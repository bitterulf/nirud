const Hapi = require('hapi');
const Vision = require('vision');
const Handlebars = require('handlebars');
const Inert = require('inert');
const Path = require('path');
const Primus = require('primus');

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

const state = {
    counter: 0,
    messages: []
};

const primus = new Primus(server.listener, {/* options */});

primus.on('connection', function (spark) {
    spark.on('data', function(data) {
        if (data.action === 'countUp') {
            state.counter++;
            state.messages.push({
                text: 'message' + state.counter
            });
            primus.forEach(function (spark, id, connections) {
                spark.write({ reload: '/page1.html' });
                spark.write({ reload: '/messages.html' });
            });
        }
    });
});

server.register(Vision);
server.register(Inert);

server.views({
    engines: { html: Handlebars },
    relativeTo: __dirname,
    path: 'templates',
    partialsPath: 'templates/partials'
});

server.route({
    method: 'GET',
    path: '/',
    config: {
        handler: function (request, reply) {

            return reply.view('index', {
                title: 'nirud server'
            });
        }
    }
});

server.route({
    method: 'GET',
    path: '/page1.html',
    config: {
        handler: function (request, reply) {

            return reply.view('page1', {
                title: 'nirud page',
                counter: state.counter
            });
        }
    }
});

server.route({
    method: 'GET',
    path: '/page1.json',
    config: {
        handler: function (request, reply) {

            return reply({
                title: 'nirud page',
                counter: state.counter
            });
        }
    }
});

server.route({
    method: 'GET',
    path: '/page2.html',
    config: {
        handler: function (request, reply) {

            return reply.view('page2', {
                title: 'nirud page'
            });
        }
    }
});

server.route({
    method: 'GET',
    path: '/messages.html',
    config: {
        handler: function (request, reply) {

            return reply.view('messages', {
                title: 'messages',
                messages: state.messages
            });
        }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: '.',
            redirectToSlash: true,
            index: true,
        }
    }
});

server.start( (err) => {

    if (err) {
        throw (err);
    }

    console.log('server started');
});
