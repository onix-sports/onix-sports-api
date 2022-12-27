// eslint-disable-next-line no-shadow
export enum CursorPageEnum {
    prev = 'prev',
    next = 'next',
    unread = 'unread'
}

export const CursorPageQuery = {
    [CursorPageEnum.prev]: '$lt',
    [CursorPageEnum.next]: '$gt',
    [CursorPageEnum.unread]: '$gte'
}