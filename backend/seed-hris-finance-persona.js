const { PrismaClient } = require("@prisma/client");
const { encrypt } = require("./src/utils/encrypt");
require("dotenv").config();

const prisma = new PrismaClient();

async function run() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY is required in .env");

  const name = "HRIS Lead and Finance Ops/Controller";
  const webhookRaw =
    "https://n8n-excollo.azurewebsites.net/webhook/HRIS-Lead-and-Finance-Ops-Controller";
  const webhookUrl = encodeURI(webhookRaw); // handles spaces safely

  const data = {
    name,
    personaRole: name,
    about: "HRIS + Finance ops controller (update details later).",
    traits: "", // you’ll add later
    painPoints: "",
    coreExpertise: "",
    communicationStyle: "Clear, action-oriented",
    keyResponsibility: "",
    description: "HRIS Lead and Finance Ops/Controller",
    avatarUrl:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    webhookUrl: encrypt(webhookUrl, key),
    isActive: true,
  };

  const existing = await prisma.persona.findFirst({ where: { name } });
  if (existing) {
    await prisma.persona.update({ where: { id: existing.id }, data });
    console.log(`✅ Updated persona: ${name}`);
  } else {
    const created = await prisma.persona.create({ data });
    console.log(`✅ Created persona: ${created.name} (${created.id})`);
  }
}

run()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
