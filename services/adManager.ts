import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adService } from './adService';

// Constants for ad frequency control
const AD_FREQUENCY = {
  INTERSTITIAL: {
    MIN_INTERVAL: 60 * 1000, // 1 minute in milliseconds
    MAX_DAILY: 15, // Maximum interstitial ads per day
    STORAGE_KEY: 'interstitial_ad_timestamps',
    DAILY_COUNT_KEY: 'interstitial_daily_count',
  },
  REWARDED: {
    MIN_INTERVAL: 2 * 60 * 1000, // 2 minutes in milliseconds
    MAX_DAILY: 10, // Maximum rewarded ads per day
    STORAGE_KEY: 'rewarded_ad_timestamps',
    DAILY_COUNT_KEY: 'rewarded_daily_count',
  },
  APP_OPEN: {
    MIN_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds (reduced from 15 minutes)
    MAX_DAILY: 10, // Maximum app open ads per day (increased from 5)
    STORAGE_KEY: 'app_open_ad_timestamps',
    DAILY_COUNT_KEY: 'app_open_daily_count',
  },
};

// User experience settings
const USER_EXPERIENCE = {
  // Don't show interstitial ads until user has used the app for this many sessions
  MIN_SESSIONS_FOR_INTERSTITIAL: 2,
  // Don't show interstitial ads in the first X minutes of a new session
  GRACE_PERIOD_MINUTES: 1,
  // Storage keys
  STORAGE_KEYS: {
    SESSION_COUNT: 'app_session_count',
    SESSION_START_TIME: 'session_start_time',
  },
};

