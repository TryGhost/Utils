const execa = require('execa');
const _ = require('lodash');

class Changelog {
    constructor(options = {}) {
        if (!options.folder) {
            throw new Error('folder required.');
        }

        if (!options.changelogPath) {
            throw new Error('changelogPath required.');
        }

        this.changelogPath = options.changelogPath;
        this.folder = options.folder;
    }

    write(options = {}) {
        if (!options.githubRepoPath) {
            throw new Error('githubRepoPath required.');
        }

        if (!options.lastVersion) {
            throw new Error('lastVersion required.');
        }

        let sign = '>';

        if (options.append) {
            sign = '>>';
        }

        const commands = [
            `git log --no-merges --pretty=tformat:'%at * [%h](${options.githubRepoPath}/commit/%h) %s - %an' ${options.lastVersion}.. ${sign} ${this.changelogPath}`
        ];

        _.each(commands, (command) => {
            console.log(command);
            execa.shellSync(command, {cwd: options.folder || this.folder});
        });

        return this;
    }

    sort() {
        execa.shellSync(`sort -r ${this.changelogPath} -o ${this.changelogPath}`, {cwd: this.folder});

        return this;
    }

    clean() {
        execa.shellSync(`sed -i.bk -E 's/^[0-9]{10} //g' ${this.changelogPath}`, {cwd: this.folder});

        return this;
    }
}

module.exports = Changelog;
