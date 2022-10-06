module.exports = {
  async up(db, client) {
    const tournamentsCollection = db.collection('tournaments');
    const stats = await tournamentsCollection.aggregate([
      {
        $match: {
          status: 'CLOSED'
        }
      },
      {
        $lookup: {
          from: 'statistics',
          localField: 'games',
          foreignField: 'game',
          as: 'stats',
          pipeline: [
            { 
              $group: {
                _id: '$user',
                goals: {
                  $avg: { $add: ["$mGoals", "$rGoals"] }
                }
              } 
            },
          ]
        }
      },
      {
        $unwind: '$stats'
      },
      {
        $sort: {
          'stats.goals': -1
        }
      },
      {
        $group: {
          _id: '$_id',
          stats: {
            $push: '$stats'
          }
        }
      },
      {
        $project: {
          best: {
            $arrayElemAt: ['$stats', 0]
          }
        }
      }
    ]).toArray();

    for (const { _id, best } of stats) {
      await tournamentsCollection.updateOne({ _id }, { $set: { best: best._id } });
    }
  },

  async down(db, client) {
    await db.collection('tournaments').updateMany({}, { $unset: { best: '' } });
  }
};
