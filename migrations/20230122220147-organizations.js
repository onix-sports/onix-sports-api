module.exports = {
    async up(db) {
        await db.collection('users').updateMany({}, { $set: { organizations: [] } });
    },

    async down(db) {
        await db.collection('users').updateMany({}, { $unset: { organizations: 1 } });
    },
};
