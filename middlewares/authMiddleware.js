const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const axios = require('axios');
require('dotenv').config();

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const prisma = new PrismaClient();

const SecretJWT = process.env.SECRET_JWT;
const USERMANAGE_API = process.env.USERMANAGE_API;


passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
     async (username, password, cb) => {
        try {
            const user = await axios.post(`${USERMANAGE_API}/authentication/login`, {
                username: username,
                credential: password,
            });
            
            if (user.status === 401) {
                return cb(null, false, { message: 'Invalid your user or password' });
            }

            const Ldaptoken = user.data.data.token;

            const User = await axios.get(`${USERMANAGE_API}/authentication/myprofile`,{
                headers: {
                    Authorization: `Bearer ${Ldaptoken}`,
                },
            });

            const getRole = await prisma.users.findFirst({
                where: {
                    ldapUserId: User.data.data.userId,
                    active: true,
                },
                include: {
                    userRole: true,
                }
            });

            /* if ( getRole && (getRole?.userRole?.nameEng === "Sale" || getRole?.userRole?.nameEng === "Sale Manager")){
                return cb(null, false, { message: "Role Sale and Sale manager can't login." });
            } */

            if (!getRole) return cb(null, false, { message: "this user don't have in the systems." });

            const userInfo = {
                fullname: User.data.data.name,
                id: User.data.data.userId,
                email: User.data.data.email,
                role: getRole?.userRole?.nameEng ? getRole?.userRole?.nameEng : 'User Not Role',
                picture: User.data.data.picture,
            };

            return cb(null, { userToken: user.data, userInfo: userInfo }, {message: 'Logged In Successfully'})
        } catch (error) {
            console.log(error);
            
            return cb(null, false, { message: 'Invalid username or password' });
        }
    }
));

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: SecretJWT
    }, (jwtPayload, cb) => {
        try {
            return cb(null, jwtPayload.user);
        } catch (err) {
            return cb(err);
        }
    }
));