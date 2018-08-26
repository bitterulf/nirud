const Hapi = require('hapi');
const Inert = require('inert');
const Path = require('path');
const unirest = require('unirest');

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

server.register(Inert);

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



