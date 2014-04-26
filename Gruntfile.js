module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['js/utils.js', 'js/alloyclip.js'],
        dest: 'build/alloyclip.min.js'
      }
    },

    clean: {
        main: {
            src: [ 'build']
        },

        cleanBuild: {
            src: ['build']
        }
    },
    copy: {
      main: {
        files: [

          // includes files within path and its sub-directories
          {expand: true, src: ['js/alloyimage.js'], dest: 'dist/'},
          {expand: true, src: ['*.js'], dest: 'dist/js/', cwd: 'build'},
          /*{expand: true, src: ['index.html'], dest: 'dist/', cwd: 'test'},*/
          {expand: true, src: ['css/*.css'], dest: 'dist/'},
          {expand: true, src: ['border/*.png'], dest: 'dist/'}

        ]
      }
    },

    CSStoJS: {
        options: {},
        files: {
            'AlloyClip.css.js': ['css/main.css']
        }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-CSStoJS');

  // Default task(s).
  grunt.registerTask('default', ['clean:main', 'uglify', "copy:main", "clean:cleanBuild"]);//'uglify']);

};
