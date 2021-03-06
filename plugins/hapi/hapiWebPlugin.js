const Handlebars = require('handlebars');
const Path = require('path');
const Canvas = require('canvas-prebuilt');

const users = [
    {
        username: 'bob',
        password: 'king'
    }
];

exports.register = (server, options, next) => {
    const seneca = server.seneca;

    server.views({
        engines: { html: Handlebars },
        relativeTo: Path.resolve(__dirname, '../../'),
        path: 'templates',
        partialsPath: 'templates/partials'
    });

    server.route({
        method: 'GET',
        path: '/metric.png',
        config: {
            handler: function (request, reply) {
                const canvas = new Canvas(256, 256);
                const ctx = canvas.getContext('2d');
                ctx.font = '10px Impact';
                ctx.fillText('abc', 128, 128);
                ctx.fillStyle = 'rgba(0,180,180,0.5)';
                ctx.fillRect(0,0,256,16);

                reply(canvas.toBuffer()).type('image/png');
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        config: {
            handler: function (request, reply) {
                const session = request
                    .headers
                    .cookie
                    .split('; ')
                    .find(function(cookie) {
                        return cookie.indexOf('session=') == 0;
                    });

                const username = request.yar.get('username');
                const world = request.yar.get('world')
                if (!username || !world || !session) {
                    return reply().redirect('/login.html');
                }

                seneca.act('role:web,cmd:respond', {path: 'index', extension: 'html', session: session.replace('session=', '')}, function (err, result) {
                    if (!result.view) {
                        return reply(result.data);
                    }
                    return reply.view(result.view, result.data);
                })
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/{path}.{extension}',
        config: {
            handler: function (request, reply) {
                const username = request.yar.get('username');
                const world = request.yar.get('world');

                if ((!username || !world) && request.params.path != 'login') {
                    if (request.params.extension == 'json') {
                        return reply({});
                    }
                    return reply('');
                }

                seneca.act('role:web,cmd:respond', {path: request.params.path, extension: request.params.extension, username: username, world: world}, function (err, result) {
                    if (!result.view) {
                        return reply(result.data);
                    }
                    return reply.view(result.view, result.data);
                })
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/login',
        config: {
            payload:{
                output:'data',
                parse:true,
            },
            handler: function (request, reply) {
                const user = users.find(function(user) {
                    return user.username == request.payload.username && user.password == request.payload.password;
                });
                const world = request.payload.world;

                if (user && world) {
                    request.yar.set('username', user.username);
                    request.yar.set('world', world);
                    return reply().redirect('/');
                }

                return reply().redirect('/login.html');
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/logout',
        config: {
            handler: function (request, reply) {
                request.yar.clear('username');

                return reply().redirect('/login.html');
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

    next();
};

exports.register.attributes = {
    name: 'hapiWeb',
    version: '1.0.0'
};
