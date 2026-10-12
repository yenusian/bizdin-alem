const langSwitcher = document.querySelector('.lang-switcher');
const langToggle = document.querySelector('.lang-switcher-toggle');
const langList = document.querySelector('.lang-switcher-list');
const langOptions = document.querySelectorAll('.lang-switcher-option');
const langArrow = document.querySelector('.arrow');

if (langToggle) {
    langToggle.addEventListener('click', () => {
        const isOpen = langToggle.getAttribute('aria-expanded') === 'true';
        langList.hidden = isOpen;
        langToggle.setAttribute('aria-expanded', String(!isOpen));
        langArrow.classList.toggle('arrow--rotated', !isOpen);
    });

    document.addEventListener('click', (e) => {
        if (!langSwitcher.contains(e.target)) {
            langList.hidden = true;
            langToggle.setAttribute('aria-expanded', 'false');
            langArrow.classList.remove('arrow--rotated');
        }
    });

    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedLang = option.dataset.lang;
            langToggle.firstChild.textContent = selectedLang.toUpperCase() + ' ';
            langList.hidden = true;
            langToggle.setAttribute('aria-expanded', 'false');
            langArrow.classList.remove('arrow--rotated');
        });
    });
}

const heroSliderEl = document.querySelector('.hero-slider');
if (heroSliderEl) {
    new Swiper(heroSliderEl, {
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        speed: 600,
    });
}

const trendingSliderEl = document.querySelector('.trending-slider');
if (trendingSliderEl && window.innerWidth > 480) {
    new Swiper(trendingSliderEl, {
        slidesPerView: 3,
        spaceBetween: 40,
        watchOverflow: false,
        navigation: {
            prevEl: '.trending__nav--prev',
            nextEl: '.trending__nav--next',
        },
    });
}

// Header — mobile menu toggle
(function initHeaderMobileMenu() {
    const container = document.querySelector('[data-role="header-link-container"]');
    const toggle = document.querySelector('[data-role="header-mobile-toggle"]');
    const nav = document.querySelector('[data-role="header-nav"]');
    if (!container || !toggle || !nav) return;

    toggle.addEventListener('click', () => {
        const isOpen = container.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            container.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    nav.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('click', () => {
            container.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
})();
// Header — кнопка "Зарегистрироваться" → страница регистрации
(function initRegisterButtons() {
    const buttons = document.querySelectorAll('.btn-register');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            window.location.href = '/pages/registration.html';
        });
    });
})();

const footerLangSwitcher = document.querySelector('.footer__lang-switcher');
const footerLangToggle = document.querySelector('.footer__lang-toggle');
const footerLangList = document.querySelector('.footer__lang-list');
const footerLangOptions = document.querySelectorAll('.footer__lang-option');
const footerLangArrow = document.querySelector('.footer__lang-arrow');

if (footerLangToggle) {
    footerLangToggle.addEventListener('click', () => {
        const isOpen = footerLangToggle.getAttribute('aria-expanded') === 'true';
        footerLangList.hidden = isOpen;
        footerLangToggle.setAttribute('aria-expanded', String(!isOpen));
        footerLangArrow.classList.toggle('arrow--rotated', !isOpen);
    });

    document.addEventListener('click', (e) => {
        if (!footerLangSwitcher.contains(e.target)) {
            footerLangList.hidden = true;
            footerLangToggle.setAttribute('aria-expanded', 'false');
        }
    });

    footerLangOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedLang = option.textContent;
            footerLangToggle.firstChild.textContent = selectedLang + ' ';
            footerLangList.hidden = true;
            footerLangToggle.setAttribute('aria-expanded', 'false');
        });
    });
}


// Profile Child swiper
document.querySelectorAll('.info-card__swiper').forEach((swiperEl) => {
    new Swiper(swiperEl, {
        slidesPerView: 3,
        spaceBetween: 12,
        pagination: {
            el: swiperEl.querySelector('.swiper-pagination'),
            clickable: true,
        },
    });
});

const badgesSwiperEl = document.querySelector('.info-card__swiper-badges');
if (badgesSwiperEl) {
    new Swiper(badgesSwiperEl, {
        slidesPerView: 2.5,
        spaceBetween: 20,
    });
}

const bookRowEl = document.querySelector('.teacher-card--books .book-row');
if (bookRowEl) {
    new Swiper(bookRowEl, {
        slidesPerView: 'auto',
        spaceBetween: 26,
        freeMode: true,
        slidesOffsetAfter: 26,
    });
}

