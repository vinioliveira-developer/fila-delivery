import { validateEnv } from "../config/env.js";
import { migrate } from "../database/migrations.js";
import { backupService } from "../services/backupService.js";

validateEnv();
migrate();

const backup = backupService.createBackup({ source: "manual_script" });
process.stdout.write(`${JSON.stringify(backup, null, 2)}\n`);
