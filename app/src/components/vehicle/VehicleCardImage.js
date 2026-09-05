import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getVehicleImageUrl } from '../../utils/vehicleImageService';

export default function VehicleCardImage({
  car,
  style,
  height = 120,
  resizeMode = 'cover',
  compact = false,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setHasError(false);

    getVehicleImageUrl(car)
      .then((url) => {
        if (isMounted) {
          if (url && typeof url === 'string' && url.startsWith('http')) {
            setImageUrl(url);
          } else {
            setHasError(true);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [car?.id, car?.make, car?.model, car?.imageUrl]);

  return (
    <View style={[styles.container, { height }, style]}>
      {loading && (
        <View style={[styles.loadingContainer, compact && { backgroundColor: 'rgba(15, 23, 42, 0.4)' }]}>
          <ActivityIndicator size={compact ? 'small' : 'small'} color="#D0142C" />
        </View>
      )}

      {imageUrl && !hasError ? (
        <Image
          source={{
            uri: imageUrl,
            headers: {
              'User-Agent': 'NGKApp/1.0 (https://ngkntk.co.za; tech@ngkntk.co.za)',
            },
          }}
          style={[styles.image, loading && { opacity: 0 }]}
          resizeMode={resizeMode}
          onLoadEnd={() => setLoading(false)}
          onError={() => setHasError(true)}
        />
      ) : (
        <View style={[styles.fallbackContainer, compact && { backgroundColor: '#1E293B' }]}>
          <Image
            source={require('../../assets/images/demonstration_car_fallback.png')}
            style={[styles.fallbackImage, compact && { width: '85%', height: '80%' }]}
            resizeMode="contain"
          />
          {!compact && (
            <View style={styles.fallbackBadge}>
              <Text style={styles.fallbackBadgeText}>Demonstration Vehicle</Text>
            </View>
          )}
        </View>
      )}

      {/* Subtle edge-to-edge shadow gradient for contrast (full size only) */}
      {!compact && <View style={styles.bottomShadowOverlay} pointerEvents="none" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    zIndex: 2,
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  fallbackImage: {
    width: '92%',
    height: '84%',
    alignSelf: 'center',
  },
  fallbackBadge: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fallbackBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomShadowOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
});
