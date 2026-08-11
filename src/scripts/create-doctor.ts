import { input, password } from "@inquirer/prompts";
import { RegisterDoctorSchema } from "@/types/doctor";
import { DoctorService } from "@/services/doctor.service";
import UniqueException from "@/exceptions/http/UniqueException";
import prisma from "@/lib/db";

async function promptForDoctorData() {
  console.log("🩺 Create a new doctor account\n");

  const email = await input({
    message: "Email:",
    validate: (value) => (value.includes("@") ? true : "Enter a valid email"),
  });

  const doctorPassword = await password({
    message: "Password:",
    mask: "*",
    validate: (value) =>
      value.length >= 8 ? true : "Password must be at least 8 characters",
  });

  const full_name = await input({
    message: "Full name:",
    validate: (value) => (value.trim().length >= 3 ? true : "Too short"),
  });

  const phone_number = await input({ message: "Phone number:" });

  const address = await input({
    message: "Address (leave blank for none):",
  });

  const clinic_address = await input({
    message: "Clinic address (leave blank for none):",
  });

  return {
    email,
    password_hash: doctorPassword,
    full_name,
    phone_number,
    address: address.trim() === "" ? null : address,
    clinic_address: clinic_address.trim() === "" ? null : clinic_address,
  };
}

async function main() {
  const rawData = await promptForDoctorData();

  const parsedData = RegisterDoctorSchema.safeParse(rawData);

  if (!parsedData.success) {
    console.error("\n❌ Validation failed:");
    for (const issue of parsedData.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  try {
    const result = await DoctorService.createDoctor(parsedData.data);
    console.log("\n✅ Doctor created successfully:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    if (error instanceof UniqueException) {
      console.error(`\n❌ ${error.message}`);
    } else {
      console.error("\n❌ Failed to create doctor:", error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
