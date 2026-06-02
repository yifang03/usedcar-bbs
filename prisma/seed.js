const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      nickname: "管理员",
      role: "admin",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      nickname: "车友小明",
      role: "user",
    },
  });

  console.log("Seed done:");
  console.log(`  Admin: admin@example.com / admin123`);
  console.log(`  User:  user@example.com / user123`);

  // Create sample car listing
  await prisma.carListing.create({
    data: {
      userId: user.id,
      title: "15年高尔夫1.4T自动舒适",
      brand: "大众",
      model: "高尔夫",
      year: 2015,
      mileage: 8,
      price: 5.8,
      city: "北京",
      description: "个人一手车，平时上下班代步，车况非常好。刚做的保养，轮胎也是今年换的。",
      images: JSON.stringify([]),
      status: "approved",
    },
  });

  // Create sample question
  const question = await prisma.question.create({
    data: {
      userId: user.id,
      title: "买二手车需要注意哪些事项？",
      description: "准备入手一台二手代步车，预算5万左右，想问一下各位老司机看车时需要注意什么？",
      tags: JSON.stringify(["选车", "验车"]),
    },
  });

  // Create sample answer
  await prisma.answer.create({
    data: {
      questionId: question.id,
      userId: admin.id,
      content: "1. 查保养记录 2. 看发动机是否漏油 3. 试驾感受换挡是否平顺 4. 检查底盘 5. 最好找第三方检测",
      isAccepted: true,
    },
  });

  // Create sample article
  await prisma.article.create({
    data: {
      userId: user.id,
      title: "我的第一台二手车选购经历",
      content: "从看车到提车花了整整两周时间，分享一下我的经验...\n\n首先确定预算和需求，然后每天刷论坛看车源...",
      category: "购车记",
      isFeatured: true,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
