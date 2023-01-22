module.exports = {
    async up(db) {
        await db.collection('tournaments').updateMany({ status: 'OPENED' }, { $set: { status: 'TEMPORARY_CLOSED' } });
    },

    async down(db) {
        await db.collection('tournaments').updateMany({ status: 'TEMPORARY_CLOSED' }, { $set: { status: 'OPENED' } });
    },
};
