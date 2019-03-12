const emojiRegex = require('emoji-regex');

module.exports.getEmojiCommits = (content) => {
    content.forEach(function (line, index, obj) {
        const sqbracket = line.substring(line.indexOf('['), line.indexOf(']') + 1);
        const rdbracket = line.substring(line.indexOf('('), line.indexOf(')') + 2);
        const contributor = line.substring(line.lastIndexOf('-') - 1, line.length);

        line = line.replace(sqbracket, '');
        line = line.replace(rdbracket, '');
        line = line.replace(contributor, '');
        obj[index] = line;

        const match = emojiRegex().exec(line);

        if (!match || (match && match.index !== 2)) {
            delete obj[index];
        }
    });

    return content;
};

const get = o => p => p.split('.').reduce((obj, prop) => obj && obj[prop], o);
module.exports.checkMissingOptions = (options = {}, ...fields) => {
    const missing = options.filter(get(fields));

    if (missing.length) {
        throw new Error(`Missing options: ${missing.join(',')}`);
    }
};
