(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var scriptUrlTrailers = 'https://kp.kovalchukruslan21.workers.dev/';

    var buttonTrailersIcon = '<svg class="button--kinopoisk_trailers_icon" width="239" height="239" viewBox="0 0 239 239" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"><path fill="currentColor" d="M215 121.415l-99.297-6.644 90.943 36.334a106.416 106.416 0 0 0 8.354-29.69z" /><path fill="currentColor" d="M194.608 171.609C174.933 197.942 143.441 215 107.948 215 48.33 215 0 166.871 0 107.5 0 48.13 48.33 0 107.948 0c35.559 0 67.102 17.122 86.77 43.539l-90.181 48.07L162.57 32.25h-32.169L90.892 86.862V32.25H64.77v150.5h26.123v-54.524l39.509 54.524h32.169l-56.526-57.493 88.564 46.352z" /><path d="M206.646 63.895l-90.308 36.076L215 93.583a106.396 106.396 0 0 0-8.354-29.688z" fill="currentColor"/></svg>';

    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
            var jq = window.jQuery || window.$;
            var checkTimer = setInterval(function () {
                var container = jq('.buttons--container');
                var target = container.length > 0 ? container : jq('.full-start-new__buttons, .full-start__buttons');

                if (target.length > 0) {
                    clearInterval(checkTimer);
                    if (target.find('.button--kinopoisk_trailers').length > 0) return;

                    var movie = e.data.movie || e.data;
                    if (!movie) return;

                    var btnTrailer = jq('<div class="full-start__button selector button--kinopoisk_trailers">' + buttonTrailersIcon + '<span>Трейлеры КП</span></div>');
                    target.append(btnTrailer);

                    btnTrailer.on('hover:enter', function () {
                        Lampa.Noty.show('Поиск трейлеров КП');

                        var requestUrl = scriptUrlTrailers + '?method=getTrailers';
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
                                    var trailer = trailers[i];
                                    var date = new Date(trailer.createdAt);
                                    trailersList.push({
                                        title: trailer.title,
                                        subtitle: date.getDate() + ' ' + Lampa.Lang.translate('month_' + date.getMonth() + '_e') + ' ' + date.getFullYear(),
                                        url: 'https://kp.kovalchukruslan21.workers.dev/?url=' + encodeURIComponent(trailer.streamUrl),
                                        icon: '<img class="size-youtube" src="https:' + trailer.preview.avatarsUrl + '/280x178">',
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
                                        onBack: function () { Lampa.Controller.toggle('full_start'); }
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
            }, 100);
            setTimeout(function () { clearInterval(checkTimer); }, 5000);
        }
    });
})();
