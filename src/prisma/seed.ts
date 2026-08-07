import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const main = async () => {
  // ---------- Wipe all tables (atomic) ----------
  // Ordered leaf -> root so this works regardless of cascade rules.
  await prisma.$transaction([
    prisma.websiteSeo.deleteMany(),
    prisma.websiteContentLocal.deleteMany(),
    prisma.websiteContent.deleteMany(),
    prisma.image.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.session.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.secretary.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.role.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.passwordReset.deleteMany(),
    prisma.doctor.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ---------- Doctor users (nested create -> doctor row comes free) ----------
  const doctorSeed = [
    {
      email: "doctor1@example.com",
      full_name: "Dr. John Doe",
      phone_number: "+96170000001",
      address: "Beirut, Lebanon",
      clinic_address: "Hamra St, Beirut",
    },
    {
      email: "doctor2@example.com",
      full_name: "Dr. Jane Smith",
      phone_number: "+96170000002",
      address: "Baabda, Lebanon",
      clinic_address: "Main Rd, Baabda",
    },
    {
      email: "doctor3@example.com",
      full_name: "Dr. Karim Fares",
      phone_number: "+96170000003",
      address: "Jounieh, Lebanon",
      clinic_address: "Sea Rd, Jounieh",
    },
  ];

  const doctorUsers = await Promise.all(
    doctorSeed.map(({ clinic_address, ...userData }) =>
      prisma.user.create({
        data: {
          role: "DOCTOR",
          password_hash: bcrypt.hashSync("0214", 10),
          is_email_verified: true,
          ...userData,
          doctor: {
            create: { clinic_address },
          },
        },
        include: { doctor: true },
      }),
    ),
  );

  const doctors = doctorUsers.map((u) => u.doctor!);

  // ---------- Permissions ----------
  const permissions = await Promise.all(
    [
      { code: "MANAGE_PATIENTS", description: "Create, edit, and view patients" },
      { code: "MANAGE_SESSIONS", description: "Create, edit, and view sessions" },
      { code: "MANAGE_PAYMENTS", description: "Create, edit, and view payments" },
    ].map((data) => prisma.permission.create({ data })),
  );

  // ---------- Roles (nested create -> role_permission rows come free) ----------
  const roleSeed = [
    { doctor_id: doctors[0].id, name: "Front Desk", permission_id: permissions[0].id },
    { doctor_id: doctors[1].id, name: "Office Manager", permission_id: permissions[1].id },
    { doctor_id: doctors[2].id, name: "Billing Assistant", permission_id: permissions[2].id },
  ];

  const roles = await Promise.all(
    roleSeed.map(({ doctor_id, name, permission_id }) =>
      prisma.role.create({
        data: {
          doctor_id,
          name,
          role_permissions: {
            create: { permission_id },
          },
        },
      }),
    ),
  );

  // ---------- Secretary users (nested create -> secretary row comes free) ----------
  const secretarySeed = [
    {
      email: "secretary1@example.com",
      full_name: "Maya Khalil",
      phone_number: "+96170000004",
      address: "Beirut, Lebanon",
      doctor_id: doctors[0].id,
      role_id: roles[0].id,
      hired_at: new Date("2024-01-15"),
    },
    {
      email: "secretary2@example.com",
      full_name: "Rana Aoun",
      phone_number: "+96170000005",
      address: "Baabda, Lebanon",
      doctor_id: doctors[1].id,
      role_id: roles[1].id,
      hired_at: new Date("2024-03-01"),
    },
    {
      email: "secretary3@example.com",
      full_name: "Lea Nassar",
      phone_number: "+96170000006",
      address: "Jounieh, Lebanon",
      doctor_id: doctors[2].id,
      role_id: roles[2].id,
      hired_at: new Date("2024-06-10"),
    },
  ];

  const secretaryUsers = await Promise.all(
    secretarySeed.map(({ doctor_id, role_id, hired_at, ...userData }) =>
      prisma.user.create({
        data: {
          role: "SECRETARY",
          password_hash: bcrypt.hashSync("0214", 10),
          is_email_verified: true,
          ...userData,
          secretary: {
            create: { doctor_id, role_id, hired_at },
          },
        },
        include: { secretary: true },
      }),
    ),
  );

  // ---------- Password resets ----------
  await Promise.all(
    [...doctorUsers, ...secretaryUsers].slice(0, 3).map((user) =>
      prisma.passwordReset.create({
        data: {
          user_id: user.id,
          otp_code_hash: bcrypt.hashSync("123456", 10),
          is_verified: false,
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
        },
      }),
    ),
  );

  // ---------- Patients ----------
  const patients = await Promise.all(
    [
      {
        doctor_id: doctors[0].id,
        full_name: "Ahmad Saleh",
        phone_number: "+96176000001",
        birth_date: new Date("1990-05-12"),
        gender: "MALE" as const,
        address: "Hamra, Beirut",
        medical_history: "None",
        alergies: "Penicillin",
      },
      {
        doctor_id: doctors[1].id,
        full_name: "Nour Haddad",
        phone_number: "+96176000002",
        birth_date: new Date("1985-11-03"),
        gender: "FEMALE" as const,
        address: "Baabda",
        medical_history: "Diabetes type 2",
        alergies: "None",
      },
      {
        doctor_id: doctors[2].id,
        full_name: "Elie Chidiac",
        phone_number: "+96176000003",
        birth_date: new Date("2000-02-20"),
        gender: "MALE" as const,
        address: "Jounieh",
        medical_history: "None",
        alergies: "None",
      },
    ].map((data) => prisma.patient.create({ data })),
  );

  // ---------- Sessions (nested create -> payment rows come free) ----------
  const sessionSeed = [
    {
      patient_id: patients[0].id,
      doctor_id: doctors[0].id,
      session_name: "Root Canal",
      session_start_date: new Date("2026-07-01T09:00:00Z"),
      session_end_date: new Date("2026-07-01T10:00:00Z"),
      total_amount: 300,
      payment_status: "COMPLETED" as const,
      status: "COMPLETED" as const,
      diagnosis: "Pulpitis",
      tooth_numbers: "14",
      description: "Root canal treatment on upper premolar",
      payment: { amount: 300, payment_date: new Date("2026-07-01"), notes: "Paid in full" },
    },
    {
      patient_id: patients[1].id,
      doctor_id: doctors[1].id,
      session_name: "Cleaning",
      session_start_date: new Date("2026-07-05T11:00:00Z"),
      session_end_date: new Date("2026-07-05T11:30:00Z"),
      total_amount: 80,
      payment_status: "SCHEDULED" as const,
      status: "UNCOMPLETED" as const,
      diagnosis: "Plaque buildup",
      description: "Routine cleaning",
      payment: { amount: 40, payment_date: new Date("2026-07-05"), notes: "Partial payment, deposit" },
    },
    {
      patient_id: patients[2].id,
      doctor_id: doctors[2].id,
      session_name: "Extraction",
      session_start_date: new Date("2026-07-10T14:00:00Z"),
      session_end_date: new Date("2026-07-10T14:45:00Z"),
      total_amount: 150,
      payment_status: "INPROGRESS" as const,
      status: "UNCOMPLETED" as const,
      diagnosis: "Impacted wisdom tooth",
      tooth_numbers: "38",
      description: "Surgical extraction",
      payment: { amount: 150, payment_date: new Date("2026-07-10"), notes: "Paid via card" },
    },
  ];

  const sessions = await Promise.all(
    sessionSeed.map(({ payment, ...data }) =>
      prisma.session.create({
        data: {
          ...data,
          payments: { create: payment },
        },
      }),
    ),
  );

  // ---------- Images ----------
  await Promise.all([
    prisma.image.create({
      data: {
        owner_type: "PATIENT",
        owner_id: patients[0].id,
        title: "Initial X-Ray",
        url: "https://example.com/images/patient1-xray.jpg",
      },
    }),
    prisma.image.create({
      data: {
        owner_type: "SESSION",
        owner_id: sessions[0].id,
        title: "Post Root Canal X-Ray",
        url: "https://example.com/images/session1-xray.jpg",
      },
    }),
    prisma.image.create({
      data: {
        owner_type: "SESSION",
        owner_id: sessions[2].id,
        title: "Extraction Before Photo",
        url: "https://example.com/images/session3-before.jpg",
      },
    }),
  ]);

  // ---------- Website content (nested create -> locals, seo come free) ----------
  const websiteContentSeed = [
    {
      doctor_id: doctors[0].id,
      name: "Hero Section",
      type: "hero",
      attrs: { headline: "Welcome to our clinic" },
      position: 1,
      local: {
        language: "en",
        title: "Welcome",
        attrs: { subtitle: "Best dental care" },
        seo: {
          title: "Best Dental Clinic in Beirut",
          description: "Top-rated dental care in Beirut",
          keywords: "dentist, beirut, dental clinic",
        },
      },
    },
    {
      doctor_id: doctors[1].id,
      name: "About Section",
      type: "about",
      attrs: { bio: "20 years of experience" },
      position: 2,
      local: {
        language: "en",
        title: "About Us",
        attrs: { subtitle: "Meet the doctor" },
        seo: {
          title: "About Our Doctors",
          description: "Learn more about our experienced team",
          keywords: "dentist, about, team",
        },
      },
    },
    {
      doctor_id: doctors[2].id,
      name: "Contact Section",
      type: "contact",
      attrs: { phone: "+96170000003" },
      position: 3,
      local: {
        language: "en",
        title: "Contact Us",
        attrs: { subtitle: "Get in touch" },
        seo: {
          title: "Contact Our Clinic",
          description: "Reach out to book an appointment",
          keywords: "dentist, contact, appointment",
        },
      },
    },
  ];

  await Promise.all(
    websiteContentSeed.map(({ local, ...data }) =>
      prisma.websiteContent.create({
        data: {
          ...data,
          locals: {
            create: {
              language: local.language,
              title: local.title,
              attrs: local.attrs,
              seo: { create: local.seo },
            },
          },
        },
      }),
    ),
  );
};

main()
  .then(() => {
    console.log("Seeded successfully");
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });