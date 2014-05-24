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
    },
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: "public/",
          src: "**",
          dest: "build/templates/"
        }]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jade");
  grunt.loadNpmTasks("grunt-contrib-copy");

  grunt.registerTask("default", ["jade", "copy"]);
};
