export const checkMultipleWords = (value: string, length: number) =>
    value.trim().split(' ').length >= length;
