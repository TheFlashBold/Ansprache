var grunt = require('grunt');


grunt.initConfig({
    connect: {
        server: {
            options: {
                port: 8000,
                base: '/Users/holzer/PhpstormProjects/ansprache',
                keepalive: true
            }
        }
    }
});

grunt.loadNpmTasks('grunt-contrib-connect');