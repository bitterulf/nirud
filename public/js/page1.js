requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        page1: 'page1'
    }
});

requirejs(['m', 'window', 'location', 'Menu'],
    function(m, window, location, Menu) {
        const state = {};

        const reloadData = function() {
            m.request({
                method: 'GET',
                url: '/page1.json'
            })
            .then(function(result) {
                state.title = result.title;
                state.counter = result.counter;
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
                    m('h1', state.title || ''),
                    m('h2', state.counter || ''),
                    m('div', m('a', { href: 'page2.html' }, '2')),
                    m('button', { onclick: function() {
                        window.parent.doAction({ action: 'countUp' });
                    }}, 'up'),
                    m('button', { onclick: function() {
                        state.inverted = !state.inverted;
                        window.parent.setToggle('inverted', state.inverted);
                    } }, state.inverted ? 'X': 'O')
                ];
            }
        });

    }
);