class AdManagerService {
  private sessionStartTime: number = Date.now();
  private isFirstSession: boolean = true;
  private sessionCount: number = 0;
  private lastAdTimestamps: Record<string, number> = {
    interstitial: 0,
    rewarded: 0,
    appOpen: 0,
  };
  private dailyCounts: Record<string, number> = {
    interstitial: 0,
    rewarded: 0,
    appOpen: 0,
  };
  private lastResetDate: string = '';

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.loadAdTimestamps();
    await this.loadSessionData();
    await this.checkAndResetDailyCounts();
  }

  private async loadAdTimestamps() {
    try {
      // Load last shown timestamps
      const interstitialTimestamps = await AsyncStorage.getItem(AD_FREQUENCY.INTERSTITIAL.STORAGE_KEY);
      const rewardedTimestamps = await AsyncStorage.getItem(AD_FREQUENCY.REWARDED.STORAGE_KEY);
      const appOpenTimestamps = await AsyncStorage.getItem(AD_FREQUENCY.APP_OPEN.STORAGE_KEY);

      if (interstitialTimestamps) this.lastAdTimestamps.interstitial = parseInt(interstitialTimestamps, 10);
      if (rewardedTimestamps) this.lastAdTimestamps.rewarded = parseInt(rewardedTimestamps, 10);
      if (appOpenTimestamps) this.lastAdTimestamps.appOpen = parseInt(appOpenTimestamps, 10);

      // Load daily counts
      const interstitialCount = await AsyncStorage.getItem(AD_FREQUENCY.INTERSTITIAL.DAILY_COUNT_KEY);
      const rewardedCount = await AsyncStorage.getItem(AD_FREQUENCY.REWARDED.DAILY_COUNT_KEY);
      const appOpenCount = await AsyncStorage.getItem(AD_FREQUENCY.APP_OPEN.DAILY_COUNT_KEY);

      if (interstitialCount) this.dailyCounts.interstitial = parseInt(interstitialCount, 10);
      if (rewardedCount) this.dailyCounts.rewarded = parseInt(rewardedCount, 10);
      if (appOpenCount) this.dailyCounts.appOpen = parseInt(appOpenCount, 10);

      // Load last reset date
      const lastReset = await AsyncStorage.getItem('ad_counts_last_reset');
      if (lastReset) this.lastResetDate = lastReset;
    } catch (error) {
      console.error('Error loading ad timestamps:', error);
    }
  }

  private async loadSessionData() {
    try {
      const sessionCount = await AsyncStorage.getItem(USER_EXPERIENCE.STORAGE_KEYS.SESSION_COUNT);
      if (sessionCount) {
        this.sessionCount = parseInt(sessionCount, 10);
        this.isFirstSession = this.sessionCount <= 1;
      } else {
        this.isFirstSession = true;
        this.sessionCount = 1;
        await AsyncStorage.setItem(USER_EXPERIENCE.STORAGE_KEYS.SESSION_COUNT, '1');
      }

      // Increment session count
      await AsyncStorage.setItem(
        USER_EXPERIENCE.STORAGE_KEYS.SESSION_COUNT,
        (this.sessionCount + 1).toString()
      );

      // Record session start time
      this.sessionStartTime = Date.now();
      await AsyncStorage.setItem(
        USER_EXPERIENCE.STORAGE_KEYS.SESSION_START_TIME,
        this.sessionStartTime.toString()
      );
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  }

  private async checkAndResetDailyCounts() {
    const today = new Date().toDateString();

    if (this.lastResetDate !== today) {
      // Reset all daily counts
      this.dailyCounts = {
        interstitial: 0,
        rewarded: 0,
        appOpen: 0,
      };

      // Save the reset counts
      await AsyncStorage.setItem(AD_FREQUENCY.INTERSTITIAL.DAILY_COUNT_KEY, '0');
      await AsyncStorage.setItem(AD_FREQUENCY.REWARDED.DAILY_COUNT_KEY, '0');
      await AsyncStorage.setItem(AD_FREQUENCY.APP_OPEN.DAILY_COUNT_KEY, '0');

      // Update the reset date
      this.lastResetDate = today;
      await AsyncStorage.setItem('ad_counts_last_reset', today);
    }
  }

  private async updateAdTimestamp(adType: 'interstitial' | 'rewarded' | 'appOpen') {
    const now = Date.now();
    this.lastAdTimestamps[adType] = now;

    // Determine which storage key to use
    let storageKey = '';
    let countKey = '';

    switch (adType) {
      case 'interstitial':
        storageKey = AD_FREQUENCY.INTERSTITIAL.STORAGE_KEY;
        countKey = AD_FREQUENCY.INTERSTITIAL.DAILY_COUNT_KEY;
        break;
      case 'rewarded':
        storageKey = AD_FREQUENCY.REWARDED.STORAGE_KEY;
        countKey = AD_FREQUENCY.REWARDED.DAILY_COUNT_KEY;
        break;
      case 'appOpen':
        storageKey = AD_FREQUENCY.APP_OPEN.STORAGE_KEY;
        countKey = AD_FREQUENCY.APP_OPEN.DAILY_COUNT_KEY;
        break;
    }

    // Update timestamp
    await AsyncStorage.setItem(storageKey, now.toString());

    // Increment and update daily count
    this.dailyCounts[adType]++;
    await AsyncStorage.setItem(countKey, this.dailyCounts[adType].toString());
  }

  // Check if we can show an interstitial ad based on frequency rules
  public canShowInterstitial(): boolean {
    const now = Date.now();

    // Don't show ads in first session
    if (this.sessionCount < USER_EXPERIENCE.MIN_SESSIONS_FOR_INTERSTITIAL) {
      return false;
    }

    // Don't show ads in the grace period
    const sessionElapsedTime = now - this.sessionStartTime;
    const gracePeriodMs = USER_EXPERIENCE.GRACE_PERIOD_MINUTES * 60 * 1000;
    if (sessionElapsedTime < gracePeriodMs) {
      return false;
    }

    // Check if we've exceeded daily maximum
    if (this.dailyCounts.interstitial >= AD_FREQUENCY.INTERSTITIAL.MAX_DAILY) {
      return false;
    }

    // Check if enough time has passed since the last ad
    const timeSinceLastAd = now - this.lastAdTimestamps.interstitial;
    return timeSinceLastAd >= AD_FREQUENCY.INTERSTITIAL.MIN_INTERVAL;
  }

  // Show an interstitial ad if frequency rules allow
  public async showInterstitial(): Promise<boolean> {
    if (!this.canShowInterstitial()) {
      return false;
    }

    const shown = await adService.showInterstitialAd();

    if (shown) {
      await this.updateAdTimestamp('interstitial');
    }

    return shown;
  }

  // Check if we can show a rewarded ad
  public canShowRewarded(): boolean {
    const now = Date.now();

    // Check if we've exceeded daily maximum
    if (this.dailyCounts.rewarded >= AD_FREQUENCY.REWARDED.MAX_DAILY) {
      return false;
    }

    // Check if enough time has passed since the last ad
    const timeSinceLastAd = now - this.lastAdTimestamps.rewarded;
    return timeSinceLastAd >= AD_FREQUENCY.REWARDED.MIN_INTERVAL;
  }

  // Show a rewarded ad if frequency rules allow
  public async showRewarded(): Promise<boolean> {
    if (!this.canShowRewarded()) {
      return false;
    }

    const shown = await adService.showRewardedAd();

    if (shown) {
      await this.updateAdTimestamp('rewarded');
    }

    return shown;
  }

  // Check if we can show an app open ad
  public canShowAppOpenAd(): boolean {
    const now = Date.now();

    // Check if we've exceeded daily maximum
    if (this.dailyCounts.appOpen >= AD_FREQUENCY.APP_OPEN.MAX_DAILY) {
      console.log('Daily app open ad limit reached:', this.dailyCounts.appOpen);
      return false;
    }

    // Check if enough time has passed since the last ad
    const timeSinceLastAd = now - this.lastAdTimestamps.appOpen;
    const canShow = timeSinceLastAd >= AD_FREQUENCY.APP_OPEN.MIN_INTERVAL;

    console.log(`Time since last app open ad: ${timeSinceLastAd / 1000} seconds`);
    console.log(`Minimum interval: ${AD_FREQUENCY.APP_OPEN.MIN_INTERVAL / 1000} seconds`);
    console.log(`Can show app open ad? ${canShow}`);

    return canShow;
  }

  // Show an app open ad if frequency rules allow
  public async showAppOpenAd(): Promise<boolean> {
    if (!this.canShowAppOpenAd()) {
      return false;
    }

    const shown = await adService.showAppOpenAd();

    if (shown) {
      await this.updateAdTimestamp('appOpen');
    }

    return shown;
  }
}

export const adManager = new AdManagerService();
