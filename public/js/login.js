requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        login: 'login'
    }
});

requirejs(['m', 'window', 'data'],
    function(m, window) {

        m.mount(document.body, {
            view: function() {
                return [
                    m('h1', data.title),
                    m('form', { action: "/login", method: "post" }, [
                        m('input#username[name=username][type=text]'),
                        m('input#password[name=password][type=password]'),
                        m('input[type=submit][value=login]')
                    ])
                ];
            }
        });

    }
);
