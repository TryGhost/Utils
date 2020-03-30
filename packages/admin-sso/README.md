# Admin Sso

## Install

`npm install @tryghost/admin-sso --save`

or

`yarn add @tryghost/admin-sso`


## Usage

```js
const AdminSSO = require('@tryghost/admin-sso');

const adminSSOMiddlware = AdminSSO({
    async createSession(req, res, user) {
        req.session.user_id = user.id;
    },
    async getTokenFromRequest(res) {
        return req.headers['some-cool-header'];
    },
    async getEmailFromToken(token) {
        await someTokenService.validate(token);
        const data = await someTokenService.getData(token);
        return data.email;
    },
    async findUserByEmail(email) {
        return await someUserModel.findOne({email});
    }
});

someExpressApp.get('/some/sso/url', someSessionMiddleware, adminSSOMiddlware, (req, res, next) => {
    res.redirect('/loggedin');
}, (err, res, res, next) => {
    res.redirect('/error');
});
```


## Develop

This is a mono repository, managed with [lerna](https://lernajs.io/).

Follow the instructions for the top-level repo.
1. `git clone` this repo & `cd` into it as usual
2. Run `yarn` to install top-level dependencies.


## Run

- `yarn dev`


## Test

- `yarn lint` run just eslint
- `yarn test` run lint and tests




# Copyright & License 

Copyright (c) 2020 Ghost Foundation - Released under the [MIT license](LICENSE).
