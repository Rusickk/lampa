(function () {
    'use strict';

    if (window.plugin_cleaner_ready) return;
    window.plugin_cleaner_ready = true;

    // 1. Пункты меню по системному data-action (пункт timetable / Расписание сохранён)
    var REMOVE_ACTIONS = [
        'feed',        // Лента
        'cartoon',     // Мультфильмы
        'myperson',    // Мои персоны
        'filter',      // Фильтр
        'relise',      // Релизы
        'mytorrents',  // Мои торренты
        'subscribes',  // Подписки
        'anime'        // Аниме
    ];

    // 2. Лишние кнопки, иконки и колокольчик
    var REMOVE_SELECTORS = [
        '.button--options',   // Три точки / параметры в карточке
        '.button--reaction',  // Реакции / эмодзи в карточке
        '.notice--icon',      // Колокольчик уведомлений в шапке
        '.icon--star',        // Звездочки-бейджи
        '.icon--fire',        // Огонь-бейджи
        '.icon--top'          // Топ-бейджи
    ];

    // 3. Текстовые названия для пунктов меню и источников поиска (в нижнем регистре)
    var REMOVE_TEXTS = [
        'клубничка',
        'spider',
        'anime',
        'спонсор',
        'лента',
        'мультфильмы',
        'мои персоны',
        'фильтр',
        'релизы',
        'мои торренты',
        'подписки',
        'аниме'
    ];

    // 4. Текстовые кнопки спонсоров / рекламы
    var SPONSOR_TEXTS = [
        'спонсор',
        'клубничка'
    ];

    // Отключение встроенных фич через нативные флаги Lampa (предотвращает создание в ядре)
    try {
        window.lampa_settings = window.lampa_settings || {};
        window.lampa_settings.disable_features = window.lampa_settings.disable_features || {};
        window.lampa_settings.disable_features.reactions = true;
        window.lampa_settings.disable_features.persons = true;
        window.lampa_settings.disable_features.subscribe = true;
        window.lampa_settings.feed = false;
    } catch (e) {}

    // =====================================================================
    // УРОВЕНЬ 1: Мгновенное скрытие через CSS (Zero-Flicker & Zero-CPU)
    // =====================================================================
    function injectStyles() {
        if (document.getElementById('lampa-cleaner-style')) return;

        var cssRules = [
            // Скрытие пунктов меню по data-action
            '.menu__item[data-action="feed"],',
            '.menu__item[data-action="cartoon"],',
            '.menu__item[data-action="myperson"],',
            '.menu__item[data-action="filter"],',
            '.menu__item[data-action="relise"],',
            '.menu__item[data-action="mytorrents"],',
            '.menu__item[data-action="subscribes"],',
            '.menu__item[data-action="anime"],',
            // Скрытие кнопок в карточке и иконок
            '.button--options,',
            '.button--reaction,',
            '.notice--icon,',
            '.icon--star,',
            '.icon--fire,',
            '.icon--top {',
            '    display: none !important;',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.id = 'lampa-cleaner-style';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(cssRules));
        (document.head || document.documentElement).appendChild(style);
    }

    injectStyles();

    // =====================================================================
    // УРОВЕНЬ 2: Точечная очистка DOM для пульта и Navigator
    // =====================================================================
    var isCleaning = false;

    function cleanDOM() {
        if (isCleaning) return;
        isCleaning = true;

        try {
            // 1. Удаление пунктов меню по data-action
            for (var a = 0; a < REMOVE_ACTIONS.length; a++) {
                var action = REMOVE_ACTIONS[a];
                var actionItems = document.querySelectorAll('.menu__item[data-action="' + action + '"]');
                for (var i = 0; i < actionItems.length; i++) {
                    actionItems[i].remove();
                }
            }

            // 2. Удаление кнопок и иконок по селекторам
            for (var s = 0; s < REMOVE_SELECTORS.length; s++) {
                var selItems = document.querySelectorAll(REMOVE_SELECTORS[s]);
                for (var j = 0; j < selItems.length; j++) {
                    selItems[j].remove();
                }
            }

            // 3. Безопасная проверка текстовых пунктов меню (включая сторонние плагины)
            var menuItems = document.querySelectorAll('.menu__item');
            for (var m = 0; m < menuItems.length; m++) {
                var menuItem = menuItems[m];
                var titleElem = menuItem.querySelector('.menu__text') || menuItem.querySelector('.menu__title') || menuItem;
                var itemText = (titleElem.textContent || '').trim().toLowerCase();
                if (itemText && REMOVE_TEXTS.indexOf(itemText) !== -1) {
                    menuItem.remove();
                }
            }

            // 4. Удаление источников и вкладок в поиске (Клубничка, Spider, Anime и др.)
            var searchSources = document.querySelectorAll('.search-source, .search-source__item');
            for (var src = 0; src < searchSources.length; src++) {
                var sourceItem = searchSources[src];
                var tabElem = sourceItem.querySelector('.search-source__tab') || sourceItem;
                var sourceText = (tabElem.textContent || '').trim().toLowerCase();
                if (sourceText && REMOVE_TEXTS.indexOf(sourceText) !== -1) {
                    sourceItem.remove();
                }
            }

            // 5. Удаление кнопок спонсоров / рекламы (точечно по классу .simple-button, НЕ трогая фильмы)
            var simpleButtons = document.querySelectorAll('.simple-button');
            for (var b = 0; b < simpleButtons.length; b++) {
                var btn = simpleButtons[b];
                var btnText = (btn.textContent || '').trim().toLowerCase();
                if (btnText && SPONSOR_TEXTS.indexOf(btnText) !== -1) {
                    btn.remove();
                }
            }
        } catch (e) {
            // Тихое игнорирование возможных ошибок DOM
        } finally {
            isCleaning = false;
        }
    }

    // =====================================================================
    // УРОВЕНЬ 3: Оптимизированный планировщик вызовов (Debounce)
    // =====================================================================
    var scheduled = false;

    function scheduleClean() {
        if (scheduled) return;
        scheduled = true;

        var defer = window.requestAnimationFrame || function (cb) { setTimeout(cb, 20); };
        defer(function () {
            scheduled = false;
            cleanDOM();
        });
    }

    // =====================================================================
    // УРОВЕНЬ 4: Интеграция с событиями Lampa и MutationObserver
    // =====================================================================
    function initPlugin() {
        cleanDOM();

        // Подписка на нативные события Lampa
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('menu', function (e) {
                if (e.type === 'start' || e.type === 'end') scheduleClean();
            });

            Lampa.Listener.follow('activity', function () {
                scheduleClean();
            });

            Lampa.Listener.follow('search', function () {
                scheduleClean();
            });
        }

        // MutationObserver взамен устаревшего и вызывающего лаги DOMNodeInserted
        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function (mutations) {
                if (isCleaning) return;
                for (var i = 0; i < mutations.length; i++) {
                    if (mutations[i].addedNodes && mutations[i].addedNodes.length > 0) {
                        scheduleClean();
                        break;
                    }
                }
            });

            var targetNode = document.body || document.documentElement;
            if (targetNode) {
                observer.observe(targetNode, {
                    childList: true,
                    subtree: true
                });
            }
        }

        // Первые 3 секунды периодически контролируем появление асинхронных элементов
        var checks = 0;
        var startInterval = setInterval(function () {
            scheduleClean();
            checks++;
            if (checks >= 10) clearInterval(startInterval);
        }, 300);
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
