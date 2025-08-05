const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  getUserByUsername: async (usernameValue) => {
    try {
      const username = usernameValue;
      const user = await prisma.users.findUnique({
        where: { username: username },
        select: {
          id: true,
          username: true,
          fullname: true,
          active: true,
          role: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Error fetching users:", error);
      return null;
    }
  },
};
