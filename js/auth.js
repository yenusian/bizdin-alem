/* =============================================================
   Доступ к сайту (демо, без бэкенда)
   -------------------------------------------------------------
   — при входе на сайт сначала показывается welcome-страница
     (светлая или тёмная — по теме посетителя);
   — без регистрации открыты только: welcome, регистрация,
     «О проекте». Любая другая страница → регистрация, а после
     неё — обратно на ту страницу, куда человек шёл;
   — «регистрация» хранится в localStorage этого браузера.

   Подключается ПЕРВЫМ в <head>, синхронно (без defer), чтобы
   закрытая страница не успела мелькнуть.
   Когда появится бэкенд — заменить проверку на настоящую.
   ============================================================= */
(function () {
    'use strict';

    var USER_KEY = 'ba-demo-user';
    var THEME_KEY = 'ba-theme';
    var WELCOMED_KEY = 'ba-welcomed';

    var PUBLIC = [
        'pages/welcome-light.html',
        'pages/welcome-dark.html',
        'pages/registration.html',
        'pages/about.html',
    ];

    var ROOT = new URL('..', document.currentScript.src).href;

    function get(storage, key) {
        try { return window[storage].getItem(key); } catch (e) { return null; }
    }
    function set(storage, key, value) {
        try { window[storage].setItem(key, value); } catch (e) { /* приватный режим */ }
    }

    // путь текущей страницы относительно корня сайта: '', 'index.html', 'pages/book.html'…
    var here = location.href.split('#')[0].split('?')[0];
    var page = here.indexOf(ROOT) === 0 ? here.slice(ROOT.length) : '';
    if (page === '' ) page = 'index.html';

    var isRegistered = !!get('localStorage', USER_KEY);

    function welcomeUrl() {
        var theme = get('localStorage', THEME_KEY);
        if (!theme && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark';
        return ROOT + (theme === 'dark' ? 'pages/welcome-dark.html' : 'pages/welcome-light.html');
    }

    // На welcome-странице отмечаем, что приветствие уже видели в этой вкладке
    if (page.indexOf('pages/welcome-') === 0) {
        set('sessionStorage', WELCOMED_KEY, '1');
        return;
    }

    // Вход на сайт (главная по ссылке) → сначала приветствие
    if (page === 'index.html' && !get('sessionStorage', WELCOMED_KEY)) {
        location.replace(welcomeUrl());
        return;
    }

    // Закрытая страница без регистрации → регистрация, потом вернём обратно
    if (PUBLIC.indexOf(page) === -1 && !isRegistered) {
        var next = page + location.search + location.hash;
        location.replace(ROOT + 'pages/registration.html?next=' + encodeURIComponent(next));
    }
})();
