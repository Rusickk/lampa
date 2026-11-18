(function () {
    'use strict';

    // =========================================================================
    // БЛОК 1: КОНФИГУРАЦИЯ, КОНСТАНТЫ И ОБЩИЕ УТИЛИТЫ
    // =========================================================================

    var jq = window.jQuery || window.$;
    var network = new Lampa.Reguest();

    // Единый бэкенд на Cloudflare Workers
    var scriptUrl = 'https://kp.kovalchukruslan21.workers.dev/';

    // Иконки SVG
    var kpLogo = '<svg viewBox="0 0 215 215" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M215 121.415l-99.297-6.644 90.943 36.334a106.416 106.416 0 0 0 8.354-29.69z" /><path fill="currentColor" d="M194.608 171.609C174.933 197.942 143.441 215 107.948 215 48.33 215 0 166.871 0 107.5 0 48.13 48.33 0 107.948 0c35.559 0 67.102 17.122 86.77 43.539l-90.181 48.07L162.57 32.25h-32.169L90.892 86.862V32.25H64.77v150.5h26.123v-54.524l39.509 54.524h32.169l-56.526-57.493 88.564 46.352z" /><path d="M206.646 63.895l-90.308 36.076L215 93.583a106.396 106.396 0 0 0-8.354-29.688z" fill="currentColor"/></svg>';
    var kpSettingsIcon = '<svg viewBox="0 0 215 215" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M215 121.415l-99.297-6.644 90.943 36.334a106.416 106.416 0 0 0 8.354-29.69z" /><path fill="white" d="M194.608 171.609C174.933 197.942 143.441 215 107.948 215 48.33 215 0 166.871 0 107.5 0 48.13 48.33 0 107.948 0c35.559 0 67.102 17.122 86.77 43.539l-90.181 48.07L162.57 32.25h-32.169L90.892 86.862V32.25H64.77v150.5h26.123v-54.524l39.509 54.524h32.169l-56.526-57.493 88.564 46.352z" /><path fill="white" d="M206.646 63.895l-90.308 36.076L215 93.583a106.396 106.396 0 0 0-8.354-29.688z"/></svg>';
    var buttonRatingIcon = '<svg class="button--kinopoisk_rating_icon" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.6162 7.10981L15.8464 7.55198L16.3381 7.63428L22.2841 8.62965C22.8678 8.72736 23.0999 9.44167 22.6851 9.86381L18.4598 14.1641L18.1104 14.5196L18.184 15.0127L19.0748 20.9752C19.1622 21.5606 18.5546 22.002 18.025 21.738L12.6295 19.0483L12.1833 18.8259L11.7372 19.0483L6.34171 21.738C5.81206 22.002 5.20443 21.5606 5.29187 20.9752L6.18264 15.0127L6.25629 14.5196L5.9069 14.1641L1.68155 9.86381C1.26677 9.44167 1.49886 8.72736 2.08255 8.62965L8.02855 7.63428L8.52022 7.55198L8.75043 7.10981L11.5345 1.76241C11.8078 1.23748 12.5589 1.23748 12.8322 1.76241L15.6162 7.10981Z" stroke="currentColor" stroke-width="2.2"></path></svg>';
    var buttonTrailersIcon = '<svg class="button--kinopoisk_trailers_icon" width="239" height="239" viewBox="0 0 239 239" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"><path fill="currentColor" d="M215 121.415l-99.297-6.644 90.943 36.334a106.416 106.416 0 0 0 8.354-29.69z" /><path fill="currentColor" d="M194.608 171.609C174.933 197.942 143.441 215 107.948 215 48.33 215 0 166.871 0 107.5 0 48.13 48.33 0 107.948 0c35.559 0 67.102 17.122 86.77 43.539l-90.181 48.07L162.57 32.25h-32.169L90.892 86.862V32.25H64.77v150.5h26.123v-54.524l39.509 54.524h32.169l-56.526-57.493 88.564 46.352z" /><path d="M206.646 63.895l-90.308 36.076L215 93.583a106.396 106.396 0 0 0-8.354-29.688z" fill="currentColor"/></svg>';

    // Хелперы учетной записи
    function getAccountToken() {
        return Lampa.Storage.get('kp_smart_token', '') || Lampa.Storage.get('kinopoisk_access_token', '');
    }

    function getAccountEmail() {
        return Lampa.Storage.get('kp_smart_email', '') || Lampa.Storage.get('kinopoisk_email', '');
    }

    function getAccountAvatar() {
        return Lampa.Storage.get('kp_user_avatar', '');
    }

    function getSocialAlias() {
        return Lampa.Storage.get('kp_social_alias', 'rusick') || 'rusick';
    }

    function clearAccount() {
        Lampa.Storage.set('kp_smart_token', '');
        Lampa.Storage.set('kp_smart_email', '');
        Lampa.Storage.set('kp_user_avatar', '');
        Lampa.Storage.set('kinopoisk_access_token', '');
        Lampa.Storage.set('kinopoisk_email', '');
        Lampa.Storage.set('kinopoisk_refresh_token', '');
    }

    function clearClientCache() {
        try {
            var keysToRemove = [];
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && (k.indexOf('kp_resolved_id_') === 0 || k.indexOf('kp_tmdb_') === 0 || k.indexOf('kp_trailers_') === 0)) {
                    keysToRemove.push(k);
                }
            }
            keysToRemove.forEach(function (k) {
                try {
                    localStorage.removeItem(k);
                } catch (e) {}
                try {
                    if (Lampa.Storage && Lampa.Storage.set) Lampa.Storage.set(k, '');
                } catch (e) {}
            });
        } catch (err) {}
    }

    function syncUserProfile(token, cb) {
        if (!token) return;
        network.silent('https://login.yandex.ru/info?format=json', function (userData) {
            if (userData) {
                if (userData.default_email) {
                    Lampa.Storage.set('kp_smart_email', userData.default_email);
                }
                if (userData.default_avatar_id) {
                    var avatarUrl = 'https://avatars.yandex.net/get-yapic/' + userData.default_avatar_id + '/islands-200';
                    Lampa.Storage.set('kp_user_avatar', avatarUrl);
                }
                if (cb) cb(userData);
            }
        }, function () {}, false, { headers: { 'Authorization': 'OAuth ' + token } });
    }

    var initToken = getAccountToken();
    if (initToken && !getAccountAvatar()) {
        syncUserProfile(initToken);
    }

    // Современные компактные всплывающие уведомления сверху (Lampa.Bell) без звука
    function showNotify(text, time) {
        if (window.Lampa && Lampa.Bell && Lampa.Bell.push) {
            var origPlay = (Lampa.Sound && Lampa.Sound.play) ? Lampa.Sound.play : null;
            if (origPlay) {
                Lampa.Sound.play = function (name) {
                    if (name === 'bell') return;
                    return origPlay.apply(this, arguments);
                };
            }
            try {
                Lampa.Bell.push({
                    text: text,
                    icon: kpLogo,
                    time: time || 2500
                });
            } finally {
                if (origPlay) Lampa.Sound.play = origPlay;
            }
        } else if (window.Lampa && Lampa.Noty && Lampa.Noty.show) {
            Lampa.Noty.show(text);
        }
    }

    // =========================================================================
    // БЛОК 2: АВТОРИЗАЦИЯ И МЕНЮ НАСТРОЕК
    // =========================================================================

    if (!window.lampa_settings.kinopoisk) {
        Lampa.SettingsApi.addComponent({
            component: 'kinopoisk',
            icon: kpSettingsIcon,
            name: 'Кинопоиск'
        });
    }

    Lampa.SettingsApi.addParam({
        component: 'kinopoisk',
        param: { type: 'title' },
        field: { name: 'Аккаунт' }
    });

    function renderAuthItem(item) {
        var token = getAccountToken();
        var email = getAccountEmail();
        var avatar = getAccountAvatar();

        if (token && !avatar) {
            syncUserProfile(token, function () {
                var newAvatar = getAccountAvatar();
                if (newAvatar) {
                    var img = item.find('.settings-param__avatar');
                    if (img.length) {
                        img.attr('src', newAvatar).show();
                    } else {
                        item.prepend('<img class="settings-param__avatar" src="' + newAvatar + '" style="width: 2.6em; height: 2.6em; border-radius: 50%; object-fit: cover; margin-right: 1.2em; flex-shrink: 0;" />');
                    }
                }
            });
        }

        var avatarImg = item.find('.settings-param__avatar');
        if (token && avatar) {
            if (avatarImg.length === 0) {
                avatarImg = jq('<img class="settings-param__avatar" src="' + avatar + '" style="width: 2.6em; height: 2.6em; border-radius: 50%; object-fit: cover; margin-right: 1.2em; flex-shrink: 0;" />');
                avatarImg.on('error', function () { jq(this).hide(); });
                item.prepend(avatarImg);
            } else {
                avatarImg.attr('src', avatar).show();
            }
        } else {
            if (avatarImg.length) avatarImg.hide();
        }

        var nameElem = item.find('.settings-param__name');
        var descrElem = item.find('.settings-param__descr');

        if (token) {
            item.css({
                display: 'flex',
                'align-items': 'center'
            });
            nameElem.text(email || 'Аккаунт подключен');
            descrElem.text('').hide();
        } else {
            item.css({
                display: 'block'
            });
            nameElem.text('Авторизация в Яндексе');
            descrElem.text('Нажмите для входа по коду').show();
        }
    }

    function updateSettingsUI() {
        var token = getAccountToken();
        var $ = window.jQuery || window.$;

        var authParam = $('div[data-name="kp_smart_auth"]');
        var logoutParam = $('div[data-name="kp_smart_logout"]');

        if (authParam.length) renderAuthItem(authParam);

        if (token) {
            logoutParam.show();
        } else {
            logoutParam.hide();
        }
    }

    // Кнопка статуса аккаунта / входа
    Lampa.SettingsApi.addParam({
        component: 'kinopoisk',
        param: { type: 'button', name: 'kp_smart_auth' },
        field: {
            name: getAccountToken() ? (getAccountEmail() || 'Аккаунт подключен') : 'Авторизация в Яндексе',
            description: getAccountToken() ? '' : 'Нажмите для входа по коду'
        },
        onRender: function (item) {
            renderAuthItem(item);
        },
        onChange: function () {
            var token = getAccountToken();
            var email = getAccountEmail();

            if (token) {
                showNotify('Вы уже вошли как ' + (email || 'пользователь'));
            } else {
                Lampa.Controller.toContent();
                startAuth();
            }
        }
    });

    // Отдельная кнопка «Выйти из аккаунта»
    Lampa.SettingsApi.addParam({
        component: 'kinopoisk',
        param: { type: 'button', name: 'kp_smart_logout' },
        field: {
            name: 'Выйти из аккаунта',
            description: 'Завершить сеанс на этом устройстве'
        },
        onRender: function (item) {
            var token = getAccountToken();
            if (!token) item.hide();
            else item.show();
        },
        onChange: function () {
            var token = getAccountToken();
            if (!token) return;

            Lampa.Select.show({
                title: 'Выйти из аккаунта?',
                items: [
                    { title: 'Да', confirm: true },
                    { title: 'Отмена' }
                ],
                onSelect: function (a) {
                    if (a.confirm) {
                        clearAccount();
                        updateSettingsUI();
                        showNotify('Вы вышли из аккаунта');
                    }
                    Lampa.Controller.toggle('settings_component');
                },
                onBack: function () {
                    Lampa.Controller.toggle('settings_component');
                }
            });
        }
    });

    // Кнопка «Очистить кэш»
    Lampa.SettingsApi.addParam({
        component: 'kinopoisk',
        param: { type: 'button', name: 'kp_smart_clear_cache' },
        field: {
            name: 'Очистить кэш',
            description: 'Сбросить сохраненные на устройстве ID фильмов и трейлеры'
        },
        onRender: function (item) {
            // Подпись автора внизу страницы настроек
            setTimeout(function () {
                var parent = item.parent();
                if (parent && parent.length && parent.find('.kp-settings-author').length === 0) {
                    parent.append('<div class="kp-settings-author" style="text-align: center; margin-top: 4.5em; padding-bottom: 2em; opacity: 0.4; font-size: 0.85em; letter-spacing: 0.05em; pointer-events: none;">Автор плагина : github.com/Rusickk</div>');
                }
            }, 60);
        },
        onChange: function () {
            Lampa.Select.show({
                title: 'Очистить кэш плагина?',
                items: [
                    { title: 'Да, очистить', confirm: true },
                    { title: 'Отмена' }
                ],
                onSelect: function (a) {
                    if (a.confirm) {
                        clearClientCache();
                        showNotify('Кэш плагина успешно очищен');
                    }
                    Lampa.Controller.toggle('settings_component');
                },
                onBack: function () {
                    Lampa.Controller.toggle('settings_component');
                }
            });
        }
    });

    // Модальное окно авторизации через Яндекс Device Code
    function startAuth() {
        var client_id = '23cabbbdc6cd418abb4b39c32c41195d';
        var client_secret = '53bc75238f0c4d08a118e51fe9203300';
        var device_id = Lampa.Storage.get('kinopoisk_deviceid', '');

        network.silent('https://oauth.yandex.ru/device/code', function (data) {
            if (data && data.user_code) {
                var modalOpen = true;
                var isTv = Lampa.Platform && Lampa.Platform.tv && Lampa.Platform.tv();

                var modalClass = 'account-modal-split account-modal-split--device-code';
                if (isTv) {
                    modalClass += ' layer--' + (Lampa.Platform.mouse && Lampa.Platform.mouse() ? 'wheight' : 'height');
                }

                var html = jq('<div class="' + modalClass + '">' +
                    '<div class="account-modal-split__qr">' +
                        '<div class="account-modal-split__qr-code"></div>' +
                        '<div class="account-modal-split__qr-text">Сканируйте QR-код для быстрого входа</div>' +
                    '</div>' +
                    '<div class="account-modal-split__info">' +
                        '<div class="account-modal-split__title">Авторизация</div>' +
                        '<div class="account-modal-split__text">Откройте на телефоне или компьютере <span class="account-modal__site">yandex.ru/device</span> и введите код:</div>' +
                        '<div class="account-modal-split__device-code">' + data.user_code + '</div>' +
                        '<div class="account-modal-split__status">Ожидание подтверждения...</div>' +
                    '</div>' +
                '</div>');

                if (Lampa.Utils && Lampa.Utils.qrcode) {
                    var qrElem = html.find('.account-modal-split__qr-code');
                    var verifyUrl = data.verification_url || 'https://yandex.ru/device';
                    Lampa.Utils.qrcode(verifyUrl, qrElem, function () {
                        html.find('.account-modal-split__qr').addClass('hide');
                    });
                } else {
                    html.find('.account-modal-split__qr').addClass('hide');
                }

                Lampa.Modal.open({
                    title: '',
                    html: html,
                    size: isTv ? 'full' : 'medium',
                    scroll: { nopadding: true },
                    onBack: function () {
                        modalOpen = false;
                        clearInterval(timer);
                        Lampa.Modal.close();
                        Lampa.Controller.toggle('settings_component');
                    }
                });

                var intervalMs = (data.interval || 5) * 1000;
                var timer = setInterval(function () {
                    if (!modalOpen || !document.body.contains(html[0])) {
                        clearInterval(timer);
                        return;
                    }

                    network.silent('https://oauth.yandex.ru/token', function (tokenData) {
                        if (tokenData && tokenData.access_token) {
                            modalOpen = false;
                            clearInterval(timer);
                            Lampa.Storage.set('kp_smart_token', tokenData.access_token);
                            html.find('.account-modal-split__status').text('Получение профиля...');

                            network.silent('https://login.yandex.ru/info?format=json', function (userData) {
                                var email = (userData && userData.default_email) ? userData.default_email : 'Аккаунт подключен';
                                Lampa.Storage.set('kp_smart_email', email);
                                if (userData && userData.default_avatar_id) {
                                    var avatarUrl = 'https://avatars.yandex.net/get-yapic/' + userData.default_avatar_id + '/islands-200';
                                    Lampa.Storage.set('kp_user_avatar', avatarUrl);
                                }
                                updateSettingsUI();
                                Lampa.Modal.close();
                                Lampa.Controller.toggle('settings_component');
                                showNotify('Вы успешно вошли в аккаунт!');
                            }, function () {
                                Lampa.Storage.set('kp_smart_email', 'Аккаунт подключен');
                                updateSettingsUI();
                                Lampa.Modal.close();
                                Lampa.Controller.toggle('settings_component');
                                showNotify('Вы успешно вошли в аккаунт!');
                            }, false, { headers: { 'Authorization': 'OAuth ' + tokenData.access_token } });
                        }
                    }, function () {
                        // Ожидание подтверждения пользователем
                    }, {
                        grant_type: 'device_code',
                        code: data.device_code,
                        client_id: client_id,
                        client_secret: client_secret
                    });
                }, intervalMs);
            }
        }, function () {
            showNotify('Ошибка получения кода');
        }, {
            client_id: client_id,
            device_id: device_id
        });
    }

    // =========================================================================
    // БЛОК 3: КАРТОЧКА ФИЛЬМА («ОЦЕНКИ КП» И «ТРЕЙЛЕРЫ КП»)
    // =========================================================================

    Lampa.Listener.follow('full', function (e) {
        if (e.type !== 'complite') return;

        var checkTimer = setInterval(function () {
            var mainTarget = jq('.full-start-new__buttons, .full-start__buttons').first();
            var watchContainer = jq('.buttons--container');

            if (mainTarget.length > 0) {
                clearInterval(checkTimer);

                var movie = e.data.movie || e.data;
                if (!movie) return;

                var token = getAccountToken();

                // -------------------------------------------------------------
                // 3.1. Кнопка «КП» (в основном ряду карточки)
                // -------------------------------------------------------------
                if (mainTarget.find('.button--kinopoisk').length === 0) {
                    var btnKp = jq('<div class="full-start__button selector button--kinopoisk">' + kpLogo + '<span>КП</span></div>');
                    mainTarget.append(btnKp);

                    // Фоновая предзагрузка статуса (для мгновенного открытия)
                    function loadStatus(kpId, cb) {
                        if (movie._kp_status) {
                            if (cb) cb(movie._kp_status);
                            return;
                        }
                        if (movie._kp_status_loading) {
                            if (cb) {
                                var checkInterval = setInterval(function () {
                                    if (movie._kp_status) {
                                        clearInterval(checkInterval);
                                        cb(movie._kp_status);
                                    }
                                }, 80);
                            }
                            return;
                        }
                        movie._kp_status_loading = true;
                        network.silent(scriptUrl + '?method=getUserStatus&movie=' + kpId + '&oauth=' + token, function (res) {
                            movie._kp_status_loading = false;
                            movie._kp_status = res || { vote: 0, plannedToWatch: false, watched: false };
                            if (cb) cb(movie._kp_status);
                        }, function () {
                            movie._kp_status_loading = false;
                            movie._kp_status = { vote: 0, plannedToWatch: false, watched: false };
                            if (cb) cb(movie._kp_status);
                        });
                    }

                    function getOrResolveKpId(cb) {
                        var existingKpId = movie.kinopoisk_id ||
                            (e.data && e.data.card && e.data.card.kinopoisk_id) ||
                            (e.object && e.object.card && e.object.card.kinopoisk_id);

                        if (existingKpId) {
                            movie.kinopoisk_id = existingKpId;
                            cb(existingKpId);
                            return;
                        }

                        var isTv = (movie.type === 'tv' || movie.method === 'tv' || (e.data && (e.data.method === 'tv' || e.data.type === 'tv')) || !!movie.name || !!movie.first_air_date || !!movie.number_of_seasons || !!movie.seasons);
                        var movieType = isTv ? 'tv' : 'movie';
                        var cacheKeyId = 'kp_resolved_id_' + (movie.id || movie.imdb_id || encodeURIComponent(movie.original_title || movie.title || movie.name || ''));
                        var cachedId = Lampa.Storage.get(cacheKeyId, '');
                        if (cachedId) {
                            movie.kinopoisk_id = cachedId;
                            cb(cachedId);
                            return;
                        }

                        var movieYear = movie.release_date ? movie.release_date.slice(0, 4) : (movie.first_air_date ? movie.first_air_date.slice(0, 4) : (movie.year ? String(movie.year).slice(0, 4) : ''));
                        var movieTitle = movie.title || movie.name || movie.original_title || movie.original_name || '';

                        var reqUrl = scriptUrl + '?method=resolveId&imdb_id=' + encodeURIComponent(movie.imdb_id || '') +
                            '&tmdb_id=' + encodeURIComponent(movie.id || '') +
                            '&title=' + encodeURIComponent(movieTitle) +
                            '&year=' + encodeURIComponent(movieYear) +
                            '&type=' + encodeURIComponent(movieType);

                        network.silent(reqUrl, function (data) {
                            if (data && data.kinopoiskId) {
                                movie.kinopoisk_id = data.kinopoiskId;
                                Lampa.Storage.set(cacheKeyId, data.kinopoiskId);
                                cb(data.kinopoiskId);
                            } else {
                                showNotify('Не удалось найти фильм на Кинопоиске');
                            }
                        }, function () {
                            showNotify('Ошибка поиска фильма на Кинопоиске');
                        });
                    }

                    btnKp.on('hover:enter', function () {
                        if (!token) {
                            showNotify('Перейдите в Настройки -> Кинопоиск и авторизуйтесь');
                            return;
                        }

                        getOrResolveKpId(function (kpId) {
                            loadStatus(kpId, function (status) {
                                openKpMainMenu(kpId, status);
                            });
                        });
                    });

                    // Главное меню Кинопоиска (Оценка + Списки сразу в одном окне)
                    function openKpMainMenu(kpId, status) {
                        var voteTitle = status.vote ? ('Оценка: ' + status.vote) : 'Оценить';

                        var items = [
                            {
                                title: voteTitle,
                                subtitle: 'Выставить или удалить оценку',
                                type: 'rate'
                            },
                            {
                                title: 'Буду смотреть',
                                type: 'planned',
                                checkbox: true,
                                checked: !!status.plannedToWatch
                            },
                            {
                                title: 'Просмотрено',
                                type: 'watched',
                                checkbox: true,
                                checked: !!status.watched
                            }
                        ];

                        Lampa.Select.show({
                            title: 'Кинопоиск',
                            items: items,
                            onSelect: function (a) {
                                if (a.type === 'rate') {
                                    openRatingMenu(kpId, status);
                                }
                            },
                            onCheck: function (a) {
                                if (a.type === 'planned') {
                                    if (a.checked) {
                                        network.silent(scriptUrl + '?method=setPlannedToWatch&movie=' + kpId + '&planned=true&oauth=' + token, function (res) {
                                            if (res && res.status === 'SUCCESS') {
                                                status.plannedToWatch = true;
                                                showNotify('Добавлено в «Буду смотреть»');
                                            } else {
                                                a.checked = false;
                                                showNotify('Ошибка: ' + (res && res.error ? res.error : 'не удалось добавить'));
                                            }
                                        }, function () {
                                            a.checked = false;
                                            showNotify('Ошибка соединения');
                                        });
                                    } else {
                                        network.silent(scriptUrl + '?method=setPlannedToWatch&movie=' + kpId + '&planned=false&oauth=' + token, function (res) {
                                            if (res && res.status === 'SUCCESS') {
                                                status.plannedToWatch = false;
                                                showNotify('Удалено из «Буду смотреть»');
                                            } else {
                                                a.checked = true;
                                                showNotify('Ошибка: ' + (res && res.error ? res.error : 'не удалось удалить'));
                                            }
                                        }, function () {
                                            a.checked = true;
                                            showNotify('Ошибка соединения');
                                        });
                                    }
                                } else if (a.type === 'watched') {
                                    if (a.checked) {
                                        network.silent(scriptUrl + '?method=setWatched&movie=' + kpId + '&watched=true&oauth=' + token, function (res) {
                                            if (res && res.status === 'SUCCESS') {
                                                status.watched = true;
                                                showNotify('Добавлено в просмотренные');
                                            } else {
                                                a.checked = false;
                                                showNotify('Ошибка: ' + (res && res.error ? res.error : 'не удалось отметить'));
                                            }
                                        }, function () {
                                            a.checked = false;
                                            showNotify('Ошибка соединения');
                                        });
                                    } else {
                                        network.silent(scriptUrl + '?method=setWatched&movie=' + kpId + '&watched=false&oauth=' + token, function (res) {
                                            if (res && res.status === 'SUCCESS') {
                                                status.watched = false;
                                                showNotify('Удалено из просмотренных');
                                            } else {
                                                a.checked = true;
                                                showNotify('Ошибка: ' + (res && res.error ? res.error : 'не удалось удалить'));
                                            }
                                        }, function () {
                                            a.checked = true;
                                            showNotify('Ошибка соединения');
                                        });
                                    }
                                }
                            },
                            onBack: function () {
                                Lampa.Controller.toggle('full_start');
                            }
                        });
                    }

                    // Окно оценки (1..10 и Удалить)
                    function openRatingMenu(kpId, status) {
                        var rate = status.vote || 0;
                        var items = [];
                        for (var i = 10; i >= 1; i--) {
                            var title = String(i);
                            if (rate === i) title += ' (Ваша оценка)';
                            items.push({ title: title, value: i });
                        }
                        if (rate > 0) items.push({ title: 'Удалить оценку', value: 0 });

                        Lampa.Select.show({
                            title: 'Оценка Кинопоиска',
                            items: items,
                            onSelect: function (a) {
                                if (a.value === 0) {
                                    network.silent(scriptUrl + '?method=removeVote&movie=' + kpId + '&oauth=' + token, function (res) {
                                        if (res && res.data && res.data.movie && res.data.movie.vote && res.data.movie.vote.remove && res.data.movie.vote.remove.status === 'SUCCESS') {
                                            status.vote = 0;
                                            showNotify('Оценка удалена');
                                            openKpMainMenu(kpId, status);
                                        } else {
                                            var err = (res && res.errors && res.errors[0]) ? res.errors[0].message : 'Ошибка Кинопоиска!';
                                            showNotify('Ошибка: ' + err);
                                        }
                                    });
                                } else {
                                    network.silent(scriptUrl + '?method=setVote&movie=' + kpId + '&rate=' + a.value + '&oauth=' + token, function (res) {
                                        if (res && res.data && res.data.movie && res.data.movie.vote && res.data.movie.vote.set && res.data.movie.vote.set.status === 'SUCCESS') {
                                            status.vote = a.value;
                                            showNotify('Оценка ' + a.value + ' сохранена!');
                                            openKpMainMenu(kpId, status);
                                        } else {
                                            var errVote = (res && res.errors && res.errors[0]) ? res.errors[0].message : 'Отклонено сервером!';
                                            showNotify('Ошибка: ' + errVote);
                                        }
                                    });
                                }
                            },
                            onBack: function () {
                                openKpMainMenu(kpId, status);
                            }
                        });
                    }
                }

                // -------------------------------------------------------------
                // 3.2. Кнопка «Трейлеры КП» (в меню «Смотреть»)
                // -------------------------------------------------------------
                if (watchContainer.length > 0 && watchContainer.find('.button--kinopoisk_trailers').length === 0) {
                    var btnTrailer = jq('<div class="full-start__button selector button--kinopoisk_trailers">' + buttonTrailersIcon + '<span>Трейлеры КП</span></div>');
                    watchContainer.append(btnTrailer);

                    btnTrailer.on('hover:enter', function () {
                        var cacheKeyTrailer = 'kp_trailers_' + (movie.kinopoisk_id || movie.id || '');
                        var cachedTrailers = Lampa.Storage.get(cacheKeyTrailer, null);
                        if (cachedTrailers && cachedTrailers.length > 0) {
                            Lampa.Select.show({
                                title: 'Трейлеры КП',
                                items: cachedTrailers,
                                onSelect: function (a) {
                                    Lampa.Player.play(a);
                                    Lampa.Player.playlist(cachedTrailers);
                                    Lampa.Controller.toggle('player');
                                },
                                onBack: function () {
                                    Lampa.Controller.toggle('full_start');
                                }
                            });
                            return;
                        }

                        var requestUrl = scriptUrl + '?method=getTrailers';
                        if (movie.kinopoisk_id) {
                            requestUrl += '&kp_id=' + movie.kinopoisk_id;
                        } else {
                            requestUrl += '&imdb_id=' + (movie.imdb_id || '') +
                                '&tmdb_id=' + (movie.id || '') +
                                '&title=' + encodeURIComponent(movie.original_title || movie.title || '') +
                                '&year=' + (movie.release_date ? movie.release_date.slice(0, 4) : '');
                        }

                        network.silent(requestUrl, function (data) {
                            if (data && data.data && data.data.movie && data.data.movie.trailers && data.data.movie.trailers.total > 0) {
                                var trailers = data.data.movie.trailers.items;
                                var trailersList = [];
                                for (var i = 0; i < trailers.length; i++) {
                                    var tr = trailers[i];
                                    var date = new Date(tr.createdAt);
                                    trailersList.push({
                                        title: tr.title,
                                        subtitle: date.getDate() + ' ' + Lampa.Lang.translate('month_' + date.getMonth() + '_e') + ' ' + date.getFullYear(),
                                        url: scriptUrl + '?url=' + encodeURIComponent(tr.streamUrl),
                                        icon: '<img class="size-youtube" src="https:' + tr.preview.avatarsUrl + '/280x178">',
                                        template: 'selectbox_icon'
                                    });
                                }

                                if (trailersList.length > 0) {
                                    Lampa.Storage.set(cacheKeyTrailer, trailersList);
                                    Lampa.Select.show({
                                        title: 'Трейлеры КП',
                                        items: trailersList,
                                        onSelect: function (a) {
                                            Lampa.Player.play(a);
                                            Lampa.Player.playlist(trailersList);
                                            Lampa.Controller.toggle('player');
                                        },
                                        onBack: function () {
                                            Lampa.Controller.toggle('full_start');
                                        }
                                    });
                                } else {
                                    showNotify('Трейлеры не найдены');
                                }
                            } else {
                                showNotify('Трейлеры не найдены');
                            }
                        }, function () {
                            showNotify('Ошибка соединения');
                        });
                    });
                }
            }
        }, 100);

        setTimeout(function () { clearInterval(checkTimer); }, 5000);
    });

    // =========================================================================
    // БЛОК 4: ЗАКЛАДКИ КИНОПОИСКА («БУДУ СМОТРЕТЬ»)
    // =========================================================================

    // Загрузка фильмов из списка «Буду смотреть» (с поддержкой пагинации по страницам)
    function loadWatchlist(token, page, onSuccess, onError) {
        if (typeof page === 'function') {
            onError = onSuccess;
            onSuccess = page;
            page = 1;
        }
        page = page || 1;
        var limit = 50;
        var offset = (page - 1) * limit;
        var workerUrl = scriptUrl + '?method=getWatchlist&oauth=' + encodeURIComponent(token) +
            '&offset=' + offset +
            '&limit=' + limit;

        network.silent(workerUrl, function (data) {
            var items = parseWatchlistResponse(data);
            if (items !== null) {
                onSuccess(items);
            } else {
                if (onError) onError();
            }
        }, function () {
            if (onError) onError();
        });
    }

    function parseWatchlistResponse(data) {
        if (!data || !data.data || !data.data.userProfile || !data.data.userProfile.userData || !data.data.userProfile.userData.plannedToWatch) {
            return null;
        }

        var ptw = data.data.userProfile.userData.plannedToWatch.movies;
        var rawItems = (ptw && ptw.items) || [];
        var total = (ptw && ptw.total) || rawItems.length;

        var cards = rawItems.map(function (item) {
            var m = item.movie || item;
            var t = item.tmdb || {};

            var hasSeriesMarkers = !!(
                m.__typename === 'TvSeries' ||
                m.__typename === 'MiniSeries' ||
                m.__typename === 'TvShow' ||
                (m.releaseYears && m.releaseYears.length > 0) ||
                m.seasonsCount ||
                m.seasons
            );
            var isFilmOnKp = (m.__typename === 'Film' || m.__typename === 'Video' || (!hasSeriesMarkers && (m.productionYear || m.duration)));
            var isTvOnKp = hasSeriesMarkers;

            var kpYear = m.productionYear || m.fallbackYear ||
                (m.releaseYears && m.releaseYears[0] && m.releaseYears[0].start) ||
                (m.distribution && m.distribution.worldPremiere && m.distribution.worldPremiere.incompleteDate && m.distribution.worldPremiere.incompleteDate.year) ||
                (m.distribution && m.distribution.releases && m.distribution.releases.items && m.distribution.releases.items[0] && m.distribution.releases.items[0].date && m.distribution.releases.items[0].date.year) ||
                (m.release_date ? m.release_date.slice(0, 4) : '');

            var isTv = isTvOnKp;

            var localizedTitle = (m.title && (m.title.localized || m.title.russian)) || (m.title && m.title.original) || m.name || m.title || '';
            var originalTitle = (m.title && m.title.original) || '';
            var year = kpYear || '';

            // Извлечение оригинального постера из Кинопоиска (приоритет перед TMDB)
            var avatars = (m.gallery && m.gallery.posters && m.gallery.posters.vertical && (m.gallery.posters.vertical.avatarsUrl || m.gallery.posters.vertical.fallbackUrl)) ||
                          (m.poster && (m.poster.avatarsUrl || m.poster.fallbackUrl)) || '';

            var kpPoster = '';
            if (avatars) {
                var cleanAvatars = avatars.replace(/^\/+/, '');
                if (cleanAvatars.indexOf('http') === 0) kpPoster = cleanAvatars;
                else if (cleanAvatars.indexOf('//') === 0) kpPoster = 'https:' + cleanAvatars;
                else kpPoster = 'https://' + cleanAvatars;

                if (!/\.(jpg|png|webp)$/i.test(kpPoster) && !/\/\d+x\d+$/i.test(kpPoster) && !/\/orig$/i.test(kpPoster)) {
                    kpPoster = kpPoster + '/300x450';
                }
            }

            var finalPosterUrl = kpPoster;

            // В списке «Буду смотреть» не выводим оценки (vote_average: 0), постеры строго из Кинопоиска
            var card = {
                vote_average: 0,
                img: finalPosterUrl,
                poster: finalPosterUrl,
                background_image: finalPosterUrl,
                kinopoisk_id: m.id,
                id: m.id,
                tmdb_id: null,
                tmdb_ready: false,
                year: year
            };

            if (isTv) {
                card.name = localizedTitle;
                card.original_name = originalTitle;
                card.first_air_date = year ? (year + '-01-01') : '';
                card.type = 'tv';
                card.method = 'tv';
            } else {
                card.title = localizedTitle;
                card.original_title = originalTitle;
                card.release_date = year ? (year + '-01-01') : '';
                card.type = 'movie';
                card.method = 'movie';
            }

            return card;
        });

        return {
            total: total,
            total_pages: Math.ceil(total / 50) || 1,
            items: cards
        };
    }

    // Загрузка списка «Оценки и просмотры» (Кинопоиск ограничивает максимум 20 элементов на запрос)
    function loadVotedWatchlist(token, page, onSuccess, onError) {
        if (typeof page === 'function') {
            onSuccess = page;
            page = 1;
        }
        page = page || 1;
        var limit = 20;
        var offset = (page - 1) * limit;
        var alias = getSocialAlias();

        var workerUrl = scriptUrl + '?method=getVotedWatchlist&oauth=' + encodeURIComponent(token) +
            '&social_alias=' + encodeURIComponent(alias) +
            '&offset=' + offset +
            '&limit=' + limit;

        network.silent(workerUrl, function (data) {
            var items = parseVotedResponse(data);
            if (items !== null) {
                onSuccess(items);
            } else {
                if (onError) onError();
            }
        }, function () {
            if (onError) onError();
        });
    }

    function parseVotedResponse(data) {
        var reactionData = data && data.data && data.data.userProfileBySocialAlias && data.data.userProfileBySocialAlias.userData && data.data.userProfileBySocialAlias.userData.movieReactions;
        if (!reactionData) return null;

        var total = reactionData.total || 0;
        var rawItems = reactionData.items || [];

        var cards = rawItems.map(function (item) {
            var m = item.movie || {};
            var t = item.tmdb || {};

            var hasSeriesMarkers = !!(
                m.__typename === 'TvSeries' ||
                m.__typename === 'TvShow' ||
                m.__typename === 'MiniSeries' ||
                (m.releaseYears && m.releaseYears.length > 0) ||
                m.releaseYears ||
                m.seasonsCount ||
                m.seasons
            );
            var isFilmOnKp = (m.__typename === 'Film' || m.__typename === 'Video' || (!hasSeriesMarkers && (m.productionYear || m.duration)));
            var isTvOnKp = hasSeriesMarkers;

            var kpYear = m.productionYear || (m.releaseYears ? (m.releaseYears.start || m.releaseYears[0]?.start) : '') || '';

            // Если на Кинопоиске фильм, а в TMDB сериал (или наоборот), сбрасываем ошибочный TMDB
            if (isFilmOnKp && t.type === 'tv') t = {};
            if (isTvOnKp && t.type === 'movie') t = {};

            // Если год на Кинопоиске известен и TMDB вернул год с расхождением более 1 года, сбрасываем ошибочный TMDB
            if (kpYear && t.year && Math.abs(Number(t.year) - Number(kpYear)) > 1) {
                t = {};
            }

            var isTv = false;
            if (isTvOnKp) isTv = true;
            else if (isFilmOnKp) isTv = false;
            else if (t.type === 'tv') isTv = true;

            var voteReaction = (item.reactions || []).find(function (r) {
                return r.__typename === 'Vote' || (r.value !== undefined);
            });
            var userVote = voteReaction ? voteReaction.value : null;

            var localizedTitle = (m.title && (m.title.russian || m.title.localized)) || t.title || (m.title && m.title.original) || '';
            var originalTitle = (m.title && m.title.original) || '';
            var year = kpYear || t.year || '';

            var kpPoster = '';
            var rawAvatar = (m.poster && (m.poster.avatarsUrl || m.poster.fallbackUrl)) ||
                            (m.gallery && m.gallery.posters && m.gallery.posters.vertical && (m.gallery.posters.vertical.avatarsUrl || m.gallery.posters.vertical.fallbackUrl)) || '';
            if (rawAvatar) {
                var cleanAvatars = rawAvatar.replace(/^\/+/, '');
                if (cleanAvatars.indexOf('http') === 0) kpPoster = cleanAvatars;
                else if (cleanAvatars.indexOf('//') === 0) kpPoster = 'https:' + cleanAvatars;
                else kpPoster = 'https://' + cleanAvatars;

                if (!/\.(jpg|png|webp)$/i.test(kpPoster) && !/\/\d+x\d+$/i.test(kpPoster) && !/\/orig$/i.test(kpPoster)) {
                    kpPoster = kpPoster + '/300x450';
                }
            }

            var finalPosterUrl = kpPoster;
            var displayRating = (userVote !== null && userVote !== undefined) ? userVote : 0;

            // Постеры и метаданные строго из Кинопоиска (без TMDB до клика)
            var card = {
                vote_average: displayRating,
                user_vote: userVote,
                kp_rating: m.rating && m.rating.kinopoisk ? m.rating.kinopoisk.value : null,
                img: finalPosterUrl,
                poster: finalPosterUrl,
                background_image: finalPosterUrl,
                kinopoisk_id: m.id,
                id: m.id,
                tmdb_id: null,
                tmdb_ready: false,
                year: year
            };

            if (isTv) {
                card.name = localizedTitle;
                card.original_name = originalTitle;
                card.first_air_date = year ? (year + '-01-01') : '';
                card.type = 'tv';
                card.method = 'tv';
            } else {
                card.title = localizedTitle;
                card.original_title = originalTitle;
                card.release_date = year ? (year + '-01-01') : '';
                card.type = 'movie';
                card.method = 'movie';
            }

            return card;
        });

        return {
            total: total,
            total_pages: Math.ceil(total / 20) || 1,
            items: cards
        };
    }

    // Стилизация плашки оценки в фирменные цвета Кинопоиска (зеленый >=7, серый 5-6, красный <5)
    // Красим ТОЛЬКО личную оценку пользователя (data.user_vote). Если фильм просто просмотрен без оценки - не красим!
    function applyKpVoteBadge(rootElem, data) {
        if (data.user_vote === undefined || data.user_vote === null || data.user_vote <= 0) return;
        var voteVal = parseFloat(data.user_vote);
        if (!voteVal || voteVal <= 0) return;

        var colorClass = voteVal >= 7 ? 'card--vote-green' : (voteVal >= 5 ? 'card--vote-grey' : 'card--vote-red');
        var dom = rootElem.jquery ? rootElem[0] : rootElem;
        if (!dom) return;

        dom.classList.add(colorClass);
        var voteElem = dom.querySelector('.card__vote');
        if (!voteElem) {
            voteElem = document.createElement('div');
            voteElem.className = 'card__vote';
            var view = dom.querySelector('.card__view');
            if (view) view.appendChild(voteElem);
        }
        if (voteElem) {
            voteElem.innerText = voteVal >= 10 ? '10' : (voteVal % 1 === 0 ? voteVal : voteVal.toFixed(1));
        }
    }

    function makeKpCard(data, params) {
        var card = new Lampa.Card(data, params);
        var origCreate = card.create.bind(card);
        card.create = function () {
            origCreate();
            applyKpVoteBadge(card.render(true), data);
        };
        return card;
    }

    // Класс специальной карточки-папки «Смотреть все» (встроенный стандарт Lampa: .bookmarks-folder)
    function FolderCard(element) {
        var html;
        var self = this;

        this.create = function () {
            html = jq(
                '<div class="bookmarks-folder card selector layer--visible layer--render">' +
                    '<div class="bookmarks-folder__inner card__view">' +
                        '<div class="bookmarks-folder__layer">' +
                            '<div class="bookmarks-folder__head">' +
                                '<div class="bookmarks-folder__title">' + (element.title || 'Смотреть все') + '</div>' +
                                '<div class="bookmarks-folder__num">' + (element.total || (element.results ? element.results.length : 0)) + '</div>' +
                            '</div>' +
                            '<div class="bookmarks-folder__body"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );

            // Добавляем 3 мини-постера из первых фильмов списка
            var previews = (element.results || []).slice(0, 3);
            previews.forEach(function (item, i) {
                var imgUrl = item.img || item.poster || item.poster_path || './img/img_load.svg';
                var img = jq('<img class="card__img i-' + i + '" src="' + imgUrl + '">');
                html.find('.bookmarks-folder__body').append(img);
            });

            if (previews.length === 0) {
                html.find('.bookmarks-folder__body').append('<img class="card__img" src="./img/img_load.svg">');
            }

            html.on('hover:focus', function () {
                if (self.onFocus) self.onFocus(html, element);
            });

            html.on('hover:enter', function () {
                if (element.onEnter) element.onEnter(html, element);
                else if (self.onEnter) self.onEnter(html, element);
            });
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            if (html) html.remove();
        };
    }

    // Открытие фильма при клике (с поиском TMDB ID через kinoapi и поиск TMDB)
    function openMovieCard(movieCard) {
        if (movieCard.tmdb_id || (movieCard.tmdb_ready && movieCard.id && movieCard.id !== movieCard.kinopoisk_id)) {
            var targetId = movieCard.tmdb_id || movieCard.id;
            var targetMethod = movieCard.method || (movieCard.type === 'tv' ? 'tv' : 'movie');
            Lampa.Activity.push({
                url: '',
                component: 'full',
                id: targetId,
                method: targetMethod,
                card: movieCard,
                source: 'tmdb'
            });
            return;
        }

        var cacheKey = 'kp_tmdb_v4_' + movieCard.kinopoisk_id;
        var cachedTmdbId = Lampa.Storage.get(cacheKey, '');

        if (cachedTmdbId) {
            movieCard.id = cachedTmdbId;
            movieCard.tmdb_id = cachedTmdbId;
            movieCard.tmdb_ready = true;
            var targetMethod = movieCard.method || (movieCard.type === 'tv' ? 'tv' : 'movie');
            Lampa.Activity.push({
                url: '',
                component: 'full',
                id: cachedTmdbId,
                method: targetMethod,
                card: movieCard,
                source: 'tmdb'
            });
            return;
        }

        var queryTitle = movieCard.title || movieCard.name || movieCard.original_title || movieCard.original_name || '';
        var origTitle = movieCard.original_title || movieCard.original_name || '';
        var queryYear = movieCard.release_date ? movieCard.release_date.slice(0, 4) : (movieCard.first_air_date ? movieCard.first_air_date.slice(0, 4) : (movieCard.year ? String(movieCard.year).slice(0, 4) : ''));
        var queryType = (movieCard.type === 'tv' || movieCard.method === 'tv') ? 'tv' : 'movie';

        // Поиск через воркер (прямой поиск в TMDB API + kinoapi fallback)
        var resolveUrl = scriptUrl + '?method=resolveTmdb&v=4&kp_id=' + encodeURIComponent(movieCard.kinopoisk_id || '') +
            '&title=' + encodeURIComponent(queryTitle) +
            '&orig_title=' + encodeURIComponent(origTitle) +
            '&year=' + encodeURIComponent(queryYear) +
            '&type=' + encodeURIComponent(queryType);

        network.silent(resolveUrl, function (res) {
            if (res && res.tmdb) {
                Lampa.Storage.set(cacheKey, res.tmdb);
                if (movieCard.kinopoisk_id) {
                    Lampa.Storage.set('kp_id_' + res.tmdb, movieCard.kinopoisk_id);
                }
                movieCard.id = res.tmdb;
                movieCard.tmdb_id = res.tmdb;
                movieCard.tmdb_ready = true;
                var resType = (res.data && res.data.type) || queryType;
                movieCard.method = resType;
                movieCard.type = resType;
                Lampa.Activity.push({
                    url: '',
                    component: 'full',
                    id: res.tmdb,
                    method: resType,
                    card: movieCard,
                    source: 'tmdb'
                });
            } else {
                showNotify('Фильм пока не найден в базе TMDB');
            }
        }, function () {
            showNotify('Фильм пока не найден в базе TMDB');
        });
    }

    // Компонент «Закладки КП»: 2 строки («Оценки и просмотры» + «Буду смотреть»)
    function KpBookmarksComponent(object) {
        var comp = new Lampa.InteractionMain(object);

        comp.create = function () {
            var token = getAccountToken();
            if (!token) {
                showNotify('Войдите в аккаунт в Настройки -> Кинопоиск');
                comp.empty();
                return;
            }

            comp.activity.loader(true);

            var pending = 2;
            var votedRes = null;
            var plannedRes = null;

            function checkDone() {
                pending--;
                if (pending > 0) return;

                comp.activity.loader(false);
                var lines = [];

                // 1. Полоска «Буду смотреть» (первая полоска)
                if (plannedRes && plannedRes.items && plannedRes.items.length > 0) {
                    var totalPlanned = plannedRes.total || plannedRes.items.length;
                    var plannedCards = plannedRes.items;
                    var lastPlanned10 = plannedCards.slice(0, 10);

                    lastPlanned10.forEach(function (card) {
                        card.onEnter = function () {
                            openMovieCard(card);
                        };
                    });

                    var plannedFolder = {
                        cardClass: function (elem, params) {
                            return new FolderCard(elem, params);
                        },
                        title: 'Смотреть все',
                        total: totalPlanned,
                        results: plannedCards,
                        onEnter: function () {
                            Lampa.Activity.push({
                                title: 'Буду смотреть (' + totalPlanned + ')',
                                component: 'kp_bookmarks_full',
                                page: 1
                            });
                        }
                    };

                    lines.push({
                        title: 'Буду смотреть',
                        results: [plannedFolder].concat(lastPlanned10),
                        nomore: true
                    });
                }

                // 2. Полоска «Оценки и просмотры» (вторая полоска)
                if (votedRes && votedRes.items && votedRes.items.length > 0) {
                    var totalVoted = votedRes.total || votedRes.items.length;
                    var votedCards = votedRes.items;
                    var lastVoted10 = votedCards.slice(0, 10);

                    lastVoted10.forEach(function (card) {
                        card.cardClass = function (elem, params) {
                            return makeKpCard(elem, params);
                        };
                        card.onEnter = function () {
                            openMovieCard(card);
                        };
                    });

                    var votedFolder = {
                        cardClass: function (elem, params) {
                            return new FolderCard(elem, params);
                        },
                        title: 'Смотреть все',
                        total: totalVoted,
                        results: votedCards,
                        onEnter: function () {
                            Lampa.Activity.push({
                                title: 'Оценки и просмотры (' + totalVoted + ')',
                                component: 'kp_voted_full',
                                page: 1
                            });
                        }
                    };

                    lines.push({
                        title: 'Оценки и просмотры',
                        results: [votedFolder].concat(lastVoted10),
                        nomore: true
                    });
                }

                if (lines.length === 0) {
                    comp.empty();
                } else {
                    comp.build(lines);
                }
            }

            // Загружаем обе полоски параллельно
            loadVotedWatchlist(token, 1, function (data) {
                votedRes = data;
                checkDone();
            }, function () {
                votedRes = null;
                checkDone();
            });

            loadWatchlist(token, 1, function (data) {
                plannedRes = data;
                checkDone();
            }, function () {
                plannedRes = null;
                checkDone();
            });
        };

        comp.onAppend = function (line, lineElement) {
            line.onSelect = function (target, cardData) {
                if (cardData.onEnter) {
                    cardData.onEnter(target, cardData);
                } else {
                    openMovieCard(cardData);
                }
            };
        };

        return comp;
    }

    // Компонент полного просмотра всех закладок (сеткой) с бесконечной пагинацией
    function KpBookmarksFullComponent(object) {
        var comp;
        var hasMaker = typeof Lampa.Maker !== 'undefined' && typeof Lampa.Maker.make === 'function';

        if (hasMaker) {
            // Современный штатный компонент Lampa (сетка 6 колонок, плавная пагинация, стандартные карточки)
            comp = Lampa.Maker.make('Category', object, function (module) {
                return module.toggle(Lampa.Maker.module('Category').MASK.base, 'Pagination');
            });

            comp.use({
                onCreate: function () {
                    var token = getAccountToken();
                    if (!token) {
                        comp.empty();
                        return;
                    }

                    loadWatchlist(token, object.page || 1, function (data) {
                        if (!data || !data.items || data.items.length === 0) {
                            comp.empty();
                            return;
                        }

                        comp.build({
                            secuses: true,
                            page: object.page || 1,
                            total_pages: data.total_pages || 1,
                            results: data.items
                        });
                    }, function () {
                        comp.empty();
                    });
                },
                onNext: function (resolve, reject) {
                    var token = getAccountToken();
                    if (!token) return reject();

                    loadWatchlist(token, object.page, function (data) {
                        if (data && data.items && data.items.length > 0) {
                            resolve({
                                results: data.items,
                                total_pages: data.total_pages
                            });
                        } else {
                            reject();
                        }
                    }, function () {
                        reject();
                    });
                },
                onInstance: function (item, data) {
                    item.use({
                        onEnter: function () {
                            openMovieCard(data);
                        },
                        onFocus: function () {
                            if (Lampa.Background && Lampa.Utils) {
                                Lampa.Background.change(Lampa.Utils.cardImgBackground(data));
                            }
                        }
                    });
                }
            });
        } else {
            // Fallback для устаревших версий Lampa
            comp = new Lampa.InteractionCategory(object);

            comp.create = function () {
                var token = getAccountToken();
                if (!token) {
                    comp.empty();
                    return;
                }

                comp.activity.loader(true);

                loadWatchlist(token, object.page || 1, function (data) {
                    comp.activity.loader(false);

                    if (!data || !data.items || data.items.length === 0) {
                        comp.empty();
                        return;
                    }

                    comp.build({
                        secuses: true,
                        page: object.page || 1,
                        total_pages: data.total_pages || 1,
                        results: data.items
                    });

                    comp.render().find('.category-full').addClass('mapping--grid cols--6');
                }, function () {
                    comp.activity.loader(false);
                    comp.empty();
                });
            };

            comp.cardRender = function (obj, element, card) {
                card.onEnter = function () {
                    openMovieCard(element);
                };
            };

            comp.nextPageReuest = function (obj, resolve, reject) {
                var token = getAccountToken();
                if (!token) return reject();

                loadWatchlist(token, obj.page, function (data) {
                    if (data && data.items && data.items.length > 0) {
                        resolve({
                            results: data.items,
                            total_pages: data.total_pages
                        });
                    } else {
                        reject();
                    }
                }, function () {
                    reject();
                });
            };
        }

        return comp;
    }

    // Компонент полного просмотра «Оценки и просмотры» (сеткой) с бесконечной пагинацией
    function KpVotedFullComponent(object) {
        var comp;
        var hasMaker = typeof Lampa.Maker !== 'undefined' && typeof Lampa.Maker.make === 'function';

        if (hasMaker) {
            comp = Lampa.Maker.make('Category', object, function (module) {
                return module.toggle(Lampa.Maker.module('Category').MASK.base, 'Pagination');
            });

            comp.use({
                onCreate: function () {
                    var token = getAccountToken();
                    if (!token) {
                        comp.empty();
                        return;
                    }

                    loadVotedWatchlist(token, object.page || 1, function (data) {
                        if (!data || !data.items || data.items.length === 0) {
                            comp.empty();
                            return;
                        }

                        comp.build({
                            secuses: true,
                            page: object.page || 1,
                            total_pages: data.total_pages || 1,
                            results: data.items
                        });
                    }, function () {
                        comp.empty();
                    });
                },
                onNext: function (resolve, reject) {
                    var token = getAccountToken();
                    if (!token) return reject();

                    loadVotedWatchlist(token, object.page, function (data) {
                        if (data && data.items && data.items.length > 0) {
                            resolve({
                                results: data.items,
                                total_pages: data.total_pages
                            });
                        } else {
                            reject();
                        }
                    }, function () {
                        reject();
                    });
                },
                onInstance: function (item, data) {
                    item.use({
                        onCreate: function () {
                            applyKpVoteBadge(item.render(true), data);
                        },
                        onEnter: function () {
                            openMovieCard(data);
                        },
                        onFocus: function () {
                            if (Lampa.Background && Lampa.Utils) {
                                Lampa.Background.change(Lampa.Utils.cardImgBackground(data));
                            }
                        }
                    });
                }
            });
        } else {
            comp = new Lampa.InteractionCategory(object);

            comp.create = function () {
                var token = getAccountToken();
                if (!token) {
                    comp.empty();
                    return;
                }

                comp.activity.loader(true);

                loadVotedWatchlist(token, object.page || 1, function (data) {
                    comp.activity.loader(false);

                    if (!data || !data.items || data.items.length === 0) {
                        comp.empty();
                        return;
                    }

                    comp.build({
                        secuses: true,
                        page: object.page || 1,
                        total_pages: data.total_pages || 1,
                        results: data.items
                    });

                    comp.render().find('.category-full').addClass('mapping--grid cols--6');
                }, function () {
                    comp.activity.loader(false);
                    comp.empty();
                });
            };

            comp.cardRender = function (obj, element, card) {
                applyKpVoteBadge(card.render(true), element);
                card.onEnter = function () {
                    openMovieCard(element);
                };
            };

            comp.nextPageReuest = function (obj, resolve, reject) {
                var token = getAccountToken();
                if (!token) return reject();

                loadVotedWatchlist(token, obj.page, function (data) {
                    if (data && data.items && data.items.length > 0) {
                        resolve({
                            results: data.items,
                            total_pages: data.total_pages
                        });
                    } else {
                        reject();
                    }
                }, function () {
                    reject();
                });
            };
        }

        return comp;
    }

    // =========================================================================
    // БЛОК 5: БОКОВОЕ МЕНЮ И ИНИЦИАЛИЗАЦИЯ
    // =========================================================================

    // Регистрация компонентов активности
    Lampa.Component.add('kp_bookmarks', KpBookmarksComponent);
    Lampa.Component.add('kp_bookmarks_full', KpBookmarksFullComponent);
    Lampa.Component.add('kp_voted_full', KpVotedFullComponent);

    // Добавление стилей сетки для идеального выравнивания карточек и фирменных оценок КП
    var gridStyle = document.createElement('style');
    gridStyle.innerHTML =
        '.category-full.mapping--grid.cols--6 > .card {' +
            'width: 16.6666667% !important;' +
            'margin-left: 0 !important;' +
            'padding: 0 0.5em 1em 0.5em !important;' +
            'box-sizing: border-box !important;' +
        '}' +
        '.category-full.mapping--grid.cols--6 {' +
            'padding: 0 1em !important;' +
        '}' +
        '.card--vote-green .card__vote {' +
            'background-color: #30a332 !important;' +
            'color: #ffffff !important;' +
            'font-weight: 700 !important;' +
        '}' +
        '.card--vote-grey .card__vote {' +
            'background-color: #777777 !important;' +
            'color: #ffffff !important;' +
            'font-weight: 700 !important;' +
        '}' +
        '.card--vote-red .card__vote {' +
            'background-color: #e64646 !important;' +
            'color: #ffffff !important;' +
            'font-weight: 700 !important;' +
        '}';
    document.head.appendChild(gridStyle);

    // Добавление пункта «Закладки КП» в главное боковое меню Lampa
    function addSidebarMenu() {
        if (jq('.menu__item.kp-bookmarks-menu-btn').length > 0) return;

        var menuBtn = jq(
            '<li class="menu__item selector kp-bookmarks-menu-btn">' +
                '<div class="menu__ico">' + kpLogo + '</div>' +
                '<div class="menu__text">Закладки КП</div>' +
            '</li>'
        );

        menuBtn.on('hover:enter', function () {
            var token = getAccountToken();
            if (!token) {
                showNotify('Авторизуйтесь в Настройки -> Кинопоиск');
                return;
            }

            Lampa.Activity.push({
                url: '',
                title: 'Закладки КП',
                component: 'kp_bookmarks',
                page: 1
            });
        });

        // Вставляем после пункта «Закладки» или в конец первого списка меню
        var bookmarkMenu = jq('.menu .menu__list .menu__item:contains("Закладки"), .menu .menu__list .menu__item:contains("Избранное")').first();
        if (bookmarkMenu.length > 0) {
            bookmarkMenu.after(menuBtn);
        } else {
            jq('.menu .menu__list').eq(0).append(menuBtn);
        }
    }

    if (window.appready) {
        addSidebarMenu();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') addSidebarMenu();
        });
    }
})();