const collectionSwiperEl = document.querySelector('.teacher-card--collections .collection-swiper');
if (collectionSwiperEl) {
    new Swiper(collectionSwiperEl, {
        slidesPerView: 'auto',
        watchOverflow: false,
        spaceBetween: 36,
        longSwipesRatio: 0.15,
        slidesOffsetAfter: 26,
        pagination: {
            el: collectionSwiperEl.querySelector('.swiper-pagination'),
            clickable: true,
        },
    });
}


// Survey page
const surveyCard = document.querySelector('.survey-page__card');

if (surveyCard) {
    const questionGroups = surveyCard.querySelectorAll('.survey-question__options');
    const submitBtn = surveyCard.querySelector('.survey-page__submit-btn');

    questionGroups.forEach((group) => {
        group.addEventListener('click', (e) => {
            const btn = e.target.closest('.survey-option');
            if (!btn) return;

            group.querySelectorAll('.survey-option').forEach((opt) => {
                opt.classList.remove('survey-option--selected');
                opt.setAttribute('aria-checked', 'false');
            });

            btn.classList.add('survey-option--selected');
            btn.setAttribute('aria-checked', 'true');
        });
    });

    submitBtn?.addEventListener('click', () => {
        const answers = [];
        let allAnswered = true;

        questionGroups.forEach((group, index) => {
            const selected = group.querySelector('.survey-option--selected');
            if (!selected) {
                allAnswered = false;
                return;
            }
            answers.push({
                question: index + 1,
                rating: Number(selected.dataset.rating),
            });
        });

        if (!allAnswered) {
            alert('Пожалуйста, ответь на все вопросы перед отправкой');
            return;
        }

        console.log('Ответы опроса:', answers);
        alert('Спасибо за участие!');
    });
}


// Registration page
const registrationBox = document.querySelector('.registration-box');

if (registrationBox) {
    const layout = registrationBox.closest('.registration__layout');

    const roleOptions = registrationBox.querySelectorAll('.registration-box__option');
    const childNameGroup = registrationBox.querySelector('.form-group--child-name');
    const schoolGroup = registrationBox.querySelector('.form-group--school');
    const rewardBlock = registrationBox.querySelector('.registration-reward');
    const form = registrationBox.querySelector('.registration-form');

    const headerSubtitleEl = layout?.querySelector('[data-role-header-subtitle]');
    const formSubtitleEl = registrationBox.querySelector('[data-role-form-subtitle]');

    const decorBlocks = layout?.querySelectorAll('[data-role-decor]') ?? [];
    const characterBlocks = layout?.querySelectorAll('[data-role-character]') ?? [];

    let selectedRole = null;

    const roleContent = {
        child: {
            headerSubtitle: 'создай аккаунт и открой мир интересных книг.',
            formSubtitle: 'Создай свой аккаунт и начни читать уже сегодня.',
        },
        parent: {
            headerSubtitle: 'создай аккаунт и читай книги вместе с ребёнком.',
            formSubtitle: 'Создай свой аккаунт, чтобы  начать читать книги с ребенком уже сегодня.',
        },
        teacher: {
            headerSubtitle: 'создай аккаунт и открой мир интересных книг.',
            formSubtitle: 'Создай свой аккаунт и начни читать уже сегодня.',
        },
    };

    function selectRole(role) {
        selectedRole = role;

        roleOptions.forEach((opt) => {
            opt.classList.remove('registration-box__option--selected');
            opt.setAttribute('aria-checked', 'false');
        });
        const activeOption = registrationBox.querySelector(`[data-role="${role}"]`);
        activeOption?.classList.add('registration-box__option--selected');
        activeOption?.setAttribute('aria-checked', 'true');

        if (childNameGroup) childNameGroup.hidden = role !== 'parent';
        if (schoolGroup) schoolGroup.hidden = role !== 'teacher';
        if (rewardBlock) rewardBlock.hidden = role !== 'child';

        const content = roleContent[role];
        if (content) {
            if (headerSubtitleEl) headerSubtitleEl.textContent = content.headerSubtitle;
            if (formSubtitleEl) formSubtitleEl.textContent = content.formSubtitle;
        }

        decorBlocks.forEach((block) => {
            block.hidden = block.dataset.roleDecor !== role;
        });
        characterBlocks.forEach((block) => {
            block.hidden = block.dataset.roleCharacter !== role;
        });
    }

    roleOptions.forEach((opt) => {
        const role = opt.dataset.role;

        opt.addEventListener('click', () => selectRole(role));

        opt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectRole(role);
            }
        });
    });

    selectRole('parent');

    form?.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const payload = {
            role: selectedRole,
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password'),
            passwordConfirm: formData.get('passwordConfirm'),
            agree: formData.get('agree') === 'on',
        };

        if (selectedRole === 'parent') {
            payload.childName = formData.get('childName');
        }
        if (selectedRole === 'teacher') {
            payload.school = formData.get('school');
        }

        if (payload.password !== payload.passwordConfirm) {
            alert('Пароли не совпадают');
            return;
        }
        if (!payload.agree) {
            alert('Нужно согласиться с правилами сайта');
            return;
        }

        console.log('Регистрация:', payload);
    });
}

