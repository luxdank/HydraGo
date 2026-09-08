import { useState, useEffect } from 'react';
import { ScreenType, UserProfile, Challenge, RewardItem } from './types';
import {
  INITIAL_USER,
  MOCK_CHALLENGES,
  MOCK_REWARDS,
  MOCK_PARTNERS,
  ASSETS,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NotificationModal } from './components/NotificationModal';
import { InAppNotificationToast } from './components/InAppNotificationToast';
import { notifications } from './utils/notifications';
import { SplashScreen } from './components/screens/SplashScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { RegisterPhoto1Screen } from './components/screens/RegisterPhoto1Screen';
import { RegisterPhoto2Screen } from './components/screens/RegisterPhoto2Screen';
import { ValidationScreen } from './components/screens/ValidationScreen';
import { LevelUpScreen } from './components/screens/LevelUpScreen';
import { ChallengesScreen } from './components/screens/ChallengesScreen';
import { RewardsScreen } from './components/screens/RewardsScreen';
import { PartnersScreen } from './components/screens/PartnersScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { sounds } from './utils/audio';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
  const [rewards, setRewards] = useState<RewardItem[]>(MOCK_REWARDS);
  const [partners] = useState(MOCK_PARTNERS);

  const [photo1Url, setPhoto1Url] = useState<string>(ASSETS.bottleFull);
  const [isMobileFrame] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // Listen for push notification quick drink and camera actions
  useEffect(() => {
    const handleQuickDrink = (e: Event) => {
      const customEvent = e as CustomEvent<{ amount: number }>;
      const amount = customEvent.detail?.amount || 250;
      handleQuickAddWater(amount);
    };

    const handleOpenCamera = () => {
      setCurrentScreen('register_photo_1');
    };

    window.addEventListener('hidrago:quick_drink', handleQuickDrink);
    window.addEventListener('hidrago:open_camera', handleOpenCamera);
    return () => {
      window.removeEventListener('hidrago:quick_drink', handleQuickDrink);
      window.removeEventListener('hidrago:open_camera', handleOpenCamera);
    };
  }, []);

  // Sync user intake and daily goal (3000 ml) with notifications engine
  useEffect(() => {
    notifications.updateUserState(user.currentIntakeMl, user.dailyGoalMl);
  }, [user.currentIntakeMl, user.dailyGoalMl]);

  // Reset application to fresh new user state
  const handleResetApp = () => {
    setUser(INITIAL_USER);
    setChallenges(MOCK_CHALLENGES);
    setRewards(MOCK_REWARDS);
    setCurrentScreen('splash');
  };

  // Handle user registration / login with Name, Age, Email
  const handleLogin = (data: { name: string; age: number; email: string }) => {
    setUser((prev) => {
      return {
        ...prev,
        name: data.name,
        age: data.age,
        email: data.email,
        dailyGoalMl: 3000,
      };
    });
    setCurrentScreen('home');
  };

  // Quick hydration logging
  const handleQuickAddWater = (amountMl: number) => {
    sounds.playWaterDrop();
    setUser((prev) => {
      const newIntake = prev.currentIntakeMl + amountMl;
      const newXp = prev.currentXp + Math.round(amountMl / 10);
      const newPoints = prev.points + Math.round(amountMl / 10);

      // Check level-up milestone
      if (newXp >= prev.maxXp) {
        setTimeout(() => {
          setCurrentScreen('level_up');
        }, 500);
      }

      return {
        ...prev,
        currentIntakeMl: newIntake,
        currentXp: newXp,
        points: newPoints,
      };
    });
  };

  // Complete photo validation
  const handleCompletePhotoFlow = () => {
    setUser((prev) => {
      const addedMl = prev.defaultBottleMl;
      const newIntake = prev.currentIntakeMl + addedMl;
      const newXp = prev.currentXp + 50;
      const newPoints = prev.points + 50;
      return {
        ...prev,
        currentIntakeMl: newIntake,
        currentXp: newXp,
        points: newPoints,
      };
    });
    setCurrentScreen('validation');
  };

  // Redeem rewards
  const handleRedeemReward = (reward: RewardItem, newPoints: number) => {
    setUser((prev) => ({
      ...prev,
      points: newPoints,
      savedCoupons: prev.savedCoupons + 1,
    }));
    // mark reward as claimed or update rewards state
    setRewards((prev) =>
      prev.map((r) => (r.id === reward.id ? { ...r, badge: 'Resgatado' } : r))
    );
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const weeklyChallenge = challenges.find((c) => c.category === 'semanal') || challenges[0];

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#eef2f8] text-[#111b2f] font-sans antialiased w-full">
      {/* Main Workspace Frame */}
      <div className="flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-x-hidden w-full">
        <div
          className={`w-full transition-all duration-300 ${
            isMobileFrame
              ? 'max-w-[430px] w-full min-h-[100dvh] sm:min-h-[844px] sm:max-h-[920px] sm:rounded-[44px] sm:shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:border-[8px] sm:border-slate-800 bg-white relative flex flex-col overflow-x-hidden'
              : 'max-w-2xl w-full min-h-[100dvh] bg-white shadow-xl flex flex-col overflow-x-hidden'
          }`}
        >
          {/* Smartphone Speaker & Dynamic Island simulation when in frame */}
          {isMobileFrame && (
            <div className="hidden sm:flex items-center justify-center pt-2 pb-1 bg-white relative z-50">
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ccf9]/70 animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Conditional Header (hidden on splash, login & camera viewfinder screens) */}
          {currentScreen !== 'splash' &&
            currentScreen !== 'login' &&
            currentScreen !== 'register_photo_1' &&
            currentScreen !== 'register_photo_2' &&
            currentScreen !== 'validation' &&
            currentScreen !== 'level_up' && (
              <Header
                currentScreen={currentScreen}
                user={user}
                onNavigate={setCurrentScreen}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(sounds.toggleSound())}
                onOpenNotifications={() => setIsNotificationModalOpen(true)}
              />
            )}

          {/* Active Screen View */}
          <main className="flex-1 flex flex-col w-full relative">
            {currentScreen === 'splash' && (
              <SplashScreen
                onStart={() => setCurrentScreen('login')}
                onNavigate={setCurrentScreen}
              />
            )}

            {currentScreen === 'login' && (
              <LoginScreen
                initialName={user.name}
                initialAge={user.age}
                initialEmail={user.email}
                onLogin={handleLogin}
                onBackToSplash={() => setCurrentScreen('splash')}
              />
            )}

            {currentScreen === 'home' && (
              <HomeScreen
                user={user}
                weeklyChallenge={weeklyChallenge}
                onNavigate={setCurrentScreen}
                onQuickAddWater={handleQuickAddWater}
                onOpenNotifications={() => setIsNotificationModalOpen(true)}
              />
            )}

            {currentScreen === 'register_photo_1' && (
              <RegisterPhoto1Screen
                onBack={() => setCurrentScreen('home')}
                onNext={(p1) => {
                  setPhoto1Url(p1);
                  setCurrentScreen('register_photo_2');
                }}
              />
            )}

            {currentScreen === 'register_photo_2' && (
              <RegisterPhoto2Screen
                photo1Url={photo1Url}
                onBack={() => setCurrentScreen('register_photo_1')}
                onComplete={() => {
                  handleCompletePhotoFlow();
                }}
              />
            )}

            {currentScreen === 'validation' && (
              <ValidationScreen
                amountMl={user.defaultBottleMl}
                onContinue={() => {
                  // After validation, show celebratory level up or return to home
                  if (user.currentXp >= 1300) {
                    setCurrentScreen('level_up');
                  } else {
                    setCurrentScreen('home');
                  }
                }}
              />
            )}

            {currentScreen === 'level_up' && (
              <LevelUpScreen
                level={user.level}
                levelTitle={user.levelTitle}
                onViewRewards={() => setCurrentScreen('rewards')}
                onClose={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'challenges' && (
              <ChallengesScreen
                challenges={challenges}
                streakDays={user.streakDays}
                onNavigate={setCurrentScreen}
              />
            )}

            {currentScreen === 'rewards' && (
              <RewardsScreen
                user={user}
                rewards={rewards}
                onRedeemReward={handleRedeemReward}
              />
            )}

            {currentScreen === 'partners' && <PartnersScreen partners={partners} />}

            {currentScreen === 'profile' && (
              <ProfileScreen
                user={user}
                onUpdateUser={handleUpdateUser}
                onNavigate={setCurrentScreen}
                onLogout={handleResetApp}
                onOpenNotifications={() => setIsNotificationModalOpen(true)}
              />
            )}
          </main>

          {/* Bottom Navigation Dock */}
          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />

          {/* Push Notification Modal & In-App Toast */}
          <NotificationModal
            isOpen={isNotificationModalOpen}
            onClose={() => setIsNotificationModalOpen(false)}
            onQuickAddWater={handleQuickAddWater}
            onNavigateToCamera={() => {
              setIsNotificationModalOpen(false);
              setCurrentScreen('register_photo_1');
            }}
          />
          <InAppNotificationToast />
        </div>
      </div>
    </div>
  );
}
