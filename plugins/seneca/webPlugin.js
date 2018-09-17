module.exports = function( options ) {
    const seneca = this;

    seneca.add('role:web,cmd:respond,path:*,extension:html', function (msg, reply) {
      reply(null, {
          view: '404',
          data: {
            title: 'nirud page',
          }
      });
    });

    seneca.add('role:web,cmd:respond,path:page1,extension:html,world:*,username:*', function (msg, reply) {
      reply(null, {
          view: 'page1',
          data: {
            title: 'nirud page'
          }
      });
    });

    seneca.add('role:web,cmd:respond,path:page1,extension:json,world:*,username:*', function (msg, reply) {
      reply(null, {
          data: {
            title: 'nirud page',
            counter: 0,
            username: msg.username,
            world: msg.world
          }
      });
    });

    seneca.add('role:web,cmd:respond,path:constructions,extension:html,world:*,username:*', function (msg, reply) {
      reply(null, {
          view: 'constructions',
          data: {
            title: 'constructions'
          }
      });
    });

    seneca.add('role:web,cmd:respond,path:constructions,extension:json,world:*,username:*', function (msg, reply) {
      reply(null, {
          data: {
            options: [
                { name: 'well', price: 10, time: 20 }
            ],
            constructions: []
          }
      });
    });

    seneca.add('role:web,cmd:respond,path:login,extension:html', function (msg, reply) {
      reply(null, {
          view: 'login',
          data: {
            title: 'login'
          }
      });
    });

    seneca.add('role:web,cmd:respond,path:messages,extension:html,world:*,username:*', function (msg, reply) {
        reply(null, {
          view: 'messages',
          data: {
          }
        });
    });

    seneca.add('role:web,cmd:respond,path:messages,extension:json,world:*,username:*', function (msg, reply) {
        this.act('role:store,cmd:getSharedState', function(err, result) {
            console.log(err, result);
            reply(null, {
                data: {
                    messages: result.state.messages
                }
            });
        });
    });

    seneca.add('role:web,cmd:respond,path:test,extension:html,world:*,username:*', function (msg, reply) {
        reply(null, {
          view: 'test',
          data: {
          }
        });
    });

    seneca.add('role:web,cmd:respond,path:test,extension:json,world:*,username:*', function (msg, reply) {
        this.act('role:store,cmd:getSharedState', function(err, result) {
            reply(null, {
                data: {
                    state: result.state
                }
            });
        });
    });

    seneca.add('role:web,cmd:respond,path:page2,extension:html', function (msg, reply) {
      reply(null, {
          view: 'page2',
          data: {
            title: 'nirud page'
          }
      });
    });

    seneca.add('role:web,cmd:respond,path:index,extension:html,session:*', function (msg, reply) {
      reply(null, {
          view: 'index',
          data: {
            session: msg.session
          }
      });
    });

    seneca.add('role:web,cmd:respond,path:unreleased,extension:html', function (msg, reply) {
        console.log('not yet ready');
        this.prior(msg, reply)
    });

    seneca.wrap('role:web,cmd:respond,path:*', function (msg, respond) {
        console.log('loading ' + msg.path + ' as '+ msg.extension);
        this.prior(msg, respond)
    });
}
