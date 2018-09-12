module.exports = function( options ) {
    const seneca = this;

    const serverState = {
        state: {}
    };

    seneca.add('role:store,cmd:setSharedState', function (msg, reply) {
        serverState.state = msg.state;
        reply(null, {});
    });

    seneca.add('role:store,cmd:getSharedState', function (msg, reply) {
        reply(null, {
            state: serverState.state
        });
    });
}