// Little Writer — landing gallery selection
const lwGallery = document.querySelector('.lw-gallery__grid');
if (lwGallery) {
    lwGallery.addEventListener('click', (e) => {
        const item = e.target.closest('.lw-gallery__item');
        if (!item) return;

        lwGallery.querySelectorAll('.lw-gallery__item').forEach((el) => {
            el.classList.remove('lw-gallery__item--selected');
        });
        item.classList.add('lw-gallery__item--selected');

    });
}

// Little Writer — write page: подсказки вставляют текст, счётчик символов
const lwStoryText = document.getElementById('lwStoryText');
const lwCharCount = document.getElementById('lwCharCount');

// Функция подсчета слов
function countWords(text) {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

if (lwStoryText && lwCharCount) {
    lwStoryText.addEventListener('input', () => {
        lwCharCount.textContent = countWords(lwStoryText.value);
    });

    document.querySelectorAll('.lw-hint').forEach((hint) => {
        hint.addEventListener('click', () => {
            const hintText = hint.textContent.trim();
            const separator = lwStoryText.value.trim() ? '\n\n' : '';
            lwStoryText.value += `${separator}${hintText} `;
            lwStoryText.dispatchEvent(new Event('input'));
            lwStoryText.focus();
        });
    });
}

const lwSaveBtn = document.getElementById('lwSaveBtn');
lwSaveBtn?.addEventListener('click', () => {
    const title = document.getElementById('lwStoryTitle')?.value.trim();
    const text = document.getElementById('lwStoryText')?.value.trim();

    if (!title || !text) {
        alert('Придумай название и напиши хотя бы немного текста перед сохранением!');
        return;
    }

    console.log('Сохранено:', { title, text });
    alert('История сохранена!');
});

const lwBackBtn = document.getElementById('lwBackBtn');
lwBackBtn?.addEventListener('click', () => {
    window.location.href = '/pages/little-writer.html';
});

// Reager page script
function initReader() {
  const reader = document.querySelector('.reader');
  if (!reader) return;

  const pager = reader.querySelector('[data-role="pager"]');
  const player = reader.querySelector('[data-role="player"]');
  const btnListen = reader.querySelector('[data-role="mode-listen"]');
  const btnRead = reader.querySelector('[data-role="mode-read"]');

  function setMode(mode) {
    const isListen = mode === 'listen';
    reader.classList.toggle('reader--listen', isListen);
    if (pager) pager.hidden = isListen;
    if (player) player.hidden = !isListen;
    if (btnListen) btnListen.hidden = isListen;   // кнопка "слушать" видна только пока читаем
    if (btnRead) btnRead.hidden = !isListen;      // кнопка "читать" видна только пока слушаем
  }

  if (btnListen) btnListen.addEventListener('click', () => setMode('listen'));
  if (btnRead) btnRead.addEventListener('click', () => setMode('read'));

  setMode('read'); // стартовое состояние страницы

  // --- Лайк ---
  const likeBtn = reader.querySelector('[data-role="like"]');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      const pressed = likeBtn.getAttribute('aria-pressed') === 'true';
      likeBtn.setAttribute('aria-pressed', String(!pressed));
      likeBtn.classList.toggle('reader__icon-btn--liked', !pressed);
    });
  }

  if (!player) return;

  // --- Аудиоплеер ---
  const audio = player.querySelector('[data-role="audio"]');
  const playBtn = player.querySelector('[data-role="play"]');
  const iconPlay = playBtn?.querySelector('.icon-play');
  const iconPause = playBtn?.querySelector('.icon-pause');
  const fill = player.querySelector('[data-role="progress-fill"]');
  const handle = player.querySelector('[data-role="progress-handle"]');
  const track = player.querySelector('[data-role="progress-track"] .reader__progress-track');
  const timeCurrent = player.querySelector('[data-role="time-current"]');
  const timeDuration = player.querySelector('[data-role="time-duration"]');
  const rewindBtn = player.querySelector('[data-role="rewind"]');
  const forwardBtn = player.querySelector('[data-role="forward"]');
  const prevPageBtn = player.querySelector('[data-role="prev-page"]');
  const nextPageBtn = player.querySelector('[data-role="next-page"]');

  if (!audio) return;

  function formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateProgress() {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    if (fill) fill.style.width = `${percent}%`;
    if (handle) handle.style.left = `${percent}%`;
    if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
  }

  audio.addEventListener('loadedmetadata', () => {
    if (timeDuration) timeDuration.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', updateProgress);

  function togglePlay() {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  audio.addEventListener('play', () => {
    iconPlay?.setAttribute('hidden', '');
    iconPause?.removeAttribute('hidden');
    playBtn?.setAttribute('aria-pressed', 'true');
  });
  audio.addEventListener('pause', () => {
    iconPause?.setAttribute('hidden', '');
    iconPlay?.removeAttribute('hidden');
    playBtn?.setAttribute('aria-pressed', 'false');
  });

  playBtn?.addEventListener('click', togglePlay);

  rewindBtn?.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  });
  forwardBtn?.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  });

  // --- Синхронизация подсветки текста с аудио ---
  const textBlock = reader.querySelector('[data-role="text"]');
  const segments = textBlock
    ? Array.from(textBlock.querySelectorAll('[data-role="text-segment"]'))
    : [];

  function updateTextHighlight() {
    const t = audio.currentTime;
    segments.forEach((seg) => {
      const start = parseFloat(seg.dataset.start);
      const end = parseFloat(seg.dataset.end);
      const isActive = t >= start && t < end;
      const isPlayed = t >= end;
      seg.classList.toggle('reader__segment--active', isActive);
      seg.classList.toggle('reader__segment--played', isPlayed && !isActive);
    });
  }

  audio.addEventListener('timeupdate', updateTextHighlight);

  // Клик по сегменту — перемотка аудио на его начало
  segments.forEach((seg) => {
    seg.addEventListener('click', () => {
      const start = parseFloat(seg.dataset.start);
      if (!isNaN(start)) audio.currentTime = start;
    });
  });
  
  // --- Клик/перетаскивание по прогресс-бару ---
  if (track) {
    function seekFromEvent(e) {
      const rect = track.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      if (audio.duration) audio.currentTime = ratio * audio.duration;
    }

    let dragging = false;
    track.addEventListener('mousedown', (e) => { dragging = true; seekFromEvent(e); });
    window.addEventListener('mousemove', (e) => { if (dragging) seekFromEvent(e); });
    window.addEventListener('mouseup', () => { dragging = false; });
    track.addEventListener('click', seekFromEvent);
  }

  // --- Переключение страниц ---
  prevPageBtn?.addEventListener('click', () => {
    console.log('Переход на предыдущую страницу');
  });
  nextPageBtn?.addEventListener('click', () => {
    console.log('Переход на следующую страницу');
  });
}

