const fs = require('fs');
const requestPromise = require('request-promise');

module.exports.create = (options = {}) => {
    let isPublic = true;

    if (!options.changelogPath) {
        throw new Error('changelogPath is required.');
    }

    if (!options.gistName) {
        throw new Error('gistName is required.');
    }

    if (!options.gistDescription) {
        throw new Error('gistDescription is required.');
    }

    if (!options.github) {
        throw new Error('github is required.');
    }

    if (!options.github.username) {
        throw new Error('github username is required.');
    }

    if (!options.github.token) {
        throw new Error('github token is required.');
    }

    if (!options.userAgent) {
        throw new Error('userAgent is required.');
    }

    if (options.hasOwnProperty('isPublic')) {
        isPublic = options.isPublic;
    }

    const content = fs.readFileSync(options.changelogPath);
    const files = {};

    files[options.gistName] = {
        content: content.toString('utf8')
    };

    const auth = 'Basic ' + new Buffer(options.github.username + ':' + options.github.token).toString('base64');

    const reqOptions = {
        uri: 'https://api.github.com/gists',
        headers: {
            'User-Agent': options.userAgent,
            Authorization: auth
        },
        method: 'POST',
        body: {
            description: options.gistDescription,
            public: isPublic,
            files: files
        },
        json: true,
        resolveWithFullResponse: true
    };

    return requestPromise(reqOptions)
        .then((response) => {
            return {
                gistUrl: response.body.html_url
            };
        });
};
