import { describe, it, expect } from "vitest";
import {
  canTransition,
  getNextStatuses,
  validateTransition,
} from "@/lib/shared/order-state-machine";
import type { OrderStatusType } from "@/lib/shared/validation";

describe("Order State Machine", () => {
  describe("canTransition", () => {
    it("allows valid transitions", () => {
      expect(canTransition("draft", "awaiting_payment")).toBe(true);
      expect(canTransition("awaiting_payment", "in_escrow")).toBe(true);
      expect(canTransition("in_escrow", "in_progress")).toBe(true);
      expect(canTransition("in_progress", "delivered")).toBe(true);
      expect(canTransition("delivered", "completed")).toBe(true);
      expect(canTransition("delivered", "revision_requested")).toBe(true);
      expect(canTransition("revision_requested", "in_progress")).toBe(true);
      expect(canTransition("in_progress", "cancelled")).toBe(true);
      expect(canTransition("in_progress", "disputed")).toBe(true);
      expect(canTransition("disputed", "resolved_refund")).toBe(true);
      expect(canTransition("disputed", "resolved_partial")).toBe(true);
      expect(canTransition("disputed", "resolved_upheld")).toBe(true);
    });

    it("rejects invalid transitions", () => {
      expect(canTransition("draft", "completed")).toBe(false);
      expect(canTransition("awaiting_payment", "in_progress")).toBe(false);
      expect(canTransition("delivered", "awaiting_payment")).toBe(false);
      expect(canTransition("completed", "in_progress")).toBe(false);
      expect(canTransition("cancelled", "in_progress")).toBe(false);
    });

    it("rejects transitions from terminal states", () => {
      expect(canTransition("completed", "in_progress")).toBe(false);
      expect(canTransition("cancelled", "in_progress")).toBe(false);
      expect(canTransition("resolved_refund", "in_progress")).toBe(false);
      expect(canTransition("resolved_partial", "in_progress")).toBe(false);
      expect(canTransition("resolved_upheld", "in_progress")).toBe(false);
    });
  });

  describe("getNextStatuses", () => {
    it("returns valid next statuses", () => {
      expect(getNextStatuses("draft")).toEqual(["awaiting_payment"]);
      expect(getNextStatuses("awaiting_payment")).toEqual([
        "in_escrow",
        "cancelled",
      ]);
      expect(getNextStatuses("in_escrow")).toEqual(["in_progress"]);
      expect(getNextStatuses("in_progress")).toEqual([
        "delivered",
        "cancelled",
        "disputed",
      ]);
      expect(getNextStatuses("delivered")).toEqual([
        "completed",
        "revision_requested",
        "disputed",
      ]);
      expect(getNextStatuses("revision_requested")).toEqual(["in_progress"]);
      expect(getNextStatuses("disputed")).toEqual([
        "resolved_refund",
        "resolved_partial",
        "resolved_upheld",
      ]);
    });

    it("returns empty array for terminal states", () => {
      expect(getNextStatuses("completed")).toEqual([]);
      expect(getNextStatuses("cancelled")).toEqual([]);
      expect(getNextStatuses("resolved_refund")).toEqual([]);
      expect(getNextStatuses("resolved_partial")).toEqual([]);
      expect(getNextStatuses("resolved_upheld")).toEqual([]);
    });
  });

  describe("validateTransition", () => {
    it("validates basic transitions", () => {
      const result = validateTransition("draft", "awaiting_payment");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects invalid transitions", () => {
      const result = validateTransition("draft", "completed");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid transition");
    });

    it("requires payment and escrow for in_escrow", () => {
      const result1 = validateTransition("awaiting_payment", "in_escrow", {
        hasPayment: false,
        hasEscrow: true,
      });
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain("Payment required");

      const result2 = validateTransition("awaiting_payment", "in_escrow", {
        hasPayment: true,
        hasEscrow: false,
      });
      expect(result2.valid).toBe(false);
      expect(result2.error).toContain("Escrow required");

      const result3 = validateTransition("awaiting_payment", "in_escrow", {
        hasPayment: true,
        hasEscrow: true,
      });
      expect(result3.valid).toBe(true);
    });

    it("requires delivery for completed", () => {
      const result1 = validateTransition("delivered", "completed", {
        deliveredAt: null,
      });
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain("must be delivered");

      const result2 = validateTransition("delivered", "completed", {
        deliveredAt: new Date(),
      });
      expect(result2.valid).toBe(true);

      const result3 = validateTransition("delivered", "completed", {
        autoCompleteDays: 7,
      });
      expect(result3.valid).toBe(true);
    });
  });
});

