const bonjour = require('bonjour')()
const portfinder = require('portfinder');
const zmq = require('zeromq');

const browser = bonjour.find({ type: 'http' });
browser.on('up', function(data) {
    console.log('BROOOM', data, browser.services);
})

portfinder.getPort(function (err, port) {
    console.log('Producer bound to port '+port);
    const producer = zmq.socket('push');
    producer.bindSync('tcp://127.0.0.1:'+port);

    setTimeout(function() {
        // setInterval(function(){
          // console.log('sending work');
          // producer.send('some work');
        // }, 500);
    }, 1000);

    bonjour.publish({ name: 'My Web Server', type: 'http', port: port });

    portfinder.getPort(function (err, port) {
        console.log('Producer bound to port '+port);
        const producer = zmq.socket('push');
        producer.bindSync('tcp://127.0.0.1:'+port);

        setTimeout(function() {
            // setInterval(function(){
              // console.log('sending work');
              // producer.send('some work');
            // }, 500);
        }, 1000);

        bonjour.publish({ name: 'My Web Server2', type: 'http', port: port });
    });
});

const find = function() {
    bonjour.find({ type: 'http' }, function (service) {
        console.log('Found an HTTP server:', service);
        console.log(service.rawTxt.toString());
        // const sock = zmq.socket('pull');

        // sock.connect('tcp://127.0.0.1:'+service.port);
        // console.log('Worker connected to port '+service.port);

        // sock.on('message', function(msg){
            // console.log('work: %s', msg.toString());
        // });
    });
};

// setInterval(find, 3000);
// find();
