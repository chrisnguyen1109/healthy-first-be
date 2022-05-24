export const omitValueObj = (obj: object, keys: string[]) =>
    Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
