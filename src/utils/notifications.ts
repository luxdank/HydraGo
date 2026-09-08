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

export interface NotificationWindowStatus {
  isOpen: boolean;
  activeSlot: DailyNotificationSlot | null;
  nextSlot: DailyNotificationSlot | null;
  minutesUntilNext: number;
  minutesRemainingInActiveWindow: number;
  isGoalMet: boolean;
  isTestMode: boolean;
  currentIntakeMl: number;
  dailyGoalMl: number;
  slots: {
    slot: DailyNotificationSlot;
    status: 'completed' | 'active' | 'upcoming' | 'missed';
  }[];
}

type NotificationListener = (notification: InAppNotification) => void;
type PermissionListener = (state: NotificationPermissionState) => void;
type WindowListener = (status: NotificationWindowStatus) => void;

// 6 Daily notifications spaced across waking hours to meet 3.000 ml (6 x 500 ml)
export const DAILY_NOTIFICATION_SLOTS: DailyNotificationSlot[] = [
  {
    id: 'slot-1',
    time: '08:00',
    hours: 8,
    minutes: 0,
    targetMl: 500,
    doseNumber: 1,
    title: '💧 1ª Dose Matinal: Despertar & Ativação (500 ml)',
    body: 'Beba 500 ml para acordar o corpo e ativar o metabolismo. A janela de registro por foto está aberta!',
  },
  {
    id: 'slot-2',
    time: '10:30',
    hours: 10,
    minutes: 30,
    targetMl: 500,
    doseNumber: 2,
    title: '⚡ 2ª Dose: Foco & Produtividade (500 ml)',
    body: 'Pausa para se hidratar! Tome mais 500 ml para manter o cérebro afiado. Registre sua foto!',
  },
  {
    id: 'slot-3',
    time: '13:00',
    hours: 13,
    minutes: 0,
    targetMl: 500,
    doseNumber: 3,
    title: '🥗 3ª Dose: Digestão & Equilíbrio (500 ml)',
    body: 'Beba 500 ml para ajudar na digestão e manter o ritmo do dia. Abra a câmera para comprovar!',
  },
  {
    id: 'slot-4',
    time: '15:30',
    hours: 15,
    minutes: 30,
    targetMl: 500,
    doseNumber: 4,
    title: '🔥 4ª Dose: Disposição da Tarde (500 ml)',
    body: 'Evite a queda de energia da tarde: beba 500 ml de água fresca e continue ganhando XP!',
  },
  {
    id: 'slot-5',
    time: '18:00',
    hours: 18,
    minutes: 0,
    targetMl: 500,
    doseNumber: 5,
    title: '🌅 5ª Dose: Reta Final do Dia (500 ml)',
    body: 'Mais 500 ml! Você está a um passo de bater a meta de 3.000 ml hoje. Tire sua foto!',
  },
  {
    id: 'slot-6',
    time: '20:30',
    hours: 20,
    minutes: 30,
    targetMl: 500,
    doseNumber: 6,
    title: '🏆 6ª Dose: Conclusão da Meta de 3.000 ml (500 ml)',
    body: 'Última dose do dia! Complete seus 3.000 ml de hidratação e encerre com chave de ouro!',
  },
];

// Active photo registration window duration after scheduled time
const WINDOW_DURATION_MINUTES = 45;

class NotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private inAppListeners: Set<NotificationListener> = new Set();
  private permissionListeners: Set<PermissionListener> = new Set();
  private windowListeners: Set<WindowListener> = new Set();
  private reminderTimerId: number | null = null;

  // Notification & goal state
  private enabled: boolean = true;
  private currentIntakeMl: number = 0;
  private dailyGoalMl: number = 3000;
  private testWindowExpiresAt: number | null = null;
  private lastNotificationTimestamp: number | null = null;
  private triggeredSlotsToday: Set<string> = new Set();

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private loadSettings() {
    try {
      const savedEnabled = localStorage.getItem('hidrago_notifications_enabled');
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }
      const savedGoal = localStorage.getItem('hidrago_daily_goal');
      if (savedGoal) {
        this.dailyGoalMl = parseInt(savedGoal, 10) || 3000;
      }
      const savedLastNotif = localStorage.getItem('hidrago_last_notif_time');
      if (savedLastNotif) {
        this.lastNotificationTimestamp = parseInt(savedLastNotif, 10) || null;
      }
      const savedTriggered = localStorage.getItem('hidrago_triggered_slots_today');
      if (savedTriggered) {
        const parsed = JSON.parse(savedTriggered);
        if (Array.isArray(parsed)) {
          this.triggeredSlotsToday = new Set(parsed);
        }
      }
    } catch {
      // Ignore storage errors in sandboxed contexts
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('hidrago_notifications_enabled', String(this.enabled));
      localStorage.setItem('hidrago_daily_goal', String(this.dailyGoalMl));
      if (this.lastNotificationTimestamp) {
        localStorage.setItem('hidrago_last_notif_time', String(this.lastNotificationTimestamp));
      }
      localStorage.setItem(
        'hidrago_triggered_slots_today',
        JSON.stringify(Array.from(this.triggeredSlotsToday))
      );
    } catch {
      // Ignore
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
        console.warn('[HidraGo SW] Service worker registration failed:', err);
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
    // Send current status immediately
    callback(this.getWindowStatus());
    return () => this.windowListeners.delete(callback);
  }

  private notifyWindowChanged() {
    const status = this.getWindowStatus();
    this.windowListeners.forEach((listener) => listener(status));
  }

  // Update user water intake and daily goal (synced from App state)
  public updateUserState(currentIntakeMl: number, dailyGoalMl: number = 3000) {
    const prevGoalMet = this.isGoalReached();
    this.currentIntakeMl = currentIntakeMl;
    this.dailyGoalMl = dailyGoalMl;
    this.saveSettings();

    // If goal status changed, notify listeners
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

  // Calculate current notification window status for photo capture
  public getWindowStatus(): NotificationWindowStatus {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const isGoalMet = this.isGoalReached();
    const isTestMode =
      this.testWindowExpiresAt !== null && Date.now() < this.testWindowExpiresAt;

    // Check recent notification within last 30 minutes
    const isRecentNotifWindow =
      this.lastNotificationTimestamp !== null &&
      Date.now() - this.lastNotificationTimestamp < 30 * 60 * 1000;

    let activeSlot: DailyNotificationSlot | null = null;
    let minutesRemainingInActiveWindow = 0;

    if (isTestMode && this.testWindowExpiresAt) {
      minutesRemainingInActiveWindow = Math.max(
        1,
        Math.ceil((this.testWindowExpiresAt - Date.now()) / (60 * 1000))
      );
      activeSlot = {
        id: 'slot-test',
        time: 'Agora',
        hours: currentHours,
        minutes: currentMinutes,
        targetMl: 500,
        doseNumber: Math.min(6, Math.floor(this.currentIntakeMl / 500) + 1),
        title: '⚡ Janela de Notificação Simulada (500 ml)',
        body: 'Janela de teste ativada para você registrar a foto agora!',
      };
    } else if (isRecentNotifWindow && this.lastNotificationTimestamp) {
      const remainingMs = 30 * 60 * 1000 - (Date.now() - this.lastNotificationTimestamp);
      minutesRemainingInActiveWindow = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      activeSlot = {
        id: 'slot-recent',
        time: 'Recente',
        hours: currentHours,
        minutes: currentMinutes,
        targetMl: 500,
        doseNumber: Math.min(6, Math.floor(this.currentIntakeMl / 500) + 1),
        title: '💧 Janela de Notificação Ativa (500 ml)',
        body: 'Notificação recebida recentemente. Janela de foto aberta!',
      };
    } else {
      // Check if current time falls within any of the 6 scheduled slots
      for (const slot of DAILY_NOTIFICATION_SLOTS) {
        const slotTotalMinutes = slot.hours * 60 + slot.minutes;
        if (
          currentTotalMinutes >= slotTotalMinutes &&
          currentTotalMinutes < slotTotalMinutes + WINDOW_DURATION_MINUTES
        ) {
          activeSlot = slot;
          minutesRemainingInActiveWindow =
            slotTotalMinutes + WINDOW_DURATION_MINUTES - currentTotalMinutes;
          break;
        }
      }
    }

    // Find the next upcoming scheduled slot
    let nextSlot: DailyNotificationSlot | null = null;
    let minutesUntilNext = Infinity;

    for (const slot of DAILY_NOTIFICATION_SLOTS) {
      const slotTotalMinutes = slot.hours * 60 + slot.minutes;
      if (slotTotalMinutes > currentTotalMinutes) {
        const diff = slotTotalMinutes - currentTotalMinutes;
        if (diff < minutesUntilNext) {
          minutesUntilNext = diff;
          nextSlot = slot;
        }
      }
    }

    // If all slots passed today, the next one is 08:00 tomorrow
    if (!nextSlot) {
      nextSlot = DAILY_NOTIFICATION_SLOTS[0];
      const tomorrowTotal = 24 * 60 - currentTotalMinutes + (nextSlot.hours * 60 + nextSlot.minutes);
      minutesUntilNext = tomorrowTotal;
    }

    // Build status list for all 6 slots
    const slots = DAILY_NOTIFICATION_SLOTS.map((slot) => {
      const slotTotalMinutes = slot.hours * 60 + slot.minutes;
      let status: 'completed' | 'active' | 'upcoming' | 'missed' = 'upcoming';

      // If user drank enough water for this dose
      const doseRequirement = slot.doseNumber * 500;
      if (this.currentIntakeMl >= doseRequirement) {
        status = 'completed';
      } else if (
        currentTotalMinutes >= slotTotalMinutes &&
        currentTotalMinutes < slotTotalMinutes + WINDOW_DURATION_MINUTES
      ) {
        status = 'active';
      } else if (currentTotalMinutes >= slotTotalMinutes + WINDOW_DURATION_MINUTES) {
        status = 'missed';
      } else {
        status = 'upcoming';
      }

      return { slot, status };
    });

    const isOpen = activeSlot !== null;

    return {
      isOpen,
      activeSlot,
      nextSlot,
      minutesUntilNext,
      minutesRemainingInActiveWindow,
      isGoalMet,
      isTestMode,
      currentIntakeMl: this.currentIntakeMl,
      dailyGoalMl: this.dailyGoalMl,
      slots,
    };
  }

  // Open a temporary testing window so the user/evaluator can register a photo anytime
  public openTestWindow(minutes: number = 30) {
    this.testWindowExpiresAt = Date.now() + minutes * 60 * 1000;
    this.notifyWindowChanged();
  }

  public closeTestWindow() {
    this.testWindowExpiresAt = null;
    this.notifyWindowChanged();
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
    if (isAutomatedSchedule && this.isGoalReached()) {
      console.log(
        `[HidraGo Notifications] Meta diária de ${this.dailyGoalMl} ml já foi batida (${this.currentIntakeMl} ml)! Notificação automática suprimida.`
      );
      return false;
    }

    // Record notification timestamp and unlock photo window
    this.lastNotificationTimestamp = Date.now();
    this.saveSettings();
    this.notifyWindowChanged();

    // 1. Play audio chime
    try {
      sounds.playWaterDrop();
    } catch {
      // safe
    }

    // 2. Trigger In-App visual toast
    const inAppItem: InAppNotification = {
      id: 'notif-' + Date.now(),
      title,
      body,
      icon,
      timestamp: new Date(),
      actionText: actionText || '📸 Registrar Foto Agora',
      onAction:
        onAction ||
        (() => {
          window.dispatchEvent(new CustomEvent('hidrago:open_camera'));
        }),
    };
    this.inAppListeners.forEach((listener) => listener(inAppItem));

    // 3. Try OS Native Push Notification
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
          new Notification(title, {
            body,
            icon,
            tag,
          });
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

    // Check scheduled slots every 30 seconds
    this.reminderTimerId = window.setInterval(() => {
      if (!this.enabled) return;

      // RULE: Do not notify if daily goal is already met
      if (this.isGoalReached()) {
        return;
      }

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      // Check each of the 6 daily slots
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
              actionText: '📸 Abrir Câmera (500 ml)',
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

  // Trigger test notification (also opens the photo window so the user can test the camera)
  public triggerTestNotification() {
    this.openTestWindow(30);

    const goalMetText = this.isGoalReached()
      ? ' (Nota: Sua meta diária de 3.000 ml já está concluída hoje!)'
      : '';

    return this.sendPushNotification({
      title: '💧 Notificação de Hidratação HidraGo (Teste)',
      body: `Hora da dose de 500 ml! A janela de registro por fotos foi aberta por 30 minutos.${goalMetText}`,
      tag: 'test-notification',
      actionText: '📸 Registrar Foto Agora',
      onAction: () => {
        window.dispatchEvent(new CustomEvent('hidrago:open_camera'));
      },
    });
  }
}

export const notifications = new NotificationManager();
