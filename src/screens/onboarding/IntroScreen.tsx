import React, { useRef, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { BellRing, PiggyBank, Radar } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { NeuButton } from '../../components/neu/NeuButton';
import { NeuSurface } from '../../components/neu/NeuSurface';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: Radar,
    title: 'Track every subscription.',
    body: 'Add what you pay for in under 20 seconds. Works offline. No login needed.',
  },
  {
    icon: BellRing,
    title: 'Never miss a renewal.',
    body: "Get reminders before you're charged, with enough time to cancel if you want.",
  },
  {
    icon: PiggyBank,
    title: "Never pay by surprise.",
    body: 'See trials, price changes and your monthly total at a glance, in one place.',
  },
];

export default function IntroScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler(e => {
    scrollX.value = e.contentOffset.x;
  });

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      goTo(index + 1);
      setIndex(index + 1);
    } else {
      router.replace('/setup');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16 }}>
        <NeuButton kind="ghost" label="Skip" onPress={() => router.replace('/setup')} />
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={e => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
      >
        {SLIDES.map((slide, i) => {
          const Icon = slide.icon;
          return (
            <View key={i} style={{ width, flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
              <SlideIcon Icon={Icon} index={i} scrollX={scrollX} />
              <Text
                style={{
                  marginTop: 36,
                  fontSize: 30,
                  lineHeight: 36,
                  fontWeight: '700',
                  color: theme.ink,
                  letterSpacing: -0.4,
                }}
              >
                {slide.title}
              </Text>
              <Text style={{ marginTop: 14, fontSize: 16, lineHeight: 24, color: theme.ink2 }}>
                {slide.body}
              </Text>
            </View>
          );
        })}
      </Animated.ScrollView>

      <View style={{ paddingHorizontal: 32, paddingBottom: insets.bottom + 24, gap: 28 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <Dot key={i} active={i === index} />
          ))}
        </View>
        <NeuButton kind="primary" label={index === SLIDES.length - 1 ? 'Get started' : 'Next'} onPress={next} fullWidth />
      </View>
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const { theme } = useAppTheme();
  const style = useAnimatedStyle(() => ({
    width: active ? 22 : 7,
    backgroundColor: active ? theme.accent : theme.mode === 'light' ? '#C9D0DA' : '#333A47',
  }));
  return <Animated.View style={[{ height: 7, borderRadius: 4 }, style]} />;
}

function SlideIcon({ Icon, index, scrollX }: { Icon: any; index: number; scrollX: SharedValue<number> }) {
  const { theme } = useAppTheme();
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = interpolate(scrollX.value, input, [0.75, 1, 0.75], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, input, [0.4, 1, 0.4], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });
  return (
    <Animated.View style={[{ alignSelf: 'flex-start' }, style]}>
      <NeuSurface variant="raised" radius={28} distance={8}>
        <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={40} color={theme.accent} strokeWidth={1.6} />
        </View>
      </NeuSurface>
    </Animated.View>
  );
}
