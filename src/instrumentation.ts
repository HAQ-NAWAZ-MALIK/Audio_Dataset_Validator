/**
 * Next.js Instrumentation
 * This file is used to initialize code that runs when the server starts.
 * Used here to start the cleanup scheduler on HF Spaces.
 */

export async function register() {
    // Only run on server-side
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            // Dynamic import to avoid client-side bundling issues
            const { initializeDataDirs } = await import('./lib/dataPath');
            const { startCleanupScheduler } = await import('./lib/cleanup');

            // Initialize data directories
            await initializeDataDirs();

            // Start the cleanup scheduler (only runs on HF Spaces)
            startCleanupScheduler();

            console.log('[Instrumentation] Server initialization complete');
        } catch (error) {
            console.error('[Instrumentation] Error during initialization:', error);
        }
    }
}
