(function () {
    'use strict';

    if (window.plugin_mob_styles_ready) return;
    window.plugin_mob_styles_ready = true;

    // =====================================================================
    // 1. СТИЛИ ДЛЯ МОБИЛЬНЫХ ЭКРАНОВ (<= 480px)
    // =====================================================================
    function injectStyles() {
        if (document.getElementById('lampa-mob-styles')) return;

        var css = [
            '@media screen and (max-width: 480px) {',
            '    /* 1. Отключение тяжелого блюра для разгрузки мобильного GPU */',
            '    .full-start__poster,',
            '    .full-start-new__poster,',
            '    .full-start__poster img,',
            '    .full-start-new__poster img,',
            '    .screensaver__slides-slide img,',
            '    .screensaver__bg,',
            '    .card--collection .card__img {',
            '        filter: none !important;',
            '        -webkit-filter: none !important;',
            '    }',
            '',
            '    .background {',
            '        background: #000 !important;',
            '    }',
            '',
            '    /* 2. Чистый фон без лишних серых плашек и теней */',
            '    .full-start-new__right {',
            '        background: none !important;',
            '        border: none !important;',
            '        border-radius: 0 !important;',
            '        box-shadow: none !important;',
            '        outline: none !important;',
            '        margin-top: -38px !important;',
            '        position: relative !important;',
            '        z-index: 2 !important;',
            '    }',
            '    .full-start-new__right::before,',
            '    .full-start-new__right::after {',
            '        background: none !important;',
            '        box-shadow: none !important;',
            '        border: none !important;',
            '        opacity: 0 !important;',
            '        content: unset !important;',
            '    }',
            '',
            '    /* 3. Исправление отступов: убираем огромную пустоту перед «Подробно» */',
            '    .full-start-new {',
            '        padding-bottom: 0.5em !important;',
            '    }',
            '',
            '    .full-start-new__reactions:empty {',
            '        display: none !important;',
            '        margin: 0 !important;',
            '        min-height: 0 !important;',
            '    }',
            '',
            '    /* Отступ снизу, чтобы описание не упиралось в нижнюю панель навигации */',
            '    .full-descr {',
            '        padding-bottom: 5em !important;',
            '    }',
            '',
            '    /* 4. Задник 16:9 и плавное затемнение постера снизу в чёрный фон */',
            '    .full-start-new__poster {',
            '        position: relative !important;',
            '        padding-bottom: 56.25% !important; /* Ровно 16:9 */',
            '        overflow: visible !important;',
            '    }',
            '',
            '    .full-start-new__poster img,',
            '    .full--poster {',
            '        object-fit: cover !important;',
            '        mask-image: linear-gradient(to bottom,',
            '            rgba(0, 0, 0, 1) 0%,',
            '            rgba(0, 0, 0, 1) 50%,',
            '            rgba(0, 0, 0, 0.8) 70%,',
            '            rgba(0, 0, 0, 0.4) 85%,',
            '            rgba(0, 0, 0, 0) 100%) !important;',
            '        -webkit-mask-image: linear-gradient(to bottom,',
            '            rgba(0, 0, 0, 1) 0%,',
            '            rgba(0, 0, 0, 1) 50%,',
            '            rgba(0, 0, 0, 0.8) 70%,',
            '            rgba(0, 0, 0, 0.4) 85%,',
            '            rgba(0, 0, 0, 0) 100%) !important;',
            '    }',
            '',
            '    .full-start-new__img {',
            '        border-radius: 0 !important;',
            '    }',
            '',
            '    /* 5. Скрытие года и страны над логотипом */',
            '    .full-start-new__head {',
            '        display: none !important;',
            '    }',
            '',
            '    /* 5. Логотип фильма: выравнивание по левому краю и плавное появление */',
            '    .full-start-new__title {',
            '        display: flex !important;',
            '        justify-content: flex-start !important;',
            '        align-items: center !important;',
            '        text-align: left !important;',
            '        margin-bottom: 0.2em !important;',
            '        transition: opacity 0.2s ease !important;',
            '    }',
            '',
            '    .full-start-new__logo {',
            '        max-height: 75px !important;',
            '        max-width: 85% !important;',
            '        width: auto !important;',
            '        height: auto !important;',
            '        object-fit: contain !important;',
            '        display: block !important;',
            '        margin: 0 !important;',
            '        margin-right: auto !important;',
            '        filter: none !important;',
            '        -webkit-filter: none !important;',
            '        opacity: 0;',
            '        animation: logoFadeIn 0.25s ease-out forwards !important;',
            '    }',
            '',
            '    @keyframes logoFadeIn {',
            '        from { opacity: 0; transform: translateY(3px); }',
            '        to { opacity: 1; transform: translateY(0); }',
            '    }',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.id = 'lampa-mob-styles';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        (document.head || document.documentElement).appendChild(style);
    }

    injectStyles();

    // =====================================================================
    // 2. КЭШ И ОПТИМИЗАЦИЯ ВЫСОКОГО КАЧЕСТВА (FullHD)
    // =====================================================================

    var logoCache = {};

    function getCachedLogo(id) {
        if (!id) return null;
        if (logoCache[id]) return logoCache[id];
        try {
            if (window.Lampa && Lampa.Storage) {
                var saved = Lampa.Storage.get('mob_logo_' + id, '');
                if (saved) {
                    logoCache[id] = saved;
                    return saved;
                }
            }
        } catch (e) {}
        return null;
    }

    function setCachedLogo(id, filePath) {
        if (!id || !filePath) return;
        logoCache[id] = filePath;
        try {
            if (window.Lampa && Lampa.Storage) {
                Lampa.Storage.set('mob_logo_' + id, filePath);
            }
        } catch (e) {}
    }

    // Повышение качества задника до четкого w1280 (HD / FullHD)
    function upgradeBackdropQuality(activityBody, movie) {
        if (!activityBody || !movie || !movie.backdrop_path) return;
        if (window.innerWidth > 480) return;

        var hdBackdropUrl = '';
        if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.image === 'function') {
            hdBackdropUrl = Lampa.TMDB.image('/t/p/w1280' + movie.backdrop_path);
        } else if (window.Lampa && Lampa.Api && typeof Lampa.Api.img === 'function') {
            hdBackdropUrl = Lampa.Api.img(movie.backdrop_path, 'w1280');
        } else {
            hdBackdropUrl = 'https://image.tmdb.org/t/p/w1280' + movie.backdrop_path;
        }

        if (hdBackdropUrl) {
            var posterImg = activityBody.find('.full-start-new__poster img, .full--poster');
            if (posterImg.length) {
                var current = posterImg.attr('src') || '';
                if (current !== hdBackdropUrl) {
                    posterImg.attr('src', hdBackdropUrl);
                }
            }
        }
    }

    // Поиск лучшего логотипа по языку
    function findBestLogo(logos) {
        if (!Array.isArray(logos) || !logos.length) return null;

        var lang = 'ru';
        try {
            if (window.Lampa && Lampa.Storage) {
                lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
            }
        } catch (e) {}

        lang = String(lang).toLowerCase().split(/[-_]/)[0];

        // Приоритеты: язык пользователя -> английский -> без языка -> любой доступный
        var priorities = [lang, 'en', null, ''];
        for (var p = 0; p < priorities.length; p++) {
            var targetLang = priorities[p];
            for (var i = 0; i < logos.length; i++) {
                var item = logos[i];
                if (!item || !item.file_path) continue;
                var itemLang = item.iso_639_1 ? String(item.iso_639_1).toLowerCase() : null;
                if (targetLang === null ? !itemLang : itemLang === targetLang) {
                    return item.file_path;
                }
            }
        }

        return logos[0].file_path || null;
    }

    // Формирование ссылки на логотип в высоком разрешении w500 (вместо мутного w300)
    function getLogoUrl(filePath) {
        if (!filePath) return '';
        var cleanPath = filePath.replace(/\.svg$/i, '.png');
        if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.image === 'function') {
            return Lampa.TMDB.image('/t/p/w500' + cleanPath);
        }
        if (window.Lampa && Lampa.Api && typeof Lampa.Api.img === 'function') {
            return Lampa.Api.img(cleanPath, 'w500');
        }
        return 'https://image.tmdb.org/t/p/w500' + cleanPath;
    }

    // Мгновенная подстановка и кэширование логотипа
    function applyMovieLogo(activityBody, movie) {
        if (!activityBody || !movie || !movie.id) return;
        if (window.innerWidth > 480) return;

        var titleElem = activityBody.find('.full-start-new__title');
        if (!titleElem.length || titleElem.hasClass('has--logo')) return;

        var origTitleText = titleElem.text().trim();

        function renderLogo(filePath) {
            if (!filePath) return;
            var logoUrl = getLogoUrl(filePath);
            if (!logoUrl) return;

            setCachedLogo(movie.id, filePath);

            var img = new Image();
            img.className = 'full-start-new__logo';
            img.alt = origTitleText;

            img.onload = function () {
                if (!titleElem.closest('body').length) return;
                titleElem.addClass('has--logo');
                titleElem.empty().append(img);
            };

            img.onerror = function () {
                titleElem.text(origTitleText);
            };

            img.src = logoUrl;
        }

        // 1. Проверяем кэш логотипов (мгновенный показ за 0 мс)
        var cached = getCachedLogo(movie.id);
        if (cached) {
            renderLogo(cached);
            return;
        }

        // 2. Проверяем, есть ли уже логотипы в объекте фильма
        if (movie.images && movie.images.logos && movie.images.logos.length > 0) {
            var best = findBestLogo(movie.images.logos);
            if (best) {
                renderLogo(best);
                return;
            }
        }

        // 3. Быстрый параллельный запрос к TMDB Images API
        var type = (movie.type === 'tv' || movie.name || movie.first_air_date) ? 'tv' : 'movie';
        var apiKey = '';
        try {
            if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.key === 'function') apiKey = Lampa.TMDB.key();
            else if (window.Lampa && Lampa.Api && typeof Lampa.Api.key === 'function') apiKey = Lampa.Api.key();
        } catch (e) {}

        if (apiKey) {
            var query = type + '/' + movie.id + '/images?api_key=' + apiKey + '&include_image_language=ru,en,null';
            var url = (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.api === 'function')
                ? Lampa.TMDB.api(query)
                : 'https://api.themoviedb.org/3/' + query;

            var req = (window.Lampa && Lampa.Reguest) ? new Lampa.Reguest() : null;
            if (req && req.silent) {
                req.silent(url, function (json) {
                    if (json && json.logos && json.logos.length > 0) {
                        var bestLogo = findBestLogo(json.logos);
                        if (bestLogo) renderLogo(bestLogo);
                    }
                });
            } else if (window.$ && $.get) {
                $.get(url, function (json) {
                    if (json && json.logos && json.logos.length > 0) {
                        var bestLogo = findBestLogo(json.logos);
                        if (bestLogo) renderLogo(bestLogo);
                    }
                });
            }
        }
    }

    // =====================================================================
    // 3. ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ СОБЫТИЙ LAMPA
    // =====================================================================
    function initPlugin() {
        injectStyles();

        // Отключаем блюр постеров в настройках Lampa для мобильных
        if (window.innerWidth <= 480) {
            try {
                if (window.lampa_settings) {
                    window.lampa_settings.blur_poster = false;
                }
            } catch (e) {}
        }

        // Обработка карточки фильма: перехватываем как 'start' (моментально), так и 'complite'
        function handleFullCard(e) {
            if (window.innerWidth > 480) return;
            var movieData = (e.data && e.data.movie) || (e.object && e.object.card);
            var bodyElem = e.body || (e.object && e.object.activity && e.object.activity.render && e.object.activity.render());

            if (movieData && bodyElem) {
                upgradeBackdropQuality(bodyElem, movieData);
                applyMovieLogo(bodyElem, movieData);
            }
        }

        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'start') {
                    handleFullCard(e);
                } else if (e.type === 'complite' || e.type === 'complete') {
                    handleFullCard(e);
                }
            });
        }
    }

    if (window.appready) {
        initPlugin();
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initPlugin();
        });
    } else {
        document.addEventListener('DOMContentLoaded', initPlugin);
    }
})();
