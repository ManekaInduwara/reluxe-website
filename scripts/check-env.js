#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'SANITY_API_TOKEN'
];

// Optional but recommended
const recommendedEnvVars = [
  'EMAIL_USER',
  'EMAIL_PASS',
  'NEXT_PUBLIC_ADMIN_PASSWORD'
];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('Required variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName} - NOT SET`);
    hasErrors = true;
  } else if (value.includes('your_') || value.includes('test_')) {
    console.log(`⚠️  ${varName} - SET (but appears to be a placeholder)`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName} - SET`);
  }
});

console.log('\nRecommended variables:');
recommendedEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName} - NOT SET (optional but recommended)`);
    hasWarnings = true;
  } else if (value.includes('your_') || value.includes('test_')) {
    console.log(`⚠️  ${varName} - SET (but appears to be a placeholder)`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName} - SET`);
  }
});

console.log('\n📋 Summary:');
if (hasErrors) {
  console.log('❌ Some required environment variables are missing!');
  console.log('   Please check your .env file and ensure all required variables are set.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Some environment variables may need attention.');
  console.log('   Check the warnings above and update your .env file if needed.');
} else {
  console.log('✅ All environment variables are properly configured!');
}

console.log('\n💡 Tip: Copy .env.example to .env and fill in your actual values.');