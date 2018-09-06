requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        constructions: 'page1'
    }
});

requirejs(['m', 'window', 'Menu'],
    function(m, window, Menu) {
        const state = {
            constructions: [],
            options: []
        };

        const reloadData = function() {
            m.request({
                method: 'GET',
                url: '/constructions.json'
            })
            .then(function(result) {
                state.constructions = result.constructions;
                state.options = result.options;
            });
        };

        window.handleReload = function() {
            reloadData();
        };

        reloadData();

        m.mount(document.body, {
            view: function() {
                return [
                    m(Menu),
                    m('h1', 'constructions'),
                    m('div', state.options.map(function(option) {
                        return m('button', {
                            onclick: function() {
                                window.parent.doAction({ action: 'construct', construction: option.name });
                            }
                        }, option.name + ' P' + option.price + ' T' +option.time);
                    }))
                ];
            }
        });
    }
);
