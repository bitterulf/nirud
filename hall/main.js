console.log(localStorage.getItem('images'));

const state = {
    images: []
};

try {
    state.images = JSON.parse(localStorage.getItem('images')).map(function(image, index) {
        image.id = image.imageUrl.split('/')[5].split('.')[0];
        return image;
    });
} catch (e) {
    console.log(e);
}

var App = {
    view: function() {
        return m('div', [
            m('h1', {class: 'title'}, 'HALL'),
            m('input#url', {
                type: 'text',
            }),
            m('button', {
                onclick: function() {
                    const url = document.querySelector('#url').value.replace('https://www.flickr.com', '');
                    // document.querySelector('#url').value = '';

                    const duplicate = state.images.find(function(image) {
                        return image.url === url;
                    });

                    if (duplicate) {
                        return;
                    }

                    m.request({
                        method: "GET",
                        url: url,
                        deserialize: function(value) {
                            const result = {
                                url: url
                            };

                            const lines = value.split(/\r\n|\r|\n/g);

                            lines.forEach(function(line) {
                                if ( line.indexOf('<meta property="og:image"')  > -1 ) {
                                    result.imageUrl = line.split('"')[3];
                                }
                            });

                            return result
                        }
                    })
                    .then(function(result) {
                        if (result.imageUrl) {
                            console.log(result);
                            state.images.push(result);
                            localStorage.setItem('images', JSON.stringify(state.images));
                        }
                    });
                }
            }, 'add'),
            state.images.map(function(image) {
                return m('a[href=/ImageView/'+image.id+']', {oncreate: m.route.link},
                    m('img', {
                        title: image.id,
                        style: ' width: 256px;',
                        src: image.imageUrl
                    })
                );
            })
        ])
    }
}

var ImageView = {
    left: -1,
    top: -1,
    right: -1,
    bottom: -1,
    centerX: -1,
    centerY: -1,
    view: function(vnode) {
        const id = m.route.param().id;
        const image = state.images.find(function(image) {
            return image.id === id;
        });



        const drawCenter = vnode.tag.centerX > -1 && vnode.tag.centerY > -1;
        const drawMarker = vnode.tag.left > -1 && vnode.tag.top > -1 && vnode.tag.right > -1 && vnode.tag.bottom > -1;

        console.log('marker', drawMarker);

        return m('div', [
            m('h1', {class: 'title', style: 'position: absolute;' }, 'ImageView'),
            m('img', {
                src: image.imageUrl
            }),
            drawCenter ? m('div', {style: 'position: absolute; width: 1px; height: 1px; border: solid blue 1px; left: '+vnode.tag.centerX+'px; top: '+vnode.tag.centerY+'px;'}) : null,
            drawMarker ? m('div', {style: 'position: absolute; width: '+(vnode.tag.right - vnode.tag.left)+'px; height: '+(vnode.tag.bottom - vnode.tag.top)+'px; border: solid red 1px; left: '+vnode.tag.left+'px; top: '+vnode.tag.top+'px;'}) : null,
            m('div', {
                style: 'position: absolute; width: 100%; height: 100%; top: 0px; left: 0px;',
                onclick: function(ev) {
                    console.log(ev.x, ev.y, ev.target.offsetWidth, ev.target.offsetHeight);
                    console.log(ev);
                    if (ev.shiftKey) {
                        vnode.tag.centerX = ev.x;
                        vnode.tag.centerY = ev.y;
                    }
                    else if (vnode.tag.centerX > -1 && vnode.tag.centerY > -1) {
                        if (ev.x < vnode.tag.centerX) {
                            vnode.tag.left = ev.x;
                        } else {
                            vnode.tag.right = ev.x;
                        }
                        if (ev.y < vnode.tag.centerY) {
                            vnode.tag.top = ev.y;
                        } else {
                            vnode.tag.bottom = ev.y;
                        }

                        console.log(vnode.tag);
                    }
                }
            }),
            drawMarker ? m('button', {
                style: 'position: absolute; left: 0px; top: 0px;',
                onclick: function() {
                    console.log({
                        left: vnode.tag.left,
                        top: vnode.tag.top,
                        right: vnode.tag.right,
                        bottom: vnode.tag.bottom,
                        centerX: vnode.tag.centerX,
                        centerY: vnode.tag.centerY
                    });
                    vnode.tag.left = -1;
                    vnode.tag.top = -1;
                    vnode.tag.right = -1;
                    vnode.tag.bottom = -1;
                    vnode.tag.centerX = -1;
                    vnode.tag.centerY = -1;
                }
            }, 'add') : null
        ]);
    }
};
