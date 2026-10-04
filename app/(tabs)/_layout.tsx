import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '../../src/navigation/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={props => <TabBar state={props.state} navigation={props.navigation} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="subscriptions" />
      <Tabs.Screen name="trials" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
