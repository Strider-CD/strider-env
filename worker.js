
module.exports = {
  init: function (config, job, context, done) {
    // add a VCS_BRANCH environment variable if it is not set
    if ( typeof config.VCS_BRANCH === 'undefined' ) {
      config.VCS_BRANCH = job.ref && job.ref.branch ? job.ref.branch : 'master';
    }
    done(null, {
      env: config
    });
  }
}

