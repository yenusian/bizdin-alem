/* =============================================================
   Демо-слой BizdinAlem (пока нет бэкенда)
   -------------------------------------------------------------
   — связывает кнопки и карточки со страницами;
   — «регистрация» сохраняет пользователя в localStorage
     и открывает профиль нужной роли;
   — поиск и фильтр в каталоге, листание страниц в читалке;
   — вместо alert() показывает аккуратные уведомления (toast);
   — панель «Все страницы» в левом нижнем углу (для показа).
     Скрыть/показать: Shift + D. Совсем выключить: ?demo=off,
     включить обратно: ?demo=on.

   Подключается ПЕРЕД main.js. Когда появится бэкенд —
   удалить этот файл, css/demo.css и их подключения.
   ============================================================= */
(function () {
    'use strict';

    // Корень сайта = папка выше js/. Работает и на localhost, и на GitHub Pages
    // (там сайт живёт в подпапке: https://<ник>.github.io/<репозиторий>/).
    const ROOT = new URL('..', document.currentScript.src).href;
    window.BA_ROOT = ROOT;
    const url = (p) => ROOT + p.replace(/^\//, '');

    const PAGES = {
        home: url('/index.html'),
        catalog: url('/pages/catalog.html'),
        book: url('/pages/book.html'),
        reader: url('/pages/book-reader.html'),
        listen: url('/pages/book-reader.html?mode=listen'),
        about: url('/pages/about.html'),
        registration: url('/pages/registration.html'),
        writer: url('/pages/little-writer.html'),
        writerWrite: url('/pages/little-writer-write.html'),
        profile: {
            child: url('/pages/profile-child.html'),
            parent: url('/pages/profile-parent.html'),
            teacher: url('/pages/profile-teacher.html'),
        },
    };

    const USER_KEY = 'ba-demo-user';
    const SHELF_KEY = 'ba-demo-shelf';
    const PANEL_KEY = 'ba-demo-panel';
    const SOON = 'Эта функция заработает после подключения сервера';
    // Озвучка для читалки: положи mp3 и впиши путь, например url('assets/audio/mister-lis.mp3').
    // Пусто — играет тихая дорожка (прогресс и подсветка текста всё равно работают).
    const AUDIO_SRC = '';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    // текущая страница без ?query и #hash; «папка/» = «папка/index.html»
    const here = (location.origin + location.pathname).replace(/\/$/, '/index.html');
    const params = new URLSearchParams(location.search);

    function store(key, value) {
        try {
            if (value === undefined) return JSON.parse(localStorage.getItem(key));
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { return null; }
        return value;
    }

    const go = (url) => { window.location.href = url; };
    const getUser = () => store(USER_KEY);

    /* ---------- Toast ---------- */
    let stack;
    function toast(message, type) {
        if (!document.body) return;
        if (!stack) {
            stack = document.createElement('div');
            stack.className = 'demo-toast-stack';
            stack.setAttribute('aria-live', 'polite');
            document.body.appendChild(stack);
        }
        const el = document.createElement('div');
        el.className = 'demo-toast' + (type === 'warn' ? ' demo-toast--warn' : '');
        el.textContent = message;
        stack.appendChild(el);
        requestAnimationFrame(() => el.classList.add('demo-toast--visible'));
        setTimeout(() => {
            el.classList.remove('demo-toast--visible');
            setTimeout(() => el.remove(), 300);
        }, 2600);
    }
    window.baToast = toast;

    // alert() из main.js → toast (предупреждения — оранжевым)
    window.alert = (msg) => {
        const text = String(msg);
        const isWarn = /пожалуйста|нужно|не совпадают|введите|придумай/i.test(text);
        toast(text, isWarn ? 'warn' : undefined);
    };

    /* ---------- Helpers ---------- */
    function linkTo(selector, url, root) {
        $$(selector, root).forEach((el) => {
            el.classList.add('demo-clickable');
            if (el.tagName !== 'BUTTON' && !el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
                el.setAttribute('role', 'link');
            }
            const target = typeof url === 'function' ? url(el) : url;
            el.addEventListener('click', (e) => { e.preventDefault(); go(target); });
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); go(target); }
            });
        });
    }
    function onClick(selector, handler) {
        $$(selector).forEach((el, i) => el.addEventListener('click', (e) => handler(e, el, i)));
    }

    /* ---------- Пользователь (фейковая авторизация) ---------- */
    function applyUser() {
        const user = getUser();
        const profileUrl = PAGES.profile[(user && user.role) || 'child'];

        // «Мои книги» в шапке и подвале ведут в профиль своей роли
        $$('a.header-nav-link, a.footer__nav-link')
            .filter((a) => a.href === PAGES.profile.child)
            .forEach((a) => { a.href = profileUrl; });

        // Мобильная иконка профиля в шапке
        onClick('[data-role="header-mobile-toggle-profile"]', () => go(user ? profileUrl : PAGES.registration));

        if (!user) return;
        $$('.btn-register .header-btn-register-text').forEach((el) => { el.textContent = 'Мой профиль'; });
    }

    // Клик по «Зарегистрироваться», когда пользователь уже «вошёл» → профиль.
    // Слушаем в фазе перехвата, чтобы не сработал переход на регистрацию из main.js.
    window.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('.btn-register');
        const user = getUser();
        if (!btn || !user) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        go(PAGES.profile[user.role] || PAGES.profile.child);
    }, true);

    /* ---------- Регистрация ---------- */
    function initRegistration() {
        const form = $('.registration-form');
        if (!form) return;

        // Слушатель на document срабатывает ПОСЛЕ проверок из main.js
        document.addEventListener('submit', (e) => {
            if (e.target !== form) return;
            e.preventDefault();

            const data = new FormData(form);
            const role = ($('.registration-box__option--selected') || {}).dataset?.role || 'parent';
            const fullName = (data.get('fullName') || '').toString().trim();
            const email = (data.get('email') || '').toString().trim();
            const password = (data.get('password') || '').toString();

            if (!fullName || !email || !password) {
                toast('Заполни имя, почту и пароль', 'warn');
                return;
            }
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                toast('Проверь адрес почты', 'warn');
                return;
            }
            if (password !== (data.get('passwordConfirm') || '').toString()) return; // main.js уже показал ошибку
            if (data.get('agree') !== 'on') return;

            store(USER_KEY, { role, fullName, email, childName: data.get('childName') || '' });
            toast('Аккаунт создан! Открываем профиль…');
            setTimeout(() => go(PAGES.profile[role]), 1200);
        });
    }

    /* ---------- Главная ---------- */
    function initHome() {
        const heroBtns = $$('.hero-slide--welcome .hero-slide--buttons .btn');
        if (heroBtns[0]) heroBtns[0].addEventListener('click', () => go(PAGES.catalog));
        if (heroBtns[1]) heroBtns[1].addEventListener('click', () => go(PAGES.listen));

        onClick('.book-of-day__btn--read', () => go(PAGES.reader));
        onClick('.book-of-day__btn--listen', () => go(PAGES.listen));
        linkTo('.book-of-day--box .book', PAGES.book);
        onClick('.challenge-right__btn', () => go(PAGES.reader));
        linkTo('.trending__card', PAGES.book);

        const levels = ['beginner', 'level1', 'level2', 'level3'];
        levels.forEach((level, i) => {
            linkTo('.reading-levels__item--' + (i + 1), PAGES.catalog + '?level=' + level);
        });
    }

    /* ---------- Страница книги ---------- */
    function initBook() {
        onClick('.book-card__cover--btn--read', () => go(PAGES.reader));
        onClick('.book-card__cover--btn--listen', () => go(PAGES.listen));
        linkTo('.book-recommendations .trending__card', PAGES.book);

        const [shelfBtn, shareBtn, offlineBtn] = $$('.book-card__info--btn');
        if (shelfBtn) {
            shelfBtn.addEventListener('click', () => {
                const onShelf = !store(SHELF_KEY);
                store(SHELF_KEY, onShelf || null);
                shelfBtn.setAttribute('aria-pressed', String(onShelf));
                toast(onShelf ? 'Книга добавлена на книжную полку' : 'Книга убрана с полки');
            });
        }
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(location.href);
                    toast('Ссылка на книгу скопирована');
                } catch (e) {
                    toast('Ссылка: ' + location.href);
                }
            });
        }
        if (offlineBtn) {
            offlineBtn.addEventListener('click', () => toast('Книга сохранена для чтения офлайн'));
        }
    }

    /* ---------- Каталог: поиск + фильтр по уровню ---------- */
    function initCatalog() {
        const input = $('.collection__search-input');
        const grids = $$('.collection__grid');
        if (!input || !grids.length) return;

        linkTo('.collection__book', PAGES.book);
        input.setAttribute('placeholder', 'Найти книгу');

        let level = params.get('level') || 'all';
        const LEVELS = [
            ['all', 'Все'],
            ['beginner', 'Начинающий читатель'],
            ['level1', 'Уровень 1'],
            ['level2', 'Уровень 2'],
            ['level3', 'Уровень 3'],
        ];

        function apply() {
            const q = input.value.trim().toLowerCase();
            grids.forEach((grid) => {
                let visible = 0;
                $$('.collection__book', grid).forEach((book) => {
                    const title = ($('.collection__book-title', book)?.textContent || '').toLowerCase();
                    const alt = ($('img', book)?.getAttribute('alt') || '').toLowerCase();
                    const okText = !q || title.includes(q) || alt.includes(q);
                    const okLevel = level === 'all' || book.classList.contains('collection__book--' + level);
                    book.hidden = !(okText && okLevel);
                    if (!book.hidden) visible++;
                });
                let empty = $('.demo-empty', grid);
                if (!visible) {
                    if (!empty) {
                        empty = document.createElement('p');
                        empty.className = 'demo-empty';
                        empty.textContent = 'Ничего не найдено. Попробуй другое название';
                        grid.appendChild(empty);
                    }
                } else if (empty) {
                    empty.remove();
                }
            });
        }

        input.addEventListener('input', apply);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') apply(); });
        onClick('.collection__search-btn', () => { apply(); input.focus(); });

        // Выпадашка фильтра
        const search = $('.collection__search');
        const panel = document.createElement('div');
        panel.className = 'demo-filter';
        panel.hidden = true;
        LEVELS.forEach(([value, label]) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'demo-filter__chip';
            chip.dataset.level = value;
            chip.textContent = label;
            chip.addEventListener('click', () => {
                level = value;
                $$('.demo-filter__chip', panel).forEach((c) =>
                    c.classList.toggle('demo-filter__chip--active', c.dataset.level === level));
                apply();
                panel.hidden = true;
            });
            panel.appendChild(chip);
        });
        search.appendChild(panel);
        $$('.demo-filter__chip', panel).forEach((c) =>
            c.classList.toggle('demo-filter__chip--active', c.dataset.level === level));

        onClick('.collection__filter-btn', (e) => { e.stopPropagation(); panel.hidden = !panel.hidden; });
        document.addEventListener('click', (e) => { if (!search.contains(e.target)) panel.hidden = true; });

        apply();
    }

    /* ---------- Читалка ---------- */
    const STORY = [
        ['Жил-был маленький лисёнок по имени Мистер Лис. Он был очень любознательным и мечтал узнать, что скрывается за пределами знакомого леса.',
         'Каждое утро он надевал свой маленький рюкзак, брал в лапки деревянную палочку и отправлялся навстречу новым открытиям.',
         'Лес встречал его пением птиц, ароматом цветов и тёплыми лучами солнца.'],
        ['Однажды у старого дуба Мистер Лис услышал тихий голос. Это был ёжик Тимка — он не мог достать яблоко с высокой ветки.',
         'Лисёнок встал на цыпочки, дотянулся палочкой до ветки и осторожно стряхнул яблоко прямо в лапки ёжика.',
         '— Спасибо! — улыбнулся Тимка. — Давай дружить? И дальше они пошли уже вдвоём.'],
        ['У ручья друзья встретили зайчиху Майю. Она плохо слышала и поэтому всегда смотрела собеседнику в глаза.',
         'Мистер Лис стал говорить медленно и чётко, а Тимка показывал жестами, куда они идут.',
         'Майя засмеялась: оказалось, понимать друг друга совсем не трудно, если очень хочется.'],
        ['Солнце клонилось к закату, и тропинка привела друзей к широкому оврагу. Через него был перекинут тонкий мостик.',
         'Тимке было страшно, но Майя взяла его за лапку, а Мистер Лис шёл первым и проверял каждую дощечку.',
         'Шаг за шагом — и вот все трое уже на другой стороне. Вместе ничего не страшно!'],
        ['За оврагом начиналась поляна, где жила старая мудрая сова Апа. Она знала все истории леса.',
         '— Вы прошли долгий путь, — сказала сова. — А что вы нашли за пределами знакомого леса?',
         'Мистер Лис посмотрел на друзей и понял: самое удивительное открытие — это они сами.'],
        ['Сова рассказала друзьям сказку о звёздах, которые светят ярче, когда стоят рядом.',
         'Тимка заснул, свернувшись клубочком, а Майя считала звёзды и шептала им пожелания.',
         'Мистер Лис думал о том, как хорошо, что каждый из них такой разный.'],
        ['Утром друзья вернулись домой — каждый с новой историей в рюкзаке.',
         'С тех пор они встречались у старого дуба каждый день и придумывали новые приключения.',
         'А настоящая дружба, как и говорила сова, творила чудеса. Конец.'],
    ];

    function initReader() {
        const reader = $('.reader');
        if (!reader) return;

        // В разметке нет <audio> — без него скрипт плеера в main.js падает.
        // Добавляем: настоящий файл из AUDIO_SRC или тихая дорожка.
        const player = $('[data-role="player"]', reader);
        if (player && !$('[data-role="audio"]', player)) {
            const audio = document.createElement('audio');
            audio.dataset.role = 'audio';
            audio.preload = 'metadata';
            audio.src = AUDIO_SRC || silentWav(28);
            if (AUDIO_SRC) audio.addEventListener('error', () => {
                if (audio.dataset.fallback) return;
                audio.dataset.fallback = '1';
                audio.src = silentWav(28);
            }, { once: true });
            player.appendChild(audio);
        }

        const segments = $$('[data-role="text-segment"]', reader);
        const dots = $$('.reader__dot', reader);
        let page = 0;

        function render() {
            const lines = STORY[page];
            segments.forEach((seg, i) => { seg.textContent = lines[i] || ''; });
            dots.forEach((dot, i) => {
                dot.classList.toggle('reader__dot--active', i === page);
                dot.textContent = i === page ? String(page + 1) : '';
            });
            const audio = $('[data-role="audio"]', reader);
            if (audio && !isNaN(audio.duration)) audio.currentTime = 0;
        }
        function turn(dir) {
            const next = page + dir;
            if (next < 0) { toast('Это первая страница'); return; }
            if (next >= STORY.length) { toast('Ура! Книга прочитана 🎉'); return; }
            page = next;
            render();
        }

        const [prevBtn, nextBtn] = $$('.reader__pager-btn', reader);
        prevBtn?.addEventListener('click', () => turn(-1));
        nextBtn?.addEventListener('click', () => turn(1));
        $('[data-role="prev-page"]', reader)?.addEventListener('click', () => turn(-1));
        $('[data-role="next-page"]', reader)?.addEventListener('click', () => turn(1));
        dots.forEach((dot, i) => {
            dot.style.cursor = 'pointer';
            dot.addEventListener('click', () => { page = i; render(); });
        });
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('input, textarea')) return;
            if (e.key === 'ArrowRight') turn(1);
            if (e.key === 'ArrowLeft') turn(-1);
        });

        render();

        // ?mode=listen — сразу открыть плеер
        if (params.get('mode') === 'listen') {
            // после initReader из main.js (он вешается на DOMContentLoaded позже нас)
            const openPlayer = () => setTimeout(() => $('[data-role="mode-listen"]', reader)?.click(), 0);
            if (document.readyState === 'complete') openPlayer();
            else document.addEventListener('DOMContentLoaded', openPlayer, { once: true });
        }
    }

    // WAV-тишина на N секунд (8 кГц, 8 бит) — чтобы плеер и подсветка текста работали
    function silentWav(seconds) {
        const rate = 8000;
        const n = rate * seconds;
        const buf = new ArrayBuffer(44 + n);
        const v = new DataView(buf);
        const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
        w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE');
        w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
        v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
        w(36, 'data'); v.setUint32(40, n, true);
        new Uint8Array(buf, 44).fill(128);
        return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    }

    /* ---------- Профили ---------- */
    function initProfiles() {
        // ребёнок
        onClick('.continue-banner__btn', () => go(PAGES.reader));
        linkTo('.info-card__item', PAGES.book);
        onClick('.name__edit-btn', () => {
            const name = $('.child-profile__name');
            if (!name) return;
            name.contentEditable = 'true';
            name.focus();
            const sel = getSelection();
            sel.selectAllChildren(name);
            const done = () => {
                name.contentEditable = 'false';
                name.textContent = name.textContent.trim() || 'Айдана';
                toast('Имя сохранено');
            };
            name.addEventListener('blur', done, { once: true });
            name.addEventListener('keydown', function onKey(e) {
                if (e.key === 'Enter') { e.preventDefault(); name.removeEventListener('keydown', onKey); name.blur(); }
            });
        });

        // родитель
        onClick('.parent-card__nav-link', () => go(PAGES.catalog));
        $$('.parent-card__book-cover').forEach((cover) => {
            const card = cover.parentElement;
            if (card && !card.classList.contains('demo-clickable')) {
                card.classList.add('demo-clickable');
                card.addEventListener('click', () => go(PAGES.book));
            }
        });
        linkTo('.parent-card__recommend', PAGES.book);

        // учитель
        linkTo('.book-placeholder', PAGES.book);
        onClick('.myclass__btn', () => toast('Список класса появится после подключения сервера'));
        onClick('.teacher-card__add-btn', () => toast(SOON));
        onClick('.teacher-card__arrow-btn', () => go(PAGES.catalog));
        onClick('.teacher-card__link', (e) => { e.preventDefault(); toast(SOON); });
    }

    /* ---------- Маленький писатель ---------- */
    function initWriter() {
        onClick('.lw-hero__btn', () => go(PAGES.writerWrite));
        onClick('#lwLaterBtn', () => {
            toast('Черновик сохранён — вернись к нему позже');
            setTimeout(() => go(PAGES.writer), 1000);
        });
    }

    /* ---------- Приветственные страницы ---------- */
    function initWelcome() {
        onClick('[data-role="read-book-btn"]', () => go(PAGES.book));
        linkTo('.welcome-books__card', PAGES.book);
    }

    /* ---------- Оставшиеся заглушки href="#" ---------- */
    document.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a[href="#"]');
        if (!a || e.defaultPrevented) return;
        e.preventDefault();
        if (a.textContent.includes('@bizdinalem')) toast('Мы в соцсетях: @bizdinalem');
        else if (!a.dataset.role) toast(SOON);
    });

    /* ---------- Панель «Все страницы» ---------- */
    const NAV_GROUPS = [
        ['Сайт', [
            ['Приветствие (светлая)', url('/pages/welcome-light.html')],
            ['Приветствие (тёмная)', url('/pages/welcome-dark.html')],
            ['Главная', url('/index.html')],
            ['Каталог книг', url('/pages/catalog.html')],
            ['Страница книги', url('/pages/book.html')],
            ['Читалка', url('/pages/book-reader.html')],
            ['Маленький писатель', url('/pages/little-writer.html')],
            ['Пишем историю', url('/pages/little-writer-write.html')],
            ['Опрос', url('/pages/survey.html')],
            ['О проекте', url('/pages/about.html')],
            ['Регистрация', url('/pages/registration.html')],
        ]],
        ['Профили', [
            ['Ребёнок', url('/pages/profile-child.html')],
            ['Родитель', url('/pages/profile-parent.html')],
            ['Учитель', url('/pages/profile-teacher.html')],
        ]],
        ['Админ-панель', [
            ['Дашборд', url('/pages/admin/index.html')],
            ['Аналитика', url('/pages/admin/analytics.html')],
            ['Пользователи', url('/pages/admin/users.html')],
            ['Участники', url('/pages/admin/members.html')],
            ['Школы', url('/pages/admin/school.html')],
            ['Модерация', url('/pages/admin/moderation.html')],
            ['Отзывы', url('/pages/admin/feedback.html')],
            ['Поддержка', url('/pages/admin/support.html')],
            ['Уведомления', url('/pages/admin/notifications.html')],
            ['Настройки', url('/pages/admin/settings.html')],
        ]],
    ];

    function initPanel() {
        if (params.get('demo') === 'off') store(PANEL_KEY, 'off');
        if (params.get('demo') === 'on') store(PANEL_KEY, null);
        if (store(PANEL_KEY) === 'off') return;

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'demo-nav-toggle';
        toggle.setAttribute('aria-label', 'Все страницы');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('data-i18n-skip', '');
        toggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

        const panel = document.createElement('nav');
        panel.className = 'demo-nav';
        panel.hidden = true;
        panel.setAttribute('data-i18n-skip', '');
        panel.setAttribute('aria-label', 'Все страницы');

        let html = '<p class="demo-nav__title">Все страницы</p><p class="demo-nav__hint">Демо-режим без сервера · Shift+D — скрыть</p>';
        NAV_GROUPS.forEach(([group, links]) => {
            html += `<p class="demo-nav__group">${group}</p>`;
            links.forEach(([label, href]) => {
                const current = href === here;
                html += `<a class="demo-nav__link${current ? ' demo-nav__link--current' : ''}" href="${href}">${label}</a>`;
            });
        });
        html += '<button type="button" class="demo-nav__reset">Сбросить демо-данные (выйти)</button>';
        panel.innerHTML = html;

        const setOpen = (open) => {
            panel.hidden = !open;
            toggle.setAttribute('aria-expanded', String(open));
        };
        toggle.addEventListener('click', (e) => { e.stopPropagation(); setOpen(panel.hidden); });
        document.addEventListener('click', (e) => {
            if (!panel.hidden && !panel.contains(e.target)) setOpen(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setOpen(false);
            if (e.shiftKey && (e.key === 'D' || e.key === 'В') && !e.target.closest('input, textarea, [contenteditable="true"]')) {
                const hidden = toggle.style.display === 'none';
                toggle.style.display = hidden ? '' : 'none';
                if (!hidden) setOpen(false);
            }
        });
        $('.demo-nav__reset', panel).addEventListener('click', () => {
            store(USER_KEY, null);
            store(SHELF_KEY, null);
            toast('Демо-данные сброшены');
            setTimeout(() => go(PAGES.home), 800);
        });

        document.body.appendChild(toggle);
        document.body.appendChild(panel);
    }

    /* ---------- Запуск ---------- */
    function init() {
        applyUser();
        initRegistration();
        initHome();
        initBook();
        initCatalog();
        initReader();
        initProfiles();
        initWriter();
        initWelcome();
        initPanel();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
