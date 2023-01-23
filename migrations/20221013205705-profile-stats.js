const { Types } = require("mongoose");

module.exports = {
  async up(db, client) {
    const stats = await db.collection('statistics').aggregate([
      { $sort: { createdAt: -1 } },
      { 
        $lookup:  {
          from: 'games',
          localField: 'game',
          foreignField: '_id',
          as: 'game'
        }
      },
      {
        $set: {
          game: { $arrayElemAt: ['$game', 0] }
        }
      },
      {
        $group: {
          _id: "$user",
          goals: {
            $sum: { $add: ["$mGoals", "$rGoals"] },
          },
          mGoals: {
            $sum: "$mGoals",
          },
          rGoals: {
            $sum: "$rGoals",
          },
          aGoals: {
            $sum: { $add: ["$amGoals", "$arGoals"] },
          },
          amGoals: {
            $sum: "$amGoals",
          },
          arGoals: {
            $sum: "$arGoals",
          },
          won: {
            $sum: {
              $cond: ["$won", 1, 0],
            },
          },
          games: {
            $sum: {
              $cond: [true, 1, 0],
            },
          },
          totalTime: {
            $sum: "$game.duration",
          },
          goalsLine: {
            $push: { $add: ["$mGoals", "$rGoals"] },
          },
          winrateLine: {
            $push: { $cond: ["$won", 1, 0] }
          },
          lastGames: {
            $push: '$game._id'
          }
        },
      },
      {
        $lookup: {
          from: 'tournaments',
          localField: '_id',
          foreignField: 'best',
          as: 'best',
          pipeline: [
            { 
              $group: { 
                _id: null,
                count: { $count: {} }
              } 
            }
          ]
        }
      },
      {
        $set: {
          best: { $arrayElemAt: ['$best', 0] }
        }
      },
      {
        $set: {
          best: '$best.count',
          lastGames: { $slice: ['$lastGames', 0, 9] }
        }
      }
    ]).toArray();

    const promises = stats.map(async (stat) => {
      const winrateLine = [];

      stat.winrateLine.reduce((acc, val, index) => {
        winrateLine.push((acc + val) / (index + 1));
  
        return acc + val;
      }, 0);

      const games = await db.collection('games').find({ players: stat._id, status: 'FINISHED' }, { sort: { duration: -1 } }).toArray();

      return { 
        ...stat,
        user: stat._id, 
        winrateLine,
        longestGame: games[0]._id,
        shortestGame: games[games.length - 1]._id,
      };
    });

    let profilestatistics = await Promise.all(promises);
    const actionPromises = profilestatistics.map(async ({ user, ...stats }) => {
      const games = await db.collection('games').find({ players: user, status: 'FINISHED' }).toArray();

      const gamesPromises = games.map(async ({ _id }) => {
        const actions = await db.collection('action').find({ game: _id }, { sort: { timeFromStart: 1 } }).toArray();

        return actions.reduce((acc, action, index) => {
          const { position, team } = action.info.players.find((player) => player._id.toString() === user.toString());
          
          if (index === 0) {
            acc.currentPosition = position;

            return acc;
          }

          if (action.type !== 'RESUME') {
            acc[acc.currentPosition === 'forward' ? 'forwardTime' : 'keeperTime'] += action.timeFromStart - acc.timeFromStart;
          }

          if (
            ['RGOAL', 'MGOAL'].includes(action.type) 
            && acc.currentPosition === 'goalkeeper'
            && action.player.team !== team) {
            acc.goalsSkipped++;
          }

          acc.timeFromStart = action.timeFromStart;
          acc.currentPosition = position;

          return acc;
        }, { keeperTime: 0, forwardTime: 0, currentPosition: 'goalkeeper', timeFromStart: 0, goalsSkipped: 0 });
      });

      const userTimes = await Promise.all(gamesPromises).then((gameStats) => {
        return gameStats.reduce((acc, val) => ({
          keeperTime: acc.keeperTime + val.keeperTime,
          forwardTime: acc.forwardTime + val.forwardTime,
          goalsSkipped: acc.goalsSkipped + val.goalsSkipped,
        }), { keeperTime: 0, forwardTime: 0, goalsSkipped: 0 });
      });

      return { best: 0, ...stats, user, ...userTimes };
    });

    profilestatistics = await Promise.all(actionPromises);

    await db.collection('profilestatistics').insertMany(profilestatistics);
  },

  async down(db, client) {
    await db.dropCollection('profilestatistics');
  }
};
