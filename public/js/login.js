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
                        m('select[name=world]', [
                            m('option[value=w1]', 'w1'),
                            m('option[value=w2]', 'w2'),
                            m('option[value=w3]', 'w3')
                        ]),
                        m('input[type=submit][value=login]')
                    ])
                ];
            }
        });

    }
);
