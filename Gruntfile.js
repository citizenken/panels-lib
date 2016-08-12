// Gruntfile.js

// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {

  require('time-grunt')(grunt);

  require('jit-grunt')(grunt, {
    jshint: 'grunt-contrib-jshint',
    clean: 'grunt-contrib-clean',
    uglify: 'grunt-contrib-uglify'
  });

  // ===========================================================================
  // CONFIGURE GRUNT ===========================================================
  // ===========================================================================
  grunt.initConfig({

    // get the configuration info from package.json ----------------------------
    // this way we can use things like name and version (pkg.name)
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },

      build: ['Grunfile.js', 'src/**/*.js']
    },

    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'dist/panels-lib.min.js': ['src/**/*.js']
        }
      }
    },

    clean: {
      build: ['dist'],
    },

    concat: {
      dev: {
        src: ['src/**/*.js'],
        dest: 'dist/panels-lib.js',
      }
    }
  });

  grunt.registerTask('default', ['clean', 'concat']);
  grunt.registerTask('build', ['jshint', 'clean', 'uglify', 'concat']);
};
