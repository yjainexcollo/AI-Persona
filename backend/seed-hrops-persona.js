// seed-cfo-persona.js
const { PrismaClient } = require("@prisma/client");
const { encrypt } = require("./src/utils/encrypt");
require("dotenv").config();

const prisma = new PrismaClient();

const hrOpsPersona = {
  name: "HR Ops / Payroll Manager",
  description:
    "Experienced HR operations and payroll professionals with deep expertise in end-to-end payroll processing, statutory compliance, and employee data management. Professionals operating in contexts requiring precise attention to regulatory frameworks, data accuracy, and process standardization across payroll and HR operational activities.",
  avatarUrl:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
  webhookUrl:
    "https://n8n-excollo.azurewebsites.net/webhook/HR-Ops-Payroll-Manager",
  isActive: true,
  metadata: {
    about:
      "Oversees end-to-end payroll operations, statutory compliance, and employee data integrity. Maintains precise control over sensitive processes and ensures adherence to regulatory frameworks across all payroll and HR operational activities.",
    coreExpertise: [
      "Payroll processing and finalization",
      "Statutory compliance (PF, ESI, PT, TDS)",
      "Attendance and leave management systems",
      "Data validation and error reconciliation",
      "HRMS implementation and optimization",
      "Labor law interpretation and audit support",
      "Confidential records management",
      "Change management in payroll policies",
    ],
    communicationStyle:
      "Communicates in a clear, factual manner focused on accuracy and policy enforcement. Provides stepwise guidance on payroll processes and compliance matters. Addresses escalations with assertive, solution-oriented explanations, ensuring clarity for all stakeholders.",
    traits: [
      "Compliance-focused – vigilantly applies statutory and regulatory rules",
      "Process-driven – enforces standardized payroll cycles and checks",
      "Detail-oriented – scrutinizes data and reports for discrepancies",
      "Confidential – safeguards payroll and employee information",
      "Deadline-conscious – prioritizes timely payroll delivery",
      "Systematic – organizes documentation for audits and reviews",
      "Analytical – resolves variances and complex salary computations",
      "Adaptable – manages evolving compliance and organizational policies",
      "Decisive – makes quick judgments on exception handling",
      "Collaborative – coordinates with finance, HR, and external agencies",
      "Audit-ready – maintains comprehensive, retrievable record-keeping",
    ],
    painPoints: [
      "Role-specific: Frequent changes in statutory regulations and contribution rates",
      "Systemic: Fragmented HR and payroll data sources complicate reconciliation",
      "Organizational: Last-minute changes to attendance and salary inputs affect payroll timelines",
      "Technical: Integration challenges with old or incompatible HRMS platforms",
      "Communication: Lack of timely information on employee status changes or exits",
      "Industry-wide: Unclear mandates or delayed government notifications impact compliance",
      "Organizational: Inadequate handover from new joiners or terminations causes errors",
      "Role-specific: Difficulty in tracking and correcting historical payroll discrepancies",
    ],
    keyResponsibilities: [
      "Process monthly payroll as per statutory and internal guidelines",
      "Implement and monitor compliance with labor laws and statutory remittances",
      "Validate attendance, leave, and overtime data before payroll runs",
      "Reconcile payroll outputs and resolve discrepancies with relevant teams",
      "Maintain confidential employee and payroll records for audits",
      "Coordinate with finance for payouts and year-end tax processing",
      "Guide HR and employees on payroll policies, deductions, and statutory benefits",
      "Prepare and submit statutory returns and compliance reports",
      "Update HRMS and payroll software for regulatory or organizational changes",
      "Participate in audits and respond to statutory body queries",
      "Manage full and final settlements for exiting employees",
      "Optimize existing payroll processes for better efficiency and accuracy",
    ],
  },
};

async function seedhrOpsPersona() {
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
          name: hrOpsPersona.name,
          personaRole: "HR Ops / Payroll Manager",
          about: hrOpsPersona.metadata.about,
          traits: hrOpsPersona.metadata.traits.join("; "),
          painPoints: hrOpsPersona.metadata.painPoints.join("; "),
          coreExpertise: hrOpsPersona.metadata.coreExpertise.join("; "),
          communicationStyle: hrOpsPersona.metadata.communicationStyle,
          keyResponsibility:
            hrOpsPersona.metadata.keyResponsibilities.join("; "),
          description: hrOpsPersona.description, // Keep original description for backward compatibility
          avatarUrl: hrOpsPersona.avatarUrl,
          webhookUrl: encrypt(
            hrOpsPersona.webhookUrl,
            process.env.ENCRYPTION_KEY
          ),
          isActive: true,
        },
      });

      console.log(
        `✅ Updated HR Ops / Payroll Manager Persona: ${updatedPersona.name}`
      );
      return updatedPersona;
    }

    // Check for encryption key
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("ENCRYPTION_KEY environment variable is required");
    }

    // Create CFO persona with encrypted webhook URL
    const cfoWithEncryptedWebhook = {
      name: hrOpsPersona.name,
      personaRole: "HR Ops / Payroll Manager",
      about: hrOpsPersona.metadata.about,
      traits: hrOpsPersona.metadata.traits.join("; "),
      painPoints: hrOpsPersona.metadata.painPoints.join("; "),
      coreExpertise: hrOpsPersona.metadata.coreExpertise.join("; "),
      communicationStyle: hrOpsPersona.metadata.communicationStyle,
      keyResponsibility: hrOpsPersona.metadata.keyResponsibilities.join("; "),
      description: hrOpsPersona.description, // Keep original description for backward compatibility
      avatarUrl: hrOpsPersona.avatarUrl,
      webhookUrl: encrypt(hrOpsPersona.webhookUrl, encryptionKey),
      isActive: true,
    };

    // Insert CFO persona
    const createdPersona = await prisma.persona.create({
      data: cfoWithEncryptedWebhook,
    });

    console.log(`✅ Successfully created CFO persona: ${createdPersona.name}`);
    console.log(`📋 Persona ID: ${createdPersona.id}`);
    console.log(` Webhook URL: ${hrOpsPersona.webhookUrl}`);
    console.log(
      `📊 Metadata: ${JSON.stringify(hrOpsPersona.metadata, null, 2)}`
    );

    return createdPersona;
  } catch (error) {
    console.error("❌ Error seeding CFO persona:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder
seedhrOpsPersona()
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
