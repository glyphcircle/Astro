/**
 * Dynamic Translation Service using Puter AI
 * Automatically translates AI-generated content on-the-fly
 */

// @ts-ignore
declare const puter: any;

interface TranslationCache {
    [key: string]: {
        [language: string]: string;
    };
}

class DynamicTranslationService {
    private cache: TranslationCache = {};
    private pendingTranslations: Map<string, Promise<string>> = new Map();

    /**
     * Translate text using Puter AI
     */
    async translate(text: string, targetLanguage: string): Promise<string> {
        // Return original if English
        if (targetLanguage === 'en') {
            return text;
        }

        // Check cache first
        const cacheKey = this.getCacheKey(text);
        if (this.cache[cacheKey]?.[targetLanguage]) {
            return this.cache[cacheKey][targetLanguage];
        }

        // Check if translation is already in progress
        const pendingKey = `${cacheKey}-${targetLanguage}`;
        if (this.pendingTranslations.has(pendingKey)) {
            return this.pendingTranslations.get(pendingKey)!;
        }

        // Start new translation
        const translationPromise = this.performTranslation(text, targetLanguage);
        this.pendingTranslations.set(pendingKey, translationPromise);

        try {
            const translated = await translationPromise;

            // Cache the result
            if (!this.cache[cacheKey]) {
                this.cache[cacheKey] = {};
            }
            this.cache[cacheKey][targetLanguage] = translated;

            return translated;
        } finally {
            this.pendingTranslations.delete(pendingKey);
        }
    }

    /**
     * Perform actual translation using Puter AI
     */
    private async performTranslation(text: string, targetLanguage: string): Promise<string> {
        try {
            const languageMap: { [key: string]: string } = {
                'hi': 'Hindi',
                'es': 'Spanish',
                'fr': 'French',
                'de': 'German',
                'ja': 'Japanese',
                'ru': 'Russian',
                'zh': 'Chinese'
            };

            const fullLanguageName = languageMap[targetLanguage] || targetLanguage;

            const prompt = `Translate the following text to ${fullLanguageName}. Output ONLY the translated text, no explanations or additional commentary:\n\n${text}`;

            const translation = await puter.ai.chat(prompt, {
                model: 'gpt-5-nano' // Fast and efficient
            });

            return translation.trim();
        } catch (error) {
            console.error('Translation error:', error);
            // Fallback to original text if translation fails
            return text;
        }
    }

    /**
     * Translate multiple texts in batch
     */
    async translateBatch(texts: string[], targetLanguage: string): Promise<string[]> {
        const promises = texts.map(text => this.translate(text, targetLanguage));
        return Promise.all(promises);
    }

    /**
     * Generate cache key from text
     */
    private getCacheKey(text: string): string {
        // Use first 100 chars + text length as key
        return `${text.substring(0, 100)}_${text.length}`;
    }

    /**
     * Clear translation cache
     */
    clearCache(): void {
        this.cache = {};
    }

    /**
     * Get cache size
     */
    getCacheSize(): number {
        return Object.keys(this.cache).length;
    }
}

export const dynamicTranslation = new DynamicTranslationService();
