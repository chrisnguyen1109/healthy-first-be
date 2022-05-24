import mongoose from 'mongoose';

import { DATABASE } from '@/config';

export const connectMongoDB = async () => {
    await mongoose.connect(DATABASE!);

    console.log('Connect database successfully!');
};
