var bonjour = require('bonjour')()

const getPort = require('get-port');

getPort().then(function(port) {
    var service = bonjour.publish({ name: 'logger1', type: 'logger', port: port });

    setTimeout(function() {
        service.stop(function() {
            console.log('should stop');
        });
        setTimeout(function() {
            console.log('end');
        }, 1000);
    }, 1000);
});
