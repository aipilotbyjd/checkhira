import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  ImageBackground,
  SafeAreaView,
  ViewStyle,
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
  onRefresh?: () => void;
  showIndicator?: boolean;
  showRefreshButton?: boolean;
  containerStyle?: ViewStyle;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate the actual item width to ensure it fits within the screen
const ITEM_WIDTH = SCREEN_WIDTH - 32; // 16px padding on each side
const ITEM_SPACING = 8;

export const SponsoredAdsCarousel: React.FC<SponsoredAdsCarouselProps> = ({
  ads,
  autoPlay = true,
  autoPlayInterval = 5000,
  height = 180,
  onAdPress,
  onRefresh,
  showIndicator = true,
  showRefreshButton = true,
  containerStyle,
}) => {
  // For the extended data array, we start at index 1 (after the duplicated last item)
  const [currentIndex, setCurrentIndex] = useState(1);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Create a modified array with duplicated items for true infinite loop effect
  const getExtendedData = useCallback(() => {
    if (!ads || ads.length === 0) return [];
    if (ads.length === 1) return [...ads];

    // For proper infinite looping, we duplicate the first item at the end
    // and the last item at the beginning to create a seamless transition
    // This creates a structure like: [lastItem, ...originalItems, firstItem]
    // We need to modify the ids to make them unique to avoid React key warnings
    const lastItem = { ...ads[ads.length - 1], id: `${ads[ads.length - 1].id}_clone_start` };
    const firstItem = { ...ads[0], id: `${ads[0].id}_clone_end` };

    return [lastItem, ...ads, firstItem];
  }, [ads]);

  const extendedData = getExtendedData();

  // This function is used for direct navigation (e.g., from dot indicators)
  // and is called from the handleDotPress function
  const scrollToIndex = useCallback((index: number) => {
    if (flatListRef.current) {
      // Convert the real index to the extended data index (add 1 because of the duplicated last item at the start)
      const extendedIndex = index + 1;

      // Scroll to the specified index with animation
      flatListRef.current.scrollToIndex({
        index: extendedIndex,
        animated: true,
        viewPosition: 0.5,
      });

      // Update the current index state
      setCurrentIndex(extendedIndex);
    }
  }, []);

  // Initialize the carousel at the correct position
  useEffect(() => {
    // Small delay to ensure the FlatList is properly rendered
    const timer = setTimeout(() => {
      if (ads.length > 1) {
        // Start at the first real item (index 0 in the original array)
        // This will be converted to index 1 in the extended array by scrollToIndex
        scrollToIndex(0);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [ads.length, scrollToIndex]);

  // Handle auto-play functionality with improved looping
  useEffect(() => {
    if (autoPlay && ads.length > 1) {
      startAutoPlay();
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, ads.length, currentIndex, extendedData.length]);

  const startAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    autoPlayTimerRef.current = setInterval(() => {
      if (ads.length <= 1) return;

      // Calculate the next index in the extended data array
      let nextIndex = currentIndex + 1;

      // If we're at the duplicated first item at the end, loop back to the real first item
      if (nextIndex >= extendedData.length) {
        // First scroll to the duplicated first item with animation
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: extendedData.length - 1,
            animated: true,
          });

          // Then after a short delay, jump to the real first item without animation
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({
                index: 1,
                animated: false,
              });
            }
            setCurrentIndex(1);
          }, 100);
        }
      } else {
        // Normal progression - just scroll to the next item
        // Convert from extended index to real index (subtract 1)
        const realIndex = nextIndex - 1;
        scrollToIndex(realIndex);
      }
    }, autoPlayInterval);
  };

  const handleAdPress = (ad: SponsoredAd) => {
    // Pause autoplay when ad is pressed
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    if (onAdPress) {
      onAdPress(ad);
    } else {
      // Default behavior: open the target URL
      Linking.openURL(ad.targetUrl).catch((err) =>
        console.error('Error opening sponsored ad URL:', err)
      );
    }

    // Resume autoplay after a short delay
    setTimeout(() => {
      if (autoPlay && ads.length > 1) {
        startAutoPlay();
      }
    }, 1000);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const slideWidth = ITEM_WIDTH + ITEM_SPACING * 2;
    const newIndex = Math.round(contentOffsetX / slideWidth);

    // Handle infinite looping for manual scrolling
    if (newIndex === 0) {
      // We scrolled to the duplicated last item (at position 0)
      // Jump to the actual last item without animation
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: ads.length,
            animated: false,
          });
        }
        setCurrentIndex(ads.length);
      }, 10);
    } else if (newIndex === extendedData.length - 1) {
      // We scrolled to the duplicated first item (at the end)
      // Jump to the actual first item without animation
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: 1,
            animated: false,
          });
        }
        setCurrentIndex(1);
      }, 10);
    } else {
      // Normal scrolling within the bounds
      setCurrentIndex(newIndex);
    }

    // Restart autoplay after manual scrolling
    if (autoPlay && ads.length > 1) {
      startAutoPlay();
    }
  };

  const renderItem = ({ item }: { item: SponsoredAd; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.adItem,
        {
          width: ITEM_WIDTH,
          height,
          marginHorizontal: ITEM_SPACING,
        }
      ]}
      onPress={() => handleAdPress(item)}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.adImage}
        imageStyle={styles.adImageStyle}
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
              <Text style={styles.sponsorName} numberOfLines={1}>
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

  // Handle dot indicator press to navigate directly to a specific ad
  const handleDotPress = (index: number) => {
    // Pause autoplay temporarily
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    // Use the scrollToIndex function to navigate to the selected ad
    scrollToIndex(index);

    // Restart autoplay after a short delay
    setTimeout(() => {
      if (autoPlay && ads.length > 1) {
        startAutoPlay();
      }
    }, 500);
  };

  // Handle refresh button press
  const handleRefreshPress = () => {
    // Pause autoplay temporarily
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    // Call the onRefresh callback if provided
    if (onRefresh) {
      onRefresh();
    }

    // Restart autoplay after a short delay
    setTimeout(() => {
      if (autoPlay && ads.length > 1) {
        startAutoPlay();
      }
    }, 500);
  };

  const renderDotIndicator = () => {
    if (!showIndicator || ads.length <= 1) return null;

    return (
      <View style={styles.indicatorContainer}>
        {/* Refresh button */}
        {showRefreshButton && onRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="refresh" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {ads.map((_, index) => {
            // Calculate the slide width including margins
            const slideWidth = ITEM_WIDTH + ITEM_SPACING * 2;

            // Adjust the input range for the extended data array
            // We need to offset by 1 because of the duplicated last item at the start
            const adjustedIndex = index + 1;

            const inputRange = [
              (adjustedIndex - 1) * slideWidth,
              adjustedIndex * slideWidth,
              (adjustedIndex + 1) * slideWidth,
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

            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: [
                COLORS.gray[400],
                COLORS.primary,
                COLORS.gray[400],
              ],
              extrapolate: 'clamp',
            });

            return (
              <TouchableOpacity
                key={`dot-${index}`}
                onPress={() => handleDotPress(index)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.safeContainer, containerStyle]}>
      <View style={styles.container}>
        {/*
          FlatList with auto-looping functionality:
          - Automatically scrolls through all items
          - When reaching the end, loops back to the first item
          - Supports both auto-play and manual scrolling
        */}
        <FlatList
          ref={flatListRef}
          data={extendedData}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          keyExtractor={(item) => item.id} // Each item has a unique ID, including cloned items
          scrollEventThrottle={16}
          snapToInterval={ITEM_WIDTH + ITEM_SPACING * 2}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.listContent}
          initialScrollIndex={1} // Start at index 1 (after the duplicated last item)
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH + ITEM_SPACING * 2,
            offset: (ITEM_WIDTH + ITEM_SPACING * 2) * index,
            index,
          })}
        />
        {renderDotIndicator()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    width: '100%',
  },
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 8,
  },
  adItem: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    backgroundColor: '#fff',
  },
  adImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  adImageStyle: {
    borderRadius: 16,
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sponsorBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sponsorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sponsoredBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
    bottom: 16,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButton: {
    position: 'absolute',
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    zIndex: 10,
  },
});
