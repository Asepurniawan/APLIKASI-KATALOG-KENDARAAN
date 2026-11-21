const fs = require("fs");
const path = require("path");

const migrationPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20261121184900_seed_large_dataset.sql",
);

console.log("Migration file:");
console.log(migrationPath);
console.log("");
console.log("This migration creates public.vehicles and public.profiles.");
console.log("It inserts 100,000 rows into each table.");
console.log("");
console.log("Run it in Supabase Dashboard > SQL Editor.");
console.log("Publishable/anon keys are intended for the app client and cannot execute SQL migrations.");

if (!fs.existsSync(migrationPath)) {
  process.exitCode = 1;
}
