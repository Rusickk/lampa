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
    var kpLogo = '<svg width="239" height="239" viewBox="0 0 239 239" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"><path fill="currentColor" d="M215 121.415l-99.297-6.644 90.943 36.334a106.416 106.416 0 0 0 8.354-29.69z" /><path fill="currentColor" d="M194.608 171.609C174.933 197.942 143.441 215 107.948 215 48.33 215 0 166.871 0 107.5 0 48.13 48.33 0 107.948 0c35.559 0 67.102 17.122 86.77 43.539l-90.181 48.07L162.57 32.25h-32.169L90.892 86.862V32.25H64.77v150.5h26.123v-54.524l39.509 54.524h32.169l-56.526-57.493 88.564 46.352z" /><path d="M206.646 63.895l-90.308 36.076L215 93.583a106.396 106.396 0 0 0-8.354-29.688z" fill="currentColor"/></svg>';
    var buttonRatingIcon = '<svg class="button--kinopoisk_rating_icon" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.6162 7.10981L15.8464 7.55198L16.3381 7.63428L22.2841 8.62965C22.8678 8.72736 23.0999 9.44167 22.6851 9.86381L18.4598 14.1641L18.1104 14.5196L18.184 15.0127L19.0748 20.9752C19.1622 21.5606 18.5546 22.002 18.025 21.738L12.6295 19.0483L12.1833 18.8259L11.7372 19.0483L6.34171 21.738C5.81206 22.002 5.20443 21.5606 5.29187 20.9752L6.18264 15.0127L6.25629 14.5196L5.9069 14.1641L1.68155 9.86381C1.26677 9.44167 1.49886 8.72736 2.08255 8.62965L8.02855 7.63428L8.52022 7.55198L8.75043 7.10981L11.5345 1.76241C11.8078 1.23748 12.5589 1.23748 12.8322 1.76241L15.6162 7.10981Z" stroke="currentColor" stroke-width="2.2"></path></svg>';
    var buttonTrailersIcon = '<svg class="button--kinopoisk_trailers_icon" width="239" height="239" viewBox="0 0 239 239" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"><path fill="currentColor" d="M215 121.415l-99.297-6.644 90.943 36.334a106.416 106.416 0 0 0 8.354-29.69z" /><path fill="currentColor" d="M194.608 171.609C174.933 197.942 143.441 215 107.948 215 48.33 215 0 166.871 0 107.5 0 48.13 48.33 0 107.948 0c35.559 0 67.102 17.122 86.77 43.539l-90.181 48.07L162.57 32.25h-32.169L90.892 86.862V32.25H64.77v150.5h26.123v-54.524l39.509 54.524h32.169l-56.526-57.493 88.564 46.352z" /><path d="M206.646 63.895l-90.308 36.076L215 93.583a106.396 106.396 0 0 0-8.354-29.688z" fill="currentColor"/></svg>';

    // Хелперы учетной записи
    function getAccountToken() {
        return Lampa.Storage.get('kp_smart_token', '') || Lampa.Storage.get('kinopoisk_access_token', '');
    }

    function getAccountEmail() {
        return Lampa.Storage.get('kp_smart_email', '') || Lampa.Storage.get('kinopoisk_email', '');
    }

    function clearAccount() {
        Lampa.Storage.set('kp_smart_token', '');
        Lampa.Storage.set('kp_smart_email', '');
        Lampa.Storage.set('kinopoisk_access_token', '');
        Lampa.Storage.set('kinopoisk_email', '');
        Lampa.Storage.set('kinopoisk_refresh_token', '');
    }

    // =========================================================================
    // БЛОК 2: АВТОРИЗАЦИЯ И МЕНЮ НАСТРОЕК
    // =========================================================================

    if (!window.lampa_settings.kinopoisk) {
        Lampa.SettingsApi.addComponent({
            component: 'kinopoisk',
            icon: kpLogo,
            name: 'Кинопоиск'
        });
    }

    Lampa.SettingsApi.addParam({
        component: 'kinopoisk',
        param: { type: 'title' },
        field: { name: 'Аккаунт' }
    });

    function updateSettingsUI() {
        var token = getAccountToken();
        var email = getAccountEmail();
        var $ = window.jQuery || window.$;

        var authParam = $('div[data-name="kp_smart_auth"]');
        var logoutParam = $('div[data-name="kp_smart_logout"]');

        if (token) {
            authParam.find('.settings-param__name').text(email || 'Аккаунт подключен');
            authParam.find('.settings-param__descr').text('Вы вошли в аккаунт');
            logoutParam.show();
        } else {
            authParam.find('.settings-param__name').text('Авторизация в Яндексе');
            authParam.find('.settings-param__descr').text('Нажмите для входа по коду');
            logoutParam.hide();
        }
    }

    // Кнопка статуса аккаунта / входа
    Lampa.SettingsApi.addParam({
        component: 'kinopoisk',
        param: { type: 'button', name: 'kp_smart_auth' },
        field: {
            name: getAccountToken() ? (getAccountEmail() || 'Аккаунт подключен') : 'Авторизация в Яндексе',
            description: getAccountToken() ? 'Вы вошли в аккаунт' : 'Нажмите для входа по коду'
        },
        onRender: function (item) {
            var token = getAccountToken();
            var email = getAccountEmail();
            if (token) {
                item.find('.settings-param__name').text(email || 'Аккаунт подключен');
                item.find('.settings-param__descr').text('Вы вошли в аккаунт');
            } else {
                item.find('.settings-param__name').text('Авторизация в Яндексе');
                item.find('.settings-param__descr').text('Нажмите для входа по коду');
            }
        },
        onChange: function () {
            var token = getAccountToken();
            var email = getAccountEmail();

            if (token) {
                Lampa.Noty.show('Вы уже вошли как ' + (email || 'пользователь'));
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
                        Lampa.Noty.show('Вы вышли из аккаунта');
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
                                updateSettingsUI();
                                Lampa.Modal.close();
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Noty.show('Вы успешно вошли в аккаунт!');
                            }, function () {
                                Lampa.Storage.set('kp_smart_email', 'Аккаунт подключен');
                                updateSettingsUI();
                                Lampa.Modal.close();
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Noty.show('Вы успешно вошли в аккаунт!');
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
            Lampa.Noty.show('Ошибка получения кода');
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
            var container = jq('.buttons--container');
            var target = container.length > 0 ? container : jq('.full-start-new__buttons, .full-start__buttons');

            if (target.length > 0) {
                clearInterval(checkTimer);

                var movie = e.data.movie || e.data;
                if (!movie) return;

                var token = getAccountToken();

                // -------------------------------------------------------------
                // 3.1. Кнопка «Оценки КП»
                // -------------------------------------------------------------
                if (target.find('.button--kinopoisk_rating').length === 0) {
                    var btnRatingTitle = token ? 'Оценки КП' : 'Войти для оценки';
                    var btnRating = jq('<div class="full-start__button selector button--kinopoisk_rating" style="position: relative;">' + buttonRatingIcon + '<span>' + btnRatingTitle + '</span></div>');
                    target.append(btnRating);

                    if (!token) {
                        btnRating.on('hover:enter', function () {
                            Lampa.Noty.show('Перейдите в Настройки -> Кинопоиск и авторизуйтесь');
                        });
                    } else {
                        function openRatingMenu(kpId) {
                            network.silent(scriptUrl + '?method=getRated&movie=' + kpId + '&oauth=' + token, function (data) {
                                var rate = 0;
                                if (data && data.data && data.data.movie && data.data.movie.movieUserVote && data.data.movie.movieUserVote.voting) {
                                    rate = data.data.movie.movieUserVote.voting.value;
                                }

                                var items = [];
                                for (var i = 10; i >= 1; i--) {
                                    var title = String(i);
                                    if (rate === i) title += ' (Ваша оценка)';
                                    items.push({ title: title, value: i });
                                }
                                if (rate > 0) items.push({ title: 'Удалить оценку', value: 0 });

                                Lampa.Select.show({
                                    title: 'Оценки КП',
                                    items: items,
                                    onSelect: function (a) {
                                        if (a.value === 0) {
                                            Lampa.Noty.show('Удаляем оценку...');
                                            network.silent(scriptUrl + '?method=removeVote&movie=' + kpId + '&oauth=' + token, function (res) {
                                                if (res && res.data && res.data.movie && res.data.movie.vote && res.data.movie.vote.remove && res.data.movie.vote.remove.status === 'SUCCESS') {
                                                    Lampa.Noty.show('Оценка удалена');
                                                } else {
                                                    var err = (res && res.errors && res.errors[0]) ? res.errors[0].message : 'Ошибка Кинопоиска!';
                                                    Lampa.Noty.show('Ошибка: ' + err);
                                                }
                                            });
                                        } else {
                                            Lampa.Noty.show('Ставим оценку ' + a.value + '...');
                                            network.silent(scriptUrl + '?method=setVote&movie=' + kpId + '&rate=' + a.value + '&oauth=' + token, function (res) {
                                                if (res && res.data && res.data.movie && res.data.movie.vote && res.data.movie.vote.set && res.data.movie.vote.set.status === 'SUCCESS') {
                                                    Lampa.Noty.show('Оценка ' + a.value + ' сохранена!');
                                                } else {
                                                    var errVote = (res && res.errors && res.errors[0]) ? res.errors[0].message : 'Отклонено сервером!';
                                                    Lampa.Noty.show('Ошибка: ' + errVote);
                                                }
                                            });
                                        }
                                        Lampa.Controller.toggle('full');
                                    },
                                    onBack: function () {
                                        Lampa.Controller.toggle('full');
                                    }
                                });
                            }, function () {
                                Lampa.Noty.show('Ошибка соединения с сервером');
                            });
                        }

                        btnRating.on('hover:enter', function () {
                            Lampa.Noty.show('Поиск...');
                            if (movie.kinopoisk_id) {
                                openRatingMenu(movie.kinopoisk_id);
                            } else {
                                var reqUrl = scriptUrl + '?method=resolveId&imdb_id=' + (movie.imdb_id || '') +
                                    '&tmdb_id=' + (movie.id || '') +
                                    '&title=' + encodeURIComponent(movie.original_title || movie.title || '') +
                                    '&year=' + (movie.release_date ? movie.release_date.slice(0, 4) : '');

                                network.silent(reqUrl, function (data) {
                                    if (data && data.kinopoiskId) {
                                        openRatingMenu(data.kinopoiskId);
                                    } else {
                                        Lampa.Noty.show('Не удалось найти фильм на Кинопоиске');
                                    }
                                }, function () {
                                    Lampa.Noty.show('Ошибка поиска фильма');
                                });
                            }
                        });
                    }
                }

                // -------------------------------------------------------------
                // 3.2. Кнопка «Трейлеры КП»
                // -------------------------------------------------------------
                if (target.find('.button--kinopoisk_trailers').length === 0) {
                    var btnTrailer = jq('<div class="full-start__button selector button--kinopoisk_trailers">' + buttonTrailersIcon + '<span>Трейлеры КП</span></div>');
                    target.append(btnTrailer);

                    btnTrailer.on('hover:enter', function () {
                        Lampa.Noty.show('Поиск трейлеров КП');

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
                                    Lampa.Noty.show('Трейлеры не найдены');
                                }
                            } else {
                                Lampa.Noty.show('Трейлеры не найдены');
                            }
                        }, function () {
                            Lampa.Noty.show('Ошибка соединения');
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
            var tmdbId = t.id || null;
            var isTv = (t.type === 'tv') || m.__typename === 'TvSeries' || m.__typename === 'MiniSeries' || m.__typename === 'TvShow' || (m.releaseYears && m.releaseYears.length > 0);
            var localizedTitle = t.title || (m.title && (m.title.localized || m.title.original)) || m.name || m.title || '';
            var originalTitle = (m.title && m.title.original) || '';
            var year = t.year || m.productionYear || m.fallbackYear || (m.releaseYears && m.releaseYears[0] && m.releaseYears[0].start) || (m.release_date ? m.release_date.slice(0, 4) : '');
            var ratingVal = t.rating || (m.rating && m.rating.kinopoisk && m.rating.kinopoisk.value) || m.vote_average || 0;

            // Извлечение постера: приоритет TMDB, затем аватары Кинопоиска
            var avatars = (m.gallery && m.gallery.posters && m.gallery.posters.vertical && (m.gallery.posters.vertical.avatarsUrl || m.gallery.posters.vertical.fallbackUrl)) ||
                          (m.poster && (m.poster.avatarsUrl || m.poster.fallbackUrl)) || '';

            var kpPoster = '';
            if (avatars) {
                if (avatars.indexOf('http') === 0) kpPoster = avatars;
                else if (avatars.indexOf('//') === 0) kpPoster = 'https:' + avatars;
                else kpPoster = 'https://' + avatars;

                if (!/\.(jpg|png|webp)$/i.test(kpPoster) && !/\/\d+x\d+$/i.test(kpPoster) && !/\/orig$/i.test(kpPoster)) {
                    kpPoster = kpPoster + '/300x450';
                }
            }

            var finalPosterUrl = t.poster || kpPoster || '';
            var tmdbRelativePath = '';

            // Если постер с TMDB, извлекаем относительный путь для poster_path (/xxx.jpg)
            if (finalPosterUrl && finalPosterUrl.indexOf('image.tmdb.org/t/p/') !== -1) {
                tmdbRelativePath = finalPosterUrl.replace(/^https?:\/\/image\.tmdb\.org\/t\/p\/[^/]+/, '');
            }

            var card = {
                vote_average: ratingVal,
                img: finalPosterUrl,
                poster: finalPosterUrl,
                background_image: finalPosterUrl,
                kinopoisk_id: m.id,
                id: tmdbId || m.id,
                tmdb_id: tmdbId,
                tmdb_ready: !!tmdbId,
                source: 'tmdb'
            };

            // ВАЖНО: Если poster_path содержит полный URL (начинается с http),
            // Лампа в Api.img склеивает его с базой TMDB: https://image.tmdb.org/t/p/w300/https://... и картинка ломается!
            // Поэтому poster_path выставляем ТОЛЬКО для относительных путей TMDB.
            // Для внешних картинок (Яндекс) Лампа использует card.poster или card.img напрямую!
            if (tmdbRelativePath) {
                card.poster_path = tmdbRelativePath;
            }

            // В Лампе наличие свойства `name` трактуется как сериал (медиа = 'tv').
            // Для фильмов должно быть только `title`, иначе Лампа открывает сериал и выдает 404!
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
            Lampa.Activity.push({
                url: '',
                component: 'full',
                id: targetId,
                method: movieCard.method || (movieCard.type === 'tv' ? 'tv' : 'movie'),
                card: movieCard,
                source: 'tmdb'
            });
            return;
        }

        var cacheKey = 'kp_tmdb_' + movieCard.kinopoisk_id;
        var cachedTmdbId = Lampa.Storage.get(cacheKey, '');

        if (cachedTmdbId) {
            movieCard.id = cachedTmdbId;
            movieCard.tmdb_id = cachedTmdbId;
            movieCard.tmdb_ready = true;
            Lampa.Activity.push({
                url: '',
                component: 'full',
                id: cachedTmdbId,
                method: movieCard.method || (movieCard.type === 'tv' ? 'tv' : 'movie'),
                card: movieCard,
                source: 'tmdb'
            });
            return;
        }

        Lampa.Noty.show('Поиск фильма в каталоге...');

        var queryTitle = movieCard.title || movieCard.name || movieCard.original_title || '';
        var queryYear = movieCard.release_date ? movieCard.release_date.slice(0, 4) : (movieCard.first_air_date ? movieCard.first_air_date.slice(0, 4) : '');

        // Поиск через kinoapi.lampac.dev в нашем воркере (по KP ID и названию)
        var resolveUrl = scriptUrl + '?method=resolveTmdb&kp_id=' + encodeURIComponent(movieCard.kinopoisk_id) +
            '&title=' + encodeURIComponent(queryTitle) +
            '&year=' + encodeURIComponent(queryYear);

        network.silent(resolveUrl, function (res) {
            if (res && res.tmdb) {
                Lampa.Storage.set(cacheKey, res.tmdb);
                movieCard.id = res.tmdb;
                movieCard.tmdb_id = res.tmdb;
                movieCard.tmdb_ready = true;
                if (res.data && res.data.type) movieCard.method = res.data.type;
                Lampa.Activity.push({
                    url: '',
                    component: 'full',
                    id: res.tmdb,
                    method: movieCard.method || (movieCard.type === 'tv' ? 'tv' : 'movie'),
                    card: movieCard,
                    source: 'tmdb'
                });
            } else {
                searchTmdbFallback(movieCard, cacheKey);
            }
        }, function () {
            searchTmdbFallback(movieCard, cacheKey);
        });
    }

    function searchTmdbFallback(movieCard, cacheKey) {
        var query = movieCard.title || movieCard.name || movieCard.original_title;
        if (!query) {
            Lampa.Noty.show('Не удалось найти фильм в TMDB');
            return;
        }

        var key = (Lampa.Api && Lampa.Api.key) ? Lampa.Api.key() : '4ef0d7355d9ffb5151e0777479f0a2f9';
        var lang = Lampa.Storage.get('language', 'ru');
        var searchUrl = 'https://api.themoviedb.org/3/search/multi?api_key=' + key + '&query=' + encodeURIComponent(query) + '&language=' + lang;

        network.silent(searchUrl, function (res) {
            var found = res && res.results && res.results.length > 0 ? res.results[0] : null;
            if (found && found.id) {
                if (cacheKey) Lampa.Storage.set(cacheKey, found.id);
                movieCard.id = found.id;
                movieCard.tmdb_id = found.id;
                movieCard.tmdb_ready = true;
                var method = found.media_type || (found.name ? 'tv' : 'movie');
                movieCard.method = method;
                Lampa.Activity.push({
                    url: '',
                    component: 'full',
                    id: found.id,
                    method: method,
                    card: movieCard,
                    source: 'tmdb'
                });
            } else {
                Lampa.Noty.show('Фильм не найден в базе TMDB');
            }
        }, function () {
            Lampa.Noty.show('Ошибка поиска фильма в TMDB');
        });
    }

    // Компонент «Закладки КП»: 1 строка (папка «Смотреть все» + 10 последних фильмов)
    function KpBookmarksComponent(object) {
        var comp = new Lampa.InteractionMain(object);

        comp.create = function () {
            var token = getAccountToken();
            if (!token) {
                Lampa.Noty.show('Войдите в аккаунт в Настройки -> Кинопоиск');
                comp.empty();
                return;
            }

            comp.activity.loader(true);

            loadWatchlist(token, function (data) {
                comp.activity.loader(false);

                if (!data || !data.items || data.items.length === 0) {
                    Lampa.Noty.show('В списке "Буду смотреть" нет фильмов');
                    comp.empty();
                    return;
                }

                var totalCount = data.total || data.items.length;
                var cards = data.items;
                var last10 = cards.slice(0, 10);

                // Привязываем клик к фильмам
                last10.forEach(function (card) {
                    card.onEnter = function () {
                        openMovieCard(card);
                    };
                });

                // Первая карточка: специальная папка «Смотреть все»
                var folderItem = {
                    cardClass: function (elem, params) {
                        return new FolderCard(elem, params);
                    },
                    title: 'Смотреть все',
                    total: totalCount,
                    results: cards,
                    onEnter: function () {
                        Lampa.Activity.push({
                            title: 'Буду смотреть (' + totalCount + ')',
                            component: 'kp_bookmarks_full',
                            page: 1
                        });
                    }
                };

                // Формируем единственную строку: папка + 10 фильмов
                var lineItems = [folderItem].concat(last10);

                var lines = [{
                    title: 'Буду смотреть',
                    results: lineItems,
                    nomore: true
                }];

                comp.build(lines);
            }, function () {
                comp.activity.loader(false);
                Lampa.Noty.show('Не удалось загрузить закладки');
                comp.empty();
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
        var comp = new Lampa.InteractionCategory(object);

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

        return comp;
    }

    // =========================================================================
    // БЛОК 5: БОКОВОЕ МЕНЮ И ИНИЦИАЛИЗАЦИЯ
    // =========================================================================

    // Регистрация компонентов активности
    Lampa.Component.add('kp_bookmarks', KpBookmarksComponent);
    Lampa.Component.add('kp_bookmarks_full', KpBookmarksFullComponent);

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
                Lampa.Noty.show('Авторизуйтесь в Настройки -> Кинопоиск');
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

