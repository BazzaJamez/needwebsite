/**
 * Feature flags
 * 
 * Read server-side and pass to layouts/components.
 * Flags are boolean values that can be toggled via environment variables.
 */

export type FeatureFlags = {
  // Example flags - add your own
  enableNewCheckout: boolean;
  enableChatWidget: boolean;
  enableDarkMode: boolean;
  enableBetaFeatures: boolean;
};

/**
 * Get feature flags from environment
 * Defaults to false for all flags
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    enableNewCheckout: process.env.FEATURE_NEW_CHECKOUT === "true",
    enableChatWidget: process.env.FEATURE_CHAT_WIDGET === "true",
    enableDarkMode: process.env.FEATURE_DARK_MODE === "true",
    enableBetaFeatures: process.env.FEATURE_BETA === "true",
  };
}

/**
 * Check if a specific flag is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag];
}

