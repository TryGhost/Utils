const fs = require('fs');
const os = require('os');
const Promise = require('bluebird');
const requestPromise = require('request-promise');
const request = require('request');

const localUtils = require('./utils');

module.exports.draft = (options = {}) => {
    let draft = true;
    let prerelease = false;

    if (!options.changelogPath) {
        throw new Error('changelogPath is required.');
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

    if (!options.uri) {
        throw new Error('uri is required.');
    }

    if (!options.tagName) {
        throw new Error('tagName is required.');
    }

    if (!options.releaseName) {
        throw new Error('releaseName is required.');
    }

    if (options.hasOwnProperty('draft')) {
        draft = options.draft;
    }

    if (options.hasOwnProperty('prerelease')) {
        prerelease = options.prerelease;
    }

    let content = fs.readFileSync(options.changelogPath).toString('utf8').split(os.EOL);
    content = localUtils.getEmojiCommits(content);

    content = content.filter((item) => {
        return item !== undefined;
    });

    if (options.gistUrl) {
        content.push('');
        content.push('You can see the [full change log](' + options.gistUrl + ') for the details of every change included in this release.');
    }

    const auth = 'Basic ' + new Buffer(options.github.username + ':' + options.github.token).toString('base64');

    const reqOptions = {
        uri: options.uri,
        headers: {
            'User-Agent': options.userAgent,
            Authorization: auth
        },
        method: 'POST',
        body: {
            tag_name: options.tagName,
            target_commitish: 'master',
            name: options.releaseName,
            body: content.join(os.EOL),
            draft: draft,
            prerelease: prerelease
        },
        json: true,
        resolveWithFullResponse: true
    };

    return requestPromise(reqOptions)
        .then((response) => {
            return {
                id: response.body.id,
                releaseUrl: response.body.html_url,
                uploadUrl: response.body.upload_url
            };
        });
};

module.exports.uploadZip = (options = {}) => {
    if (!options.github) {
        throw new Error('github is required.');
    }

    if (!options.github.username) {
        throw new Error('github username is required.');
    }

    if (!options.github.token) {
        throw new Error('github token is required.');
    }

    if (!options.zipPath) {
        throw new Error('github zipPath is required.');
    }

    if (!options.userAgent) {
        throw new Error('userAgent is required.');
    }

    if (!options.uri) {
        throw new Error('uri is required.');
    }

    const auth = 'Basic ' + new Buffer(options.github.username + ':' + options.github.token).toString('base64');
    const stats = fs.statSync(options.zipPath);

    const reqOptions = {
        uri: options.uri,
        headers: {
            'User-Agent': options.userAgent,
            Authorization: auth,
            'Content-Type': 'application/zip',
            'Content-Length': stats.size
        },
        method: 'POST',
        json: true,
        resolveWithFullResponse: true
    };

    return new Promise((resolve, reject) => {
        fs.createReadStream(options.zipPath)
            .pipe(request.post(reqOptions), (err, res) => {
                if (err) {
                    return reject(err);
                }

                resolve({
                    downloadUrl: res.body.browser_download_url
                });
            });
    });
};

module.exports.get = (options = {}) => {
    if (!options.userAgent) {
        throw new Error('userAgent is required.');
    }

    if (!options.uri) {
        throw new Error('uri is required.');
    }

    const reqOptions = {
        uri: options.uri,
        headers: {
            'User-Agent': options.userAgent
        },
        method: 'GET',
        json: true
    };

    return requestPromise(reqOptions)
        .then((response) => {
            return response;
        });
};
