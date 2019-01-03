const Hapi = require('hapi');
const Vision = require('vision');
const Inert = require('inert');
const Path = require('path');

const zmq = require('zeromq');
const pub = zmq.socket('pub');

const shelf = {};

pub.bind('tcp://127.0.0.1:3000');

const subRequestOffer = zmq.socket('sub');

subRequestOffer.connect('tcp://127.0.0.1:3000');
subRequestOffer.subscribe('requestOffer:log');

const subRequest = zmq.socket('sub');

subRequest.connect('tcp://127.0.0.1:3000');
subRequest.subscribe('request:log');

const pushOffer = zmq.socket('push');
pushOffer.bind('tcp://127.0.0.1:4000');

const pullOffer = zmq.socket('pull');
pullOffer.connect('tcp://127.0.0.1:4000');

pullOffer.on('message', function(msg){
    const data = JSON.parse(msg.toString());
    shelf[data.id].offers.push(data);
    console.log('offerPull', data.id);
});

const pushRequest = zmq.socket('push');
pushRequest.bind('tcp://127.0.0.1:5000');

const pullRequest = zmq.socket('pull');
pullRequest.connect('tcp://127.0.0.1:5000');

pullRequest.on('message', function(msg){
    const data = JSON.parse(msg.toString());
    shelf[data.id].response = data;
    console.log('requestPull', data.id);
});

const service1Time = new Date().getTime();

subRequestOffer.on('message', function(topic, message) {
    const data = JSON.parse(message.toString());
    data.serviceStamp = {
        name: 'service1',
        time: service1Time
    };
    pushOffer.send(JSON.stringify(data));
});

subRequest.on('message', function(topic, message) {
    const data = JSON.parse(message.toString());
    if (data.serviceStamp.name === 'service1') {
        pushRequest.send(JSON.stringify(data));
    }
});

const service2Time = new Date().getTime()+1;

subRequestOffer.on('message', function(topic, message) {

    const data = JSON.parse(message.toString());
    data.serviceStamp = {
        name: 'service2',
        time: service2Time
    };
    pushOffer.send(JSON.stringify(data));
});

subRequest.on('message', function(topic, message) {
    const data = JSON.parse(message.toString());
    if (data.serviceStamp.name === 'service2') {
        pushRequest.send(JSON.stringify(data));
    }
});

const sessionPassword = 'passwordmustbesomewhatlongerthanitis';

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.resolve(__dirname, './public/')
            }
        }
    }
});

server.connection({
    port: 8081,
});

const myPlugin = {
    name: 'myPlugin',
    version: '1.0.0',
    register: function (server, options, next) {
        server.route({
            method: 'GET',
            path: '/{service}/{path*}',
            config: {
                handler: function (request, reply) {
                    const data = {
                        id: request.id,
                        service: request.params.service,
                        path: request.params.path
                    };

                    shelf[request.id] = {
                        id: request.id,
                        offers: []
                    }

                    console.log('request started', data.id);
                    pub.send(['requestOffer:'+request.params.service, JSON.stringify(data)]);

                    setTimeout(function() {
                        const offer = shelf[request.id].offers.sort(function(a, b) {
                            return b.serviceStamp.time - a.serviceStamp.time;
                        })[0];

                        pub.send(['request:'+request.params.service, JSON.stringify(offer)]);

                        const interval = setInterval(function() {
                            if (shelf[request.id].response) {
                                reply(shelf[request.id].response);
                                clearInterval(interval);
                            }
                        }, 100);
                    }, 10);
                }
            }
        });

        next();
    }
};

myPlugin.register.attributes = {
    name: 'myPlugin',
    version: '1.0.0'
};

server.register([
    myPlugin,
    Vision,
    Inert,
    {
        register: require('yar'),
        options: {
            cookieOptions: {
                password: sessionPassword,   // Required
                isSecure: false // Required if using http
            }
        }
    }
]);

server.start( (err) => {

    if (err) {
        throw (err);
    }

    console.log('server started');
});
