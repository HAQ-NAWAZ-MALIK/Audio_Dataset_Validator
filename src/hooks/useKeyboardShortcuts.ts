import { useEffect } from 'react';

interface Shortcuts {
    [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if typing in an input
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                document.activeElement?.tagName === 'SELECT'
            ) {
                return;
            }

            const key = event.key.toLowerCase();
            const ctrl = event.ctrlKey || event.metaKey;
            const shift = event.shiftKey;

            // Construct key string like "ctrl+s" or "shift+arrowright"
            let keyString = key;
            if (shift) keyString = `shift+${keyString}`;
            if (ctrl) keyString = `ctrl+${keyString}`;

            if (shortcuts[keyString]) {
                event.preventDefault();
                shortcuts[keyString]();
            } else if (shortcuts[key]) {
                // Fallback for single keys
                event.preventDefault();
                shortcuts[key]();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}
