/* =============================================================
   Preferences: тема (светлая / тёмная) + подготовка языка
   -------------------------------------------------------------
   Подключается в <head> СИНХРОННО и ПОСЛЕ всех <link rel="stylesheet">:
       <script src="/js/preferences.js"></script>

   Как работает тёмная тема:
   — styles.css и mobile.css НЕ меняются;
   — при включении тёмной темы скрипт проходит по всем CSS-правилам
     сайта и для каждого цвета генерирует тёмную пару
     ([data-theme="dark"] .класс { ... });
   — ручные правки тёмной темы пишутся в css/dark.css.
   ============================================================= */
(function () {
    const THEME_KEY = 'ba-theme';
    const LANG_KEY = 'ba-lang';
    const STYLE_ID = 'ba-dark-generated';
    const root = document.documentElement;

    function read(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function write(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* приватный режим */ }
    }

    /* ---------- Цвета ---------- */

    function parseColor(str) {
        str = str.trim().toLowerCase();
        if (str === 'white') return { r: 255, g: 255, b: 255, a: 1 };
        if (str === 'black') return { r: 0, g: 0, b: 0, a: 1 };
        const m = str.match(/^rgba?\(([^)]+)\)$/);
        if (m) {
            const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
            return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
        }
        const h = str.match(/^#([0-9a-f]{3,8})$/);
        if (h) {
            let x = h[1];
            if (x.length <= 4) x = x.split('').map(c => c + c).join('');
            return {
                r: parseInt(x.slice(0, 2), 16),
                g: parseInt(x.slice(2, 4), 16),
                b: parseInt(x.slice(4, 6), 16),
                a: x.length === 8 ? parseInt(x.slice(6, 8), 16) / 255 : 1,
            };
        }
        return null;
    }

    function toHsl({ r, g, b }) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const l = (max + min) / 2;
        let h = 0, s = 0;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
        }
        return { h, s, l };
    }

    function hsla(h, s, l, a) {
        const c = `${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
        return a < 1 ? `hsla(${c}, ${+a.toFixed(3)})` : `hsl(${c})`;
    }

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const BRAND_HUE = 210;   // оттенок для серых в тёмной теме (синий, как у сайта)

    // Фоны, рамки, градиенты: светлое → тёмное, яркие фирменные цвета не трогаем
    function darkBackground(c) {
        if (c.a === 0) return null;
        const { h, s, l } = toHsl(c);
        if (s > 0.35 && l > 0.25 && l < 0.75) return null;   // фирменный цвет кнопок/бейджей
        if (l < 0.25) return null;                             // уже тёмный (footer и т.п.)
        let nl;
        if (l >= 0.9) nl = 0.14 - (1 - l) * 0.8;               // белый → карточка, #ECF2F9 → фон страницы
        else if (l >= 0.75) nl = 0.30 - (l - 0.75) * 0.6;      // светло-серые плашки
        else nl = clamp(1 - l, 0.2, 0.6);                      // серые середины
        // серые и белые получают лёгкий фирменный синий оттенок, чтобы карточки не были «грязно-серыми»
        if (s < 0.08) return hsla(BRAND_HUE, 0.22, clamp(nl, 0.06, 0.6), c.a);
        return hsla(h, Math.min(s, 0.35), clamp(nl, 0.06, 0.6), c.a);
    }

    // Текст и иконки: тёмное → светлое
    function darkForeground(c) {
        if (c.a === 0) return null;
        const { h, s, l } = toHsl(c);
        if (l >= 0.5) return null;                             // уже светлый (белый текст на кнопке)
        if (s > 0.5 && l > 0.35) return null;                  // яркий фирменный (ссылки)
        if (s < 0.08) return hsla(BRAND_HUE, 0.15, clamp(0.92 - l * 0.5, 0.7, 0.92), c.a);
        return hsla(h, Math.min(s, 0.6), clamp(0.92 - l * 0.5, 0.7, 0.92), c.a);
    }

    const COLOR_RE = /rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b|\b(?:white|black)\b/g;

    const FOREGROUND = new Set([
        'color', '-webkit-text-fill-color', 'fill', 'stroke', 'caret-color', 'text-decoration-color',
    ]);
    const BACKGROUND = new Set([
        'background-color', 'background-image',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color',
    ]);

    function convertValue(prop, value) {
        const map = FOREGROUND.has(prop) ? darkForeground : BACKGROUND.has(prop) ? darkBackground : null;
        if (!map) return null;
        let changed = false;
        const out = value.replace(COLOR_RE, (m) => {
            const c = parseColor(m);
            const r = c && map(c);
            if (r) { changed = true; return r; }
            return m;
        });
        return changed ? out : null;
    }

    /* ---------- Селекторы ---------- */

    function splitSelectors(text) {
        const parts = [];
        let depth = 0, cur = '';
        for (const ch of text) {
            if (ch === '(') depth++;
            if (ch === ')') depth--;
            if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
        }
        parts.push(cur);
        return parts.map(s => s.trim()).filter(Boolean);
    }

    // Блоки с атрибутом data-theme-keep (баннеры с иллюстрациями и т.п.)
    // в тёмной теме остаются как в макете: к ним и их содержимому правила не применяются
    const KEEP = ':not([data-theme-keep], [data-theme-keep] *)';

    function prefix(sel) {
        if (/^html\b/.test(sel)) return sel.replace(/^html/, 'html[data-theme="dark"]');
        if (/^:root\b/.test(sel)) return sel.replace(/^:root/, ':root[data-theme="dark"]');
        if (/^body\b/.test(sel) && !/\s/.test(sel)) return `[data-theme="dark"] ${sel}`;
        // :not(...) ставим перед псевдоэлементом (::before, ::placeholder), если он есть
        const i = sel.indexOf('::');
        const scoped = i === -1 ? sel + KEEP : sel.slice(0, i) + KEEP + sel.slice(i);
        return `[data-theme="dark"] ${scoped}`;
    }

    function convertRules(rules) {
        let css = '';
        for (const rule of rules) {
            if (rule.type === CSSRule.STYLE_RULE) {
                const decls = [];
                const style = rule.style;
                for (let i = 0; i < style.length; i++) {
                    const prop = style[i];
                    if (!FOREGROUND.has(prop) && !BACKGROUND.has(prop)) continue;
                    const value = style.getPropertyValue(prop);
                    if (prop === 'background-image' && !/gradient/.test(value)) continue;  // картинки не трогаем
                    const v = convertValue(prop, value);
                    // Неизменённые цвета тоже повторяем: иначе модификаторы вроде
                    // .header-nav-link--active проиграют по специфичности тёмной версии базового класса
                    decls.push(`${prop}: ${v || value}${style.getPropertyPriority(prop) ? ' !important' : ''}`);
                }
                if (decls.length) {
                    css += `${splitSelectors(rule.selectorText).map(prefix).join(', ')} { ${decls.join('; ')} }\n`;
                }
            } else if (rule.type === CSSRule.MEDIA_RULE) {
                const inner = convertRules(rule.cssRules);
                if (inner) css += `@media ${rule.conditionText || rule.media.mediaText} {\n${inner}}\n`;
            }
        }
        return css;
    }

    function buildDarkCss() {
        let css = '';
        for (const sheet of document.styleSheets) {
            // внешние CSS (Google Fonts, Swiper CDN) и наш ручной dark.css пропускаем
            if (!sheet.href || sheet.href.indexOf(location.origin) !== 0) continue;
            if (/\/dark\.css/.test(sheet.href)) continue;
            let rules;
            try { rules = sheet.cssRules; } catch (e) { continue; }
            css += convertRules(rules);
        }
        return css;
    }

    function ensureDarkStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = buildDarkCss();
        // ставим ПЕРЕД dark.css, чтобы ручные правки были сильнее сгенерированных
        const manual = document.querySelector('link[href*="/css/dark.css"]');
        if (manual) manual.before(style); else document.head.appendChild(style);
    }

    /* ---------- Тема ---------- */

    function applyTheme(theme) {
        if (theme === 'dark') {
            ensureDarkStyles();
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
        root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
        document.querySelectorAll('[data-role="theme-toggle"]').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(theme === 'dark'));
        });
    }

    function currentTheme() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    // Страницы со своим оформлением (welcome-*) помечены data-theme-fixed — там тему не трогаем
    const themeFixed = root.hasAttribute('data-theme-fixed');
    if (!themeFixed) applyTheme(read(THEME_KEY) === 'dark' ? 'dark' : 'light');

    /* ---------- Язык: прячем страницу до перевода, чтобы не мигал русский текст ---------- */

    const savedLang = read(LANG_KEY);
    if (savedLang && savedLang !== 'ru') {
        root.classList.add('i18n-pending');
        const hide = document.createElement('style');
        hide.id = 'ba-i18n-pending';
        hide.textContent = 'html.i18n-pending body{visibility:hidden}';
        document.head.appendChild(hide);
        // страховка: если i18n.js не загрузился — всё равно показать страницу
        setTimeout(() => root.classList.remove('i18n-pending'), 1500);
    }

    /* ---------- Кнопка переключения темы ---------- */

    document.addEventListener('DOMContentLoaded', () => {
        const toggles = document.querySelectorAll('[data-role="theme-toggle"]');
        if (!toggles.length || themeFixed) return;

        applyTheme(currentTheme());   // синхронизировать aria-pressed
        toggles.forEach((btn) => {
            btn.addEventListener('click', () => {
                const next = currentTheme() === 'dark' ? 'light' : 'dark';
                root.classList.add('theme-transition');
                applyTheme(next);
                setTimeout(() => root.classList.remove('theme-transition'), 300);
                write(THEME_KEY, next);
            });
        });
    });
})();
