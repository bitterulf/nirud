const _ = require('highland');
const jsondiffpatch = require('jsondiffpatch');

var stream = _();

stream.map(function(event, cb) {
        return event
})
.scan({ messages: [] }, function(state, action) {
    if (action.type == 'message' && action.username && action.text) {
        state.messages.push(action.username + ': ' + action.text);
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
    if (change.diff.messages) {
        console.log('messages changed', change.newState.messages);
    }
});

stream.resume();
stream.write({ type: 'message', username: 'bob', text: 'foo' });
stream.write({ type: 'message', username: 'bob', text: 'foo2' });
stream.write({ type: 'message', username: 'bob', text: 'foo3' });
stream.write({ type: 'message', username: 'bob', text: 'foo4' });
