const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  getRoleByRoleId: async (roleId) => {
    try {
      const role = roleId;
      const roleData = await prisma.roles.findUnique({
        where: { id: role },
        select: {
          id: true,
          nameEng: true,
          nameTH: true,
          description: true,
        },
      });

      return roleData;
    } catch (error) {
      console.error("Error fetching roles:", error);
      return null;
    }
  },
};
