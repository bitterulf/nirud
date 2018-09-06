requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        messages: 'page1'
    }
});

requirejs(['m', 'window', 'location'],
    function(m, window, location) {
        const state = {
            messages: []
        };

        const reloadData = function() {
            m.request({
                method: 'GET',
                url: '/messages.json'
            })
            .then(function(result) {
                state.messages = result.messages;
            });
        };

        window.handleReload = function() {
            reloadData();
        };

        reloadData();

        m.mount(document.body, {
            view: function() {
                return [
                    m('h1', 'messages'),
                    m('input#message[type=text]'),
                    m('button', {
                        onclick: function() {
                            const input = document.getElementById('message');
                            if (input.value) {
                                window.parent.doAction({ action: 'sendMessage', message: input.value });
                                input.value = '';
                            }
                        }
                    }, 'send'),
                    m('div', state.messages.map(function(message) {
                        return m('div', message.text);
                    }))
                ];
            }
        });
    }
);
