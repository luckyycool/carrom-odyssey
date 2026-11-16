import { AdMob, type AdMobRewardItem, MaxAdContentRating } from '@capacitor-community/admob';

// Google AdMob Official Production & Test Config for Carrom Odyssey
export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-0897820292119776~2022691273',
  androidRewardedId: 'ca-app-pub-0897820292119776/5556797516',
  testRewardedId: 'ca-app-pub-3940256099942544/5224354917',
};

export type AdRewardCallback = (rewardGranted: boolean) => void;

let isAdMobInitialized = false;

const getEnv = (): Record<string, any> => {
  return ((import.meta as any).env || {}) as Record<string, any>;
};

export const getRewardedAdId = (): string => {
  const env = getEnv();
  return (env.VITE_ADMOB_REWARDED_ID as string) || ADMOB_CONFIG.androidRewardedId;
};

export const isTestingMode = (): boolean => {
  const env = getEnv();
  if (env.VITE_ADMOB_IS_TESTING === 'false') {
    return false;
  }
  if (env.VITE_ADMOB_IS_TESTING === 'true') {
    return true;
  }
  return false;
};

export const initNativeAdMob = async () => {
  try {
    const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.();
    if (isNative && !isAdMobInitialized) {
      await AdMob.initialize({
        initializeForTesting: isTestingMode(),
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
        maxAdContentRating: MaxAdContentRating.General,
      });
      isAdMobInitialized = true;
    }
  } catch (e) {
    console.warn('AdMob init skipped/unsupported in web preview:', e);
  }
};

/**
 * Trigger rewarded video ad.
 * - On Native Android (Capacitor): Uses official Google AdMob SDK.
 * - On Web / Preview: Invokes callback with true or triggers web fallback.
 */
export const showRewardedAdMobVideo = async (
  onComplete: AdRewardCallback,
  fallbackToSimulated?: () => void
) => {
  const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.();

  if (isNative) {
    try {
      await initNativeAdMob();

      const adUnitId = getRewardedAdId();
      await AdMob.prepareRewardVideoAd({
        adId: adUnitId,
      });

      const reward: AdMobRewardItem = await AdMob.showRewardVideoAd();
      if (reward) {
        onComplete(true);
        return;
      }
      onComplete(false);
      return;
    } catch (e) {
      console.warn('Native AdMob error/no inventory, granting graceful reward:', e);
      // Graceful native fallback so gameplay is never blocked
      onComplete(true);
      return;
    }
  }

  // If in web / preview, run fallback simulated modal if provided, or immediately grant
  if (fallbackToSimulated) {
    fallbackToSimulated();
  } else {
    onComplete(true);
  }
};
