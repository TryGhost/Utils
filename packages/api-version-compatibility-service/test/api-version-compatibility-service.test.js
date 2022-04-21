const assert = require('assert');
const sinon = require('sinon');
const APIVersionCompatibilityService = require('../index');

describe('APIVersionCompatibilityService', function () {
    afterEach(function () {
        sinon.reset();
    });

    it('Sends an email to the instance owners when fresh accept-version header mismatch detected', async function () {
        const sendEmail = sinon.spy();
        const fetchHandled = sinon.spy();
        const saveHandled = sinon.spy();

        const compatibilityService = new APIVersionCompatibilityService({
            sendEmail,
            fetchEmailsToNotify: async () => ['test_env@example.com'],
            fetchHandled,
            saveHandled
        });

        await compatibilityService.handleMismatch({
            acceptVersion: 'v4.5',
            contentVersion: 'v5.1',
            userAgent: 'Elaborate Fox'
        });

        assert.equal(sendEmail.called, true);
        assert.equal(sendEmail.args[0][0].to, 'test_env@example.com');
        assert.equal(sendEmail.args[0][0].subject, `Attention required: Your Elaborate Fox integration has failed`);
        assert.match(sendEmail.args[0][0].html, /Elaborate Fox integration expected Ghost version: v4.5/);
        assert.match(sendEmail.args[0][0].html, /Current Ghost version: v5.1/);
    });

    it('Does NOT send an email to the instance owner when previously handled accept-version header mismatch is detected', async function () {
        const sendEmail = sinon.spy();
        const fetchHandled = sinon.stub()
            .onFirstCall().resolves(null)
            .onSecondCall().resolves({});

        const saveHandled = sinon.stub().resolves({});

        const compatibilityService = new APIVersionCompatibilityService({
            sendEmail,
            fetchEmailsToNotify: async () => ['test_env@example.com'],
            fetchHandled,
            saveHandled
        });

        await compatibilityService.handleMismatch({
            acceptVersion: 'v4.5',
            contentVersion: 'v5.1',
            userAgent: 'Elaborate Fox'
        });

        assert.equal(sendEmail.calledOnce, true);
        assert.equal(sendEmail.args[0][0].to, 'test_env@example.com');
        assert.equal(sendEmail.args[0][0].subject, `Attention required: Your Elaborate Fox integration has failed`);
        assert.match(sendEmail.args[0][0].html, /Elaborate Fox integration expected Ghost version: v4.5/);
        assert.match(sendEmail.args[0][0].html, /Current Ghost version: v5.1/);

        await compatibilityService.handleMismatch({
            acceptVersion: 'v4.5',
            contentVersion: 'v5.1',
            userAgent: 'Elaborate Fox'
        });

        assert.equal(sendEmail.calledTwice, false);
    });

    it('Does send multiple emails to the instance owners when previously unhandled accept-version header mismatch is detected', async function () {
        const sendEmail = sinon.spy();
        const fetchHandled = sinon.stub()
            .onFirstCall().resolves(null)
            .onSecondCall().resolves(null);

        const saveHandled = sinon.stub().resolves({});

        const compatibilityService = new APIVersionCompatibilityService({
            sendEmail,
            fetchEmailsToNotify: async () => ['test_env@example.com', 'test_env2@example.com'],
            fetchHandled,
            saveHandled
        });

        await compatibilityService.handleMismatch({
            acceptVersion: 'v4.5',
            contentVersion: 'v5.1',
            userAgent: 'Elaborate Fox'
        });

        assert.equal(sendEmail.calledTwice, true);
        assert.equal(sendEmail.args[0][0].to, 'test_env@example.com');
        assert.equal(sendEmail.args[0][0].subject, `Attention required: Your Elaborate Fox integration has failed`);
        assert.match(sendEmail.args[0][0].html, /Elaborate Fox integration expected Ghost version: v4.5/);
        assert.match(sendEmail.args[0][0].html, /Current Ghost version: v5.1/);

        assert.equal(sendEmail.calledTwice, true);
        assert.equal(sendEmail.args[1][0].to, 'test_env2@example.com');
        assert.equal(sendEmail.args[1][0].subject, `Attention required: Your Elaborate Fox integration has failed`);
        assert.match(sendEmail.args[1][0].html, /Elaborate Fox integration expected Ghost version: v4.5/);
        assert.match(sendEmail.args[1][0].html, /Current Ghost version: v5.1/);

        await compatibilityService.handleMismatch({
            acceptVersion: 'v4.8',
            contentVersion: 'v5.1',
            userAgent: 'Elaborate Fox'
        });

        assert.equal(sendEmail.callCount, 4);
        assert.equal(sendEmail.args[2][0].to, 'test_env@example.com');
        assert.equal(sendEmail.args[2][0].subject, `Attention required: Your Elaborate Fox integration has failed`);
        assert.match(sendEmail.args[2][0].html, /Elaborate Fox integration expected Ghost version: v4.8/);
        assert.match(sendEmail.args[2][0].html, /Current Ghost version: v5.1/);
    });
});