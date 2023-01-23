const defaultAvatar = 'https://www.w3schools.com/howto/img_avatar.png';

module.exports = {
    async up(db) {
        await db.collection('users').updateMany({}, { $set: { avatarUrl: defaultAvatar } });
    },

    async down(db) {
        await db.collection('users').updateMany({}, { $unset: { avatarUrl: '' } });
    },
};