document.addEventListener('DOMContentLoaded', initReader);


// Admin — sidebar collapse
const adminSidebar = document.querySelector('[data-role="admin-sidebar"]');
const sidebarCollapseBtn = document.querySelector('[data-role="sidebar-collapse"]');

if (adminSidebar && sidebarCollapseBtn) {
    sidebarCollapseBtn.addEventListener('click', () => {
        adminSidebar.classList.toggle('admin-sidebar--collapsed');
    });
}

// Admin main page — daterange dropdown
(function initAdminDaterange() {
    const daterange = document.querySelector('[data-role="admin-daterange"]');
    if (!daterange) return;

    const toggle = daterange.querySelector('.admin-daterange__toggle');
    const valueEl = daterange.querySelector('.admin-daterange__value');
    const list = daterange.querySelector('.admin-daterange__list');
    const options = daterange.querySelectorAll('.admin-daterange__option');

    function formatDate(date) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
    }

    function applyRange(days) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);

        if (valueEl) {
            valueEl.textContent = `${formatDate(start)} - ${formatDate(end)}`;
        }

        // сюда пойдёт запрос с параметрами start/end
        console.log('Выбран диапазон дат:', { days, start, end });
    }

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        list.hidden = isOpen;
        toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
        if (!daterange.contains(e.target)) {
            list.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    options.forEach((opt) => {
        opt.addEventListener('click', () => {
            options.forEach((o) => o.classList.remove('admin-daterange__option--active'));
            opt.classList.add('admin-daterange__option--active');

            applyRange(Number(opt.dataset.days));

            list.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
})();

// Admin main page — filters button (заглушка до готовности бэка)
const adminFiltersBtn = document.querySelector('[data-role="admin-filters-btn"]');
if (adminFiltersBtn) {
    adminFiltersBtn.addEventListener('click', () => {
        adminFiltersBtn.classList.toggle('admin-filters-btn--active');
        console.log('Фильтры нажаты — тут потом будет открытие панели/модалки');
    });
}

// Admin main page — date range select
document.querySelectorAll('[data-role="admin-main-select"]').forEach((select) => {
    const toggle = select.querySelector('.admin-main-select__toggle');
    const value = select.querySelector('.admin-main-select__value');
    const list = select.querySelector('.admin-main-select__list');
    const options = select.querySelectorAll('.admin-main-select__option');

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        list.hidden = isOpen;
        toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            list.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    options.forEach((opt) => {
        opt.addEventListener('click', () => {
            options.forEach((o) => o.classList.remove('admin-main-select__option--active'));
            opt.classList.add('admin-main-select__option--active');
            value.textContent = opt.textContent;
            list.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
});

// Admin — profile dropdown
const adminProfile = document.querySelector('[data-role="admin-profile"]');
if (adminProfile) {
    const toggle = adminProfile.querySelector('.admin-profile__toggle');
    const menu = adminProfile.querySelector('.admin-profile__menu');

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        menu.hidden = isOpen;
        toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
        if (!adminProfile.contains(e.target)) {
            menu.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

document.querySelectorAll('[data-role="admin-select"]').forEach((select) => {
    const toggle = select.querySelector(':scope > button');
    const value = select.querySelector('.admin-select__value');
    const list = select.querySelector('.admin-select__list');
    const options = select.querySelectorAll('.admin-select__option');

    if (!toggle || !list) return;

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        list.hidden = isOpen;
        toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            list.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    options.forEach((opt) => {
        opt.addEventListener('click', () => {
            options.forEach((o) => o.classList.remove('admin-select__option--active'));
            opt.classList.add('admin-select__option--active');
            if (value) value.textContent = opt.textContent;
            list.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
});


// Admin — notifications page
const notifTabs = document.querySelector('[data-role="notif-tabs"]');
const notifList = document.querySelector('[data-role="notif-list"]');

if (notifTabs && notifList) {
    const tabs = notifTabs.querySelectorAll('.notif-tab');
    const items = notifList.querySelectorAll('.notif-item');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('notif-tab--active'));
            tab.classList.add('notif-tab--active');

            const filter = tab.dataset.filter;
            items.forEach((item) => {
                let show = true;
                if (filter === 'unread') show = item.dataset.status === 'unread';
                if (filter === 'important') show = item.dataset.important === 'true';
                item.hidden = !show;
            });
        });
    });

    const markAllBtn = document.querySelector('[data-role="notif-mark-all"]');
    markAllBtn?.addEventListener('click', () => {
        items.forEach((item) => {
            item.dataset.status = 'read';
        });
    });

    const pagesWrap = document.querySelector('[data-role="notif-pages"]');
    pagesWrap?.querySelectorAll('.notif-page__btn:not([data-dir])').forEach((btn) => {
        btn.addEventListener('click', () => {
            pagesWrap.querySelectorAll('.notif-page__btn').forEach((b) => b.classList.remove('notif-page__btn--active'));
            btn.classList.add('notif-page__btn--active');
        });
    });
}



/*   SUPPORT PAGE  */

(function initSupportSelects() {
    const selects = document.querySelectorAll('[data-role="support-select"]');
    if (!selects.length) return;

    function closeAll(except) {
        selects.forEach((select) => {
            if (select === except) return;
            const toggle = select.querySelector('.support-select__toggle');
            const list = select.querySelector('.admin-select__list');
            if (!list || list.hidden) return;
            list.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        });
    }

    selects.forEach((select) => {
        const toggle = select.querySelector('.support-select__toggle');
        const list = select.querySelector('.admin-select__list');
        const valueEl = select.querySelector('.admin-select__value');
        if (!toggle || !list) return;

        // Открыть/закрыть по клику на toggle
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !list.hidden;

            closeAll(select);

            list.hidden = isOpen;
            toggle.setAttribute('aria-expanded', String(!isOpen));
        });

        // Выбор пункта списка
        list.addEventListener('click', (e) => {
            const option = e.target.closest('.admin-select__option');
            if (!option) return;

            // обновить активный пункт
            list.querySelectorAll('.admin-select__option').forEach((el) => {
                el.classList.remove('admin-select__option--active');
            });
            option.classList.add('admin-select__option--active');

            // обновить отображаемое значение
            if (valueEl) {
                valueEl.textContent = option.textContent.trim();
            }

            // закрыть список
            list.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');

        });
    });

    // Закрыть все по клику вне любого support-select
    document.addEventListener('click', () => {
        closeAll(null);
    });

    // Закрыть по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closeAll(null);
    });
})();


// Admin Settings 

function initSettingsTabs() {
    const tabs = document.querySelectorAll('[data-role="settings-tabs"] .admin-settings__tab');
    const panels = document.querySelectorAll('.admin-settings__tab-panel');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => {
                const isActive = t === tab;
                t.classList.toggle('admin-settings__tab--active', isActive);
                t.querySelector('.admin-settings__tab-icon')
                    ?.classList.toggle('admin-settings__tab-icon--active', isActive);
            });

            panels.forEach(panel => {
                panel.hidden = panel.dataset.tab !== target;
            });
        });
    });
}

