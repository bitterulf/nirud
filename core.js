const bonjour = require('bonjour')()
const portfinder = require('portfinder');
const zmq = require('zeromq');

portfinder.getPort(function (err, port) {
    console.log('output'+port);
    const producer = zmq.socket('push');
    producer.bindSync('tcp://127.0.0.1:'+port);
    bonjour.publish({ name: 'http output', type: 'httpOut', port: port });

    portfinder.getPort(function (err, port) {
        console.log('input'+port);
        const consumer = zmq.socket('pull');
        consumer.bindSync('tcp://127.0.0.1:'+port);
        consumer.on('message', function(msg){
            console.log('work: %s', msg.toString());
            producer.send(msg.toString());
        });
        bonjour.publish({ name: 'http input', type: 'httpIn', port: port });
    });
});

portfinder.getPort(function (err, port) {
    console.log('output'+port);
    const producer = zmq.socket('push');
    producer.bindSync('tcp://127.0.0.1:'+port);
    bonjour.publish({ name: 'response output', type: 'responseOut', port: port });

    portfinder.getPort(function (err, port) {
        console.log('input'+port);
        const consumer = zmq.socket('pull');
        consumer.bindSync('tcp://127.0.0.1:'+port);
        consumer.on('message', function(msg){
            console.log('work: %s', msg.toString());
            producer.send(msg.toString());
        });
        bonjour.publish({ name: 'response input', type: 'responseIn', port: port });
    });
});

portfinder.getPort(function (err, port) {
    console.log('loggerOut'+port);
    const producer = zmq.socket('pub');
    producer.bindSync('tcp://127.0.0.1:'+port);
    bonjour.publish({ name: 'log output', type: 'logOut', port: port });

    portfinder.getPort(function (err, port) {
        console.log('loggerIn'+port);
        const consumer = zmq.socket('pull');
        consumer.bindSync('tcp://127.0.0.1:'+port);
        consumer.on('message', function(msg){
            console.log('log: %s', msg.toString());
            producer.send(['info', msg.toString()]);
        });
        bonjour.publish({ name: 'log input', type: 'logIn', port: port });
    });
});
