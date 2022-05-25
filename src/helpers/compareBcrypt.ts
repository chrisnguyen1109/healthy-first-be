import bcrypt from 'bcryptjs';

export const compareBcrypt = (token: string, hashToken: string) =>
    bcrypt.compare(token, hashToken);
