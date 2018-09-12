const Hapi = require('hapi');
const Vision = require('vision');
const Inert = require('inert');
const Path = require('path');
const Primus = require('primus');
const seneca = require('seneca')();
const Iron = require('iron');

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
    port: 8080,
});

const sessionPassword = 'passwordmustbesomewhatlongerthanitis';

const primus = new Primus(server.listener, {/* options */});

const serverState = {
    state: {}
};

seneca.add('role:store,cmd:setSharedState', function (msg, reply) {
    serverState.state = msg.state;
    reply(null, {});
});

seneca.add('role:store,cmd:getSharedState', function (msg, reply) {
    reply(null, {
        state: serverState.state
    });
});

seneca.use( require('./webPlugin.js'), { });
seneca.use( require('./serverPlugin.js'), { });

primus.on('connection', function (spark) {
    spark.on('data', function(data) {
        if (data.action === 'auth') {
            Iron
                .unseal(data.session, sessionPassword, Iron.defaults)
                .then(function(unsealed) {
                    console.log(unsealed._store);
                    spark.username = unsealed._store.username;
                    spark.world = unsealed._store.world;
                });
        }
        else if (spark.username && spark.world) {
            if (data.action === 'sendMessage' && data.message) {
                seneca.act('role:stream,cmd:addEvent', { type: 'message', world: spark.world, username: spark.username, text: data.message }, function (err, result) {
                })
            }
        }
    });
});

server.register([
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
    },
    { register: require('./hapiWebPlugin'), options: { seneca: seneca } }
]);

seneca.add('role:reloader,cmd:updateURL,url:*', function (msg, reply) {
    primus.forEach(function (spark, id, connections) {
        spark.write({ reload: msg.url });
    });
    reply(null, {});
});

server.start( (err) => {

    if (err) {
        throw (err);
    }

    console.log('server started');
});
