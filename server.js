const Hapi = require('hapi');
const Vision = require('vision');
const Handlebars = require('handlebars');
const Inert = require('inert');
const Path = require('path');
const Primus = require('primus');
const seneca = require('seneca')();

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

            seneca.act('data:messages,action:add', {message: 'message' + state.counter}, function (err, result) {
                seneca.act('event:update', { url: '/page1.html' });
                seneca.act('event:update', { url: '/messages.html' });
            })
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

seneca.add('event:update,url:*', (msg, reply) => {
    primus.forEach(function (spark, id, connections) {
        spark.write({ reload: msg.url });
    });
    reply(null, {});
});

seneca.add('path:page1,extension:html', (msg, reply) => {
  reply(null, {
      view: 'page1',
      data: {
        title: 'nirud page',
        counter: state.counter
      }
  });
});

seneca.add('path:page1,extension:json', (msg, reply) => {
  reply(null, {
      data: {
        title: 'nirud page',
        counter: state.counter
      }
  });
});

seneca.add('data:messages,action:get', (msg, reply) => {
  reply(null, {
      messages: state.messages
  });
});

seneca.add('data:messages,action:add', (msg, reply) => {
    state.messages.push({
        text: msg.message
    });
    reply(null, {});
});

seneca.add('path:messages,extension:html', (msg, reply) => {
    seneca.act('data:messages,action:get', function (err, result) {
        reply(null, {
          view: 'messages',
          data: {
            title: 'messages',
            messages: result.messages
          }
        });
    })
});

seneca.add('path:page2,extension:html', (msg, reply) => {
  reply(null, {
      view: 'page2',
      data: {
        title: 'nirud page'
      }
  });
});

seneca.add('path:index,extension:html', (msg, reply) => {
  reply(null, {
      view: 'index',
      data: {
        title: 'nirud server'
      }
  });
});

server.route({
    method: 'GET',
    path: '/',
    config: {
        handler: function (request, reply) {
            seneca.act({path: 'index', extension: 'html'}, function (err, result) {
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
            seneca.act({path: request.params.path, extension: request.params.extension}, function (err, result) {
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
