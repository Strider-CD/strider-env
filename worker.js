
module.exports = {
  init: function (config, job, context, done) {
    config.STRIDER_JOB_ID = job._id;
    done(null, {
      env: config
    })
  }
}

