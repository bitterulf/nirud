const Hapi = require('hapi');
const Vision = require('vision');
const Handlebars = require('handlebars');
const Inert = require('inert');
const Path = require('path');
const Primus = require('primus');
const seneca = require('seneca')();
const Iron = require('iron');
const _ = require('highland');
const jsondiffpatch = require('jsondiffpatch');

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
    messages: [],
    users: [
        {
            username: 'bob',
            password: 'king'
        }
    ]
};

const sessionPassword = 'passwordmustbesomewhatlongerthanitis';

const primus = new Primus(server.listener, {/* options */});

const stream = _();

const serverState = {
    state: {}
};

stream.map(function(event, cb) {
    return event
})
.scan({ messages: [] }, function(state, action) {
    if (action.type == 'message' && action.username && action.text) {
        state.messages.push({
            text: action.text,
            username: action.username,
            world: action.world
        });
        if (state.messages.length > 3) {
            state.messages.shift();
        }
    }

    return state;
})
.scan({oldState: null, newState: null, diff: null}, function(state, newState) {
    state.oldState = state.newState;
    state.newState = JSON.parse(JSON.stringify(newState));
    state.diff = jsondiffpatch.diff(state.oldState, state.newState);

    return state;
})
.filter(function(change) {
    return change.diff;
})
.each(function(change) {
    serverState.state = change.newState;

    if (change.diff.messages) {
        primus.forEach(function (spark, id, connections) {
            spark.write({ reload:'/messages.html' });
        });
    }
});

stream.resume();

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
            if (data.action === 'countUp') {
                state.counter++;

                seneca.act('data:messages,action:add', {username: spark.username, world: spark.world, message: 'message' + state.counter}, function (err, result) {
                    this.act('event:update', { username: spark.username, world: spark.world, url: '/page1.html' });
                })
            }
            else if (data.action === 'sendMessage' && data.message) {
                stream.write({ type: 'message', world: spark.world, username: spark.username, text: data.message });
            }
            else if (data.action === 'construct' && data.construction) {
                seneca.act('data:messages,action:add', {username: spark.username, world: spark.world, message: spark.username + ' want to construct ' + data.construction }, function (err, result) {
                })
            }
        }
    });
});

server.register(Vision);
server.register(Inert);
server.register({ register: require('yar'), options: {
    cookieOptions: {
        password: sessionPassword,   // Required
        isSecure: false // Required if using http
    }
} });

server.views({
    engines: { html: Handlebars },
    relativeTo: __dirname,
    path: 'templates',
    partialsPath: 'templates/partials'
});

seneca.add('event:update,url:*,username:*,world:*', function (msg, reply) {
    primus.forEach(function (spark, id, connections) {
        spark.write({ reload: msg.url });
    });
    reply(null, {});
});

seneca.add('path:*,extension:html', function (msg, reply) {
  reply(null, {
      view: '404',
      data: {
        title: 'nirud page',
      }
  });
});

seneca.add('path:page1,extension:html,world:*,username:*', function (msg, reply) {
  reply(null, {
      view: 'page1',
      data: {
        title: 'nirud page'
      }
  });
});

seneca.add('path:page1,extension:json,world:*,username:*', function (msg, reply) {
  reply(null, {
      data: {
        title: 'nirud page',
        counter: state.counter,
        username: msg.username,
        world: msg.world
      }
  });
});

seneca.add('path:constructions,extension:html,world:*,username:*', function (msg, reply) {
  reply(null, {
      view: 'constructions',
      data: {
        title: 'constructions'
      }
  });
});

seneca.add('path:constructions,extension:json,world:*,username:*', function (msg, reply) {
  reply(null, {
      data: {
        options: [
            { name: 'well', price: 10, time: 20 }
        ],
        constructions: []
      }
  });
});

seneca.add('path:login,extension:html', function (msg, reply) {
  reply(null, {
      view: 'login',
      data: {
        title: 'login'
      }
  });
});

seneca.add('path:messages,extension:html,world:*,username:*', function (msg, reply) {
    reply(null, {
      view: 'messages',
      data: {
      }
    });
});

seneca.add('path:messages,extension:json,world:*,username:*', function (msg, reply) {
    reply(null, {
        data: {
            messages: serverState.state.messages || []
        }
    });
});

seneca.add('path:page2,extension:html', function (msg, reply) {
  reply(null, {
      view: 'page2',
      data: {
        title: 'nirud page'
      }
  });
});

seneca.add('path:index,extension:html,session:*', function (msg, reply) {
  reply(null, {
      view: 'index',
      data: {
        session: msg.session
      }
  });
});

seneca.add('path:unreleased,extension:html', function (msg, reply) {
    console.log('not yet ready');
    this.prior(msg, reply)
});

seneca.wrap('path:*', function (msg, respond) {
    console.log('loading ' + msg.path + ' as '+ msg.extension);
    this.prior(msg, respond)
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

            seneca.act({path: 'index', extension: 'html', session: session.replace('session=', '')}, function (err, result) {
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

            seneca.act({path: request.params.path, extension: request.params.extension, username: username, world: world}, function (err, result) {
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
            const user = state.users.find(function(user) {
                return user.username == request.payload.username && user.password == request.payload.password;
            });
            const world = request.payload.world;

            if (user && world) {
                request.yar.set('username', user.username);
                console.log(world);
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

server.start( (err) => {

    if (err) {
        throw (err);
    }

    console.log('server started');
});
