import React, { useState, useEffect, memo } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  getVehicleImageUrl,
  getCachedVehicleImageUrlSync,
  DEFAULT_VEHICLE_FALLBACK,
} from '../../utils/vehicleImageService';
import VehicleBlueprintFallback from './VehicleBlueprintFallback';

function VehicleCardImage({
  car,
  style,
  height = 120,
  resizeMode = 'cover',
  compact = false,
}) {
  const syncCachedUrl = getCachedVehicleImageUrlSync(car);
  const [imageUrl, setImageUrl] = useState(syncCachedUrl);
  const [loading, setLoading] = useState(!syncCachedUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const cached = getCachedVehicleImageUrlSync(car);
    if (cached) {
      setImageUrl(cached);
      setLoading(false);
      setHasError(false);
      return;
    }

    setLoading(true);
    setHasError(false);

    getVehicleImageUrl(car)
      .then((url) => {
        if (isMounted) {
          if (url && typeof url === 'string' && url.startsWith('http') && url !== DEFAULT_VEHICLE_FALLBACK) {
            setImageUrl(url);
          } else {
            // No real image — will render VehicleBlueprintFallback
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
  }, [car?.id, car?._id, car?.linkageTargetId, car?.make, car?.model, car?.imageUrl]);

  return (
    <View style={[styles.container, { height }, style]}>
      {loading && (
        <View style={[styles.loadingContainer, compact && { backgroundColor: 'rgba(15, 23, 42, 0.4)' }]}>
          <ActivityIndicator size="small" color={COLORS.primary} />
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
        <VehicleBlueprintFallback car={car} compact={compact} height={height} />
      )}

      {/* Subtle edge-to-edge shadow gradient for contrast (full size only) */}
      {!compact && imageUrl && !hasError && <View style={styles.bottomShadowOverlay} pointerEvents="none" />}
    </View>
  );
}

export default memo(VehicleCardImage, (prevProps, nextProps) => {
  if (prevProps.height !== nextProps.height) return false;
  if (prevProps.resizeMode !== nextProps.resizeMode) return false;
  if (prevProps.compact !== nextProps.compact) return false;

  const prevCar = prevProps.car;
  const nextCar = nextProps.car;
  if (prevCar === nextCar) return true;
  if (!prevCar || !nextCar) return false;

  const prevId = String(prevCar.id || prevCar._id || prevCar.linkageTargetId || '');
  const nextId = String(nextCar.id || nextCar._id || nextCar.linkageTargetId || '');
  if (prevId !== nextId) return false;

  if (prevCar.make !== nextCar.make) return false;
  if (prevCar.model !== nextCar.model) return false;
  if (prevCar.imageUrl !== nextCar.imageUrl) return false;

  return true;
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.slate900,
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
    backgroundColor: COLORS.slate900,
    zIndex: 2,
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
