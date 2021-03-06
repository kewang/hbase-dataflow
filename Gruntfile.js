module.exports = function(grunt){
  grunt.initConfig({
    "jade": {
      compile: {
        options: {
          pretty: true
        },
        files: [{
          expand: true,
          cwd: "views/",
          src: [
            "**/*.jade",
            "!layout.jade",
            "!index.jade"
          ],
          dest: "build/templates/",
          ext: "",
          extDot: "first"
        }, {
          expand: true,
          cwd: "views/",
          src: ["index.jade"],
          dest: "build/templates/",
          ext: ".htm",
          extDot: "first"
        }]
      }
    },
    "copy": {
      main: {
        files: [{
          expand: true,
          cwd: "public/",
          src: [
            "**/*.js",
            "**/*.css",
            "!javascripts/bootstrap/**"
          ],
          dest: "build/templates/"
        }, {
          expand: true,
          cwd: "public/",
          src: ["javascripts/bootstrap/dist/**"],
          dest: "build/templates/"
        }]
      }
    },
    "gh-pages": {
      options: {
        base: "build/templates",
        user: {
          name: "kewang",
          email: "cpckewang@gmail.com"
        }
      },
      src: ["**"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jade");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-gh-pages");

  grunt.registerTask("default", ["jade", "copy", "gh-pages"]);
};
