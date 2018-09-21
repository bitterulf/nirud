var bonjour = require('bonjour')()

var browser = bonjour.find({ type: 'logger' });

browser.on('up', function(service) {
    console.log('up', service);
});

browser.on('down', function(service) {
    console.log('down', service);
});

setInterval(function() {
    browser.update();
}, 1000);
