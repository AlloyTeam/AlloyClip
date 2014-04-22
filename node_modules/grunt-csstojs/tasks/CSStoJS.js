/*
 * grunt-CSStoJS
 * https://github.com/danielstocks/grunt-CSStoJS
 *
 * Copyright (c) 2014 Daniel Stocks
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('CSStoJS', 'Transforms your CSS to a JavaScript string', function() {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      varName: 'CSSString'
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join("");

      src = src.replace(/\s+/g, '');
      src = src.replace(/"/g, "'");
      src = 'var '+options.varName+'="'+src+'";';
      src += "\n";

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
