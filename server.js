const Hapi = require('hapi');
const Vision = require('vision');
const Inert = require('inert');
const Path = require('path');

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
    port: 8080,
});

server.register([
    require('./plugins/hapi/senecaPlugin.js'),
    { register: require('./plugins/hapi/primusPlugin.js'), options: { sessionPassword: sessionPassword } },
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
    { register: require('./plugins/hapi/hapiWebPlugin.js'), options: { } }
]);

server.start( (err) => {

    if (err) {
        throw (err);
    }

    console.log('server started');
});
