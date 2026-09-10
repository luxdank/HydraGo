import { sounds } from './audio';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: Date;
  actionText?: string;
  onAction?: () => void;
}

export interface DailyNotificationSlot {
  id: string;
  time: string; // '08:00', '10:30', '13:00', '15:30', '18:00', '20:30'
  hours: number;
  minutes: number;
  targetMl: number; // 500 ml each
  doseNumber: number; // 1 to 6
  title: string;
  body: string;
}

export interface PhotoRegistrationStatus {
  canTakePhoto: boolean;
  reason: 'ready' | 'cooldown' | 'max_reached';
  photosTakenToday: number; // 0 to 6
  maxPhotosPerDay: number; // 6
  photosRemainingToday: number;
  minutesUntilNextPhoto: number; // 0 if ready, or minutes until 1 hour elapsed
  lastPhotoTimestamp: number | null;
  isGoalMet: boolean;
  isBypassed: boolean;
  currentIntakeMl: number;
  dailyGoalMl: number;
}

export interface NotificationWindowStatus extends PhotoRegistrationStatus {
  // Backwards compatibility aliases
  isOpen: boolean;
  activeSlot: DailyNotificationSlot | null;
  nextSlot: DailyNotificationSlot | null;
  minutesUntilNext: number;
  minutesRemainingInActiveWindow: number;
  isTestMode: boolean;
  slots: {
    slot: DailyNotificationSlot;
    status: 'completed' | 'active' | 'upcoming' | 'missed';
  }[];
}

type NotificationListener = (notification: InAppNotification) => void;
type PermissionListener = (state: NotificationPermissionState) => void;
type WindowListener = (status: NotificationWindowStatus) => void;

// 6 Daily notification reminders to encourage drinking 3.000 ml
export const DAILY_NOTIFICATION_SLOTS: DailyNotificationSlot[] = [
  {
    id: 'slot-1',
    time: '08:00',
    hours: 8,
    minutes: 0,
    targetMl: 500,
    doseNumber: 1,
    title: '💧 1ª Dose: Despertar & Ativação (500 ml)',
    body: 'Comece o dia com 500 ml de água para acelerar o metabolismo e hidratar o corpo!',
  },
  {
    id: 'slot-2',
    time: '10:30',
    hours: 10,
    minutes: 30,
    targetMl: 500,
    doseNumber: 2,
    title: '⚡ 2ª Dose: Foco & Produtividade (500 ml)',
    body: 'Hora da segunda dose! Tome mais 500 ml e registre sua garrafa para ganhar XP.',
  },
  {
    id: 'slot-3',
    time: '13:00',
    hours: 13,
    minutes: 0,
    targetMl: 500,
    doseNumber: 3,
    title: '🥗 3ª Dose: Digestão & Equilíbrio (500 ml)',
    body: 'Beba 500 ml pós-almoço para ajudar na digestão e manter seu ritmo de hidratação.',
  },
  {
    id: 'slot-4',
    time: '15:30',
    hours: 15,
    minutes: 30,
    targetMl: 500,
    doseNumber: 4,
    title: '🔥 4ª Dose: Disposição da Tarde (500 ml)',
    body: 'Evite o cansaço da tarde com mais 500 ml de água fresca. Abra a câmera do HidraGo!',
  },
  {
    id: 'slot-5',
    time: '18:00',
    hours: 18,
    minutes: 0,
    targetMl: 500,
    doseNumber: 5,
    title: '🌅 5ª Dose: Reta Final do Dia (500 ml)',
    body: 'Quase lá! Faltam apenas 500 ml para completar sua meta diária de 3.000 ml.',
  },
  {
    id: 'slot-6',
    time: '20:30',
    hours: 20,
    minutes: 30,
    targetMl: 500,
    doseNumber: 6,
    title: '🏆 6ª Dose: Meta Diária Concluída (500 ml)',
    body: 'Última dose do dia! Complete seus 3.000 ml e feche seu streak com chave de ouro.',
  },
];

const COOLDOWN_INTERVAL_MINUTES = 60; // 1 hour interval between photo registrations
const MAX_PHOTOS_PER_DAY = 6; // exactly 6 photos allowed per day

class NotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private inAppListeners: Set<NotificationListener> = new Set();
  private permissionListeners: Set<PermissionListener> = new Set();
  private windowListeners: Set<WindowListener> = new Set();
  private reminderTimerId: number | null = null;

  // Settings & state
  private enabled: boolean = true;
  private currentIntakeMl: number = 0;
  private dailyGoalMl: number = 3000;
  private photosTakenToday: number = 0;
  private lastPhotoTimestamp: number | null = null;
  private lastActiveDate: string = new Date().toDateString();
  private isBypassed: boolean = false;
  private triggeredSlotsToday: Set<string> = new Set();

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private checkAndResetDaily() {
    const today = new Date().toDateString();
    if (this.lastActiveDate !== today) {
      this.lastActiveDate = today;
      this.photosTakenToday = 0;
      this.triggeredSlotsToday.clear();
      this.saveSettings();
    }
  }

  private loadSettings() {
    try {
      this.checkAndResetDaily();
      const savedEnabled = localStorage.getItem('hidrago_notifications_enabled');
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }
      const savedGoal = localStorage.getItem('hidrago_daily_goal');
      if (savedGoal) {
        this.dailyGoalMl = parseInt(savedGoal, 10) || 3000;
      }
      const savedPhotosCount = localStorage.getItem('hidrago_photos_today');
      if (savedPhotosCount) {
        this.photosTakenToday = parseInt(savedPhotosCount, 10) || 0;
      }
      const savedLastPhoto = localStorage.getItem('hidrago_last_photo_timestamp');
      if (savedLastPhoto) {
        this.lastPhotoTimestamp = parseInt(savedLastPhoto, 10) || null;
      }
      const savedTriggered = localStorage.getItem('hidrago_triggered_slots_today');
      if (savedTriggered) {
        const parsed = JSON.parse(savedTriggered);
        if (Array.isArray(parsed)) {
          this.triggeredSlotsToday = new Set(parsed);
        }
      }
    } catch {
      // safe fallback
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('hidrago_notifications_enabled', String(this.enabled));
      localStorage.setItem('hidrago_daily_goal', String(this.dailyGoalMl));
      localStorage.setItem('hidrago_photos_today', String(this.photosTakenToday));
      if (this.lastPhotoTimestamp) {
        localStorage.setItem('hidrago_last_photo_timestamp', String(this.lastPhotoTimestamp));
      } else {
        localStorage.removeItem('hidrago_last_photo_timestamp');
      }
      localStorage.setItem('hidrago_active_date', this.lastActiveDate);
      localStorage.setItem(
        'hidrago_triggered_slots_today',
        JSON.stringify(Array.from(this.triggeredSlotsToday))
      );
    } catch {
      // safe
    }
  }

  public async init() {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = reg;

        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'QUICK_ADD_WATER') {
            window.dispatchEvent(
              new CustomEvent('hidrago:quick_drink', { detail: { amount: event.data.amount || 250 } })
            );
          }
        });
      } catch (err) {
        console.warn('[HidraGo SW] Service worker registration:', err);
      }
    }

    this.startSchedulerLoop();
  }

  public getPermission(): NotificationPermissionState {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationPermissionState;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      this.notifyPermissionChanged(permission as NotificationPermissionState);
      return permission as NotificationPermissionState;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return this.getPermission();
    }
  }

  public onPermissionChange(callback: PermissionListener): () => void {
    this.permissionListeners.add(callback);
    return () => this.permissionListeners.delete(callback);
  }

  private notifyPermissionChanged(state: NotificationPermissionState) {
    this.permissionListeners.forEach((listener) => listener(state));
  }

  public onInAppNotification(callback: NotificationListener): () => void {
    this.inAppListeners.add(callback);
    return () => this.inAppListeners.delete(callback);
  }

  public onWindowStateChange(callback: WindowListener): () => void {
    this.windowListeners.add(callback);
    callback(this.getWindowStatus());
    return () => this.windowListeners.delete(callback);
  }

  private notifyWindowChanged() {
    const status = this.getWindowStatus();
    this.windowListeners.forEach((listener) => listener(status));
  }

  public updateUserState(currentIntakeMl: number, dailyGoalMl: number = 3000) {
    this.checkAndResetDaily();
    const prevGoalMet = this.isGoalReached();
    this.currentIntakeMl = currentIntakeMl;
    this.dailyGoalMl = dailyGoalMl;
    this.saveSettings();

    if (prevGoalMet !== this.isGoalReached()) {
      this.notifyWindowChanged();
    }
  }

  public isGoalReached(): boolean {
    return this.currentIntakeMl >= this.dailyGoalMl;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(value: boolean) {
    this.enabled = value;
    this.saveSettings();
    if (value) {
      this.startSchedulerLoop();
    } else {
      this.stopSchedulerLoop();
    }
    this.notifyWindowChanged();
  }

  // Record that a photo was taken: increments daily count, starts 1h cooldown timer
  public recordPhotoRegistration(amountMl: number = 500) {
    this.checkAndResetDaily();
    this.photosTakenToday = Math.min(MAX_PHOTOS_PER_DAY, this.photosTakenToday + 1);
    this.lastPhotoTimestamp = Date.now();
    this.isBypassed = false;
    this.saveSettings();
    this.notifyWindowChanged();
  }

  // Test helper: bypasses cooldown timer so testing is instantaneous
  public bypassCooldownForTesting() {
    this.isBypassed = true;
    this.notifyWindowChanged();
  }

  public openTestWindow(_minutes = 30) {
    this.bypassCooldownForTesting();
  }

  // Reset daily photos for testing
  public resetPhotosForTesting() {
    this.photosTakenToday = 0;
    this.lastPhotoTimestamp = null;
    this.isBypassed = false;
    this.saveSettings();
    this.notifyWindowChanged();
  }

  // Calculate current photo registration status
  public getPhotoRegistrationStatus(): PhotoRegistrationStatus {
    this.checkAndResetDaily();
    const isGoalMet = this.isGoalReached();
    const photosRemainingToday = Math.max(0, MAX_PHOTOS_PER_DAY - this.photosTakenToday);

    // Rule 1: Limit to 6 photos per day
    if (this.photosTakenToday >= MAX_PHOTOS_PER_DAY) {
      return {
        canTakePhoto: this.isBypassed,
        reason: 'max_reached',
        photosTakenToday: this.photosTakenToday,
        maxPhotosPerDay: MAX_PHOTOS_PER_DAY,
        photosRemainingToday: 0,
        minutesUntilNextPhoto: 0,
        lastPhotoTimestamp: this.lastPhotoTimestamp,
        isGoalMet,
        isBypassed: this.isBypassed,
        currentIntakeMl: this.currentIntakeMl,
        dailyGoalMl: this.dailyGoalMl,
      };
    }

    // Rule 2: 1 hour interval between each photo
    if (this.lastPhotoTimestamp && !this.isBypassed) {
      const elapsedMinutes = (Date.now() - this.lastPhotoTimestamp) / (60 * 1000);
      if (elapsedMinutes < COOLDOWN_INTERVAL_MINUTES) {
        const minutesUntilNext = Math.max(1, Math.ceil(COOLDOWN_INTERVAL_MINUTES - elapsedMinutes));
        return {
          canTakePhoto: false,
          reason: 'cooldown',
          photosTakenToday: this.photosTakenToday,
          maxPhotosPerDay: MAX_PHOTOS_PER_DAY,
          photosRemainingToday,
          minutesUntilNextPhoto: minutesUntilNext,
          lastPhotoTimestamp: this.lastPhotoTimestamp,
          isGoalMet,
          isBypassed: false,
          currentIntakeMl: this.currentIntakeMl,
          dailyGoalMl: this.dailyGoalMl,
        };
      }
    }

    // Ready to take photo!
    return {
      canTakePhoto: true,
      reason: 'ready',
      photosTakenToday: this.photosTakenToday,
      maxPhotosPerDay: MAX_PHOTOS_PER_DAY,
      photosRemainingToday,
      minutesUntilNextPhoto: 0,
      lastPhotoTimestamp: this.lastPhotoTimestamp,
      isGoalMet,
      isBypassed: this.isBypassed,
      currentIntakeMl: this.currentIntakeMl,
      dailyGoalMl: this.dailyGoalMl,
    };
  }

  // Full status combining photo registration with scheduled slots for UI
  public getWindowStatus(): NotificationWindowStatus {
    const photoStatus = this.getPhotoRegistrationStatus();
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    let nextSlot: DailyNotificationSlot | null = null;
    let minutesUntilNext = Infinity;

    for (const slot of DAILY_NOTIFICATION_SLOTS) {
      const slotMinutes = slot.hours * 60 + slot.minutes;
      if (slotMinutes > currentTotalMinutes) {
        const diff = slotMinutes - currentTotalMinutes;
        if (diff < minutesUntilNext) {
          minutesUntilNext = diff;
          nextSlot = slot;
        }
      }
    }

    if (!nextSlot) {
      nextSlot = DAILY_NOTIFICATION_SLOTS[0];
      minutesUntilNext = 24 * 60 - currentTotalMinutes + (nextSlot.hours * 60 + nextSlot.minutes);
    }

    const slots = DAILY_NOTIFICATION_SLOTS.map((slot) => {
      let status: 'completed' | 'active' | 'upcoming' | 'missed' = 'upcoming';
      if (this.photosTakenToday >= slot.doseNumber || this.currentIntakeMl >= slot.doseNumber * 500) {
        status = 'completed';
      } else if (photoStatus.canTakePhoto && this.photosTakenToday === slot.doseNumber - 1) {
        status = 'active';
      } else {
        status = 'upcoming';
      }
      return { slot, status };
    });

    const activeSlot = slots.find((s) => s.status === 'active')?.slot || null;

    return {
      ...photoStatus,
      isOpen: photoStatus.canTakePhoto,
      activeSlot,
      nextSlot,
      minutesUntilNext,
      minutesRemainingInActiveWindow: photoStatus.canTakePhoto ? 60 : 0,
      isTestMode: photoStatus.isBypassed,
      slots,
    };
  }

  // Push notification sender
  public async sendPushNotification({
    title,
    body,
    icon = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrKp5FG7GdV8xsHKrxpLBrmJDXKFW9hyB2aC1vJHzjGp-6PWMc-NVTJkhAgEFVRk1G1qj6XN4zWI0CATTPQxy00S1yCGPuPJXcz2wjw3bjExxl5eldPgZ8be98g3BndZglap4hPxwYRrMgR1rx7PuXURMkX39IZJPho7C9xIj64xjah3RLXzJ8YVndhd-SDH_xzzDQFI-SgeyfOlraYRKQYbvTNZvL0kx0bRFYrn0dnH_zsysyOCQ',
    tag = 'hidrago-notification',
    actionText,
    onAction,
    isAutomatedSchedule = false,
  }: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    actionText?: string;
    onAction?: () => void;
    isAutomatedSchedule?: boolean;
  }) {
    // RULE: "Caso o usuário já tenha batido a meta, não notifique mais."
    if (isAutomatedSchedule && (this.isGoalReached() || this.photosTakenToday >= MAX_PHOTOS_PER_DAY)) {
      console.log('[HidraGo Notifications] Meta batida ou 6 fotos atingidas. Notificação suprimida.');
      return false;
    }

    try {
      sounds.playWaterDrop();
    } catch {
      // safe
    }

    // In-App Notification Toast
    const inAppItem: InAppNotification = {
      id: 'notif-' + Date.now(),
      title,
      body,
      icon,
      timestamp: new Date(),
      actionText: actionText || '📸 Tirar Foto da Garrafa',
      onAction:
        onAction ||
        (() => {
          window.dispatchEvent(new CustomEvent('hidrago:open_camera'));
        }),
    };
    this.inAppListeners.forEach((listener) => listener(inAppItem));

    // OS Push Notification
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        if (this.swRegistration && 'showNotification' in this.swRegistration) {
          const swOptions = {
            body,
            icon,
            badge: icon,
            tag,
            vibrate: [200, 100, 200],
            renotify: true,
            data: { url: '/' },
          } as unknown as NotificationOptions;
          await this.swRegistration.showNotification(title, swOptions);
          return true;
        } else {
          new Notification(title, { body, icon, tag });
          return true;
        }
      } catch (err) {
        console.warn('Native notification error:', err);
      }
    }

    return false;
  }

  private startSchedulerLoop() {
    this.stopSchedulerLoop();
    if (!this.enabled) return;

    this.reminderTimerId = window.setInterval(() => {
      if (!this.enabled) return;

      if (this.isGoalReached() || this.photosTakenToday >= MAX_PHOTOS_PER_DAY) {
        return;
      }

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      for (const slot of DAILY_NOTIFICATION_SLOTS) {
        if (slot.hours === currentHours && slot.minutes === currentMinutes) {
          const todayKey = `${now.toDateString()}_${slot.id}`;
          if (!this.triggeredSlotsToday.has(todayKey)) {
            this.triggeredSlotsToday.add(todayKey);
            this.saveSettings();

            this.sendPushNotification({
              title: slot.title,
              body: slot.body,
              tag: `hidrago-slot-${slot.id}`,
              actionText: '📸 Abrir Câmera',
              isAutomatedSchedule: true,
              onAction: () => {
                window.dispatchEvent(new CustomEvent('hidrago:open_camera'));
              },
            });
          }
        }
      }

      this.notifyWindowChanged();
    }, 30000);
  }

  private stopSchedulerLoop() {
    if (this.reminderTimerId !== null) {
      clearInterval(this.reminderTimerId);
      this.reminderTimerId = null;
    }
  }

  public triggerTestNotification() {
    const goalMetText = this.isGoalReached()
      ? ' (Meta diária de 3.000 ml já concluída!)'
      : '';

    return this.sendPushNotification({
      title: '💧 Notificação Push HidraGo',
      body: `Hora de beber água e registrar sua foto! Você tem ${Math.max(0, MAX_PHOTOS_PER_DAY - this.photosTakenToday)} fotos disponíveis hoje.${goalMetText}`,
      tag: 'test-notification',
      actionText: '📸 Tirar Foto da Garrafa',
      onAction: () => {
        window.dispatchEvent(new CustomEvent('hidrago:open_camera'));
      },
    });
  }
}

export const notifications = new NotificationManager();
