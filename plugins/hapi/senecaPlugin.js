exports.register = (server, options, next) => {
    const seneca = require('seneca')();

    seneca.use( require('../seneca/statePlugin.js'), { });
    seneca.use( require('../seneca/webPlugin.js'), { });
    seneca.use( require('../seneca/streamPlugin.js'), { world: 'w1' });

    server.decorate('server', 'seneca', seneca);

    next();
};

exports.register.attributes = {
    name: 'senecaPlugin',
    version: '1.0.0'
};