function initAdminSelects() {
    const selects = document.querySelectorAll('[data-role="admin-select"]');
    if (!selects.length) return;

    selects.forEach(select => {
        const toggle = select.querySelector('.admin-select__toggle');
        const list = select.querySelector('.admin-select__list');
        const valueEl = select.querySelector('.admin-select__value');
        const items = select.querySelectorAll('.admin-select__item');

        toggle.addEventListener('click', () => {
            const isOpen = select.classList.toggle('admin-select--open');
            list.hidden = !isOpen;
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        items.forEach(item => {
            item.addEventListener('click', () => {
                items.forEach(i => i.classList.remove('admin-select__item--active'));
                item.classList.add('admin-select__item--active');
                valueEl.textContent = item.textContent;
                select.classList.remove('admin-select--open');
                list.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
                console.log('Выбрано значение:', item.dataset.value);
            });
        });
    });

    document.addEventListener('click', (e) => {
        selects.forEach(select => {
            if (!select.contains(e.target)) {
                select.classList.remove('admin-select--open');
                const list = select.querySelector('.admin-select__list');
                if (list) list.hidden = true;
                select.querySelector('.admin-select__toggle')?.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

function initSettingsForm() {
    const form = document.querySelector('[data-role="settings-form-general"]');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        console.log('Сохранение настроек:', data); // заглушка бэкенда
    });
}

initSettingsTabs();
initAdminSelects();
initSettingsForm();


/* ===== Settings — Users & Roles tab ===== */

// Роль по умолчанию — список с выбором одного пункта
function initRoleDefaultList() {
    const list = document.querySelector('[data-role="role-default-list"]');
    if (!list) return;

    const items = list.querySelectorAll('.role-list__item');

    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('role-list__item--active'));
            item.classList.add('role-list__item--active');
            console.log('Роль по умолчанию:', item.dataset.value);
        });
    });
}

// Матрица разрешений — клик по ячейке циклично переключает уровень доступа
function initPermMatrix() {
    const buttons = document.querySelectorAll('.perm-select');
    if (!buttons.length) return;

    const levels = ['none', 'view', 'edit'];

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const current = btn.dataset.value;
            const nextIndex = (levels.indexOf(current) + 1) % levels.length;
            const next = levels[nextIndex];
            btn.dataset.value = next;
            btn.classList.toggle('perm-select--view', next === 'view');
            btn.classList.toggle('perm-select--edit', next === 'edit');
            console.log('Разрешение изменено:', next);
        });
    });
}

