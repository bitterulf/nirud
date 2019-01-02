const bonjour = require('bonjour')()
const zmq = require('zeromq');

bonjour.find({ type: 'responseIn' }, function (service) {
    console.log('Found an HTTP server:', service);
    console.log(service.rawTxt.toString());
    const producer = zmq.socket('push');
    producer.connect('tcp://127.0.0.1:'+service.port);

    bonjour.find({ type: 'httpOut' }, function (service) {
        console.log('Found an HTTP server:', service);
        console.log(service.rawTxt.toString());
        const consumer = zmq.socket('pull');

        consumer.connect('tcp://127.0.0.1:'+service.port);
        console.log('consumer connected to port '+service.port);

        consumer.on('message', function(msg){
            producer.send(msg.toString());
        });
    });
});
