// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const JobManager = new require('../index');

describe('Job Manager', function () {
    it('public interface', function () {
        const jobManager = new JobManager();

        should.exist(jobManager.addJob);
    });
});