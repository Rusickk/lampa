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
            '    /* Отключение тяжелых фильтров блюра для разгрузки мобильного GPU */',
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
            '    /* Очистка фона и теней карточки на мобильных */',
            '    .full-start-new__right {',
            '        background: none !important;',
            '        border: none !important;',
            '        border-radius: 0 !important;',
            '        box-shadow: none !important;',
            '        outline: none !important;',
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
            '    /* Блок заголовка и логотипа фильма */',
            '    .full-start-new__title {',
            '        position: relative !important;',
            '        width: 100% !important;',
            '        display: flex !important;',
            '        justify-content: center !important;',
            '        align-items: center !important;',
            '        min-height: 50px !important;',
            '        margin: 0.4em auto !important;',
            '        text-align: center !important;',
            '        box-sizing: border-box !important;',
            '    }',
            '',
            '    .full-start-new__logo {',
            '        max-height: 80px !important;',
            '        max-width: 85% !important;',
            '        width: auto !important;',
            '        height: auto !important;',
            '        object-fit: contain !important;',
            '        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8)) !important;',
            '        -webkit-filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8)) !important;',
            '    }',
            '',
            '    /* Мягкий градиент постера в черный фон */',
            '    .full-start-new__poster {',
            '        position: relative !important;',
            '        overflow: visible !important;',
            '    }',
            '',
            '    .full-start-new__poster img,',
            '    .full--poster {',
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
            '    .full-start-new__head {',
            '        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6) !important;',
            '    }',
            '',
            '    /* Центрирование элементов карточки */',
            '    .full-start-new__right,',
            '    .full-start__left {',
            '        display: flex !important;',
            '        flex-direction: column !important;',
            '        justify-content: center !important;',
            '        align-items: center !important;',
            '    }',
            '',
            '    .full-start-new__buttons,',
            '    .full-start-new__rate-line,',
            '    .full-start__buttons,',
            '    .full-start__details {',
            '        justify-content: center !important;',
            '        align-items: center !important;',
            '        display: flex !important;',
            '        flex-direction: row !important;',
            '        gap: 0.5em !important;',
            '        flex-wrap: wrap !important;',
            '    }',
            '',
            '    .full-start-new__details,',
            '    .full-descr__details,',
            '    .full-descr__tags {',
            '        justify-content: center !important;',
            '        align-items: center !important;',
            '        display: flex !important;',
            '        flex-direction: row !important;',
            '        flex-wrap: wrap !important;',
            '    }',
            '',
            '    /* Текст описания фильма: выравнивание по центру без поломки абзацев */',
            '    .full-descr__text {',
            '        text-align: center !important;',
            '        line-height: 1.5 !important;',
            '    }',
            '',
            '    .full-start-new__tagline,',
            '    .full-start__title,',
            '    .full-start__title-original {',
            '        text-align: center !important;',
            '        width: 100% !important;',
            '    }',
            '',
            '    /* Центрирование заголовков секций (Рекомендации, Актеры, Сезоны и др.) */',
            '    .items-line__head {',
            '        display: flex !important;',
            '        justify-content: center !important;',
            '        align-items: center !important;',
            '        text-align: center !important;',
            '        width: 100% !important;',
            '    }',
            '',
            '    .items-line__title {',
            '        text-align: center !important;',
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
    // 2. ВЫБОР И ЗАГРУЗКА ЛОГОТИПА ИЗ TMDB
    // =====================================================================

    // Поиск лучшего логотипа по языку (по аналогии с media_loading_data ядра Lampa)
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

    // Формирование ссылки на логотип
    function getLogoUrl(filePath) {
        if (!filePath) return '';
        var cleanPath = filePath.replace(/\.svg$/i, '.png');
        if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.image === 'function') {
            return Lampa.TMDB.image('/t/p/w300' + cleanPath);
        }
        if (window.Lampa && Lampa.Api && typeof Lampa.Api.img === 'function') {
            return Lampa.Api.img(cleanPath, 'w300');
        }
        return 'https://image.tmdb.org/t/p/w300' + cleanPath;
    }

    // Подстановка логотипа в карточку фильма
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

            var img = new Image();
            img.className = 'full-start-new__logo';
            img.alt = origTitleText;

            img.onload = function () {
                if (!titleElem.closest('body').length) return;
                titleElem.addClass('has--logo');
                titleElem.empty().append(img);
            };

            img.onerror = function () {
                // Если картинка не загрузилась, оставляем исходный текст
                titleElem.text(origTitleText);
            };

            img.src = logoUrl;
        }

        // 1. Проверяем, есть ли уже логотипы в объекте фильма (встроены в append_to_response TMDB)
        if (movie.images && movie.images.logos && movie.images.logos.length > 0) {
            var best = findBestLogo(movie.images.logos);
            if (best) {
                renderLogo(best);
                return;
            }
        }

        // 2. Если логотипов не было в ответе, запрашиваем через TMDB Images API
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

        // Подписка на открытие полной карточки фильма
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('full', function (e) {
                if (window.innerWidth > 480) return;

                // В ядре Lampa событие окончания загрузки пишется как 'complite'
                if (e.type === 'complite' || e.type === 'complete') {
                    var movieData = (e.data && e.data.movie) || (e.object && e.object.card);
                    var bodyElem = e.body || (e.object && e.object.activity && e.object.activity.render && e.object.activity.render());
                    if (movieData && bodyElem) {
                        applyMovieLogo(bodyElem, movieData);
                    }
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
