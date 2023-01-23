/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
module.exports = {
    async up(db) {
        const statistics = await db.collection('profilestatistics').find({}).toArray();

        for (const stat of statistics) {
            const lastGames = await db
                .collection('games')
                .find({ players: stat.user })
                .sort({ finishedAt: -1 }).limit(9)
                .toArray();

            await db.collection('profilestatistics').updateOne(
                { _id: stat._id },
                { $set: { lastGames: lastGames.map((game) => game._id).reverse() } },
            );
        }
    },

    async down() {},
};
