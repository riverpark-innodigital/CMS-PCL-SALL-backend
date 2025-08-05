const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const InitRole = async () => {
    try {
        const data = [
            {
                nameTH: 'ผู้ดูแลระบบ',
                nameEng: 'Administrator',
                description: 'for system administrator'
            },
            {
                nameTH: 'ผู้จัดการฝ่ายขาย',
                nameEng: 'Sale Manager',
                description: 'for sale manager'
            },
            {
                nameTH: 'ฝ่ายขาย',
                nameEng: 'Sale',
                description: 'for sale'
            },
        ];

        const reCheckRole = await prisma.roles.count();

        if (reCheckRole === 0) {
            await prisma.roles.createMany({
                data: data.map((items) => ({
                    nameTH: items.nameTH,
                    nameEng: items.nameEng,
                    description: items.description,
                }))
            });

            console.log('✅ Initializing role data created successfully.');
        } else {
            console.log('✅ Initializing role data already exists in the database.');
        }
    } catch (error) {
        console.log('Initializing user data already exists in the database.');
    }
};

module.exports = InitRole;