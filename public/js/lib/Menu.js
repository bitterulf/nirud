define(['m'],
    function(m) {
        const Menu = {
            view: function(vnode) {
                return m('div', [
                    m('span',
                        m('a', { href: 'page1.html' }, 'page 1'),
                        m('a', { href: 'page2.html' }, 'page 2')
                    )
                ])
            }
        };

        return Menu;
    }
);
