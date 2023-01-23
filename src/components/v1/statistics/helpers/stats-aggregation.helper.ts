import { Teams } from '@components/v1/games/enum/teams.enum';

export const statsAggregationPipe = () => [
    {
        $group: {
            _id: '$user',
            goals: {
                $sum: { $add: ['$mGoals', '$rGoals'] },
            },
            mGoals: {
                $sum: '$mGoals',
            },
            rGoals: {
                $sum: '$rGoals',
            },
            aGoals: {
                $sum: { $add: ['$amGoals', '$arGoals'] },
            },
            amGoals: {
                $sum: '$amGoals',
            },
            arGoals: {
                $sum: '$arGoals',
            },
            blueWon: {
                $sum: {
                    $cond: [{ $and: [{ $eq: ['$team', Teams.blue] }, '$won'] }, 1, 0],
                },
            },
            redWon: {
                $sum: {
                    $cond: [{ $and: [{ $eq: ['$team', Teams.red] }, '$won'] }, 1, 0],
                },
            },
            blueGames: {
                $sum: {
                    $cond: [{ $eq: ['$team', Teams.blue] }, 1, 0],
                },
            },
            redGames: {
                $sum: {
                    $cond: [{ $eq: ['$team', Teams.red] }, 1, 0],
                },
            },
            won: {
                $sum: {
                    $cond: ['$won', 1, 0],
                },
            },
            games: {
                $sum: 1,
            },
        },
    },
    {
        $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
        },
    },
    {
        $addFields: {
            user: { $arrayElemAt: ['$user', 0] },
        },
    },
    {
        $addFields: {
            name: '$user.name',
        },
    },
    {
        $unset: 'user',
    },
];
