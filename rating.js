(function () {

    'use strict';

    var jq = window.jQuery || window.$;

    

    var network = new Lampa.Reguest();

    var scriptUrlAuth = 'https://kp.kovalchukruslan21.workers.dev/';

    var scriptUrlGet = 'https://kp.kovalchukruslan21.workers.dev/';

    

    var buttonIcon = '<svg class="button--kinopoisk_rating_icon" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.6162 7.10981L15.8464 7.55198L16.3381 7.63428L22.2841 8.62965C22.8678 8.72736 23.0999 9.44167 22.6851 9.86381L18.4598 14.1641L18.1104 14.5196L18.184 15.0127L19.0748 20.9752C19.1622 21.5606 18.5546 22.002 18.025 21.738L12.6295 19.0483L12.1833 18.8259L11.7372 19.0483L6.34171 21.738C5.81206 22.002 5.20443 21.5606 5.29187 20.9752L6.18264 15.0127L6.25629 14.5196L5.9069 14.1641L1.68155 9.86381C1.26677 9.44167 1.49886 8.72736 2.08255 8.62965L8.02855 7.63428L8.52022 7.55198L8.75043 7.10981L11.5345 1.76241C11.8078 1.23748 12.5589 1.23748 12.8322 1.76241L15.6162 7.10981Z" stroke="currentColor" stroke-width="2.2"></path></svg>';

    var kpLogo = '<svg width="239" height="239" viewBox="0 0 239 239" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"><path fill="currentColor" d="M215 121.415l-99.297-6.644 90.943 36.334a106.416 106.416 0 0 0 8.354-29.69z" /><path fill="currentColor" d="M194.608 171.609C174.933 197.942 143.441 215 107.948 215 48.33 215 0 166.871 0 107.5 0 48.13 48.33 0 107.948 0c35.559 0 67.102 17.122 86.77 43.539l-90.181 48.07L162.57 32.25h-32.169L90.892 86.862V32.25H64.77v150.5h26.123v-54.524l39.509 54.524h32.169l-56.526-57.493 88.564 46.352z" /><path d="M206.646 63.895l-90.308 36.076L215 93.583a106.396 106.396 0 0 0-8.354-29.688z" fill="currentColor"/></svg>';

    

    if (!window.lampa_settings.kinopoisk) {

        Lampa.SettingsApi.addComponent({

            component: 'kinopoisk',

            icon: kpLogo,

            name: 'Кинопоиск'

        });

    }



    

    Lampa.SettingsApi.addParam({ component: 'kinopoisk', param: { type: 'title' }, field: { name: 'Аккаунт' } });

    var kp_smart_email = Lampa.Storage.get('kp_smart_email', '') || Lampa.Storage.get('kinopoisk_email', '');

    Lampa.SettingsApi.addParam({

        component: 'kinopoisk',

        param: { type: 'button', name: 'kp_smart_auth' },

        field: { name: kp_smart_email ? kp_smart_email : 'Авторизация в Яндексе' },

        onChange: function() {

            if (Lampa.Storage.get('kp_smart_token', '') || Lampa.Storage.get('kinopoisk_access_token', '')) {

                Lampa.Select.show({

                    title: 'Выйти из аккаунта',

                    items: [{ title: 'Да', confirm: true }, { title: 'Нет' }],

                    onSelect: function(a) {

                        if(a.confirm) {

                            Lampa.Storage.set('kp_smart_token', '');

                            Lampa.Storage.set('kp_smart_email', '');

                            Lampa.Storage.set('kinopoisk_access_token', '');

                            Lampa.Storage.set('kinopoisk_email', '');

                            Lampa.Storage.set('kinopoisk_refresh_token', '');

                            var jq = window.jQuery || window.$;

                            jq('div[data-name="kp_smart_auth"]').find('.settings-param__name').text('Авторизация в Яндексе');                           

                        }

                        Lampa.Controller.toggle('settings_component');

                    },

                    onBack: function(){ Lampa.Controller.toggle('settings_component'); }

                });

            } else {

                Lampa.Controller.toContent();

                startAuth();

            }

        }

    });



    function startAuth() {

        var client_id = '23cabbbdc6cd418abb4b39c32c41195d';

        

        

        network.silent('https://oauth.yandex.ru/device/code', function (data) {

            if (data.user_code) {

                Lampa.Modal.open({

                    title: 'Авторизация Кинопоиск',

                    html: jq('<div class="about"><div>1. Откройте с телефона или ПК сайт <b>yandex.ru/device</b></div><div>2. Введите код: <b>' + data.user_code + '</b></div><br><div>Ожидание авторизации...</div></div>'),

                    onBack: function () { Lampa.Modal.close(); Lampa.Controller.toggle('settings_component'); }

                });

                

                var timer = setInterval(function () {

                    if (!jq('.modal:contains("yandex.ru/device")').length) {

                        clearInterval(timer); return;

                    }

                    

                    network.silent('https://oauth.yandex.ru/token', function (tokenData) {

                        if (tokenData && tokenData.access_token) {

                            clearInterval(timer);

                            Lampa.Storage.set('kp_smart_token', tokenData.access_token);

                            

                            network.silent('https://login.yandex.ru/info?format=json', function(userData) {

                                if (userData && userData.default_email) {

                                    Lampa.Storage.set('kp_smart_email', userData.default_email);

                                    jq('div[data-name="kp_smart_auth"]').find('.settings-param__name').text(userData.default_email);

                                } else { jq('div[data-name="kp_smart_auth"]').find('.settings-param__name').text('Аккаунт подключен'); }

                                jq('div[data-name="kp_smart_auth"]').find('.settings-param__descr').text('Нажмите, чтобы выйти из аккаунта');

                                Lampa.Modal.close(); Lampa.Noty.show('Вы успешно вошли в аккаунт!');

                            }, function() {

                                jq('div[data-name="kp_smart_auth"]').find('.settings-param__name').text('Аккаунт подключен');

                                jq('div[data-name="kp_smart_auth"]').find('.settings-param__descr').text('Нажмите, чтобы выйти из аккаунта');

                                Lampa.Modal.close(); Lampa.Noty.show('Вы успешно вошли в аккаунт!');

                            }, false, { headers: { 'Authorization': 'OAuth ' + tokenData.access_token }});

                        }

                    }, function() {}, { grant_type: 'device_code', code: data.device_code, client_id: client_id, client_secret: '53bc75238f0c4d08a118e51fe9203300' });

                }, (data.interval || 5) * 1000);

            }

        }, function () { Lampa.Noty.show('Ошибка получения кода'); }, { client_id: client_id, device_id: Lampa.Storage.get('kinopoisk_deviceid', '') });

    }



    Lampa.Listener.follow('full', function (e) {

        if (e.type == 'complite') {

            var jq = window.jQuery || window.$;

            var checkTimer = setInterval(function() {

                var target = jq('.full-start__buttons');

                if (target.length === 0) target = jq('.full-start-new__buttons');

                if (target.length > 0) {

                    clearInterval(checkTimer);

                    if (target.find('.button--kinopoisk_rating').length > 0) return;

                    var token = Lampa.Storage.get('kp_smart_token', '') || Lampa.Storage.get('kinopoisk_access_token', '');

                    var btnTitle = token ? 'Оценки КП' : 'Войти для оценки';

                    var btn = jq('<div class="full-start__button selector button--kinopoisk_rating" style="position: relative;">' + buttonIcon + '<span>' + btnTitle + '</span></div>');

                    var movie = e.data.movie || e.data;

                    if (!movie) return;

                    target.append(btn);



                    if (!token) {

                        btn.on('hover:enter', function() { Lampa.Noty.show('Перейдите в Настройки -> Кинопоиск и авторизуйтесь'); });

                    } else {

                        function openMenu(kpId) {

                            network.silent(scriptUrlGet + '?method=getRated&movie=' + kpId + '&oauth=' + token, function(data) {

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

                                    title: 'Оценки КП', items: items,

                                    onSelect: function(a) {

                                        if (a.value === 0) {

                                            Lampa.Noty.show('Удаляем оценку...');

                                            network.silent(scriptUrlAuth + '?method=removeVote&movie=' + kpId + '&oauth=' + token, function(res) {

                                                if (res && res.data && res.data.movie && res.data.movie.vote && res.data.movie.vote.remove && res.data.movie.vote.remove.status == 'SUCCESS') {

                                                    Lampa.Noty.show('Оценка удалена');

                                                } else {

                                                    var err = 'Ошибка Кинопоиска!';

                                                    if (res && res.errors && res.errors[0]) err = res.errors[0].message;

                                                    Lampa.Noty.show('Ошибка: ' + err);

                                                }

                                            });

                                        } else {

                                            Lampa.Noty.show('Ставим оценку ' + a.value + '...');

                                            network.silent(scriptUrlAuth + '?method=setVote&movie=' + kpId + '&rate=' + a.value + '&oauth=' + token, function(res) {

                                                if (res && res.data && res.data.movie && res.data.movie.vote && res.data.movie.vote.set && res.data.movie.vote.set.status == 'SUCCESS') {

                                                    Lampa.Noty.show('Оценка ' + a.value + ' сохранена!');

                                                } else {

                                                    var err = 'Отклонено сервером!';

                                                    if (res && res.errors && res.errors[0]) err = res.errors[0].message;

                                                    Lampa.Noty.show('Ошибка: ' + err);

                                                }

                                            });

                                        }

                                        Lampa.Controller.toggle('full');

                                    },

                                    onBack: function() { Lampa.Controller.toggle('full'); }

                                });

                            }, function() { Lampa.Noty.show('Ошибка соединения с сервером'); });

                        }



                        btn.on('hover:enter', function () {

                            Lampa.Noty.show('Поиск...');

                            

                            var requestUrl = scriptUrlGet + '?method=resolveId';

                            if (movie.kinopoisk_id) {

                                openMenu(movie.kinopoisk_id);

                            } else {

                                requestUrl += '&imdb_id=' + (movie.imdb_id || '') + 

                                              '&tmdb_id=' + (movie.id || '') + 

                                              '&title=' + encodeURIComponent(movie.original_title || movie.title || '') + 

                                              '&year=' + (movie.release_date ? movie.release_date.slice(0, 4) : '');

                                network.silent(requestUrl, function(data) {

                                    if (data && data.kinopoiskId) {

                                        openMenu(data.kinopoiskId);

                                    } else {

                                        Lampa.Noty.show('Не удалось найти фильм на Кинопоиске');

                                    }

                                }, function() { Lampa.Noty.show('Ошибка поиска фильма'); });

                            }

                        });

                    }

                }

            }, 100);

            setTimeout(function() { clearInterval(checkTimer); }, 5000);

        }

    });

})();

