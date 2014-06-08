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
          src: ["**/*.jade", "!layout.jade", "!index.jade"],
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
          src: ["**/*.js", "**/*.css"],
          dest: "build/templates/"
        }]
      }
    },
    "replace": {
      htm: {
        src: ["build/templates/controllers/controllers.js"],
        dest: "build/templates/controllers/",
        replacements: [{
          from: /^(\s+templateUrl: "[\w\/]+)(",)$/g,
          to: "$1.htm$2"
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
  grunt.loadNpmTasks("grunt-text-replace");
  grunt.loadNpmTasks("grunt-gh-pages");

  //grunt.registerTask("default", ["jade", "copy", "replace", "gh-pages"]);
  grunt.registerTask("default", ["jade", "copy", "gh-pages"]);
};
