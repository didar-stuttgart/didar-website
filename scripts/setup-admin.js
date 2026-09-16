#!/usr/bin/env node

/**
 * Admin Password Setup Script
 *
 * This script helps generate a secure password hash for the admin account.
 * Run this before the first deployment.
 *
 * Usage:
 *   node scripts/setup-admin.js
 */

const { hashPassword, validatePassword } = require('../lib/admin-auth');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n╔════════════════════════════════════════╗');
console.log('║  DIDAR Admin Password Setup             ║');
console.log('╚════════════════════════════════════════╝\n');

console.log('This script generates a secure password hash for the admin account.\n');

console.log('Password Requirements:');
console.log('  • At least 12 characters');
console.log('  • At least one uppercase letter (A-Z)');
console.log('  • At least one lowercase letter (a-z)');
console.log('  • At least one number (0-9)');
console.log('  • At least one special character (!@#$%^&*)\n');

console.log('Example strong password:');
console.log('  MyPassword123!2026\n');

function promptPassword() {
  rl.question('Enter admin password: ', (password) => {
    if (!password) {
      console.log('Password cannot be empty.\n');
      promptPassword();
      return;
    }

    const validation = validatePassword(password);

    if (!validation.valid) {
      console.log('\n❌ Password does not meet requirements:\n');
      validation.errors.forEach((err) => {
        console.log(`   • ${err}`);
      });
      console.log();
      promptPassword();
      return;
    }

    // Confirm password
    rl.question('Confirm password: ', (confirmPassword) => {
      if (confirmPassword !== password) {
        console.log('❌ Passwords do not match.\n');
        promptPassword();
        return;
      }

      // Generate hash
      const hash = hashPassword(password);

      console.log('\n✅ Password accepted!\n');
      console.log('╔════════════════════════════════════════╗');
      console.log('║  GENERATED PASSWORD HASH               ║');
      console.log('╚════════════════════════════════════════╝\n');

      console.log('Add this to your .env.local file:\n');
      console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);

      console.log('To update .env.local:');
      console.log('  1. Open .env.local in a text editor');
      console.log('  2. Find the line: ADMIN_PASSWORD_HASH=will-be-generated-during-setup');
      console.log('  3. Replace it with the line above');
      console.log('  4. Save the file\n');

      console.log('⚠️  IMPORTANT:');
      console.log('  • Do NOT commit .env.local to Git');
      console.log('  • Do NOT share this hash with anyone');
      console.log('  • Keep this password secure and memorable');
      console.log('  • If you forget it, run this script again\n');

      console.log('After updating .env.local:');
      console.log('  1. Restart your development server (if running)');
      console.log('  2. Test: curl http://localhost:3000/api/health');
      console.log('  3. Deploy to Vercel and add the same hash to environment variables\n');

      rl.close();
    });
  });
}

promptPassword();
