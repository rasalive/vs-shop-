import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Vortex Database Seed...");

  // Purge existing data
  await prisma.auditLog.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.productFeature.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("VortexAdmin2026!", 10);
  const customerPassword = await bcrypt.hash("VortexCustomer2026!", 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@vortex.io",
      name: "Vortex Administrator",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      walletBalance: 250.0,
    },
  });

  const support = await prisma.user.create({
    data: {
      email: "support@vortex.io",
      name: "Senior Support Desk",
      password: adminPassword,
      role: "SUPPORT",
      status: "ACTIVE",
      walletBalance: 50.0,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@vortex.io",
      name: "Marcus Miller",
      password: customerPassword,
      role: "CUSTOMER",
      status: "ACTIVE",
      phone: "+91 9876543210",
      walletBalance: 45.0,
    },
  });

  console.log("✓ Seed Users created.");

  // Categories
  const catSteamKeys = await prisma.category.create({
    data: {
      name: "Steam & Diamond Keys",
      slug: "gaming-keys",
      description: "Verified Steam AAA & Random Diamond keys with 100% activation.",
      icon: "💎",
    },
  });

  const catAccounts = await prisma.category.create({
    data: {
      name: "Modded Accounts",
      slug: "accounts",
      description: "Pre-leveled, high-rank, full mail access gaming accounts.",
      icon: "🎮",
    },
  });

  const catSoftware = await prisma.category.create({
    data: {
      name: "Software & AI Subscriptions",
      slug: "software-tools",
      description: "ChatGPT Plus, Canva Pro, Developer Licenses, and Cloud access.",
      icon: "⚡",
    },
  });

  const catStreaming = await prisma.category.create({
    data: {
      name: "Streaming & Entertainment",
      slug: "streaming-services",
      description: "4K UHD Lifetime access to premium video and music streaming platforms.",
      icon: "🍿",
    },
  });

  console.log("✓ Categories created.");

  // Products
  const productsData = [
    {
      title: "Netflix (LIFETIME UHD 4K)",
      slug: "netflix-lifetime-uhd",
      description: "Ultra HD 4K personal profile with lifetime renewal guarantee. Stream without interruptions across all TV, mobile, and desktop devices.",
      instructions: "Login with the provided email and password. Use Profile 1 with PIN 4422.",
      categoryId: catStreaming.id,
      price: 19.99,
      comparePrice: 49.99,
      coverImage: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80",
      badge: "LIFETIME",
      deliveryType: "INSTANT_KEYS",
      deliveryTime: "Instant (0-2m)",
      warrantyPeriod: "Lifetime Replacement",
      isFeatured: true,
      features: ["4K Ultra HD Streaming", "100% Replacement Warranty", "Works on Smart TV & Console", "No VPN Required"],
      inventory: [
        "EMAIL: netflix_vip_1@vortex-cloud.net | PASS: Stream4kFast! | PIN: 4422",
        "EMAIL: netflix_vip_2@vortex-cloud.net | PASS: Cinema4kAccess! | PIN: 8891",
        "EMAIL: netflix_vip_3@vortex-cloud.net | PASS: VortexStream77! | PIN: 1204",
      ],
    },
    {
      title: "GTA V Enhanced Modded Account [Rank 250 + $500M]",
      slug: "gta-v-enhanced-modded-account",
      description: "Ready-to-play Rockstar Social Club account with Rank 250, $500,000,000 in-game bank balance, unlocked research, and maximum vehicles.",
      instructions: "Full email access provided. Change email and password immediately after login.",
      categoryId: catAccounts.id,
      price: 24.99,
      comparePrice: 59.99,
      coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
      badge: "HOT",
      deliveryType: "INSTANT_KEYS",
      deliveryTime: "Instant (0-2m)",
      warrantyPeriod: "90 Days Warranty",
      isFeatured: true,
      features: ["$500,000,000 Clean Bank Balance", "Rank 250 Legit Stats", "Full Mail Changeable", "Safe Anti-Ban Guarantee"],
      inventory: [
        "LOGIN: gta_modded_alpha@gamer-mail.org | PASS: LosSantosRich2026! | MAIL_PASS: AlphaSafePass!",
        "LOGIN: gta_modded_bravo@gamer-mail.org | PASS: HeistMaster99! | MAIL_PASS: BravoSafePass!",
      ],
    },
    {
      title: "Steam Random Diamond Key [AAA Guaranteed]",
      slug: "steam-random-diamond-key",
      description: "Guaranteed Steam key valued between $29.99 and $69.99 on the official Steam Store. Games include Cyberpunk, Elden Ring, or Black Myth Wukong.",
      instructions: "Open Steam Client -> Games -> Activate a Product on Steam -> Paste code.",
      categoryId: catSteamKeys.id,
      price: 7.99,
      comparePrice: 19.99,
      coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
      badge: "DIAMOND",
      deliveryType: "INSTANT_KEYS",
      deliveryTime: "Instant (0-2m)",
      warrantyPeriod: "Lifetime Activation",
      isFeatured: true,
      features: ["Guaranteed $29-$69 Steam Value", "No Free/DLC Games", "Global Region Unlocked", "Instant Code Provisioning"],
      inventory: [
        "STEAM-DIAMOND-9941-K4XP-9921-ABCD",
        "STEAM-DIAMOND-8822-M7LP-4412-EFGH",
        "STEAM-DIAMOND-3319-Q1ZR-7733-IJKL",
        "STEAM-DIAMOND-5501-T9WB-2290-MNOP",
      ],
    },
    {
      title: "ChatGPT Plus & Canvas [GPT-4o 30 Days]",
      slug: "chatgpt-plus-30-days",
      description: "Official ChatGPT Plus seat with unlimited GPT-4o, Canvas, advanced data analysis, code interpreter, and DALL-E 3 image generation.",
      instructions: "Login with direct session credentials provided in your vault.",
      categoryId: catSoftware.id,
      price: 14.99,
      comparePrice: 20.00,
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      badge: "AI PRO",
      deliveryType: "INSTANT_KEYS",
      deliveryTime: "Instant (0-2m)",
      warrantyPeriod: "30 Days Renewable",
      isFeatured: true,
      features: ["Full GPT-4o & Canvas Access", "DALL-E 3 Image Generation", "Advanced Voice & Vision", "30 Days Renewable Warranty"],
      inventory: [
        "LOGIN: chatgpt_vip_user1@ai-vault.org | PASS: OpenAiPro2026!",
        "LOGIN: chatgpt_vip_user2@ai-vault.org | PASS: Model4oFast!",
      ],
    },
    {
      title: "Canva Pro [1 Year Full Access]",
      slug: "canva-pro-1-year",
      description: "Upgrade your design workflow with 1 full year of Canva Pro. Access 100M+ premium stock photos, 1-click background remover, and cloud storage.",
      instructions: "Click the invitation link or use team credentials to activate your 1-year Pro pass.",
      categoryId: catSoftware.id,
      price: 9.99,
      comparePrice: 29.99,
      coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
      badge: "EXCLUSIVE",
      deliveryType: "INSTANT_KEYS",
      deliveryTime: "Instant (0-2m)",
      warrantyPeriod: "1 Year Full",
      isFeatured: true,
      features: ["100M+ Premium Stock Elements", "1-Click Magic Background Remover", "1TB Secure Cloud Storage", "Instant Activation Invite"],
      inventory: [
        "INVITE-URL: https://canva.com/brand/join?token=VTX_PRO_991823a",
        "INVITE-URL: https://canva.com/brand/join?token=VTX_PRO_774918b",
      ],
    },
  ];

  for (const item of productsData) {
    const product = await prisma.product.create({
      data: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        instructions: item.instructions,
        categoryId: item.categoryId,
        price: item.price,
        comparePrice: item.comparePrice,
        coverImage: item.coverImage,
        badge: item.badge,
        deliveryType: item.deliveryType,
        deliveryTime: item.deliveryTime,
        warrantyPeriod: item.warrantyPeriod,
        isFeatured: item.isFeatured,
        features: {
          create: item.features.map((f) => ({ feature: f })),
        },
        inventory: {
          create: item.inventory.map((content) => ({
            content,
            status: "AVAILABLE",
          })),
        },
      },
    });

    console.log(`✓ Product created: "${product.title}"`);
  }

  // Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountPercent: 10,
        maxUses: 1000,
        isActive: true,
      },
      {
        code: "GAMER20",
        discountPercent: 20,
        maxUses: 500,
        isActive: true,
      },
      {
        code: "VIP50",
        discountPercent: 50,
        maxUses: 100,
        isActive: true,
      },
    ],
  });

  console.log("✓ Coupons seeded.");
  console.log("🚀 Vortex Database Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
