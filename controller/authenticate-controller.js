const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const transporter = require('../hooks/mailerInstance');

const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const SecretJWT = process.env.SECRET_JWT;

exports.signin = async (req, res, next) => {
    try {
        passport.authenticate('local', {session: false}, (err, user, info) => {
            if (err) return next(err);
            if (user) {
                const authToken = jwt.sign({user: user.userToken}, SecretJWT, { expiresIn: '6h'});
                return res.status(200).json({
                    message: "Login successful",
                    body: user.userInfo,
                    authToken: authToken,
                });
            } else {
                return res.status(422).json(info);
            }
        })(req, res, next);
    } catch (error) {
        return res.status(401).json({
            message: "Invalid username or password",
            error: error,
        })
    }
};

exports.createagentcy = async (req, res) => {
    try {
        const { email , password, firstName, lastName } = req.body;
        const hashPassword = await bcrypt.hashSync(password, 10);

        const recheckAgent = await prisma.users.findFirst({
            where: {
                OR: [{email: email}],
            } 
        });

        if (recheckAgent) throw "this agentcys already in a system.";

        const newAgentcy = await prisma.users.create({
            data: {
                email: email,
                password: hashPassword,
                firstName: firstName,
                lastName: lastName,
            }
        });

        // await transporter.sendMail({
        //     from: {
        //         name: "Oasis Home Supports",
        //         address: process.env.MAILER_EMAIL,
        //     }, 
        //     to: [email],
        //     subject: `Dear, ${firstName} ${lastName} 🤗`,
        //     html: `
        //     <div>
        //         <p>We is a Supports from Booking Oasis Home.</p>
        //         <p>Thank you for joining us.</p>
        //     </div>
        //     `,
        // });
        
        return res.status(201).json({
            message: "agentcys created successfully",
            body: newAgentcy,
        });
    } catch (error) {
        return res.status(500).json({
            message: "agentcys creation failed",
            error: error,
        })
    }
};


