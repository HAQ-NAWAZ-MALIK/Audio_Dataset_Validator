import { promises as fs } from 'fs';
import path from 'path';
import { getDataDir, getAudioPath, getTranscriptionsPath, getMetadataPath, getFontsPath } from './dataPath';

// Cleanup interval in milliseconds (6 hours)
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

// Maximum age for files in milliseconds (24 hours)
const MAX_FILE_AGE_MS = 24 * 60 * 60 * 1000;

// Flag to track if cleanup scheduler is running
let cleanupSchedulerRunning = false;

/**
 * Delete files older than MAX_FILE_AGE_MS from a directory
 * Recursively processes subdirectories
 */
async function cleanupDirectory(dirPath: string, dryRun: boolean = false): Promise<number> {
    let deletedCount = 0;
    const now = Date.now();

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Recursively clean subdirectories
                deletedCount += await cleanupDirectory(fullPath, dryRun);

                // Try to remove empty directories
                try {
                    const contents = await fs.readdir(fullPath);
                    if (contents.length === 0) {
                        if (!dryRun) {
                            await fs.rmdir(fullPath);
                        }
                        console.log(`[Cleanup] Removed empty directory: ${fullPath}`);
                    }
                } catch {
                    // Directory might not be empty or already removed
                }
            } else if (entry.isFile()) {
                try {
                    const stats = await fs.stat(fullPath);
                    const fileAge = now - stats.mtimeMs;

                    if (fileAge > MAX_FILE_AGE_MS) {
                        if (!dryRun) {
                            await fs.unlink(fullPath);
                        }
                        deletedCount++;
                        console.log(`[Cleanup] Deleted old file: ${entry.name} (age: ${Math.round(fileAge / 3600000)}h)`);
                    }
                } catch (error) {
                    console.error(`[Cleanup] Error processing file ${fullPath}:`, error);
                }
            }
        }
    } catch (error) {
        // Directory might not exist yet
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error(`[Cleanup] Error reading directory ${dirPath}:`, error);
        }
    }

    return deletedCount;
}

/**
 * Run cleanup on all data directories
 */
export async function runCleanup(dryRun: boolean = false): Promise<{ totalDeleted: number; timestamp: string }> {
    const startTime = Date.now();
    console.log(`[Cleanup] Starting cleanup at ${new Date().toISOString()}...`);

    let totalDeleted = 0;

    // Directories to clean
    const directoriesToClean = [
        getAudioPath(),
        getTranscriptionsPath(),
    ];

    for (const dir of directoriesToClean) {
        try {
            const deleted = await cleanupDirectory(dir, dryRun);
            totalDeleted += deleted;
        } catch (error) {
            console.error(`[Cleanup] Error cleaning ${dir}:`, error);
        }
    }

    // Clean up old metadata entries
    try {
        await cleanupMetadata();
    } catch (error) {
        console.error('[Cleanup] Error cleaning metadata:', error);
    }

    const duration = Date.now() - startTime;
    console.log(`[Cleanup] Completed in ${duration}ms. Deleted ${totalDeleted} files.`);

    return {
        totalDeleted,
        timestamp: new Date().toISOString()
    };
}

/**
 * Clean up old entries from metadata file
 */
async function cleanupMetadata(): Promise<void> {
    const metadataPath = path.join(getMetadataPath(), 'dataset_info.json');

    try {
        const content = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(content);

        // Update last cleanup timestamp
        metadata.last_cleanup = new Date().toISOString();

        // Clear old recent_recordings if they exist
        if (metadata.recent_recordings && Array.isArray(metadata.recent_recordings)) {
            const now = Date.now();
            metadata.recent_recordings = metadata.recent_recordings.filter((rec: { timestamp?: string }) => {
                if (!rec.timestamp) return false;
                const recTime = new Date(rec.timestamp).getTime();
                return (now - recTime) < MAX_FILE_AGE_MS;
            });
        }

        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
        // Metadata file might not exist
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
        }
    }
}

/**
 * Start the cleanup scheduler
 * Runs cleanup on startup and then periodically
 */
export function startCleanupScheduler(): void {
    // Only run on HF Spaces (when /data exists or SPACE_ID is set)
    const isHFSpaces = !!process.env.SPACE_ID || getDataDir() === '/data';

    if (!isHFSpaces) {
        console.log('[Cleanup] Not running on HF Spaces, skipping cleanup scheduler');
        return;
    }

    if (cleanupSchedulerRunning) {
        console.log('[Cleanup] Scheduler already running');
        return;
    }

    cleanupSchedulerRunning = true;
    console.log('[Cleanup] Starting cleanup scheduler (24h max age, 6h interval)');

    // Run cleanup on startup (with a small delay to let the app initialize)
    setTimeout(async () => {
        try {
            await runCleanup();
        } catch (error) {
            console.error('[Cleanup] Error during startup cleanup:', error);
        }
    }, 5000);

    // Schedule periodic cleanup
    setInterval(async () => {
        try {
            await runCleanup();
        } catch (error) {
            console.error('[Cleanup] Error during scheduled cleanup:', error);
        }
    }, CLEANUP_INTERVAL_MS);
}

/**
 * Get cleanup status information
 */
export function getCleanupConfig() {
    return {
        maxFileAgeMs: MAX_FILE_AGE_MS,
        maxFileAgeHours: MAX_FILE_AGE_MS / 3600000,
        cleanupIntervalMs: CLEANUP_INTERVAL_MS,
        cleanupIntervalHours: CLEANUP_INTERVAL_MS / 3600000,
        isSchedulerRunning: cleanupSchedulerRunning,
        dataDir: getDataDir(),
    };
}
