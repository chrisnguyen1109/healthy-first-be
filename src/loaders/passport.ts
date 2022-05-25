import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { checkLogin } from '@/services';

export const loadPassports = () => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
            },
            async (email, password, done) => {
                try {
                    const user = await checkLogin({ email, password });

                    done(null, user);
                } catch (error) {
                    done(error);
                }
            }
        )
    );
};
