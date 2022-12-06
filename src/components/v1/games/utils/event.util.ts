export const gameEvent = (id: string, event: string) => {
    return `game.${id}.${event}`;
};
