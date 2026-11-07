import { Redirect } from 'expo-router';
import { useSettingsStore } from '../src/store/useSettingsStore';

export default function Index() {
  const onboarded = useSettingsStore(s => s.onboarded);
  return <Redirect href={onboarded ? '/(tabs)' : '/intro'} />;
}
