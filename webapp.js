var path = require('path')
  , _ = require('lodash')

function modifyEnv(changefn) {
  var name = changefn.name
  return function (req, res) {
    var url = req.param('url')
    function error(text, code) {
      console.error('Strider-Env: %s() - %s', name, text)
      res.statusCode = code || 400
      return res.end(JSON.stringify({
        errors: [text],
        status: 'error'
      }, null, '\t'));
    }
    req.user.get_repo_config(url, function (err, repo, access_level, user) {
      if (err) return error('Failed to fetch repo config for ' + url + ': ' + err.message)
      // must have access_level > 0 to be able to continue;
      if (access_level < 1) {
        console.debug(
          "User %s tried to change environment config but doesn't have admin privileges on %s (access level: %s)",
          req.user.email, url, access_level);
        return error(
          "You must have access level greater than 0 in order to be able to configure environment variables.",
          403)
      }
      return changefn(req, res, repo, user, error)
    })
  }
}

/*
 * DELETE /api/config/env
 *
 * Delete a variable from the Strider environment config for specified project.
 *
 * @param url Github html_url of the project.
 * @param key
 *
 */
// to be wrapped by modifyEnv
function deleteEnv(req, res, repo, user, error) {
  var key = req.param('key')
    , env = _.extend({}, repo.get('env'))
  if (!env[key]) return error('Key not found')
  delete env[key]
  repo.set('env', env)
  user.save(function(err) {
    if (err) {
      var errmsg = "Error saving environment config " + user.email + ": " + err;
      return error(errmsg)
    }
    return res.end(JSON.stringify({status: 'ok'}, null, '\t'))
  })
};


/*
 * POST /api/config/env
 *
 * Add a variable to the Strider environment config for specified project.
 *
 * @param url Github html_url of the project.
 * @param key
 * @param val
 *
 */
// to be wrapped by modifyEnv
function addEnv(req, res, repo, user, error) {
  var key = req.param('key')
    , val = req.param('val')
    , env = _.extend({}, repo.get('env'))
  env[key] = val
  repo.set('env', env)
  user.save(function(err) {
    if (err) {
      var errmsg = "Error saving environment config " + user.email + ": " + err;
      return error(errmsg)
    }
    return res.end(JSON.stringify({status: 'ok'}, null, '\t'))
  })
}

module.exports = function(ctx, cb) {
  /*
   * GET /api/config/env
   *
   * Get the current Strider environment config for specified project. This will be a JSON-encoded
   * object with the keys: 
   *
   * @param url Github html_url of the project.
   */
  function getEnv(req, res) {
    var url = req.param("url")

    function error(err_msg) {
      console.error("Strider-Env: getEnv() - %s", err_msg)
      var r = {
        errors: [err_msg],
        status: "error"
      }
      res.statusCode = 400
      return res.end(JSON.stringify(r, null, '\t'))
    }

    req.user.get_repo_config(url, function(err, repo, access_level, owner_user_obj) {
      if (err) {
        return error("Error fetching Repo Config for url " + url + ": " + err)
      }
      var results = repo.get('env')
      if (!results) results = {}
      var r = {
        status: "ok",
        errors: [],
        results: results
      }
      return res.end(JSON.stringify(r, null, '\t'))
    })
  }

  // Extend RepoConfig model with 'Env' properties
  function envPlugin(schema, opts) {
    schema.add({
      env: {}
    })
  }
  ctx.models.RepoConfig.plugin(envPlugin)
  // Add webserver routes
  // this one is currently unused.
  ctx.route.get("/api/env",
    ctx.middleware.require_auth,
    ctx.middleware.require_params(["url"]),
    getEnv)
  // add and remove env variables
  ctx.route.post("/api/env",
    ctx.middleware.require_auth,
    ctx.middleware.require_params(['url', 'key', 'val']),
    modifyEnv(addEnv))
  ctx.route.delete('/api/env',
    ctx.middleware.require_auth,
    ctx.middleware.require_params(['url', 'key']),
    modifyEnv(deleteEnv))

  console.log("strider-env webapp extension loaded")
  cb(null, null)
}
