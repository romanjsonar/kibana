export default (grunt) => {

  grunt.registerTask('_build:forSonar', 'handle Sonar specific options', function () {

    if (grunt.option('with-visualizations')) {
      grunt.file.copy('src/core_plugins/kibana/index.js.orig', 'src/core_plugins/kibana/index.js');
      grunt.file.copy('src/core_plugins/timelion/index.js.orig', 'src/core_plugins/timelion/index.js');
    }
    else {
      grunt.file.copy('src/core_plugins/kibana/index.js.new', 'src/core_plugins/kibana/index.js');
      grunt.file.copy('src/core_plugins/timelion/index.js.new', 'src/core_plugins/timelion/index.js');
    }
  });
};