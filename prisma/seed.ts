import { prisma } from "../lib/db";

async function main() {
  await prisma.vendor.createMany({
    data: [
      {
        vendor_name: "Seoul Logistics Co.",
        biz_reg_no: "1234567890",
        vendor_type: "logistics",
        expected_annual_spend: 120_000_000,
        advance_payment: true,
        pii_access_level: "limited",
        public_procurement_related: false,
        notes: "Demo vendor for logistics."
      },
      {
        vendor_name: "Hanbit IT Services",
        biz_reg_no: "0987654321",
        vendor_type: "IT",
        expected_annual_spend: 250_000_000,
        advance_payment: false,
        pii_access_level: "high",
        public_procurement_related: true,
        notes: "Demo vendor for IT services."
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
