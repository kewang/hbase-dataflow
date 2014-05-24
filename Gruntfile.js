module.exports = function(grunt){
  grunt.initConfig({
    jade: {
      compile: {
        options: {
          pretty: true
        },
        files: {
          "build/templates/index.htm": "views/index.jade"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jade");
  grunt.registerTask("default", ["jade"]);
};
