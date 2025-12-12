import { franc } from 'franc';

export const RTL_LANGUAGES = ['arb', 'heb', 'urd', 'per', 'ara', 'fas', 'urd'];

export function detectLanguage(text: string): string {
    // franc returns 'und' if undetermined
    // We can set a minimum length threshold to avoid noise
    if (!text || text.length < 5) return 'eng';
    return franc(text);
}

export function isRTL(langCode: string): boolean {
    return RTL_LANGUAGES.includes(langCode);
}

export function getSuggestedFont(langCode: string): string {
    switch (langCode) {
        case 'arb':
        case 'ara':
            return 'Amiri'; // Assuming we have this or similar
        case 'jpn':
            return 'Noto Sans JP';
        case 'kor':
            return 'Noto Sans KR';
        case 'cmn':
            return 'Noto Sans SC';
        default:
            return 'DM Sans';
    }
}
