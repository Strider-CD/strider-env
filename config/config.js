
app.controller('EnvironmentCtrl', ['$scope', function ($scope) {
  $scope.$watch('configs[branch].env.config', function (value) {
    $scope.config = value;
  });
  $scope.saving = false;
  $scope.save = function () {
    $scope.saving = true;
    $scope.pluginConfig(name, $scope.config, function () {
      $scope.saving = false;
    });
  };
  $scope.del = function (key) {
    delete $scope.config[key];
  };
}]);
