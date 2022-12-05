export const lastGamesAggregationPipe = (count: Number) => [
    {
        $sort: {
            createdAt: -1,
        },
    }, {
        $group: {
            _id: '$user',
            items: {
                $push: {
                    _id: '$_id',
                    arGoals: '$arGoals',
                    amGoals: '$amGoals',
                    rGoals: '$rGoals',
                    mGoals: '$mGoals',
                    user: '$user',
                    team: '$team',
                    won: '$won',
                    game: '$game',
                    tournament: '$tournament',
                    createdAt: '$createdAt',
                    updatedAt: '$updatedAt',
                    enemy: '$enemy',
                    teammate: '$teammate',
                },
            },
        },
    }, {
        $project: {
            items: {
                $slice: [
                    '$items', count,
                ],
            },
        },
    }, {
        $unwind: {
            path: '$items',
            preserveNullAndEmptyArrays: true,
        },
    }, {
        $project: {
            _id: '$items._id',
            arGoals: '$items.arGoals',
            amGoals: '$items.amGoals',
            rGoals: '$items.rGoals',
            mGoals: '$items.mGoals',
            user: '$items.user',
            team: '$items.team',
            won: '$items.won',
            game: '$items.game',
            tournament: '$items.tournament',
            createdAt: '$items.createdAt',
            updatedAt: '$items.updatedAt',
            enemy: '$items.enemy',
            teammate: '$items.teammate',
        },
    },
];
