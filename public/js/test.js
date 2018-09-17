requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        messages: 'page1'
    }
});

requirejs(['m', 'window'],
    function(m, window) {
        const state = {};

        const reloadData = function() {
            m.request({
                method: 'GET',
                url: '/test.json'
            })
            .then(function(result) {
                console.log('test', result.state);
            });
        };

        window.handleReload = function() {
            reloadData();
        };

        reloadData();

        m.mount(document.body, {
            view: function() {
                return [
                    m('h1', 'test'),
                    m('button', {
                        onclick: function() {
                            window.parent.doAction({ action: 'sendMessage', message: 'fooMessage' });
                        }
                    }, 'message'),
                    m('button', {
                        onclick: function() {
                            window.parent.doAction({ action: 'addMoney', amount: 100 });
                        }
                    }, 'money'),
                    m('button', {
                        onclick: function() {
                            window.parent.doAction({ action: 'timeTick' });
                        }
                    }, 'time'),
                    m('button', {
                        onclick: function() {
                            window.parent.doAction({ action: 'addPlot' });
                        }
                    }, 'addPlot')
                ];
            }
        });
    }
);
