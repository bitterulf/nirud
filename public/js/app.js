requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: 'app'
    }
});

requirejs(
    ['/primus/primus.js', 'session'],
    function(Primus, session) {
        const primus = Primus.connect();
        primus.on('data', function(data) {
            if (data.reload) {
                Array.prototype.forEach.call(document.getElementsByTagName('iframe'), function(iframe) {
                    if (iframe.contentWindow.location.href.indexOf(data.reload) > -1) {
                        if (iframe.contentWindow.handleReload) {
                            iframe.contentWindow.handleReload();
                        }
                        else {
                            iframe.contentWindow.location.reload();
                        }
                    }
                });
            }
        });

        primus.write({
            action: 'auth',
            session: session
        });

        window.doAction = function(action) {
            primus.write(action);
        }

        const toggles = {};

        window.getToggle = function(toggle) {
            if (toggles[toggle]) {
                return true;
            }
            return false;
        }

        window.setToggle = function(toggle, value) {
            toggles[toggle] = !!value;
        }
    }
);
