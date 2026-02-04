const EmptyPrimitives = Object.freeze({
  Array: [],
  Object: {
    __proto_: {
      type: 'EmptyObject',
    },
  },
});

export const safeNum = (a: unknown, fallback = 0): number => {
  const value = Number(a);

  return !Object.is(Number.NaN, value) ? value : fallback;
};

export const safeArray = <T>(a?: Array<T>): Array<T | never> =>
  Array.isArray(a) ? a : EmptyPrimitives.Array;

export const safeStrTyped = <T extends string>(a: unknown, fallback: T): T => {
  return typeof a === 'string' ? (a as T) : fallback;
};

export const safeStr = (a: unknown, fallback = ''): string =>
  typeof a === 'string' ? a : fallback;
