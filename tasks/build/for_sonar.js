export default (grunt) => {

  grunt.registerTask('_build:forSonar', 'handle Sonar specific options', function () {

    const dest = grunt.config.get('copy.devSource.dest');

    grunt.log.writeln('Using destination: ' + dest);

    if (grunt.option('with-visualizations')) {
      grunt.log.writeln('Enable visualizations');
      grunt.file.copy(dest + '/src/core_plugins/kibana/index.js.orig', dest + '/src/core_plugins/kibana/index.js');
      grunt.file.copy(dest + '/src/core_plugins/timelion/index.js.orig', dest + '/src/core_plugins/timelion/index.js');
    }
    else {
      grunt.log.writeln('Disable visualizations');
      grunt.file.copy(dest + '/src/core_plugins/kibana/index.js.new', dest + '/src/core_plugins/kibana/index.js');
      grunt.file.copy(dest + '/src/core_plugins/timelion/index.js.new', dest + '/src/core_plugins/timelion/index.js');
    }
  });
};