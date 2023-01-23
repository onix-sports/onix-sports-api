export function pipe<IResult>(...functions: Function[]): any {
    return (args: any): IResult => functions.reduce((arg, fn) => fn(arg), args);
}
