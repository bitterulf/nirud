requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        page1: 'page1'
    }
});

requirejs(['m', 'window', 'location', 'Menu'],
    function(m, window, location, Menu) {
        const state = {
            plots: [],
            selectedPlot: null
        };

        const reloadData = function() {
            m.request({
                method: 'GET',
                url: '/plots.json'
            })
            .then(function(result) {
                console.log('ORN', result);
                state.title = result.title;
                state.plots = result.plots;
            });
        };

        window.handleReload = function() {
            reloadData();
        };

        reloadData();

        m.mount(document.getElementById('root'), {
            view: function() {
                return [
                    m(Menu),
                    m('h1', state.title || ''),
                    m('h2', state.selectedPlot ? state.selectedPlot.x + '/' + state.selectedPlot.y : '-/-'),
                    m('a', {
                        onclick: function() {
                            window.parent.doAction({ action: 'buyPlot', x: state.selectedPlot.x, y: state.selectedPlot.y });
                        }
                    }, 'buy'),
                    m('div', { style: 'position: relative;' }, state.plots.map(function(plot, index) {
                        const isSelected = state.selectedPlot && state.selectedPlot.x === plot.x && state.selectedPlot.y === plot.y;

                        return m('div', {
                            style: 'position: absolute; left: ' + plot.x * 32 + 'px; top: ' + plot.y * 32 + 'px; border: 1px solid ' + (isSelected ? 'red' : 'black') + '; width: 32px; height: 32px; cursor: pointer;',
                            onclick: function() {
                                state.selectedPlot = {
                                    x: plot.x,
                                    y: plot.y
                                };
                            }
                        });
                    }))
                ];
            }
        });

    }
);
