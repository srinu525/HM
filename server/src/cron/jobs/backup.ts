import { exec } from "child_process";
import { promisify } from "util";
import { mkdirSync, readdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";
import { logger } from "../../common/logger";

const execAsync = promisify(exec);

const BACKUP_DIR = join(process.cwd(), "backups");
const MAX_BACKUPS = 7;

export async function runBackup() {
  mkdirSync(BACKUP_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${timestamp}.sql`;
  const filepath = join(BACKUP_DIR, filename);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set for backup");
  }

  logger.info({ filepath }, "Starting database backup");

  try {
    await execAsync(`pg_dump "${databaseUrl}" > "${filepath}"`, { timeout: 300000 });
    logger.info({ filepath }, "Database backup completed successfully");

    cleanupOldBackups();
  } catch (err) {
    logger.error({ err }, "Database backup failed");
    throw err;
  }
}

function cleanupOldBackups() {
  try {
    const files = readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".sql"))
      .map((f) => ({ name: f, time: statSync(join(BACKUP_DIR, f)).mtime }))
      .sort((a, b) => b.time.getTime() - a.time.getTime());

    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(MAX_BACKUPS);
      for (const file of toDelete) {
        unlinkSync(join(BACKUP_DIR, file.name));
        logger.info({ file: file.name }, "Deleted old backup");
      }
    }
  } catch (err) {
    logger.error({ err }, "Failed to cleanup old backups");
  }
}
