// seed-cfo-persona.js
const { PrismaClient } = require("@prisma/client");
const { encrypt } = require("./src/utils/encrypt");
require("dotenv").config();

const prisma = new PrismaClient();

const cfoPersona = {
  name: "Chief Financial Officer (CFO)",
  description:
    "Experienced financial executives with deep involvement in strategic decision-making and partnership formation within financial and product-centric environments. Professionals operating in contexts requiring accelerated decision cycles and internal stakeholder alignment, particularly in areas related to financial efficiency, operational scalability, and controlled pilot testing in banking and credit product domains.",
  avatarUrl:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
  webhookUrl:
    "https://n8n-excollo.azurewebsites.net/webhook-test/Chief-Financial-Officer(CFO)",
  isActive: true,
  // Additional metadata that can be stored in description or as JSON
  metadata: {
    about:
      "Experienced financial executives with deep involvement in strategic decision-making and partnership formation within financial and product-centric environments. Professionals operating in contexts requiring accelerated decision cycles and internal stakeholder alignment, particularly in areas related to financial efficiency, operational scalability, and controlled pilot testing in banking and credit product domains.",
    coreExpertise: [
      "Strategic decision-making and risk mitigation",
      "Financial efficiency and operational cost control",
      "Stakeholder alignment and requirement validation",
      "Pilot program design and execution for solution testing",
      "Timeline setting and project gating process management",
      "Operational efficiency enhancement and scalability planning",
      "Data-driven feedback loops and iterative process improvement",
      "Cross-functional collaboration between finance, product, and operations teams",
    ],
    communicationStyle:
      "Clear, direct, and data-driven communication focused on accelerating decision processes and aligning internal stakeholders. Professionals emphasize transparency and financial efficiency while facilitating prompt review cycles. Communications typically aim to build confidence around proposed solutions, ensuring buy-in and readiness to move forward with controlled, evidence-based pilots.",
    traits: [
      "Analytical – uses data and evidence to support decisions",
      "Strategic – balances short-term actions with long-term goals",
      "Collaborative – actively involves multiple stakeholders for alignment",
      "Result-oriented – focuses on accelerating timelines and milestones",
      "Detail-attentive – monitors gating steps and process control points",
      "Financially prudent – prioritizes cost-effectiveness and resource optimization",
      "Transparent – openly communicates solution fit and operational impact",
      "Risk-aware – promotes gradual validation to mitigate exposure",
      "Adaptive – quickly responds to feedback and adjusts plans accordingly",
    ],
    painPoints: [
      "Role-specific: Navigating complex internal reviews that can delay project progression",
      "Industry-wide: Managing risk in piloting new financial products within regulated environments",
      "Organizational: Aligning diverse stakeholder priorities while maintaining operational efficiency",
      "Systemic: Ensuring data-driven validation processes without excessive bureaucracy",
      "Technical: Balancing solution scalability with low technical complexity demands",
      "Communication: Overcoming delays caused by slow feedback loops and documentation turnaround",
    ],
    keyResponsibilities: [
      "Leading strategic decision-making processes related to financial initiatives",
      "Driving stakeholder alignment and facilitating requirement validation sessions",
      "Accelerating review and feedback cycles to maintain project momentum",
      "Designing and managing pilot programs to test new product solutions",
      "Ensuring transparent and controlled financial oversight of projects",
      "Coordinating cross-departmental collaboration between finance, product, and operations",
      "Setting and enforcing gating steps in project lifecycles",
      "Supporting operational efficiency through scalable, cost-effective solutions",
      "Monitoring and reporting on project progress and outcomes",
      "Mitigating risks through staged rollout and iterative improvements",
    ],
  },
};

async function seedCFOPersona() {
  try {
    console.log("🌱 Starting CFO persona seeding...");

    // Check if CFO persona already exists
    const existingCFO = await prisma.persona.findFirst({
      where: {
        name: {
          contains: "CFO",
        },
      },
    });

    if (existingCFO) {
      console.log(`⚠️  CFO persona already exists with ID: ${existingCFO.id}`);
      console.log("Updating existing CFO persona...");

      // Update existing persona
      const updatedPersona = await prisma.persona.update({
        where: { id: existingCFO.id },
        data: {
          description:
            cfoPersona.description +
            "\n\n" +
            JSON.stringify(cfoPersona.metadata, null, 2),
          avatarUrl: cfoPersona.avatarUrl,
          webhookUrl: encrypt(
            cfoPersona.webhookUrl,
            process.env.ENCRYPTION_KEY
          ),
          isActive: true,
        },
      });

      console.log(`✅ Updated CFO persona: ${updatedPersona.name}`);
      return updatedPersona;
    }

    // Check for encryption key
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("ENCRYPTION_KEY environment variable is required");
    }

    // Create CFO persona with encrypted webhook URL
    const cfoWithEncryptedWebhook = {
      name: cfoPersona.name,
      description:
        cfoPersona.description +
        "\n\n" +
        JSON.stringify(cfoPersona.metadata, null, 2),
      avatarUrl: cfoPersona.avatarUrl,
      webhookUrl: encrypt(cfoPersona.webhookUrl, encryptionKey),
      isActive: true,
    };

    // Insert CFO persona
    const createdPersona = await prisma.persona.create({
      data: cfoWithEncryptedWebhook,
    });

    console.log(`✅ Successfully created CFO persona: ${createdPersona.name}`);
    console.log(`📋 Persona ID: ${createdPersona.id}`);
    console.log(` Webhook URL: ${cfoPersona.webhookUrl}`);
    console.log(`📊 Metadata: ${JSON.stringify(cfoPersona.metadata, null, 2)}`);

    return createdPersona;
  } catch (error) {
    console.error("❌ Error seeding CFO persona:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder
seedCFOPersona()
  .then((persona) => {
    console.log("🎉 CFO persona seeding completed!");
    console.log(`\n📝 You can now test the persona with:`);
    console.log(
      `   curl -X POST http://localhost:3000/api/personas/${persona.id}/chat \\`
    );
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -H "Authorization: Bearer YOUR_TOKEN" \\`);
    console.log(`     -d '{"message": "Hello, I need financial advice"}'`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 CFO persona seeding failed:", error);
    process.exit(1);
  });
