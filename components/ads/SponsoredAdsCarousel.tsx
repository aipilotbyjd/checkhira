import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  Linking,
  Platform,
  ImageBackground,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define the sponsored ad item interface
export interface SponsoredAd {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  targetUrl: string;
  sponsorName?: string;
  sponsorLogo?: string;
  ctaText?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface SponsoredAdsCarouselProps {
  ads: SponsoredAd[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: number;
  onAdPress?: (ad: SponsoredAd) => void;
  showIndicator?: boolean;
  containerStyle?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SponsoredAdsCarousel: React.FC<SponsoredAdsCarouselProps> = ({
  ads,
  autoPlay = true,
  autoPlayInterval = 5000,
  height = 180,
  onAdPress,
  showIndicator = true,
  containerStyle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto-play functionality
  useEffect(() => {
    if (autoPlay && ads.length > 1) {
      startAutoPlay();
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, ads.length, currentIndex]);

  const startAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    autoPlayTimerRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % ads.length;
      scrollToIndex(nextIndex);
    }, autoPlayInterval);
  };

  const scrollToIndex = (index: number) => {
    if (flatListRef.current && index >= 0 && index < ads.length) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  const handleAdPress = (ad: SponsoredAd) => {
    if (onAdPress) {
      onAdPress(ad);
    } else {
      // Default behavior: open the target URL
      Linking.openURL(ad.targetUrl).catch((err) =>
        console.error('Error opening sponsored ad URL:', err)
      );
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(newIndex);
  };

  const renderItem = ({ item }: { item: SponsoredAd }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.adItem, { width: SCREEN_WIDTH, height }]}
      onPress={() => handleAdPress(item)}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.adImage}
        imageStyle={{ borderRadius: 12 }}
        resizeMode="cover"
      >
        {/* Gradient overlay for better text visibility */}
        <View style={styles.gradientOverlay}>
          {/* Sponsor logo and name */}
          <View style={styles.sponsorContainer}>
            {item.sponsorLogo ? (
              <Image
                source={{ uri: item.sponsorLogo }}
                style={styles.sponsorLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.sponsorBadge, { backgroundColor: item.backgroundColor || COLORS.primary }]}>
                <MaterialCommunityIcons name="star" size={12} color="#FFFFFF" />
              </View>
            )}
            {item.sponsorName && (
              <Text style={styles.sponsorName}>
                {item.sponsorName}
              </Text>
            )}
            <View style={styles.sponsoredBadge}>
              <Text style={styles.sponsoredText}>Sponsored</Text>
            </View>
          </View>

          {/* Ad content */}
          <View style={styles.adContent}>
            <Text style={styles.adTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={styles.adDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: item.backgroundColor || COLORS.primary }]}
              onPress={() => handleAdPress(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaText}>
                {item.ctaText || 'Learn More'}
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderDotIndicator = () => {
    if (!showIndicator || ads.length <= 1) return null;

    return (
      <View style={styles.indicatorContainer}>
        {ads.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: currentIndex === index ? COLORS.primary : COLORS.gray[400],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        ref={flatListRef}
        data={ads}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />
      {renderDotIndicator()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  adItem: {
    position: 'relative',
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  adImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  sponsorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sponsorLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  sponsorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sponsorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sponsoredBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sponsoredText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  adContent: {
    marginTop: 'auto',
  },
  adTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  adDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
