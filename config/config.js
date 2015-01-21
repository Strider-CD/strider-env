app.directive("fileread", [function () {
  return {
    scope: {
      fileread: "="
    },
    link: function (scope, element, attributes) {
      element.bind("change", function (changeEvent) {
        var file = changeEvent.target.files[0],
            reader = new FileReader();

        reader.onload = function (loadEvent) {
          var fileContents = loadEvent.target.result,
              env;

          try {
            env = JSON.parse(fileContents);
          } catch (e) {}

          if (!env) try {
            var obj = {},
                lines = fileContents.split("\n");

            for (var i = 0; i < lines.length - 1; i++) {
              var pair = lines[i].split("=");
              obj[pair[0].trim()] = pair[1].trim();
            }
            env = obj;
          } catch (e) {}

          if (!env) {
            scope.$apply(function () {
              scope.filereadstatus = "Error: unable to parse .env file.";
            });
            return;
          }

          scope.$apply(function () {
            scope.fileread = env;
            scope.filereadstatus = "Ready to add.";
          });
        }
        reader.readAsText(file);
      });
    }
  }
}]);

app.directive( 'editInPlace', function() {
  return {
    restrict: 'E',
    scope: { value: '=' },
    template: '<span ng-click="edit()" ng-bind="value"></span><input ng-blur="editdone()" ng-model="value"></input>',
    link: function ($scope, element, attrs) {
      var inputElement = angular.element( element.children()[1] );

      element.addClass( 'edit-in-place' );
      $scope.editing = false;

      $scope.edit = function () {
        $scope.editing = true;
        element.addClass('active');
        inputElement[0].focus();
      };

      $scope.editdone = function() {
        $scope.editing = false;
        element.removeClass('active');
        gran_papa = $scope.$parent.$parent;
        gran_papa.setkv(element.attr('envkey'), inputElement.val());
        gran_papa.save();
      };
    }
  };
});

app.controller('EnvironmentCtrl', ['$scope', function ($scope) {
  $scope.$watch('configs[branch.name].env.config', function (value) {
    $scope.config = value || {};
  });
  $scope.saving = false;
  $scope.parsedenv = {};
  $scope.parsedenv.src = "";
  $scope.filereadstatus = "";
  $scope.setkv = function (key, value) {
    $scope.config[key] = value;
  }
  $scope.save = function () {
    $scope.saving = true;
    $scope.pluginConfig('env', $scope.config, function () {
      $scope.saving = false;
    });
  };
  $scope.del = function (key) {
    delete $scope.config[key];
    $scope.save();
  };
  $scope.add = function () {
    $scope.config[$scope.newkey] = $scope.newvalue;
    $scope.newkey = $scope.newvalue = '';
    $scope.save();
  };
  $scope.upload = function () {
    var env = $scope.parsedenv.src;
    for (var key in env) {
      $scope.config[key] = env[key];
    }
    $scope.save();
  };
}]);
