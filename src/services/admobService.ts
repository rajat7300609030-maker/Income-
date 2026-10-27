/**
 * Google AdMob Integration Service
 * Handles configuration, official Google test ad units, production ad units,
 * frequency capping, and Capacitor / Web ad lifecycle.
 */

export interface AdMobConfig {
  enabled: boolean;
  isTestMode: boolean;
  publisherId: string;
  appId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  appOpenAdUnitId: string;
  interstitialFrequency: number; // Show interstitial every N actions
  showBannerOnDashboard: boolean;
  showBannerOnReports: boolean;
  showBannerOnHistory: boolean;
}

// User's Registered Production AdMob IDs
export const REGISTERED_ADMOB_IDS = {
  publisherId: 'pub-3478133934097048',
  appId: 'ca-app-pub-3478133934097048~9343028119',
  adUnitId: 'ca-app-pub-3478133934097048/4514915255',
};

// Official Google AdMob Test Ad Unit IDs (Guaranteed to work without policy violation)
export const GOOGLE_ADMOB_TEST_IDS = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  appOpen: 'ca-app-pub-3940256099942544/9257390321',
};

const ADMOB_STORAGE_KEY = 'app_admob_config';
const ADMOB_ACTION_COUNT_KEY = 'app_admob_action_count';

export const DEFAULT_ADMOB_CONFIG: AdMobConfig = {
  enabled: true,
  isTestMode: true, // Safe default; user can toggle Live Production mode with their unit IDs
  publisherId: REGISTERED_ADMOB_IDS.publisherId,
  appId: REGISTERED_ADMOB_IDS.appId,
  bannerAdUnitId: REGISTERED_ADMOB_IDS.adUnitId,
  interstitialAdUnitId: REGISTERED_ADMOB_IDS.adUnitId,
  rewardedAdUnitId: REGISTERED_ADMOB_IDS.adUnitId,
  appOpenAdUnitId: GOOGLE_ADMOB_TEST_IDS.appOpen,
  interstitialFrequency: 3, // Show interstitial every 3 actions
  showBannerOnDashboard: true,
  showBannerOnReports: true,
  showBannerOnHistory: true,
};

export const admobService = {
  getConfig(): AdMobConfig {
    try {
      const stored = localStorage.getItem(ADMOB_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_ADMOB_CONFIG,
          ...parsed,
          publisherId: parsed.publisherId || DEFAULT_ADMOB_CONFIG.publisherId,
          appId: parsed.appId && parsed.appId !== GOOGLE_ADMOB_TEST_IDS.appId ? parsed.appId : DEFAULT_ADMOB_CONFIG.appId,
          bannerAdUnitId: parsed.bannerAdUnitId && parsed.bannerAdUnitId !== GOOGLE_ADMOB_TEST_IDS.banner ? parsed.bannerAdUnitId : DEFAULT_ADMOB_CONFIG.bannerAdUnitId,
          interstitialAdUnitId: parsed.interstitialAdUnitId && parsed.interstitialAdUnitId !== GOOGLE_ADMOB_TEST_IDS.interstitial ? parsed.interstitialAdUnitId : DEFAULT_ADMOB_CONFIG.interstitialAdUnitId,
          rewardedAdUnitId: parsed.rewardedAdUnitId && parsed.rewardedAdUnitId !== GOOGLE_ADMOB_TEST_IDS.rewarded ? parsed.rewardedAdUnitId : DEFAULT_ADMOB_CONFIG.rewardedAdUnitId,
        };
      }
    } catch (e) {
      console.error('Failed to load AdMob config', e);
    }
    return DEFAULT_ADMOB_CONFIG;
  },

  saveConfig(config: Partial<AdMobConfig>): AdMobConfig {
    try {
      const current = this.getConfig();
      const updated = { ...current, ...config };
      localStorage.setItem(ADMOB_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save AdMob config', e);
      return DEFAULT_ADMOB_CONFIG;
    }
  },

  getActiveAdUnitId(type: 'banner' | 'interstitial' | 'rewarded' | 'appOpen'): string {
    const config = this.getConfig();
    if (config.isTestMode) {
      return GOOGLE_ADMOB_TEST_IDS[type];
    }
    switch (type) {
      case 'banner':
        return config.bannerAdUnitId || REGISTERED_ADMOB_IDS.adUnitId;
      case 'interstitial':
        return config.interstitialAdUnitId || REGISTERED_ADMOB_IDS.adUnitId;
      case 'rewarded':
        return config.rewardedAdUnitId || REGISTERED_ADMOB_IDS.adUnitId;
      case 'appOpen':
        return config.appOpenAdUnitId || GOOGLE_ADMOB_TEST_IDS.appOpen;
      default:
        return '';
    }
  },

  getActionCount(): number {
    try {
      const count = parseInt(localStorage.getItem(ADMOB_ACTION_COUNT_KEY) || '0', 10);
      return isNaN(count) ? 0 : count;
    } catch {
      return 0;
    }
  },

  incrementActionCount(): number {
    const next = this.getActionCount() + 1;
    try {
      localStorage.setItem(ADMOB_ACTION_COUNT_KEY, next.toString());
    } catch {}
    return next;
  },

  shouldShowInterstitial(): boolean {
    const config = this.getConfig();
    if (!config.enabled) return false;
    const count = this.incrementActionCount();
    return count % config.interstitialFrequency === 0;
  },

  resetActionCount(): void {
    try {
      localStorage.setItem(ADMOB_ACTION_COUNT_KEY, '0');
    } catch {}
  },
};
