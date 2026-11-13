declare module 'jstat' {
  export const jStat: {
    normal: {
      inv(p: number, mean: number, std: number): number;
      cdf(x: number, mean: number, std: number): number;
    };
  };
}
