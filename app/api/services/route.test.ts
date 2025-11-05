import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/services/route";
import { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";

// Mock dependencies
vi.mock("@/lib/server/auth", () => ({
  requireRole: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
  db: {
    service: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/analytics/track", () => ({
  trackServer: vi.fn(),
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "test-service-id-123456"),
}));

import { requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { trackServer } from "@/lib/analytics/track";

describe("POST /api/services", () => {
  const mockSeller = {
    id: "seller-123",
    email: "seller@example.com",
    name: "Test Seller",
    role: "seller" as const,
  };

  const validServiceData = {
    title: "Professional Logo Design",
    category: "Design",
    description: "I will create a professional logo for your brand",
    tags: ["logo", "branding", "design"],
    gallery: [],
    packages: [
      {
        tier: "basic" as const,
        priceMinor: 5000, // $50.00 in cents
        deliveryDays: 3,
        revisions: 0,
        features: ["1 logo concept", "Standard file formats"],
      },
      {
        tier: "standard" as const,
        priceMinor: 10000, // $100.00 in cents
        deliveryDays: 5,
        revisions: 1,
        features: ["2 logo concepts", "All file formats", "1 revision"],
      },
      {
        tier: "premium" as const,
        priceMinor: 20000, // $200.00 in cents
        deliveryDays: 7,
        revisions: 2,
        features: ["3 logo concepts", "All file formats", "2 revisions", "Source files"],
      },
    ],
    isActive: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRole).mockResolvedValue(mockSeller);
    vi.mocked(db.service.findUnique).mockResolvedValue(null); // No existing slug
  });

  it("should create a Service with 3 Packages correctly", async () => {
    const mockCreatedService = {
      id: "test-service-id-123456",
      sellerId: mockSeller.id,
      title: validServiceData.title,
      slug: "professional-logo-design-test",
      description: validServiceData.description,
      category: validServiceData.category,
      tags: validServiceData.tags,
      gallery: validServiceData.gallery,
      isActive: validServiceData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      packages: validServiceData.packages.map((pkg, index) => ({
        id: `package-${index}`,
        serviceId: "test-service-id-123456",
        tier: pkg.tier,
        priceMinor: pkg.priceMinor,
        deliveryDays: pkg.deliveryDays,
        revisions: pkg.revisions,
        features: pkg.features,
        addons: null,
      })),
    };

    vi.mocked(db.service.create).mockResolvedValue(mockCreatedService);

    const request = new NextRequest("http://localhost:3000/api/services", {
      method: "POST",
      body: JSON.stringify(validServiceData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("slug");
    expect(data.id).toBe("test-service-id-123456");
    expect(data.slug).toContain("professional-logo-design");

    // Verify database calls
    expect(requireRole).toHaveBeenCalledWith("seller");
    expect(db.service.findUnique).toHaveBeenCalled();
    expect(db.service.create).toHaveBeenCalledWith({
      data: {
        id: "test-service-id-123456",
        sellerId: mockSeller.id,
        title: validServiceData.title,
        slug: expect.stringContaining("professional-logo-design"),
        description: validServiceData.description,
        category: validServiceData.category,
        tags: validServiceData.tags,
        gallery: validServiceData.gallery,
        isActive: validServiceData.isActive,
        packages: {
          create: validServiceData.packages.map((pkg) => ({
            tier: pkg.tier,
            priceMinor: pkg.priceMinor,
            deliveryDays: pkg.deliveryDays,
            revisions: pkg.revisions,
            features: pkg.features,
          })),
        },
      },
      include: {
        packages: true,
      },
    });

    // Verify analytics tracking
    expect(trackServer).toHaveBeenCalledWith("service_created", {
      actorId: mockSeller.id,
      serviceId: "test-service-id-123456",
      slug: expect.stringContaining("professional-logo-design"),
      isActive: false,
    });
  });

  it("should validate that exactly 3 packages are created", async () => {
    const mockCreatedService = {
      id: "test-service-id-123456",
      sellerId: mockSeller.id,
      title: validServiceData.title,
      slug: "professional-logo-design-test",
      description: validServiceData.description,
      category: validServiceData.category,
      tags: validServiceData.tags,
      gallery: validServiceData.gallery,
      isActive: validServiceData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      packages: validServiceData.packages.map((pkg, index) => ({
        id: `package-${index}`,
        serviceId: "test-service-id-123456",
        tier: pkg.tier,
        priceMinor: pkg.priceMinor,
        deliveryDays: pkg.deliveryDays,
        revisions: pkg.revisions,
        features: pkg.features,
        addons: null,
      })),
    };

    vi.mocked(db.service.create).mockResolvedValue(mockCreatedService);

    const request = new NextRequest("http://localhost:3000/api/services", {
      method: "POST",
      body: JSON.stringify(validServiceData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await POST(request);

    // Verify packages array has exactly 3 items
    const createCall = vi.mocked(db.service.create).mock.calls[0][0];
    expect(createCall.data.packages.create).toHaveLength(3);

    // Verify all three tiers are present
    const tiers = createCall.data.packages.create.map((pkg: any) => pkg.tier);
    expect(tiers).toContain("basic");
    expect(tiers).toContain("standard");
    expect(tiers).toContain("premium");
  });

  it("should validate package schema fields", async () => {
    const mockCreatedService = {
      id: "test-service-id-123456",
      sellerId: mockSeller.id,
      title: validServiceData.title,
      slug: "professional-logo-design-test",
      description: validServiceData.description,
      category: validServiceData.category,
      tags: validServiceData.tags,
      gallery: validServiceData.gallery,
      isActive: validServiceData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      packages: validServiceData.packages.map((pkg, index) => ({
        id: `package-${index}`,
        serviceId: "test-service-id-123456",
        tier: pkg.tier,
        priceMinor: pkg.priceMinor,
        deliveryDays: pkg.deliveryDays,
        revisions: pkg.revisions,
        features: pkg.features,
        addons: null,
      })),
    };

    vi.mocked(db.service.create).mockResolvedValue(mockCreatedService);

    const request = new NextRequest("http://localhost:3000/api/services", {
      method: "POST",
      body: JSON.stringify(validServiceData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await POST(request);

    // Verify each package has required fields per schema
    const createCall = vi.mocked(db.service.create).mock.calls[0][0];
    const packages = createCall.data.packages.create;

    packages.forEach((pkg: any) => {
      expect(pkg).toHaveProperty("tier");
      expect(["basic", "standard", "premium"]).toContain(pkg.tier);
      expect(pkg).toHaveProperty("priceMinor");
      expect(typeof pkg.priceMinor).toBe("number");
      expect(pkg.priceMinor).toBeGreaterThanOrEqual(0);
      expect(pkg).toHaveProperty("deliveryDays");
      expect(typeof pkg.deliveryDays).toBe("number");
      expect(pkg.deliveryDays).toBeGreaterThan(0);
      expect(pkg).toHaveProperty("revisions");
      expect(typeof pkg.revisions).toBe("number");
      expect(pkg.revisions).toBeGreaterThanOrEqual(0);
      expect(pkg).toHaveProperty("features");
      expect(Array.isArray(pkg.features)).toBe(true);
      expect(pkg.features.length).toBeGreaterThan(0);
    });
  });

  it("should reject request from non-seller role", async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error("Forbidden: Requires seller role"));

    const request = new NextRequest("http://localhost:3000/api/services", {
      method: "POST",
      body: JSON.stringify(validServiceData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Only sellers can create services");
    expect(db.service.create).not.toHaveBeenCalled();
  });

  it("should reject request with invalid data (missing packages)", async () => {
    const invalidData = {
      title: "Test Service",
      category: "Design",
      description: "Test description",
      packages: [], // Invalid: must have exactly 3 packages
    };

    const request = new NextRequest("http://localhost:3000/api/services", {
      method: "POST",
      body: JSON.stringify(invalidData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(db.service.create).not.toHaveBeenCalled();
  });

  it("should reject request with invalid package tiers", async () => {
    const invalidData = {
      ...validServiceData,
      packages: [
        { ...validServiceData.packages[0], tier: "basic" },
        { ...validServiceData.packages[1], tier: "basic" }, // Duplicate tier
        { ...validServiceData.packages[2], tier: "standard" },
      ],
    };

    const request = new NextRequest("http://localhost:3000/api/services", {
      method: "POST",
      body: JSON.stringify(invalidData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(db.service.create).not.toHaveBeenCalled();
  });

  it("should validate Service schema fields", async () => {
    const mockCreatedService = {
      id: "test-service-id-123456",
      sellerId: mockSeller.id,
      title: validServiceData.title,
      slug: "professional-logo-design-test",
      description: validServiceData.description,
      category: validServiceData.category,
      tags: validServiceData.tags,
      gallery: validServiceData.gallery,
      isActive: validServiceData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      packages: [],
    };

    vi.mocked(db.service.create).mockResolvedValue(mockCreatedService);

    const request = new NextRequest("http://localhost:3000/api/services", {
      method: "POST",
      body: JSON.stringify(validServiceData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await POST(request);

    // Verify Service schema fields per domain-model.md
    const createCall = vi.mocked(db.service.create).mock.calls[0][0];
    const serviceData = createCall.data;

    expect(serviceData).toHaveProperty("id");
    expect(serviceData).toHaveProperty("sellerId");
    expect(serviceData.sellerId).toBe(mockSeller.id);
    expect(serviceData).toHaveProperty("title");
    expect(typeof serviceData.title).toBe("string");
    expect(serviceData.title.length).toBeGreaterThan(0);
    expect(serviceData).toHaveProperty("slug");
    expect(typeof serviceData.slug).toBe("string");
    expect(serviceData).toHaveProperty("description");
    expect(typeof serviceData.description).toBe("string");
    expect(serviceData).toHaveProperty("category");
    expect(typeof serviceData.category).toBe("string");
    expect(serviceData).toHaveProperty("tags");
    expect(Array.isArray(serviceData.tags)).toBe(true);
    expect(serviceData).toHaveProperty("isActive");
    expect(typeof serviceData.isActive).toBe("boolean");
  });

  it("should handle slug collision by retrying", async () => {
    // First call returns existing service (collision)
    vi.mocked(db.service.findUnique)
      .mockResolvedValueOnce({ id: "existing", slug: "professional-logo-design-test" } as any)
      .mockResolvedValueOnce(null); // Second call succeeds

    const mockCreatedService = {
      id: "test-service-id-123456",
      sellerId: mockSeller.id,
      title: validServiceData.title,
      slug: "professional-logo-design-test-2",
      description: validServiceData.description,
      category: validServiceData.category,
      tags: validServiceData.tags,
      gallery: validServiceData.gallery,
      isActive: validServiceData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      packages: [],
    };

    vi.mocked(db.service.create).mockResolvedValue(mockCreatedService);

    const request = new NextRequest("http://localhost:3000/api/services", {
      method: "POST",
      body: JSON.stringify(validServiceData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    // Should have checked for slug collision
    expect(db.service.findUnique).toHaveBeenCalledTimes(2);
  });
});

