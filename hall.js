const Hapi = require('hapi');
const Inert = require('inert');
const Path = require('path');
const unirest = require('unirest');
const rq = require('request');

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.resolve(__dirname, './hall/')
            }
        }
    }
});

server.connection({
    port: 8080,
});

server.register([Inert], function() {
    server.route({
        method: 'GET',
        path: '/static/{param*}',
        config: {
            handler: function (request, reply) {
                const url = 'https://c1.staticflickr.com/' + request.params.param;

                var options = {
                    url: url,
                    method: 'get',
                    encoding: null
                };

                rq(options, function (error, response, body) {
                    return reply(body).type(response.headers['content-type']);
                });
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/photos/{param*}',
        config: {
            handler: function (request, reply) {
                const url = 'https://www.flickr.com/' + request.params.param;

                unirest
                    .get(url)
                    .end(function (response) {
                        console.log('fooo', response.body);
                        return reply(response.body);
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
});





