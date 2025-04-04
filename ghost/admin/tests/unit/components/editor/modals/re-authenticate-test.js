import Service from '@ember/service';
import sinon from 'sinon';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import {isTwoFactorTokenRequiredError} from 'ghost/app/services/ajax';
import {setupTest} from 'ember-mocha';
// Stub modals service
class ModalsStub extends Service {
    open() {
        return Promise.resolve();
    }
}

describe('Unit: Re-authenticate error handling', function () {
    setupTest();

    beforeEach(function () {
        this.owner.register('service:modals', ModalsStub);
    });

    it('can identify 2FA and device verification errors', function () {
        const errors = [
            {
                payload: {
                    errors: [{
                        code: '2FA_TOKEN_REQUIRED'
                    }]
                },
                expected: true
            },
            {
                payload: {
                    errors: [{
                        code: 'DEVICE_VERIFICATION_REQUIRED'
                    }]
                },
                expected: true
            },
            {
                payload: {
                    errors: [{
                        message: 'Access denied.'
                    }]
                },
                expected: false
            },
            {
                payload: {
                    errors: [{
                        code: 'DIFFERENT_ERROR'
                    }]
                },
                expected: false
            }
        ];

        errors.forEach((testCase) => {
            expect(
                isTwoFactorTokenRequiredError(testCase),
                `should ${testCase.expected ? '' : 'not '}identify as 2FA error`
            ).to.equal(testCase.expected);
        });
    });

    it('calls re-verify modal exactly once for 2FA error', async function () {
        const modals = this.owner.lookup('service:modals');
        const openSpy = sinon.spy(modals, 'open');

        const handleError = async (error) => {
            if (isTwoFactorTokenRequiredError(error)) {
                await modals.open('editor/modals/re-verify');
                return true;
            }
            return false;
        };

        const error2FA = {
            payload: {
                errors: [{
                    code: '2FA_TOKEN_REQUIRED'
                }]
            }
        };

        await handleError(error2FA);

        expect(openSpy.calledOnce, 're-verify modal called once').to.be.true;
        expect(openSpy.firstCall.args[0]).to.equal('editor/modals/re-verify');
    });
});