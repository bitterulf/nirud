const jsondiffpatch = require('jsondiffpatch');
const _ = require('highland');
const Datastore = require('nedb');

module.exports = function( options ) {
    const db = new Datastore({ filename: 'data/worlds/'+options.world, autoload: true });

    const stream = _();

    const seneca = this;

    stream
    .map(function(event, cb) {
        return event
    })
    .scan({ messages: [], users: {}, time: 0, plots: [] }, function(state, action) {
        if (action.type == 'message' && action.username && action.text) {
            state.messages.push({
                text: action.text,
                username: action.username,
                world: action.world
            });
        }
        else if (action.type == 'addMoney' && action.username && action.amount && action.amount > 0) {
            if (!state.users[action.username]) {
                state.users[action.username] = {};
            }

            if (!state.users[action.username].money) {
                state.users[action.username].money = 0;
            }

            state.users[action.username].money += action.amount;
        }
        else if (action.type == 'timeTick') {
            state.time++;
            state.messages.push({
                text: '[TIME] ' + state.time,
                username: 'SYSTEM',
                world: action.world
            });
        }
        else if (action.type == 'addPlot') {
            const index = state.plots.length;
            const y = Math.floor(index / 8);
            const x = index - 8 * y;
            state.plots.push({
                id: index + 1,
                x: x,
                y: y
            });
        }

        return state;
    })
    .map(function(state) {
        if (state.messages.length > 10) {
            state.messages = state.messages.slice(-10);
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
        seneca.act('role:store,cmd:setSharedState', {
            state: change.newState
        });

        if (change.diff.messages) {
            seneca.act('role:reloader,cmd:updateURL', { url: '/messages.html' });
        }

        if (change.diff.plots) {
            seneca.act('role:reloader,cmd:updateURL', { url: '/plots.html' });
        }

        seneca.act('role:reloader,cmd:updateURL', { url: '/test.html' });
    });

    db.find({}).sort({ timestamp: 1 }).exec(function (err, docs) {
        docs.forEach(function(doc) {
            stream.write(doc);
        });
    });

    seneca.add('role:stream,cmd:addEvent', { world: options.world }, function (msg, reply) {
        msg.timestamp = (new Date()).getTime();
        stream.write(msg);
        reply(null, {});
        db.insert(msg, function (err, newDoc) {
        });
    });
}
