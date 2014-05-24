module.exports = function(grunt){
  grunt.initConfig({
    "jade": {
      compile: {
        options: {
          pretty: true
        },
        files: {
          "build/templates/index.htm": "views/index.jade"
        }
      }
    },
    "copy": {
      main: {
        files: [{
          expand: true,
          cwd: "public/",
          src: ["**/*.js", "**/*.css"],
          dest: "build/templates/"
        }]
      }
    },
    "gh-pages": {
      options: {
        base: "build/templates"
      },
      src: ["**"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jade");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-gh-pages");

  grunt.registerTask("default", ["jade", "copy", "gh-pages"]);
};
