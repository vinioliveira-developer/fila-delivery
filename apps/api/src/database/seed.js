import { db } from "./connection.js";
import { seedAdmin } from "./seeds/adminSeed.js";
import { seedDevelopment } from "./seeds/developmentSeed.js";
import { seedFeatureFlags } from "./seeds/featureFlagsSeed.js";
import { seedPlans } from "./seeds/plansSeed.js";

export function seedDatabase() {
  seedPlans(db);
  seedFeatureFlags(db);
  seedAdmin(db);
  seedDevelopment(db);
}