// Приглашение администратора
function initInviteAdminForm() {
    const form = document.querySelector('[data-role="invite-admin-form"]');
    const submitBtn = document.querySelector('.invite-form__submit');
    if (!form || !submitBtn) return;

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const input = form.querySelector('.invite-form__input');
        const email = input.value.trim();

        if (!email) {
            alert('Введите email администратора');
            return;
        }

        console.log('Приглашение отправлено на:', email); // заглушка бэкенда
        input.value = '';
    });
}

// Сохранение настроек ролей (тумблеры + чекбоксы ролей)
function initRolesSaveButton() {
    const form = document.getElementById('roles-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const defaultRole = form.querySelector('.role-list__item--active')?.dataset.value;

        const enabledRoles = Array.from(form.querySelectorAll('.role-checklist__checkbox'))
            .filter(cb => cb.checked)
            .map(cb => cb.id);

        const toggles = Array.from(form.querySelectorAll('.admin-settings-roles__switch input'))
            .reduce((acc, input) => {
                acc[input.name] = input.checked;
                return acc;
            }, {});

        console.log('Сохранение настроек ролей:', { defaultRole, enabledRoles, toggles });
    });
}

initRoleDefaultList();
initPermMatrix();
initInviteAdminForm();
initRolesSaveButton();

