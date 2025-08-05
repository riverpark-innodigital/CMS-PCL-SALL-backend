const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const InitUser = async () => {
    const reCheckuser = await prisma.users.count();

    if (reCheckuser === 0) {
        const user = await prisma.users.create({
            data: {
                ldapUserId: '6836fa458837c522eb0da159',
                username: 'SystemAccountTest',
                password: await bcrypt.hashSync('123456', 10),
                fullname: 'Administrator PCL',
                active: true,
                role: 1
            }
        });
        console.log('✅ Initializing user data created successfully:', user);
    } else {
        console.log('✅ Initializing user data already exists in the database.');
    }
};

module.exports = InitUser;