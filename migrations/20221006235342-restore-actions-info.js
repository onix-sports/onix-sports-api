const getPlayerInfo = (player, index) => {
  return {
    _id: player._id,
    name: player.name,
    mGoals: 0,
    rGoals: 0,
    amGoals: 0,
    arGoals: 0,
    team: index < 2 ? 'red' : 'blue',
    position: index % 2 === 0 ? 'goalkeeper' : 'forward',
  };
};
const clone = (info) => {
  return {
    ...info,
    players: info.players.map((player) => ({ ...player })),
    score: { ...info.score }
  }
};
const isGoal = (action) => ['MGOAL', 'RGOAL', 'AMGOAL', 'ARGOAL'].includes(action.type);
const isForwardGoal = (action) => ['MGOAL', 'AMGOAL'].includes(action.type);
const isKeeperGoal = (action) => ['RGOAL', 'ARGOAL'].includes(action.type);
const swapPositions = (player1, player2) => {
  const position = player1.position;

  player1.position = player2.position;
  player2.position = position;
};

module.exports = {
  async up(db, client) {
    console.time('restore-actions-info');

    const actionCollection = db.collection('action');
    const gamesCollection = db.collection('games');
    const usersCollection = db.collection('users');

    const games = await gamesCollection.find({ status: 'FINISHED' }).toArray();

    let i = 1;

    for (const game of games) {
      console.log('Processing game', i++, 'of', games.length, ` [${game._id.toString()}]`);
      
      const actions = await actionCollection.find({ game: game._id }, {}).sort({ time: 1 }).toArray();

      if (actions.length === 0) continue;

      const players = await Promise.all(
        game.players.map((_id) => usersCollection.findOne({ _id }))
      );

      const info = {
        id: game._id.toString(),
        title: game.title,
        players: players.map(getPlayerInfo),
        score: {
          red: 0,
          blue: 0
        },
        status: 'STARTED',
        startedAt: games.startedAt,
        finishedAt: null,
        duration: 0
      };
      const getPlayer = (id) => info.players.find(({ _id }) => _id.toString() === id);
      const getTeammate = (player) => {
        const index = info.players.findIndex(({ _id }) => _id.toString() === player._id.toString());

        switch (index) {
          case 0: return info.players[1];
          case 1: return info.players[0];
          case 2: return info.players[3];
          case 3: return info.players[2];
        }
      };
      const getEnemies = (player) => {
        const index = info.players.findIndex(({ _id }) => _id.toString() === player._id.toString());

        switch (index) {
          case 0:
          case 1: return [info.players[2], info.players[3]];
          case 2: 
          case 3: return [info.players[0], info.players[1]];
        }
      };

      const result = clone(actions[0].info);
      
      actions.reduce((acc, action, index, array) => {
        switch (action.type) {
          case 'MGOAL': {
            const player = getPlayer(action.player._id.toString());

            player.mGoals += 1;
            info.score[player.team] += 1;
            action.player = { ...player };

            break;
          }
          case 'RGOAL': {
            const player = getPlayer(action.player._id.toString());

            player.rGoals += 1;
            info.score[player.team] += 1;
            action.player = { ...player };

            break;
          }
          case 'AMGOAL': {
            const player = getPlayer(action.player._id.toString());

            player.amGoals += 1;
            action.player = { ...player };

            break;
          }
          case 'ARGOAL': {
            const player = getPlayer(action.player._id.toString());

            player.arGoals += 1;
            action.player = { ...player };

            break;
          }
          case 'SWAP': {
            let goalAction = array.slice(index + 1).find(isGoal);
            let goaler = null;

            if (goalAction) {
              goaler = getPlayer(goalAction.player._id.toString());
            } else {
              const lastMGoaler = acc.players.find((player, index) => result.players[index].mGoals !== player.mGoals);
              const lastRGoaler = acc.players.find((player, index) => result.players[index].rGoals !== player.rGoals);

              goaler = lastMGoaler || lastRGoaler;
              goalAction = { type: lastMGoaler ? 'MGOAL' : 'RGOAL' };
            }

            if (
              (isForwardGoal(goalAction) && goaler.position === 'goalkeeper') ||
              (isKeeperGoal(goalAction) && goaler.position === 'forward')
              ) {
                const teammate = getTeammate(goaler);

                swapPositions(goaler, teammate);
            } else {
              const [enemy1, enemy2] = getEnemies(goaler);

              swapPositions(enemy1, enemy2);
            }

            break;
          }
          case 'PAUSE': {
            acc.status = 'PAUSED';

            break;
          }
          case 'RESUME': {
            acc.status = 'UNPAUSED';

            break;
          }
        }

        action.info = clone(acc);

        if (index === array.length - 1) {
          const lastMGoaler = acc.players.find((player, index) => result.players[index].mGoals !== player.mGoals);
          const lastRGoaler = acc.players.find((player, index) => result.players[index].rGoals !== player.rGoals);

          if (lastMGoaler) {
            lastMGoaler.mGoals += 1;
          }

          if (lastRGoaler) {
            lastRGoaler.rGoals += 1;
          }

          acc.score[(lastMGoaler || lastRGoaler).team] += 1;

          array.push({
            type: lastMGoaler ? 'MGOAL' : 'RGOAL',
            player: lastMGoaler || lastRGoaler,
            time: game.finishedAt,
            timeFromStart: (game.finishedAt - game.startedAt).valueOf(),
            info: clone(acc),
            game: game._id,
            createdAt: game.finishedAt,
            updatedAt: game.finishedAt,
          });

          const lastAMGoaler = acc.players.find((player, index) => result.players[index].amGoals !== player.amGoals);
          const lastARGoaler = acc.players.find((player, index) => result.players[index].arGoals !== player.arGoals);

          if (lastAMGoaler) {
            lastAMGoaler.amGoals += 1;
          }

          if (lastARGoaler) {
            lastARGoaler.arGoals += 1;
          }

          if (lastAMGoaler || lastARGoaler) {
            array.push({
              type: lastAMGoaler ? 'AMGOAL' : 'ARGOAL',
              player: lastAMGoaler || lastARGoaler,
              time: game.finishedAt,
              timeFromStart: (game.finishedAt - game.startedAt).valueOf(),
              info: clone(acc),
              game: game._id,
              createdAt: game.finishedAt,
              updatedAt: game.finishedAt,
            });
          }

          acc.status = 'FINISHED';

          array.push({
            type: 'FINISH',
            time: game.finishedAt,
            timeFromStart: (game.finishedAt - game.startedAt).valueOf(),
            info: clone(acc),
            game: game._id,
            createdAt: game.finishedAt,
            updatedAt: game.finishedAt,
          });
        }

        return acc;
      }, info);

      const promises = actions.map((action) => {
        if (action._id) {
          return actionCollection.updateOne({ _id: action._id }, { $set: {
            player: action.player,
            info: action.info,
          } });
        } else {
          return actionCollection
            .insertOne(action)
            .then((result) => gamesCollection.updateOne({ _id: game._id }, { $push: { actions: result.insertedId } }));
        }
      });

      await Promise.all(promises);
    }

    console.timeEnd('restore-actions-info');
  },

  async down(db, client) {
  }
};
