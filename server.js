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
    counter: 0
};

const primus = new Primus(server.listener, {/* options */});

primus.on('connection', function (spark) {
    spark.on('data', function(data) {
        if (data.action === 'countUp') {
            state.counter++;
            primus.forEach(function (spark, id, connections) {
                spark.write({ reload: '/page.html' });
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
    path: '/page.html',
    config: {
        handler: function (request, reply) {

            return reply.view('page', {
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
