/**
 * Puter Service - Handle authentication and initialization
 */

// @ts-ignore
declare const puter: any;

class PuterService {
    private static instance: PuterService;
    private isInitialized = false;
    private isAuthenticated = false;

    private constructor() { }

    static getInstance(): PuterService {
        if (!PuterService.instance) {
            PuterService.instance = new PuterService();
        }
        return PuterService.instance;
    }

    /**
     * Initialize and authenticate with Puter
     */
    async initialize(): Promise<boolean> {
        if (this.isInitialized) {
            return this.isAuthenticated;
        }

        try {
            // Check if Puter is available
            if (typeof puter === 'undefined') {
                console.error('❌ Puter SDK not loaded');
                return false;
            }

            console.log('🔄 Initializing Puter...');

            // Check authentication status
            const isSignedIn = await puter.auth.isSignedIn();

            if (!isSignedIn) {
                console.log('⚠️ User not signed in to Puter');
                // Auto sign-in
                await this.signIn();
            } else {
                console.log('✅ User already signed in to Puter');
                this.isAuthenticated = true;
            }

            this.isInitialized = true;
            return this.isAuthenticated;

        } catch (error) {
            console.error('❌ Puter initialization failed:', error);
            return false;
        }
    }

    /**
     * Sign in to Puter
     */
    async signIn(): Promise<boolean> {
        try {
            console.log('🔐 Signing in to Puter...');

            // Sign in with Puter (opens auth dialog if needed)
            await puter.auth.signIn();

            this.isAuthenticated = true;
            console.log('✅ Successfully signed in to Puter');

            return true;
        } catch (error) {
            console.error('❌ Puter sign-in failed:', error);
            return false;
        }
    }

    /**
     * Check if user is authenticated
     */
    async isSignedIn(): Promise<boolean> {
        try {
            if (typeof puter === 'undefined') return false;
            return await puter.auth.isSignedIn();
        } catch {
            return false;
        }
    }

    /**
     * Get current user info
     */
    async getCurrentUser() {
        try {
            if (!this.isAuthenticated) {
                await this.initialize();
            }
            return await puter.auth.getUser();
        } catch (error) {
            console.error('❌ Failed to get user:', error);
            return null;
        }
    }

    /**
     * Sign out from Puter
     */
    async signOut() {
        try {
            await puter.auth.signOut();
            this.isAuthenticated = false;
            console.log('✅ Signed out from Puter');
        } catch (error) {
            console.error('❌ Sign out failed:', error);
        }
    }
}

export const puterService = PuterService.getInstance();
