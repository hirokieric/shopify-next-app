#!/usr/bin/env node

/**
 * Generate shopify.app.toml from .env file
 * 
 * This script reads environment variables from .env file and generates
 * shopify.app.toml based on the template structure.
 * 
 * Usage:
 *   node scripts/generate-shopify-app-toml.cjs [--env <path>] [--out <path>] [--check]
 * 
 * Options:
 *   --env <path>  Path to .env file (default: ./.env)
 *   --out <path>  Path to output shopify.app.toml (default: ./shopify.app.toml)
 *   --check       Only check if generated file matches existing file (for CI)
 */

const fs = require("fs");
const path = require("path");
const toml = require("@iarna/toml");
const dotenv = require("dotenv");

// Parse command line arguments
const args = process.argv.slice(2);
let envPath = "./.env";
let outPath = "./shopify.app.toml";
let checkMode = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--env" && i + 1 < args.length) {
    envPath = args[i + 1];
    i++;
  } else if (args[i] === "--out" && i + 1 < args.length) {
    outPath = args[i + 1];
    i++;
  } else if (args[i] === "--check") {
    checkMode = true;
  }
}

// Resolve paths
const resolvedEnvPath = path.resolve(process.cwd(), envPath);
const resolvedOutPath = path.resolve(process.cwd(), outPath);

// Load .env file
if (!fs.existsSync(resolvedEnvPath)) {
  console.error(`Error: .env file not found at ${resolvedEnvPath}`);
  process.exit(1);
}

const envResult = dotenv.config({ path: resolvedEnvPath });
if (envResult.error) {
  console.error(`Error loading .env file: ${envResult.error.message}`);
  process.exit(1);
}

// Required environment variables
const requiredEnvVars = {
  SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
  APP_NAME: process.env.APP_NAME,
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SCOPES: process.env.SHOPIFY_API_SCOPES,
  SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION,
};

// Validate required environment variables
const missingVars = [];
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value || value.trim() === "") {
    missingVars.push(key);
  }
}

if (missingVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

// Normalize SHOPIFY_APP_URL (remove trailing slash)
let appUrl = process.env.SHOPIFY_APP_URL.trim();
if (appUrl.endsWith("/")) {
  appUrl = appUrl.slice(0, -1);
}

// Build TOML config object
const config = {};

// Globals
config.name = process.env.APP_NAME;
config.client_id = process.env.SHOPIFY_API_KEY;
config.application_url = appUrl;
config.embedded = true;

// Build
config.build = {};
config.build.automatically_update_urls_on_dev = true;
if (process.env.SHOPIFY_DEV_STORE_URL?.trim()) {
  config.build.dev_store_url = process.env.SHOPIFY_DEV_STORE_URL.trim();
}

// Access admin
config.access = {};
config.access.admin = {};
config.access.admin.direct_api_mode = "offline";
config.access.admin.embedded_app_direct_api_access = true;

// Access scopes
config.access_scopes = {};
config.access_scopes.scopes = process.env.SHOPIFY_API_SCOPES;
config.access_scopes.use_legacy_install_flow = false;

// Auth
config.auth = {};
config.auth.redirect_urls = [
  `${appUrl}/auth/callback`,
  `${appUrl}/auth/shopify/callback`,
  `${appUrl}/api/auth/callback`,
];

// Webhooks
config.webhooks = {};
config.webhooks.api_version = process.env.SHOPIFY_API_VERSION;

// POS
config.pos = {};
config.pos.embedded = false;

// Generate TOML string
let tomlString = toml.stringify(config);
tomlString =
  "# Learn more about configuring your app at https://shopify.dev/docs/apps/tools/cli/configuration\n" +
  "# Avoid writing to toml directly. Use your .env file instead\n\n" +
  tomlString;

// Check mode: compare with existing file
if (checkMode) {
  if (!fs.existsSync(resolvedOutPath)) {
    console.error(`Error: Output file not found at ${resolvedOutPath}`);
    process.exit(1);
  }

  const existingContent = fs.readFileSync(resolvedOutPath, "utf8");
  if (existingContent === tomlString) {
    console.log("✓ Generated TOML matches existing file");
    process.exit(0);
  } else {
    console.error("✗ Generated TOML does not match existing file");
    console.error("Run 'pnpm run sync:shopify-app-toml' to update the file");
    process.exit(1);
  }
}

// Write to file
try {
  fs.writeFileSync(resolvedOutPath, tomlString, "utf8");
  console.log(`✓ Successfully generated ${resolvedOutPath}`);
} catch (error) {
  console.error(`Error writing to file: ${error.message}`);
  process.exit(1);
}
