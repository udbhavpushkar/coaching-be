const { env } = require("../src/config/env");
const prisma = require("../src/prisma/client");
const { hashPassword } = require("../src/utils/password");

const main = async () => {
  const existing = await prisma.user.findUnique({
    where: { email: env.superAdminEmail }
  });

  if (existing) {
    console.log("Super admin already exists");
    return;
  }

  const password = await hashPassword(env.superAdminPassword);
  await prisma.user.create({
    data: {
      name: env.superAdminName,
      email: env.superAdminEmail,
      phone: env.superAdminPhone,
      password,
      role: "SUPER_ADMIN"
    }
  });

  console.log("Super admin seeded successfully");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
