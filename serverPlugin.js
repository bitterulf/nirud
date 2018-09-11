const jsondiffpatch = require('jsondiffpatch');
const _ = require('highland');

module.exports = function( options ) {
    const stream = _();

    const seneca = this;

    stream
    .map(function(event, cb) {
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
        seneca.act('server:state', {
            state: change.newState
        });

        if (change.diff.messages) {
            seneca.act('event:update', { url: '/messages.html' });
        }
    });

    stream.resume();

    seneca.add('stream:*', function (msg, reply) {
        stream.write(msg);
        reply(null, {});
    });
}
