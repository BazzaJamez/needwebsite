import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServiceCard } from "@/components/shared/ServiceCard";

// Mock the analytics function
vi.mock("@/lib/client/search-analytics", () => ({
  trackResultClick: vi.fn(),
}));

describe("ServiceCard", () => {
  const mockProps = {
    id: "service-123",
    slug: "test-service-abc",
    title: "Professional Web Design",
    coverImage: "https://example.com/image.jpg",
    seller: {
      name: "John Doe",
      avatarUrl: "https://example.com/avatar.jpg",
      rating: 4.9,
    },
    category: "Web Design",
    deliveryDays: 5,
    priceMinor: 50000, // $500
    currency: "USD",
  };

  it("renders with all props", () => {
    render(<ServiceCard {...mockProps} />);

    expect(screen.getByText("Professional Web Design")).toBeInTheDocument();
    expect(screen.getByText(/by John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/★ 4.9/)).toBeInTheDocument();
    expect(screen.getByText("Web Design")).toBeInTheDocument();
    expect(screen.getByText("5 days")).toBeInTheDocument();
    expect(screen.getByText("$500")).toBeInTheDocument();
  });

  it("renders without optional props", () => {
    const minimalProps = {
      id: "service-456",
      slug: "minimal-service",
      title: "Basic Service",
      seller: {
        name: "Jane Smith",
      },
      priceMinor: 10000,
    };

    render(<ServiceCard {...minimalProps} />);

    expect(screen.getByText("Basic Service")).toBeInTheDocument();
    expect(screen.getByText(/by Jane Smith/)).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
    expect(screen.queryByText("days")).not.toBeInTheDocument();
  });

  it("renders placeholder when no cover image", () => {
    const propsWithoutImage = {
      ...mockProps,
      coverImage: null,
    };

    render(<ServiceCard {...propsWithoutImage} />);

    expect(screen.getByText("No image")).toBeInTheDocument();
  });

  it("formats price correctly", () => {
    render(<ServiceCard {...mockProps} priceMinor={75000} />);
    expect(screen.getByText("$750")).toBeInTheDocument();
  });

  it("renders link with correct href", () => {
    render(<ServiceCard {...mockProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/services/test-service-abc");
  });

  it("handles singular delivery day", () => {
    render(<ServiceCard {...mockProps} deliveryDays={1} />);
    expect(screen.getByText("1 day")).toBeInTheDocument();
  });

  it("handles plural delivery days", () => {
    render(<ServiceCard {...mockProps} deliveryDays={7} />);
    expect(screen.getByText("7 days")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ServiceCard {...mockProps} className="custom-class" />
    );
    const article = container.querySelector("article");
    expect(article).toHaveClass("custom-class");
  });
});

