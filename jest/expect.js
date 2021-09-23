expect.extend({
    toBeDateString(received) {
        const parsed = Date.parse(received);

        return {
            pass: !isNaN(parsed),
            message: () => `expected ${received} to be parsable by Date`
        };
    }
});
