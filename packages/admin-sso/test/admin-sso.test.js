const express = require('express');
const sinon = require('sinon');
const should = require('should');
const adminSSO = require('../lib/AdminSSO');

describe('admin-sso', function () {
    it('Parses the request, matches the user to the token, sets the user on req.user and calls createSession', async function () {
        const createSession = sinon.spy(async (req, res, user) => {
            req.session = user;
        });
        const findUserByEmail = sinon.spy(async email => ({id: '1', email}));
        const getTokenFromRequest = sinon.spy(async req => req.token);
        const getEmailFromToken = sinon.spy(async token => token.email);

        const handler = adminSSO({
            createSession,
            findUserByEmail,
            getTokenFromRequest,
            getEmailFromToken
        });

        const req = Object.create(express.request);
        const res = Object.create(express.response);
        const next = sinon.spy();

        req.token = {
            email: 'user@host.tld'
        };

        await handler(req, res, next);

        should.ok(getTokenFromRequest.calledOnceWith(req));
        const token = await getTokenFromRequest.returnValues[0];

        should.ok(getEmailFromToken.calledOnceWith(token));
        const email = await getEmailFromToken.returnValues[0];

        should.ok(findUserByEmail.calledOnceWith(email));
        const foundUser = await findUserByEmail.returnValues[0];

        should.ok(createSession.calledOnceWith(req, res, foundUser));
    });
});
