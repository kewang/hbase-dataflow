module.exports = function(grunt){
  grunt.initConfig({
    jade: {
      compile: {
        options: {
          pretty: true
        }
      }
    }

    grunt.loadNpmTasks("grunt-contrib-jade");
    grunt.registerTask("default", ["jade"]);
  });
};
