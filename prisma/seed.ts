import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "barry@semantica.co.za" },
    update: {},
    create: {
      email: "barry@semantica.co.za",
      name: "Barry Semantica",
      role: "admin",
      languages: ["en"],
      isVerified: true,
      reputation: {
        create: {
          ratingAvg: 5.0,
          ratingCount: 0,
          badges: ["admin"],
        },
      },
    },
  });

  // Create sellers
  const seller1 = await prisma.user.upsert({
    where: { email: "seller1@example.com" },
    update: {},
    create: {
      email: "seller1@example.com",
      name: "Alex Designer",
      role: "seller",
      headline: "Professional UI/UX Designer",
      bio: "Creating beautiful interfaces for 5+ years",
      location: "New York, USA",
      languages: ["en"],
      isVerified: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      reputation: {
        create: {
          ratingAvg: 4.9,
          ratingCount: 127,
          badges: ["top_rated", "verified"],
        },
      },
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "seller2@example.com" },
    update: {},
    create: {
      email: "seller2@example.com",
      name: "Sam Developer",
      role: "seller",
      headline: "Full-stack Developer",
      bio: "React, Next.js, Node.js expert",
      location: "San Francisco, USA",
      languages: ["en"],
      isVerified: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
      reputation: {
        create: {
          ratingAvg: 4.8,
          ratingCount: 89,
          badges: ["verified"],
        },
      },
    },
  });

  const seller3 = await prisma.user.upsert({
    where: { email: "seller3@example.com" },
    update: {},
    create: {
      email: "seller3@example.com",
      name: "Jordan Writer",
      role: "seller",
      headline: "Content Writer & Copywriter",
      bio: "SEO-optimized content that converts",
      location: "London, UK",
      languages: ["en"],
      isVerified: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
      reputation: {
        create: {
          ratingAvg: 4.7,
          ratingCount: 156,
          badges: ["top_rated"],
        },
      },
    },
  });

  const seller4 = await prisma.user.upsert({
    where: { email: "seller4@example.com" },
    update: {},
    create: {
      email: "seller4@example.com",
      name: "Taylor Designer",
      role: "seller",
      headline: "Logo & Brand Identity Designer",
      bio: "Creating memorable brands",
      location: "Los Angeles, USA",
      languages: ["en"],
      isVerified: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
      reputation: {
        create: {
          ratingAvg: 5.0,
          ratingCount: 45,
          badges: ["verified"],
        },
      },
    },
  });

  const seller5 = await prisma.user.upsert({
    where: { email: "seller5@example.com" },
    update: {},
    create: {
      email: "seller5@example.com",
      name: "Morgan Voice",
      role: "seller",
      headline: "Professional Voice Over Artist",
      bio: "Warm, professional voice for your projects",
      location: "Toronto, Canada",
      languages: ["en"],
      isVerified: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan",
      reputation: {
        create: {
          ratingAvg: 4.9,
          ratingCount: 203,
          badges: ["top_rated", "verified"],
        },
      },
    },
  });

  const seller6 = await prisma.user.upsert({
    where: { email: "seller6@example.com" },
    update: {},
    create: {
      email: "seller6@example.com",
      name: "Casey Editor",
      role: "seller",
      headline: "Video Editor & Motion Graphics",
      bio: "YouTube, TikTok, Instagram content",
      location: "Austin, USA",
      languages: ["en"],
      isVerified: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
      reputation: {
        create: {
          ratingAvg: 4.6,
          ratingCount: 78,
          badges: ["verified"],
        },
      },
    },
  });

  // Create buyers
  const buyer1 = await prisma.user.upsert({
    where: { email: "buyer1@example.com" },
    update: {},
    create: {
      email: "buyer1@example.com",
      name: "Buyer One",
      role: "buyer",
      languages: ["en"],
      isVerified: true,
      reputation: {
        create: {
          ratingAvg: 0,
          ratingCount: 0,
          badges: [],
        },
      },
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: "buyer2@example.com" },
    update: {},
    create: {
      email: "buyer2@example.com",
      name: "Buyer Two",
      role: "buyer",
      languages: ["en"],
      isVerified: true,
      reputation: {
        create: {
          ratingAvg: 0,
          ratingCount: 0,
          badges: [],
        },
      },
    },
  });

  // Create services with packages
  const service1 = await prisma.service.create({
    data: {
      sellerId: seller1.id,
      title: "Clean landing page with AI-ready components",
      slug: "clean-landing-page-ai-components-a1b2",
      description: "Modern, responsive landing page with AI-powered components. Fully customizable and mobile-optimized.",
      category: "Web Design",
      tags: ["web", "landing-page", "responsive", "ai"],
      coverImage: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800",
        "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800",
      ],
      basePrice: 45000, // $450
      isActive: true,
      packages: {
        create: [
          {
            tier: "basic",
            priceMinor: 45000,
            deliveryDays: 5,
            revisions: 1,
            features: ["1 page design", "Mobile responsive", "Basic revisions"],
          },
          {
            tier: "standard",
            priceMinor: 75000,
            deliveryDays: 7,
            revisions: 3,
            features: ["3 page design", "Mobile responsive", "3 revisions", "SEO optimization"],
          },
          {
            tier: "premium",
            priceMinor: 120000,
            deliveryDays: 10,
            revisions: 5,
            features: ["5 page design", "Mobile responsive", "Unlimited revisions", "SEO optimization", "AI integration"],
          },
        ],
      },
    },
  });

  const service2 = await prisma.service.create({
    data: {
      sellerId: seller2.id,
      title: "Full-stack web application with Next.js",
      slug: "fullstack-nextjs-app-c3d4",
      description: "Complete web application built with Next.js, TypeScript, and PostgreSQL. Includes authentication, database, and deployment.",
      category: "Web Development",
      tags: ["web", "nextjs", "typescript", "fullstack"],
      coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
      gallery: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"],
      basePrice: 250000, // $2500
      isActive: true,
      packages: {
        create: [
          {
            tier: "basic",
            priceMinor: 250000,
            deliveryDays: 14,
            revisions: 2,
            features: ["Basic app", "Authentication", "Database setup"],
          },
          {
            tier: "standard",
            priceMinor: 400000,
            deliveryDays: 21,
            revisions: 4,
            features: ["Full app", "Authentication", "Database", "Admin panel", "API endpoints"],
          },
          {
            tier: "premium",
            priceMinor: 600000,
            deliveryDays: 30,
            revisions: 6,
            features: ["Full app", "Everything in standard", "Deployment", "Documentation", "1 month support"],
          },
        ],
      },
    },
  });

  const service3 = await prisma.service.create({
    data: {
      sellerId: seller3.id,
      title: "SEO-optimized blog content package",
      slug: "seo-blog-content-package-e5f6",
      description: "10 high-quality, SEO-optimized blog posts (1000 words each) with keyword research and optimization.",
      category: "Content Writing",
      tags: ["content", "seo", "blog", "writing"],
      coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
      gallery: ["https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"],
      basePrice: 50000, // $500
      isActive: true,
      packages: {
        create: [
          {
            tier: "basic",
            priceMinor: 50000,
            deliveryDays: 7,
            revisions: 2,
            features: ["5 blog posts", "Basic SEO", "Keyword research"],
          },
          {
            tier: "standard",
            priceMinor: 90000,
            deliveryDays: 10,
            revisions: 3,
            features: ["10 blog posts", "Advanced SEO", "Keyword research", "Meta descriptions"],
          },
          {
            tier: "premium",
            priceMinor: 150000,
            deliveryDays: 14,
            revisions: 5,
            features: ["15 blog posts", "Everything in standard", "Content calendar", "Social media snippets"],
          },
        ],
      },
    },
  });

  const service4 = await prisma.service.create({
    data: {
      sellerId: seller4.id,
      title: "Professional logo design",
      slug: "professional-logo-design-g7h8",
      description: "Custom logo design with multiple concepts, color variations, and brand guidelines.",
      category: "Logo Design",
      tags: ["logo", "branding", "design"],
      coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      gallery: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"],
      basePrice: 15000, // $150
      isActive: true,
      packages: {
        create: [
          {
            tier: "basic",
            priceMinor: 15000,
            deliveryDays: 3,
            revisions: 2,
            features: ["1 logo concept", "2 revisions", "PNG files"],
          },
          {
            tier: "standard",
            priceMinor: 30000,
            deliveryDays: 5,
            revisions: 4,
            features: ["3 logo concepts", "4 revisions", "Vector files", "Color variations"],
          },
          {
            tier: "premium",
            priceMinor: 50000,
            deliveryDays: 7,
            revisions: 6,
            features: ["5 logo concepts", "Unlimited revisions", "All file formats", "Brand guidelines", "Business card design"],
          },
        ],
      },
    },
  });

  const service5 = await prisma.service.create({
    data: {
      sellerId: seller5.id,
      title: "Professional voice over narration",
      slug: "voice-over-narration-i9j0",
      description: "High-quality voice over for videos, commercials, or audiobooks. Warm, professional delivery.",
      category: "Voice Over",
      tags: ["voice", "narration", "audio"],
      coverImage: "https://images.unsplash.com/photo-1590602847861-f357a0da47a6?w=800",
      gallery: ["https://images.unsplash.com/photo-1590602847861-f357a0da47a6?w=800"],
      basePrice: 10000, // $100
      isActive: true,
      packages: {
        create: [
          {
            tier: "basic",
            priceMinor: 10000,
            deliveryDays: 2,
            revisions: 1,
            features: ["Up to 60 seconds", "1 revision", "MP3 file"],
          },
          {
            tier: "standard",
            priceMinor: 18000,
            deliveryDays: 3,
            revisions: 2,
            features: ["Up to 2 minutes", "2 revisions", "MP3 + WAV files"],
          },
          {
            tier: "premium",
            priceMinor: 30000,
            deliveryDays: 5,
            revisions: 4,
            features: ["Up to 5 minutes", "4 revisions", "All formats", "Music bed option"],
          },
        ],
      },
    },
  });

  const service6 = await prisma.service.create({
    data: {
      sellerId: seller6.id,
      title: "Video editing for social media",
      slug: "video-editing-social-media-k1l2",
      description: "Professional video editing for YouTube, TikTok, Instagram. Includes transitions, effects, and color grading.",
      category: "Video Editing",
      tags: ["video", "editing", "social-media"],
      coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
      gallery: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800"],
      basePrice: 7500, // $75
      isActive: true,
      packages: {
        create: [
          {
            tier: "basic",
            priceMinor: 7500,
            deliveryDays: 2,
            revisions: 1,
            features: ["Up to 1 minute", "Basic cuts", "1 revision"],
          },
          {
            tier: "standard",
            priceMinor: 15000,
            deliveryDays: 4,
            revisions: 2,
            features: ["Up to 3 minutes", "Transitions", "Color grading", "2 revisions"],
          },
          {
            tier: "premium",
            priceMinor: 30000,
            deliveryDays: 7,
            revisions: 4,
            features: ["Up to 10 minutes", "Everything in standard", "Motion graphics", "Music & SFX"],
          },
        ],
      },
    },
  });

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      sellerId: seller1.id,
      serviceId: service1.id,
      packageTier: "standard",
      status: "in_progress",
      amountMinor: 75000,
      currency: "USD",
      requirements: {
        colorScheme: "Blue and white",
        targetAudience: "Tech startups",
      },
      attachments: [],
      paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  const order2 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      sellerId: seller4.id,
      serviceId: service4.id,
      packageTier: "premium",
      status: "completed",
      amountMinor: 50000,
      currency: "USD",
      requirements: {
        companyName: "TechCo",
        industry: "Technology",
      },
      attachments: [],
      paidAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      review: {
        create: {
          authorId: buyer1.id,
          targetUserId: seller4.id,
          rating: 5,
          body: "Amazing work! Exactly what I needed.",
        },
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      sellerId: seller2.id,
      serviceId: service2.id,
      packageTier: "basic",
      status: "awaiting_payment",
      amountMinor: 250000,
      currency: "USD",
      requirements: {
        features: ["User authentication", "CRUD operations"],
      },
      attachments: [],
    },
  });

  const order4 = await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      sellerId: seller5.id,
      serviceId: service5.id,
      packageTier: "standard",
      status: "delivered",
      amountMinor: 18000,
      currency: "USD",
      requirements: {
        script: "Welcome to our platform...",
        tone: "Warm and professional",
      },
      attachments: [],
      paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deliveries: {
        create: {
          message: "Here's your voice over recording. Let me know if you need any changes!",
          files: ["https://example.com/voice-over.mp3"],
          status: "submitted",
        },
      },
    },
  });

  console.log("Seed completed successfully!");
  console.log(`Created:`);
  console.log(`- 1 admin user`);
  console.log(`- 6 sellers`);
  console.log(`- 2 buyers`);
  console.log(`- 6 services with packages`);
  console.log(`- 4 sample orders`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

