const Primus = require('primus');
const Iron = require('iron');

exports.register = (server, options, next) => {
    const seneca = server.seneca;
    const primus = new Primus(server.listener, {/* options */});

    primus.on('connection', function (spark) {
        spark.on('data', function(data) {
            if (data.action === 'auth') {
                Iron
                    .unseal(data.session, options.sessionPassword, Iron.defaults)
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
                else if (data.action === 'addMoney' && data.amount) {
                    seneca.act('role:stream,cmd:addEvent', { type: 'addMoney', world: spark.world, username: spark.username, amount: data.amount }, function (err, result) {
                    })
                }
                else if (data.action === 'timeTick') {
                    seneca.act('role:stream,cmd:addEvent', { type: 'timeTick', world: spark.world, username: spark.username }, function (err, result) {
                    })
                }
                else if (data.action === 'addPlot') {
                    seneca.act('role:stream,cmd:addEvent', { type: 'addPlot', world: spark.world, username: spark.username }, function (err, result) {
                    })
                }
            }
        });
    });

    seneca.add('role:reloader,cmd:updateURL,url:*', function (msg, reply) {
        primus.forEach(function (spark, id, connections) {
            spark.write({ reload: msg.url });
        });
        reply(null, {});
    });

    server.decorate('server', 'primus', primus);

    next();
};

exports.register.attributes = {
    name: 'primusPlugin',
    version: '1.0.0'
};