/* ===== Settings — Notifications tab ===== */

function initNotifFrequencyList() {
    const list = document.querySelector('[data-role="notif-frequency-list"]');
    if (!list) return;

    const items = list.querySelectorAll('.role-list__item');

    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('role-list__item--active'));
            item.classList.add('role-list__item--active');
            console.log('Частота уведомлений:', item.dataset.value);
        });
    });
}

function initNotificationsForm() {
    const form = document.getElementById('notifications-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const channels = {
            email: form.querySelector('[name="channelEmail"]')?.checked,
            inApp: form.querySelector('[name="channelInApp"]')?.checked,
            push: form.querySelector('[name="channelPush"]')?.checked,
        };

        const categories = Array.from(form.querySelectorAll('.notif-categories-list .role-checklist__checkbox'))
            .filter(cb => cb.checked)
            .map(cb => cb.id);

        const frequency = form.querySelector('.role-list__item--active')?.dataset.value;

        const quietHours = {
            from: form.querySelector('[name="quietFrom"]')?.value,
            to: form.querySelector('[name="quietTo"]')?.value,
        };

        console.log('Сохранение настроек уведомлений:', { channels, categories, frequency, quietHours }); // заглушка бэкенда
    });

    const cancelBtn = form.closest('.admin-settings__users-pannel')?.querySelector('[data-role="notif-cancel"]');
    cancelBtn?.addEventListener('click', () => {
        form.reset();
        console.log('Изменения отменены');
    });
}

initNotifFrequencyList();
initNotificationsForm();

/* ===== Settings — Notifications: переключение между двумя страницами ===== */
function initNotifPageNav() {
    const page1 = document.querySelector('[data-role="notif-page-1"]');
    const page2 = document.querySelector('[data-role="notif-page-2"]');
    const nextBtn = document.querySelector('[data-role="notif-next"]');
    const prevBtn = document.querySelector('[data-role="notif-prev"]');
    if (!page1 || !page2) return;

    nextBtn?.addEventListener('click', () => {
        page1.hidden = true;
        page2.hidden = false;
    });

    prevBtn?.addEventListener('click', () => {
        page2.hidden = true;
        page1.hidden = false;
    });
}

initNotifPageNav();


/* ===== Settings — System tab ===== */
function initSystemTab() {
    const panel = document.querySelector('.admin-settings__tab-panel[data-tab="system"]');
    if (!panel) return;

    const maintenanceToggle = panel.querySelector('[name="maintenanceMode"]');
    const maintenanceText = panel.querySelector('[data-role="maintenance-status"]');
    maintenanceToggle?.addEventListener('change', () => {
        if (maintenanceText) {
            maintenanceText.textContent = maintenanceToggle.checked ? 'Включен' : 'Выключен';
        }
    });

    const clearCacheBtn = panel.querySelector('[data-role="clear-cache-btn"]');
    clearCacheBtn?.addEventListener('click', () => {
        console.log('Очистка кэша запрошена'); // заглушка бэкенда
        alert('Кэш очищен');
    });

    const saveBtn = panel.querySelector('[data-role="system-save"]');
    saveBtn?.addEventListener('click', () => {
        const selects = Array.from(panel.querySelectorAll('.admin-select--system .admin-select__value'))
            .map(el => el.textContent.trim());

        const data = {
            maintenanceMode: maintenanceToggle?.checked ?? false,
            backupSchedule: selects[0],
            maxFileSize: selects[1],
            sessionTimeout: selects[2],
            securityLogRetention: selects[3],
        };

        console.log('Сохранение системных настроек:', data); // заглушка бэкенда
    });
}

initSystemTab();


