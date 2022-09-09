export default function sortByScore(users: {
  gpg: number;
  winrate: number;
  games: any;
  _id: any;
  name: any;
}[]) {
  return users
      .sort((a, b) => b.winrate - a.winrate || b.gpg - a.gpg)
      .map((user, index) => ({ ...user, wScore: users.length - index, }))
      .sort((a, b) => b.gpg - a.gpg || b.winrate - a.winrate)
      .map((user, index) => ({ ...user, gScore: users.length - index, score: user.wScore + users.length - index }))
      .sort((a, b) => b.score - a.score || b.wScore - a.wScore || b.gScore - a.gScore);
}