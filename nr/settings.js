module.exports = {
    userDir: './userDir',
    adminAuth: {
        type: 'credentials',
        users: [{
            username: 'admin',
            password: '$2a$08$qgbU/.vT74vjgh1kIJTEzehKQsph2T.CkrD9e/Efm/RgDm/1kqAMK',
            permissions: "*"
        }]
    },
    functionGlobalContext: {
        osModule: require('os')
    }
}
