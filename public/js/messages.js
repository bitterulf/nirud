requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        messages: 'page1'
    }
});

requirejs(['m', 'window', 'location', 'data'],
    function(m, window, location, data) {
        window.handleReload = function() {
            location.reload();
        };

        m.mount(document.body, {
            view: function() {
                return [
                    m('h1', data.title),
                    m('div', data.messages.map(function(message) {
                        return m('div', message.text);
                    }))
                ];
            }
        });
    }
);
