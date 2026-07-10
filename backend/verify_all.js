import { execSync } from "child_process";

const files = [
  "verify_packing.js",
  "verify_document.js",
  "verify_analytics.js",
  "verify_notification.js",
  "verify_weather.js",
  "verify_maps.js",
  "verify_currency.js",
  "verify_ai.js",
  "verify_pdf.js"
];

console.log("🏁 STARTING GLOBAL TRIPVAULT API VERIFICATION SUITE...\n");

files.forEach((file) => {
  console.log(`--------------------------------------------------`);
  console.log(`🏃 Running: ${file}`);
  console.log(`--------------------------------------------------`);
  try {
    const stdout = execSync(`node ${file}`, { encoding: "utf-8" });
    console.log(stdout);
  } catch (error) {
    console.error(`❌ Verification script ${file} failed!`);
    console.error(error.stdout || error.message);
    process.exit(1);
  }
});

console.log("==================================================");
console.log("🎉 ALL MODULE INTEGRATION TESTS COMPLETED SUCCESSFUL!");
console.log("==================================================");