/* ===== Settings — Integration tab ===== */
function initIntegrationTab() {
    const panel = document.querySelector('.admin-settings__tab-panel[data-tab="integration"]');
    if (!panel) return;

    // Показать/скрыть API-ключ
    panel.querySelectorAll('[data-role="toggle-key"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const valueEl = btn.previousElementSibling;
            if (!valueEl) return;
            const isMasked = valueEl.dataset.masked !== 'false';
            valueEl.dataset.masked = String(!isMasked);
            valueEl.textContent = isMasked
                ? (valueEl.dataset.full || valueEl.textContent)
                : (valueEl.dataset.full ? valueEl.dataset.full.replace(/.(?=.{4})/g, '*') : valueEl.textContent);
        });
    });

    panel.querySelectorAll('[data-role="integration-edit"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            console.log('Изменить интеграцию'); // заглушка бэкенда
        });
    });

    panel.querySelectorAll('[data-role="integration-test"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            console.log('Тестирование интеграции'); // заглушка бэкенда
            alert('Тестовое письмо отправлено');
        });
    });

    panel.querySelectorAll('[data-role="integration-connect"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            console.log('Подключение аналитики'); // заглушка бэкенда
        });
    });

    const saveBtn = panel.querySelector('[data-role="integration-save"]');
    saveBtn?.addEventListener('click', () => {
        console.log('Сохранение настроек интеграций'); // заглушка бэкенда
    });
}

initIntegrationTab();



/* ===== Settings — Languages tab ===== */

function initLangInterfaceList() {
    const list = document.querySelector('[data-role="lang-interface-list"]');
    if (!list) return;

    const items = list.querySelectorAll('.role-list__item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('role-list__item--active'));
            item.classList.add('role-list__item--active');
            console.log('Язык интерфейса:', item.dataset.value);
        });
    });
}

// Универсальный drag-and-drop для списка (поддерживаемые языки / приоритет контента)
function initDragList(selector, itemClass, dragClass, onReorder) {
    const list = document.querySelector(selector);
    if (!list) return;

    let draggedEl = null;

    list.addEventListener('dragstart', (e) => {
        const item = e.target.closest(`.${itemClass}`);
        if (!item) return;
        draggedEl = item;
        item.classList.add(dragClass);
        e.dataTransfer.effectAllowed = 'move';
    });

    list.addEventListener('dragend', () => {
        draggedEl?.classList.remove(dragClass);
        draggedEl = null;
        onReorder?.(list);
    });

    list.addEventListener('dragover', (e) => {
        e.preventDefault();
        const target = e.target.closest(`.${itemClass}`);
        if (!target || target === draggedEl) return;

        const rect = target.getBoundingClientRect();
        const isAfter = e.clientY - rect.top > rect.height / 2;
        list.insertBefore(draggedEl, isAfter ? target.nextSibling : target);
    });
}

function initLangSupportList() {
    initDragList('[data-role="lang-support-list"]', 'lang-support-item', 'lang-support-item--dragging', (list) => {
        const order = Array.from(list.querySelectorAll('.lang-support-item')).map(i => i.dataset.value);
        console.log('Новый порядок поддерживаемых языков:', order);
    });
}

function initLangPriorityList() {
    initDragList('[data-role="lang-priority-list"]', 'lang-priority-item', 'lang-priority-item--dragging', (list) => {
        const items = Array.from(list.querySelectorAll('.lang-priority-item'));
        items.forEach((item, index) => {
            item.querySelector('.lang-priority-item__number').textContent = index + 1;
        });
        console.log('Новый порядок приоритета:', items.map(i => i.dataset.value));
    });
}

function initLanguagesForm() {
    const form = document.getElementById('languages-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const interfaceLang = form.querySelector('.lang-interface-list .role-list__item--active')?.dataset.value;

        const supportedLangs = Array.from(form.querySelectorAll('.lang-support-item'))
            .map(item => ({
                value: item.dataset.value,
                enabled: item.querySelector('input[type="checkbox"]').checked,
            }));

        const contentPriority = Array.from(form.querySelectorAll('.lang-priority-item'))
            .map(item => item.dataset.value);

        const autoDetect = form.querySelector('[name="autoDetectLang"]')?.checked;

        const dateFormat = form.querySelector('.lang-format-field:nth-of-type(1) .admin-select__item--active')?.dataset.value;
        const numberFormat = form.querySelector('.lang-format-field:nth-of-type(2) .admin-select__item--active')?.dataset.value;

        console.log('Сохранение настроек языков:', {
            interfaceLang, supportedLangs, contentPriority, autoDetect, dateFormat, numberFormat,
        }); // заглушка бэкенда
    });
}

initLangInterfaceList();
initLangSupportList();
initLangPriorityList();
initLanguagesForm();