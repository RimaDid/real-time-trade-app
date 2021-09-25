export type Stock = {
    isin: string,
    price: number,
    bid: number,
    ask: number,
    previousPrice?: number,
};