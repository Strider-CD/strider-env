
module.exports = {
  init: function (config, job, context, done) {
    done(null, {
      env: config
    })
  }
}

