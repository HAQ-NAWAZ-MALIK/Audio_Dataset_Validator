import { promises as fs } from 'fs';
import path from 'path';

/**
 * Determines the base data directory path based on environment.
 * On Hugging Face Spaces with persistent storage, uses /data
 * Otherwise, uses the local dataset folder.
 */
export function getDataDir(): string {
    // Check for explicit environment variable first
    if (process.env.DATA_DIR) {
        return process.env.DATA_DIR;
    }
    
    // On HF Spaces with persistent storage, /data is available
    // We check this at runtime since /data only exists at runtime, not build time
    if (process.env.SPACE_ID || isHuggingFaceSpaces()) {
        return '/data';
    }
    
    // Default to local dataset directory
    return path.join(process.cwd(), 'dataset');
}

/**
 * Check if running on Hugging Face Spaces
 */
function isHuggingFaceSpaces(): boolean {
    // HF Spaces sets SPACE_ID environment variable
    return !!process.env.SPACE_ID;
}

/**
 * Get the full path to a subdirectory within the data directory
 */
export function getDataPath(...subPaths: string[]): string {
    return path.join(getDataDir(), ...subPaths);
}

/**
 * Get audio directory path for a speaker
 */
export function getAudioPath(speakerId?: string): string {
    if (speakerId) {
        return getDataPath('audio', speakerId);
    }
    return getDataPath('audio');
}

/**
 * Get transcriptions directory path for a speaker
 */
export function getTranscriptionsPath(speakerId?: string): string {
    if (speakerId) {
        return getDataPath('transcriptions', speakerId);
    }
    return getDataPath('transcriptions');
}

/**
 * Get metadata directory path
 */
export function getMetadataPath(): string {
    return getDataPath('metadata');
}

/**
 * Get fonts directory path
 */
export function getFontsPath(): string {
    return getDataPath('fonts');
}

/**
 * Safely create a directory, handling errors gracefully
 */
export async function ensureDir(dirPath: string): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error: unknown) {
        // Ignore EEXIST errors (directory already exists)
        if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code !== 'EEXIST') {
            console.error(`Failed to create directory ${dirPath}:`, error);
            throw error;
        }
    }
}

/**
 * Sanitize a string for use in file paths
 * Prevents path traversal attacks and invalid characters
 */
export function sanitizePath(input: string, maxLength: number = 50): string {
    if (!input || typeof input !== 'string') {
        return 'unknown';
    }
    
    // Remove any path traversal attempts and invalid characters
    return input
        .replace(/\.\./g, '') // Prevent path traversal
        .replace(/[\/\\:*?"<>|]/g, '_') // Remove invalid path characters
        .replace(/[^a-zA-Z0-9_-]/g, '_') // Keep only safe characters
        .substring(0, maxLength)
        .replace(/^_+|_+$/g, '') // Trim leading/trailing underscores
        || 'unknown';
}

/**
 * Initialize the data directory structure
 * Creates all necessary subdirectories
 */
export async function initializeDataDirs(): Promise<void> {
    const dirs = [
        getDataPath(),
        getAudioPath(),
        getTranscriptionsPath(),
        getMetadataPath(),
        getFontsPath(),
    ];
    
    for (const dir of dirs) {
        await ensureDir(dir);
    }
    
    console.log(`[DataPath] Initialized data directories at: ${getDataDir()}`);
}
