const {toMatchSnapshot} = require('jest-snapshot');

expect.extend({
    toBeDateString(received) {
        const parsed = Date.parse(received);

        return {
            pass: !isNaN(parsed),
            message: () => `expected ${received} to be parsable by Date`
        };
    },
    toMatchHeaderSnapshot(received) {
        return toMatchSnapshot.call(
            this,
            received,
            {
                date: expect.toBeDateString(),
                etag: expect.any(String)
            }
        )
    }
});
