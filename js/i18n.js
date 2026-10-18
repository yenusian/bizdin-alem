/* =============================================================
   Переключение языка RU / KZ / EN
   -------------------------------------------------------------
   Как это работает:
   — HTML-страницы НЕ размечаются ключами: исходный текст и есть ключ;
   — все переводы лежат в js/translations.js:
         'Главная': { kz: 'Басты бет', en: 'Home' },
   — скрипт находит на странице каждый текст, который есть в словаре,
     и подменяет его. Если перевода нет — остаётся исходный текст;
   — тексты, которые JS вставляет позже (например, подзаголовок на
     регистрации), переводятся автоматически;
   — выбранный язык сохраняется и действует на всех страницах.

   Не переводить элемент: добавить ему атрибут data-i18n-skip.
   ============================================================= */
(function () {
    const LANG_KEY = 'ba-lang';
    const LANGS = ['ru', 'kz', 'en'];
    const HTML_LANG = { ru: 'ru', kz: 'kk', en: 'en' };
    const ATTRS = ['placeholder', 'alt', 'aria-label', 'title'];
    const SKIP = 'script, style, svg, [data-i18n-skip], .lang-switcher, .footer__lang-switcher';

    const dict = window.BA_TRANSLATIONS || {};
    const root = document.documentElement;

    const norm = (s) => s.replace(/\s+/g, ' ').trim();

    let lang = 'ru';
    try { lang = localStorage.getItem(LANG_KEY) || 'ru'; } catch (e) { /* приватный режим */ }
    if (!LANGS.includes(lang)) lang = 'ru';

    function translate(original) {
        const entry = dict[norm(original)];
        if (!entry) return null;
        const value = lang === 'ru' ? (entry.ru || norm(original)) : entry[lang];
        if (!value) return null;
        // сохраняем пробелы по краям, чтобы не слипались соседние слова
        const lead = original.match(/^\s*/)[0];
        const trail = original.match(/\s*$/)[0];
        return lead + value + trail;
    }

    /* --- тексты --- */
    const originals = new WeakMap();   // узел → исходный текст
    const applied = new WeakMap();     // узел → что мы туда записали

    function translateTextNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest(SKIP)) return;
        if (!node.nodeValue.trim()) return;

        // если текст поменял другой скрипт — это новый исходник
        if (!originals.has(node) || applied.get(node) !== node.nodeValue) {
            originals.set(node, node.nodeValue);
        }
        const original = originals.get(node);
        const value = translate(original) ?? original;
        if (node.nodeValue !== value) node.nodeValue = value;
        applied.set(node, value);
    }

    /* --- атрибуты (placeholder, alt, aria-label, title) --- */
    const attrOriginals = new WeakMap();   // элемент → { attr: исходник }

    function translateAttrs(el) {
        if (el.closest(SKIP)) return;
        let saved = attrOriginals.get(el);
        ATTRS.forEach((attr) => {
            if (!el.hasAttribute(attr)) return;
            if (!saved) { saved = {}; attrOriginals.set(el, saved); }
            const current = el.getAttribute(attr);
            if (!(attr in saved) || saved['_' + attr] !== current) saved[attr] = current;
            const value = translate(saved[attr]) ?? saved[attr];
            if (current !== value) el.setAttribute(attr, value);
            saved['_' + attr] = value;
        });
    }

    function translateTree(start) {
        if (start.nodeType === Node.TEXT_NODE) { translateTextNode(start); return; }
        if (start.nodeType !== Node.ELEMENT_NODE) return;

        const walker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) translateTextNode(node);

        translateAttrs(start);
        start.querySelectorAll(ATTRS.map(a => `[${a}]`).join(',')).forEach(translateAttrs);
    }

    /* --- подписи на переключателях языка --- */
    function updateSwitchers() {
        const headerToggle = document.querySelector('.lang-switcher-toggle');
        if (headerToggle && headerToggle.firstChild) {
            headerToggle.firstChild.textContent = lang.toUpperCase() + ' ';
        }
        const footerToggle = document.querySelector('.footer__lang-toggle');
        const footerOption = document.querySelector(`.footer__lang-option[data-lang="${lang}"]`);
        if (footerToggle && footerToggle.firstChild && footerOption) {
            footerToggle.firstChild.textContent = footerOption.textContent.trim() + ' ';
        }
    }

    let observer;

    function apply() {
        observer?.disconnect();
        root.lang = HTML_LANG[lang];
        translateTree(document.body);
        updateSwitchers();
        observer?.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
        root.classList.remove('i18n-pending');
    }

    function setLang(next) {
        if (!LANGS.includes(next) || next === lang) { updateSwitchers(); return; }
        lang = next;
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* приватный режим */ }
        apply();
    }

    // Для других скриптов: window.BA_I18N.lang, window.BA_I18N.t('Текст')
    window.BA_I18N = {
        get lang() { return lang; },
        set: setLang,
        t: (text) => (translate(text) ?? text).trim(),
    };

    function init() {
        // тексты, которые добавляют/меняют другие скрипты
        observer = new MutationObserver((mutations) => {
            observer.disconnect();
            mutations.forEach((m) => {
                if (m.type === 'characterData') translateTextNode(m.target);
                else if (m.type === 'attributes') translateAttrs(m.target);
                else m.addedNodes.forEach(translateTree);
            });
            observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
        });

        apply();

        // клики по RU / KZ / EN в header и footer
        document.addEventListener('click', (e) => {
            const option = e.target.closest('.lang-switcher-option[data-lang], .footer__lang-option[data-lang]');
            if (!option) return;
            // main.js уже обновил подпись — после него выставляем язык
            setTimeout(() => setLang(option.dataset.lang), 0);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
