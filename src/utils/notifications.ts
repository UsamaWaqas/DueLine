import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { formatMoney } from './currency';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let androidChannelReady = false;

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android' || androidChannelReady) return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  androidChannelReady = true;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (granted) await ensureAndroidChannel();
  return granted;
}

export async function notifyBudgetExceeded(monthlyTotal: number, monthlyBudget: number, currency: string) {
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You're over budget",
      body: `Spending ${formatMoney(monthlyTotal, currency)}/mo is over your ${formatMoney(monthlyBudget, currency)} limit.`,
    },
    trigger: null,
  });
}
