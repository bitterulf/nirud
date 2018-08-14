var Header = {
    view: function(vnode) {
        return m('div.header', [
            m('h1', {class: 'title'}, [
                vnode.attrs.title,
                m('span.badge.badge-secondary', 'awesome')
            ]),
        ])
    }
};

var Card = {
    view: function(vnode) {
        return m(".card", {style: {"width": "18rem"}},
            [
                m("img.card-img-top[alt='Card image cap'][src='http://via.placeholder.com/180x100']"),
                m(".card-body",
                    [
                        m("h5.card-title",
                            vnode.attrs.title
                        ),
                        m("p.card-text",
                            vnode.attrs.title
                        ),
                        vnode.attrs.button
                    ]
                )
            ]
        )
    }
}

var Breadcrumb = {
    view: function(vnode) {
        return m("nav[aria-label='breadcrumb']",
            m("ol.breadcrumb",
                vnode.attrs.items.map(function(item) {
                    if (!item.link) {
                        return m("li.breadcrumb-item.active", {"aria-current": "page"}, item.title);
                    }

                    return m("li.breadcrumb-item",
                        m('a', { href: item.link }, item.title)
                    );
                })
            )
        );
    }
}

var Counter = {
    data: {
        count: 0
    },
    view: function(vnode) {
        return [
            m('button.btn.btn-primary', {
                onclick: function() {
                    vnode.state.data.count++;
                    if (vnode.attrs.onCountChange) {
                        vnode.attrs.onCountChange(vnode.state.data.count);
                    }
                }
            }, '+'),
            m('input', { value: vnode.state.data.count, size: 2, readonly: true } ),
            m('button.btn.btn-primary', {
                onclick: function() {
                    if (vnode.state.data.count < 1) {
                        return;
                    }
                    vnode.state.data.count--;
                    if (vnode.attrs.onCountChange) {
                        vnode.attrs.onCountChange(vnode.state.data.count);
                    }
                }
            }, '-')
        ];
    }
}
