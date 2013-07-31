
app.controller('EnvironmentCtrl', ['$scope', function ($scope) {
  $scope.env = [];
  $.each($scope.panelData.environment || {}, function (key, value) {
    $scope.env.push({key: key, value: value});
  });

  function add(url, key, val, done) {
    var data = {
      url: url,
      key: key,
      val: val
    };
    $.ajax({
      url: '/api/env',
      type: 'POST',
      data: data,
      dataType: 'json',
      success: function (data, ts, xhr) {
        done(null);
      },
      error: function (xhr, ts, e) {
        if (xhr && xhr.responseText) {
          var data = $.parseJSON(xhr.responseText);
          e = data.errors[0];
        }
        done(e);
      }
    });
  }

  function remove(url, key, done) {
    var data = {
      url: url,
      key: key
    };
    $.ajax({
      url: '/api/env',
      type: 'DELETE',
      data: data,
      dataType: 'json',
      success: function (data, ts, xhr) {
        done(null);
      },
      error: function (xhr, ts, e) {
        if (xhr && xhr.responseText) {
          var data = $.parseJSON(xhr.responseText);
          e = data.errors[0];
        }
        done(e);
      }
    });
  }

  $scope.add = function () {
    var key = $scope.new_key
      , val = $scope.new_val
      , prev
      , display;
    for (var i=0; i<$scope.env.length; i++) {
      if ($scope.env[i].key === key) {
        display = $scope.env[i];
        break;
      }
    }
    if (!display) {
      display = {key: key, value: val};
      $scope.env.push(display);
    } else {
      prev = display.value;
      display.value = val;
    }
    display.loading = true;
    add($scope.repo.url, key, val, function (err) {
      var verbs = prev ? ['modifying', 'modified'] : ['adding', 'added'];
      display.loading = false;
      if (err) {
        $scope.error("Error " + verbs[0] + " environment variable: " + err);
        if (prev) {
          display.value = prev;
        } else {
          $scope.env.splice($scope.env.indexOf(display), 1);
        }
      } else {
        $scope.success("Environment variable " + verbs[1]);
      }
      $scope.$root.$digest();
    });
  };

  $scope.remove = function (vbl) {
    vbl.loading = true;
    remove($scope.repo.url, vbl.key, function (err) {
      vbl.loading = false;
      if (err) {
        $scope.error("Error removing environment variable: " + err);
      } else {
        $scope.success("Environment variable removed");
        $scope.env.splice($scope.env.indexOf(vbl), 1);
      }
      $scope.$root.$digest();
    });
  };
}]);
