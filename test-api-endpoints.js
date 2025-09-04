#!/usr/bin/env node

/**
 * Test the updated API endpoints with /api prefix
 * Run with: node test-api-endpoints.js
 */

const API_BASE_URL = "http://localhost:8080/api";

async function testApiEndpoints() {
  console.log("🔍 Testing updated API endpoints with /api prefix...");
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log("");

  const endpoints = [
    "/auth/login",
    "/auth/register",
    "/users/me",
    "/groups",
    "/events",
    "/notifications",
    "/subscriptions",
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 401) {
        console.log(
          `   ✅ ${endpoint}: SUCCESS (reached server, got 401 as expected for unauthenticated request)`
        );
      } else if (response.status === 404) {
        console.log(`   ❌ ${endpoint}: FAILED - Endpoint not found (404)`);
      } else {
        console.log(
          `   ⚠️  ${endpoint}: Status ${response.status} - ${response.statusText}`
        );
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: FAILED - ${error.message}`);
    }
    console.log("");
  }

  console.log("🎯 API endpoint test completed!");
  console.log("");
  console.log("📋 Summary:");
  console.log(
    "   • 401 responses = Endpoint exists, authentication required ✅"
  );
  console.log("   • 404 responses = Endpoint doesn't exist ❌");
  console.log("   • Network errors = Server unreachable or CORS issues ❌");
}

// Run the test
testApiEndpoints();
