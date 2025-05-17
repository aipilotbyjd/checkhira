import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { onboardingService } from '../../services/onboardingService';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedIllustration } from '../../components/AnimatedIllustration';
import { ModernButton } from '../../components/ModernButton';
import { ModernPagination } from '../../components/ModernPagination';

// Define slide type
interface Slide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageType: 'work' | 'payment' | 'offline' | 'analytics';
  gradientVariant: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
}

const { width, height } = Dimensions.get('window');

// Onboarding data
const slides: Slide[] = [
  {
    id: '1',
    title: 'Track Your Work',
    subtitle: 'Effortless Time Management',
    description: 'Log your daily activities with ease and gain insights into your productivity patterns. Never lose track of your billable hours again.',
    imageType: 'work',
    gradientVariant: 'primary',
  },
  {
    id: '2',
    title: 'Manage Payments',
    subtitle: 'Simplified Finances',
    description: 'Keep track of all your payments in one place. Get timely reminders for due payments and maintain a clear financial record.',
    imageType: 'payment',
    gradientVariant: 'secondary',
  },
  {
    id: '3',
    title: 'Work Offline',
    subtitle: 'Always Available',
    description: "No internet? No problem. Continue working seamlessly offline and your data will automatically sync when you're back online.",
    imageType: 'offline',
    gradientVariant: 'tertiary',
  },
  {
    id: '4',
    title: 'Insightful Analytics',
    subtitle: 'Data-Driven Decisions',
    description: 'Gain valuable insights with detailed analytics. Understand your work patterns and make informed decisions to boost your productivity.',
    imageType: 'analytics',
    gradientVariant: 'quaternary',
  },
];

// Onboarding slide component
const OnboardingSlide = ({ item, index, scrollX }: {
  item: Slide,
  index: number,
  scrollX: Animated.Value
}) => {
  // Calculate animations based on scroll position
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // Image scale animation - using less dramatic values to avoid performance issues
  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  // Text opacity animation
  const textOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });

  // Text translateY animation - using smaller values for better performance
  const textTranslateY = scrollX.interpolate({
    inputRange,
    outputRange: [10, 0, 10],
    extrapolate: 'clamp',
  });

  // Background opacity animation
  const backgroundOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.slide, { width }]}>
      <GradientBackground
        variant={item.gradientVariant}
        style={{ opacity: backgroundOpacity }}
      >
        <View style={styles.slideContent}>
          <Animated.View
            style={[
              styles.imageContainer,
              { transform: [{ scale: imageScale }] }
            ]}
          >
            <AnimatedIllustration
              type={item.imageType}
              size={width * 0.6}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }]
              }
            ]}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>
        </View>
      </GradientBackground>
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  // Check if onboarding is already complete
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const isComplete = await onboardingService.isOnboardingComplete();
      if (isComplete) {
        router.replace('/(tabs)');
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index: number) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index });
    }
  };

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    // Mark onboarding as complete in AsyncStorage
    await onboardingService.completeOnboarding();
    router.replace('/(tabs)');
  };

  // Use modern pagination component
  const renderPagination = () => {
    return (
      <ModernPagination
        data={slides}
        scrollX={scrollX}
        dotSize={10}
        dotSpacing={8}
        activeDotColor={COLORS.primary}
        inactiveDotColor={`${COLORS.primary}40`}
        style={styles.paginationContainer}
      />
    );
  };

  // Modern button for navigation
  const renderNavigationButton = () => {
    const isLastSlide = currentIndex === slides.length - 1;

    return (
      <ModernButton
        label={isLastSlide ? "Get Started" : "Next"}
        icon={isLastSlide ? "checkmark-circle" : "arrow-forward"}
        variant="primary"
        size="large"
        onPress={nextSlide}
        style={styles.navigationButton}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Header with Skip button */}
      <View style={styles.header}>
        {currentIndex > 0 ? (
          <ModernButton
            icon="arrow-back"
            variant="text"
            size="small"
            onPress={() => scrollTo(currentIndex - 1)}
            style={styles.backButton}
          />
        ) : (
          <View style={styles.backButton} />
        )}
        <ModernButton
          label="Skip"
          variant="text"
          size="small"
          onPress={finishOnboarding}
        />
      </View>

      {/* Slides */}
      <View style={styles.slidesContainer}>
        <FlatList
          data={slides}
          renderItem={({ item, index }: { item: Slide; index: number }) => (
            <OnboardingSlide
              item={item}
              index={index}
              scrollX={scrollX}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item: Slide) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          scrollEventThrottle={16}
        />
      </View>

      {/* Bottom navigation */}
      <View style={styles.bottomContainer}>
        {renderPagination()}
        {renderNavigationButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80, // Space for header
    paddingBottom: 100, // Space for bottom navigation
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: height * 0.4, // Ensure it doesn't take too much space on small devices
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
  },
  title: {
    fontWeight: 'bold',
    fontSize: Math.min(32, width * 0.08), // Responsive font size
    marginBottom: 8,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(20, width * 0.05), // Responsive font size
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: Math.min(16, width * 0.04), // Responsive font size
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    maxWidth: width * 0.85,
  },
  paginationContainer: {
    marginBottom: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  navigationButton: {
    marginTop: 20,
    minWidth: 180,
  },
});
