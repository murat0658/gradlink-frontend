import React from "react";
import {
  isEventComingSoon,
  createEventNotification,
} from "../../app/store/utils";
import {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateName,
  validateUrl,
  validateDate,
  validateGraduationYear,
  validateForm,
  validateUniversityCode,
  validateEventCapacity,
  validateBio,
  validateLocation,
  validateId,
  validateTimestamp,
  validateEventTime,
  validateEnrollment,
  sanitizeText,
  sanitizeEmail,
  sanitizePhoneNumber,
} from "../../app/utils/validation";
import { createMockEvent } from "./test-utils";

describe("Validation Utilities", () => {
  describe("Email Validation", () => {
    it("should validate correct email formats", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
      expect(validateEmail("user+tag@example.org")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test.example.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("Phone Validation", () => {
    it("should validate correct phone formats", () => {
      expect(validatePhoneNumber("1234567890")).toBe(true);
      expect(validatePhoneNumber("+1234567890")).toBe(true);
      expect(validatePhoneNumber("(123) 456-7890")).toBe(true);
      expect(validatePhoneNumber("123-456-7890")).toBe(true);
    });

    it("should reject invalid phone formats", () => {
      expect(validatePhoneNumber("123")).toBe(false);
      expect(validatePhoneNumber("abc")).toBe(false);
      expect(validatePhoneNumber("")).toBe(false);
    });
  });

  describe("Password Validation", () => {
    it("should validate correct passwords", () => {
      expect(validatePassword("password123")).toBe(true);
      expect(validatePassword("mypassword")).toBe(true);
      expect(validatePassword("12345678")).toBe(true);
    });

    it("should reject short passwords", () => {
      expect(validatePassword("1234567")).toBe(false);
      expect(validatePassword("pass")).toBe(false);
      expect(validatePassword("")).toBe(false);
    });
  });

  describe("Name Validation", () => {
    it("should validate correct names", () => {
      expect(validateName("John Doe")).toBe(true);
      expect(validateName("Jane")).toBe(true);
      expect(validateName("Mary Jane Watson")).toBe(true);
    });

    it("should reject invalid names", () => {
      expect(validateName("J")).toBe(false);
      expect(validateName("John123")).toBe(false);
      expect(validateName("")).toBe(false);
    });
  });

  describe("URL Validation", () => {
    it("should validate correct URLs", () => {
      expect(validateUrl("https://example.com")).toBe(true);
      expect(validateUrl("http://test.org")).toBe(true);
      expect(validateUrl("https://subdomain.example.com/path")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(validateUrl("not-a-url")).toBe(false);
      expect(validateUrl("just-text")).toBe(false);
      expect(validateUrl("")).toBe(false);
    });
  });

  describe("Date Validation", () => {
    it("should validate correct dates", () => {
      expect(validateDate("2023-01-01")).toBe(true);
      expect(validateDate("2023-12-31T23:59:59Z")).toBe(true);
      expect(validateDate("January 1, 2023")).toBe(true);
    });

    it("should reject invalid dates", () => {
      expect(validateDate("invalid-date")).toBe(false);
      expect(validateDate("2023-13-01")).toBe(false);
      expect(validateDate("")).toBe(false);
    });
  });

  describe("Graduation Year Validation", () => {
    it("should validate correct graduation years", () => {
      expect(validateGraduationYear(2020)).toBe(true);
      expect(validateGraduationYear(2025)).toBe(true);
      expect(validateGraduationYear(1990)).toBe(true);
    });

    it("should reject invalid graduation years", () => {
      expect(validateGraduationYear(1800)).toBe(false);
      expect(validateGraduationYear(2050)).toBe(false);
      expect(validateGraduationYear(-1)).toBe(false);
    });
  });

  describe("Form Validation", () => {
    it("should validate complete forms", () => {
      const validData = {
        email: "test@example.com",
        phone: "+1234567890",
        password: "password123",
        name: "John Doe",
        graduationYear: 2020,
      };

      const result = validateForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return errors for invalid forms", () => {
      const invalidData = {
        email: "invalid-email",
        phone: "123",
        password: "short",
        name: "J",
        graduationYear: 1800,
      };

      const result = validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Advanced Validation Patterns", () => {
    describe("University Code Validation", () => {
      it("should validate correct university codes", () => {
        expect(validateUniversityCode("harvard")).toBe(true);
        expect(validateUniversityCode("stanford")).toBe(true);
        expect(validateUniversityCode("mit")).toBe(true);
        expect(validateUniversityCode("university-of-california")).toBe(true);
        expect(validateUniversityCode("uc-berkeley")).toBe(true);
      });

      it("should reject invalid university codes", () => {
        expect(validateUniversityCode("")).toBe(false);
        expect(validateUniversityCode("a")).toBe(false);
        expect(validateUniversityCode("university@code")).toBe(false);
        expect(validateUniversityCode("university code")).toBe(false);
      });
    });

    describe("Event Capacity Validation", () => {
      it("should validate correct capacities", () => {
        expect(validateEventCapacity(10)).toBe(true);
        expect(validateEventCapacity(100)).toBe(true);
        expect(validateEventCapacity(1000)).toBe(true);
      });

      it("should reject invalid capacities", () => {
        expect(validateEventCapacity(0)).toBe(false);
        expect(validateEventCapacity(-1)).toBe(false);
        expect(validateEventCapacity(10001)).toBe(false);
        expect(validateEventCapacity(1.5)).toBe(false);
      });
    });

    describe("Bio/Description Validation", () => {
      it("should validate correct bios", () => {
        expect(validateBio("Short bio")).toBe(true);
        expect(validateBio("A".repeat(500))).toBe(true);
        expect(validateBio("")).toBe(true);
      });

      it("should reject invalid bios", () => {
        expect(validateBio("A".repeat(501))).toBe(false);
      });
    });

    describe("Location Validation", () => {
      it("should validate correct locations", () => {
        expect(validateLocation("New York")).toBe(true);
        expect(validateLocation("San Francisco, CA")).toBe(true);
        expect(validateLocation("A".repeat(100))).toBe(true);
      });

      it("should reject invalid locations", () => {
        expect(validateLocation("A")).toBe(false);
        expect(validateLocation("A".repeat(101))).toBe(false);
        expect(validateLocation("")).toBe(false);
      });
    });
  });

  describe("Input Sanitization", () => {
    describe("Text Sanitization", () => {
      it("should sanitize text input", () => {
        expect(sanitizeText("  Hello World  ")).toBe("Hello World");
        expect(sanitizeText("Text with <script>")).toBe("Text with script");
        expect(sanitizeText("Text with >tag<")).toBe("Text with tag");
      });
    });

    describe("Email Sanitization", () => {
      it("should sanitize email input", () => {
        expect(sanitizeEmail("  TEST@EXAMPLE.COM  ")).toBe("test@example.com");
        expect(sanitizeEmail("User@Domain.Org")).toBe("user@domain.org");
      });
    });

    describe("Phone Number Sanitization", () => {
      it("should sanitize phone input", () => {
        expect(sanitizePhoneNumber("+1 (234) 567-8900")).toBe(
          "+1 (234) 567-8900"
        );
        expect(sanitizePhoneNumber("123abc456def789")).toBe("123456789");
      });
    });
  });

  describe("Data Type Validation", () => {
    describe("ID Validation", () => {
      it("should validate correct IDs", () => {
        expect(validateId("user123")).toBe(true);
        expect(validateId("event-456")).toBe(true);
        expect(validateId("group_789")).toBe(true);
      });

      it("should reject invalid IDs", () => {
        expect(validateId("")).toBe(false);
        expect(validateId("id with spaces")).toBe(false);
        expect(validateId("id@with#symbols")).toBe(false);
      });
    });

    describe("Timestamp Validation", () => {
      it("should validate correct timestamps", () => {
        expect(validateTimestamp("2023-01-01T00:00:00Z")).toBe(true);
        expect(validateTimestamp("2023-12-31T23:59:59.999Z")).toBe(true);
        expect(validateTimestamp("2023-01-01")).toBe(true);
      });

      it("should reject invalid timestamps", () => {
        expect(validateTimestamp("invalid-timestamp")).toBe(false);
        expect(validateTimestamp("")).toBe(false);
      });
    });
  });

  describe("Business Logic Validation", () => {
    describe("Event Time Validation", () => {
      it("should validate correct event times", () => {
        expect(
          validateEventTime("2023-01-01T10:00:00Z", "2023-01-01T12:00:00Z")
        ).toBe(true);
        expect(
          validateEventTime("2023-12-31T09:00:00Z", "2024-01-01T01:00:00Z")
        ).toBe(true);
      });

      it("should reject invalid event times", () => {
        expect(
          validateEventTime("2023-01-01T12:00:00Z", "2023-01-01T10:00:00Z")
        ).toBe(false);
        expect(validateEventTime("invalid-start", "2023-01-01T12:00:00Z")).toBe(
          false
        );
        expect(validateEventTime("2023-01-01T10:00:00Z", "invalid-end")).toBe(
          false
        );
      });
    });

    describe("Enrollment Validation", () => {
      it("should validate enrollment eligibility", () => {
        const futureTime = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();
        expect(validateEnrollment(futureTime, 5, 10, false)).toBe(true);
        expect(validateEnrollment(futureTime, 0, 10, false)).toBe(true);
      });

      it("should reject enrollment for past events", () => {
        const pastTime = new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString();
        expect(validateEnrollment(pastTime, 5, 10, false)).toBe(false);
      });

      it("should reject enrollment for full events", () => {
        const futureTime = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();
        expect(validateEnrollment(futureTime, 10, 10, false)).toBe(false);
        expect(validateEnrollment(futureTime, 15, 10, false)).toBe(false);
      });

      it("should reject enrollment for already enrolled users", () => {
        const futureTime = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();
        expect(validateEnrollment(futureTime, 5, 10, true)).toBe(false);
      });
    });
  });

  describe("Store Utilities", () => {
    describe("isEventComingSoon", () => {
      it("should identify events coming soon", () => {
        const futureEvent = createMockEvent({
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        });
        expect(isEventComingSoon(futureEvent)).toBe(true);
      });

      it("should not identify distant events as coming soon", () => {
        const distantEvent = createMockEvent({
          startTime: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // 7 days from now
        });
        expect(isEventComingSoon(distantEvent)).toBe(false);
      });

      it("should not identify past events as coming soon", () => {
        const pastEvent = createMockEvent({
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        });
        expect(isEventComingSoon(pastEvent)).toBe(false);
      });
    });

    describe("createEventNotification", () => {
      it("should create notification for upcoming event", () => {
        const event = createMockEvent({
          title: "Test Event",
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        });

        const notification = createEventNotification(event);
        expect(notification.title).toBe("Upcoming Event");
        expect(notification.message).toContain("Test Event");
        expect(notification.type).toBe("event");
      });

      it("should include correct time format in message", () => {
        const event = createMockEvent({
          title: "Test Event",
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        });

        const notification = createEventNotification(event);
        expect(notification.message).toMatch(/in \d+ hours?/);
      });

      it("should handle singular hour correctly", () => {
        const event = createMockEvent({
          title: "Test Event",
          startTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        });

        const notification = createEventNotification(event);
        expect(notification.message).toContain("in 1 hour");
      });

      it("should handle minutes correctly", () => {
        const event = createMockEvent({
          title: "Test Event",
          startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        });

        const notification = createEventNotification(event);
        expect(notification.message).toMatch(/in \d+ minutes?/);
      });

      it("should handle hours and minutes together", () => {
        const event = createMockEvent({
          title: "Test Event",
          startTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1.5 hours
        });

        const notification = createEventNotification(event);
        expect(notification.message).toMatch(/in \d+ hours? and \d+ minutes?/);
      });
    });
  });
});
