module.exports = SettingsCache;

const debug = require('@tryghost/debug');
const tpl = require('@tryghost/tpl');
const {NotFoundError} = require('@tryghost/errors');

const {cloneDeep} = require('lodash');

const messages = {
    SettingNotFound: 'No setting was found for key {key}'
};

/**
 * @typedef {string|number|boolean|object|null} SettingValue
 */

/**
 * @typedef {Object.<string,any>} Setting
 * @prop {SettingValue} value
 */

class SettingsCache {
    /**
     * @param {object} deps 
     * @param {string[]} deps.publicSettingKeys
     */
    constructor(deps) {
        this._cache = {};
        this._publicSettingKeys = deps.publicSettingKeys;
    }

    /**
     * @param {string} key 
     * 
     * @returns {Setting}
     */
    getRaw(key) {
        if (!Reflect.has(this._cache, key)) {
            throw new NotFoundError(tpl(messages.SettingNotFound, {key}));
        }

        return this._cache[key];
    }

    /**
     * 
     * @param {string} key 
     * @param {SettingsCacheGetOptions} options 
     * 
     * @returns {SettingValue}
     */
    get(key) {
        if (!Reflect.has(this._cache, key)) {
            throw new NotFoundError(tpl(messages.SettingNotFound, {key}));
        }

        const setting = this._cache[key];

        const rawValue = setting.value;
        const valueAsNumber = Number(rawValue);

        if (!Number.isNaN(valueAsNumber)) {
            return valueAsNumber;
        }

        try {
            const valueAsJSON = JSON.parse(rawValue);

            return valueAsJSON;
        } catch (err) {
            return rawValue || null;
        }
    }

    /**
     * 
     * @param {string} key 
     * @param {Setting} setting 
     * 
     * @returns {void}
     */
    set(key, setting) {
        this._cache[key] = setting;
        return;
    }

    /**
     * @returns {Object.<string, Setting>}
     */
    getAll() {
        return cloneDeep(this._cache);
    }

    /**
     * @returns {Object.<string, Setting>}
     */
    getPublic() {
        return this._publicSettingKeys.reduce((publicSettings, publicSettingKey) => {
            return {
                ...publicSettings,
                [publicSettingKey]: this.get(publicSettingKey)
            };
        }, {});
    }

    /**
     * @returns {void}
     */
    clear() {
        this._cache = {}; 
        return;
    }
}