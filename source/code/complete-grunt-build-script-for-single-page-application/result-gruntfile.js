// Generated on 2013-12-02 using generator-webapp 0.4.4
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    var assets = require('./assets.js')(grunt);
    var jsAssetsRoots = assets.getJSAssetsRoots();

    var appConfig = require('../spot.im.frontend.common/app-config.js');

    var buildTime = new Date().toLocaleString();

    var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

    grunt.initConfig({
        // configurable paths
        yeoman: {
            app: 'app',
            dist: 'dist'
        },

        clean: {
            /* Delete all files from .tmp, dist (except .git files) */
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            /* Delete all files from .tmp */
            server: '.tmp'
        },

        /* Process app/index.html template and put the result in .tmp/index.html */
        htmlTemplates: {
            files: [ 'index.html' ],
            sourceDir: '<%= yeoman.app %>',
            destDir: '.tmp',
            server: {
                data: {
                    scripts: assets.getJSAssets(false),
                    appConfig: appConfig.development,
                    buildTime: buildTime
                }
            },
            dist: {
                data: {
                    scripts: assets.getJSAssets(true),
                    appConfig: appConfig.staging,
                    buildTime: buildTime
                }
            }
        },

        /* Minimize and put all AngularJS templates into .tmp/templates/templates.js file */
        ngtemplates: {
            dist: {
                cwd: '<%= yeoman.app %>/templates',
                src: '**/*.html',
                dest: '.tmp/templates/templates.js',
                options: {
                    prefix: '/templates/',
                    module: 'spot.im.website',
                    htmlmin: '<%= htmlmin.dist.options %>',
                    concat: 'generated' // Add the result to concat:generated (created by useminPrepare)
                }
            }

            /*app:        {
                src:      '**.html',
                dest:     'template.js',
                options:  {
                    concat: 'combined.js'
                }
            }*/
        },

        /* Compile Sass files from app/styles to Css and put them in .tmp/styles
         *  The server task include debug info where the dist task reset the generated images directory */
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                imagesDir: '<%= yeoman.app %>/assets/images',
                generatedImagesDir: '.tmp/assets/images/generated',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/assets/webfonts',
                //importPath: '<%= yeoman.app %>/bower_components',
                httpImagesPath: '/assets/images',
                httpGeneratedImagesPath: '/assets/images/generated',
                httpFontsPath: '/assets/webfonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= yeoman.dist %>/assets/images/generated'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },

        /* Prefix all css files from .tmp/styles and rewrite them */
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '**/*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        /* Watch for changes and respond accordingly */
        watch: {
            /* Watch for changes in sass files and run compass to process them */
            compass: {
                files: ['<%= yeoman.app %>/styles/**/*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer']
            },
            /* Watch for changes in css files and copy them to .tmp/styles */
            styles: {
                files: ['<%= yeoman.app %>/styles/**/*.css'],
                tasks: ['copy:styles', 'autoprefixer']
            },
            /* Watch for changes in html files and generate a templates to .tmp and .tmp/templates */
            html: {
                files: ['<%= yeoman.app %>/index.html'],
                tasks: ['htmlTemplates:server']
            },
            /* Watch for changes in any of the operational files and activate live reload */
            server: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/**/*.html',
                    '.tmp/styles/**/*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
                    '<%= yeoman.app %>/assets/images/**/*.{gif,jpeg,jpg,png,svg,webp}'
                ]
            }
        },

        /* Prepare configurations for usemin with .tmp/index.html and it's destination */
        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>'
            },
            html: '.tmp/index.html'
        },

        /* Minify images from app/assets/images and put them in dist/assets/images */
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/assets/images',
                    src: '**/*.{gif,jpeg,jpg,png}',
                    dest: '<%= yeoman.dist %>/assets/images'
                }]
            }
        },

        /* Minify svg files from app/assets/images and put them in dist/assets/images */
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/assets/images',
                    src: '**/*.svg',
                    dest: '<%= yeoman.dist %>/assets/images'
                }]
            }
        },

        /* Minify html files from .tmp root and put them in dist root */
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                     // https://github.com/yeoman/grunt-usemin/issues/44
                     //collapseWhitespace: true,
                     collapseBooleanAttributes: true,
                     removeAttributeQuotes: true,
                     removeRedundantAttributes: true,
                     useShortDoctype: true,
                     removeEmptyAttributes: true,
                     removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '.tmp',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        /* Do concurrent tasks */
        concurrent: {
            /* Extract all css files from app/styles (both css and sass) concurrently, and put them in .tmp/styles */
            server: [
                'compass',
                'copy:styles'
            ],
            /* Extract only css files from app/styles and put them in .tmp/styles */
            test: [
                'copy:styles'
            ],
            /* Extract all css files from app/styles (both css and sass) concurrently, and put them in .tmp/styles
             Minify images, svg files and html files (of root) and put them in dist/ */
            dist: [
                'compass',
                'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },

        // Copy files that wasn't handled in other tasks
        copy: {
            /* Copy images that not handled in imagemin, webfonts and other relevant files that wasn't handled from
               app/ to dist/ */
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'assets/images/**/*.{webp}',
                        'assets/webfonts/**/*',
                        'static-pages/**/*'
                    ]
                }]
            },
            /* Copy all pure css from app/styles to .tmp/styles (the folder compass compiles sass) */
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '**/*.css'
            },
            /* Copy task to use when disable uglify task */
            unuglify: {
                expand: true,
                dot: true,
                cwd: '.tmp/concat',
                dest: 'dist',
                src: 'scripts/website.js'
            }
        },

        /* Cache busting for static files */
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/**/*.js',
                        '<%= yeoman.dist %>/styles/**/*.css'
                        // Revved images and fonts cause to wrong references inside css
                        //'<%= yeoman.dist %>/assets/images/**/*.{gif,jpeg,jpg,png,webp}',
                        //'<%= yeoman.dist %>/assets/webfonts/**/*'
                    ]
                }
            },
            index: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/index.html'
                    ]
                }
            }
        },

        /* Replace references in dist/index.html */
        usemin: {
            html: '<%= yeoman.dist %>/index.html',
            options: {
                assetsDirs: ['<%= yeoman.dist %>']
            }
        },

        //------------


        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost',
                middleware: function (connect, options) {
                    var middlewares = [];
                    var paths = options.base;
                    if (typeof paths === 'string') {
                        paths = [ paths ];
                    }
                    // Search for the request url
                    paths.forEach(function(path) {
                        middlewares.push(connect.static(require('path').resolve(path)));
                    });
                    // Request url doesn't found, rewrite rules
                    middlewares.push(rewriteRulesSnippet);

                    // Search the new rewritten request url
                    paths.forEach(function(path) {
                        middlewares.push(connect.static(require('path').resolve(path)));
                    });
                    return middlewares;
                }
            },
            rules: [
                { from: '.*', to: '/index.html' }
            ],
            server: {
                options: {
                    open: 'http://localhost:9000',
                    base: [
                        '.tmp', // For index.html
                        '<%= yeoman.app %>' // For assets and templates
                    ].concat(jsAssetsRoots) // For JavaScript assets
                }
            },
            test: {
                options: {
                    base: [
                        '.tmp',
                        'test',
                        '<%= yeoman.app %>'
                    ].concat(jsAssetsRoots) // For project dependencies
                }
            },
            dist: {
                options: {
                    open: 'http://localhost:9000',
                    base: '<%= yeoman.dist %>',
                    livereload: false
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/**/*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
                }
            }
        },

        aws_s3: {
            staging: {
                options: {
                    accessKeyId: appConfig.staging.aws.accessKeyId,
                    secretAccessKey: appConfig.staging.aws.secretKey,
                    bucket: appConfig.staging.aws.bucketName,
                    sslEnabled: true,
                    access: 'public-read',
                    uploadConcurrency: 5,
                    differential: true
                },
                files: [
                    { expand: true, cwd: 'dist/', src: ['**'], dest: '' }
                ]
            }
        },



        'bower-install': {
            app: {
                html: '<%= yeoman.app %>/index.html',
                ignorePath: '<%= yeoman.app %>/'
            }
        }
    });

    grunt.registerMultiTask('htmlTemplates', 'Processes templates in html files', function() {
        var config = grunt.config('htmlTemplates'),
            sourceDir = config.sourceDir,
            files = grunt.file.expand({ cwd: sourceDir}, config.files),
            destDir = config.destDir,
            allData = config.data || {},
            targetdata = this.data.data || {},
            templateData = {},
            key,
            contents,
            destPath;

        for (key in allData) {
            templateData[key] = allData[key];
        }
        for (key in targetdata) {
            templateData[key] = targetdata[key];
        }


        files.forEach(function(filePath) {
            contents = grunt.file.read(sourceDir + '/' + filePath);

            destPath = destDir + '/' + filePath;

            grunt.log.write('Processing Html template: "' + destPath + '"....');

            // feed the entire pages array and current entry to the template
            grunt.file.write(destPath, grunt.template.process(contents, {data: templateData}));
            grunt.log.writeln('Done'.green);
        });
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run([
                'build',
                'configureRewriteRules',
                'connect:dist:keepalive'
            ]);
        }

        grunt.task.run([
            'clean:server',
            'htmlTemplates:server',
            'concurrent:server',
            'autoprefixer',
            'configureRewriteRules',
            'connect:server',
            'watch'
        ]);
    });

    grunt.registerTask('server', function () {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'configureRewriteRules',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'htmlTemplates:dist',
        'useminPrepare',
        'ngtemplates:dist',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'cssmin',
        'uglify',
        //'copy:unuglify',
        'copy:dist',
        'rev:dist',
        'usemin'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('deploy-staging', [
        'default',
        'aws_s3:staging'
    ]);
};
