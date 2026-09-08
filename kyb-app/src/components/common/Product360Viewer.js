import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  PanResponder,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Maximize2 } from 'lucide-react-native';
import { articles360FramesApi } from '../../apis/api';
import { apiFunction } from '../../apis/apiFunction';
import PartSchematicFallback from '../parts/PartSchematicFallback';

// ---------------------------------------------------------------------------
// Global in-memory frame cache – survives component unmount/remount cycles.
// Key: gifUrl string  →  Value: string[] (already prefetched to disk cache)
// ---------------------------------------------------------------------------
export const globalFramesCache = new Map();

// Loading pipeline phases
const Phase = {
  IDLE:        'idle',        // isStatic or no gifUrl
  FETCHING:    'fetching',    // requesting frame URL list from backend
  PREFETCHING: 'prefetching', // Image.prefetch() downloading all frames
  READY:       'ready',       // all frames on disk — safe to display & spin
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Product360Viewer = ({
  isStatic = false,
  gifUrl,
  staticImageUrl,
  angle = 0,
  isAutoSpinning = false,
  zoomScale = 1,
  height = 360,
  containerStyle,
  onAngleChange,
  onAutoSpinChange,
  onScaleChange,
  onPressImage,
  onFramesReady,
  showTapHint = false,
  partName = '',
  brand = 'KYB',
  partNo = '',
}) => {
  // Seed from global cache (prefetched in a previous mount) — instant READY
  const seedFrames = (!isStatic && gifUrl && globalFramesCache.get(gifUrl)) || null;

  const [frames, setFrames] = useState(seedFrames || []);
  const [phase, setPhase]   = useState(
    seedFrames        ? Phase.READY
    : isStatic || !gifUrl ? Phase.IDLE
    : Phase.FETCHING
  );
  const [currentFrame, setCurrentFrame] = useState(0);

  // Pan, pitch, yaw & zoom animated values
  const pan         = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panOffset   = useRef({ x: 0, y: 0 });
  const scaleAnim   = useRef(new Animated.Value(zoomScale)).current;
  const pitchAnim   = useRef(new Animated.Value(0)).current;
  const pitchOffset = useRef(0);
  const yawAnim     = useRef(new Animated.Value(0)).current;
  const yawOffset   = useRef(0);

  // Gesture-state refs (no re-renders)
  const lastTapRef           = useRef(0);
  const startXRef            = useRef(0);
  const currentFrameRef      = useRef(0);
  const isAutoSpinningRef    = useRef(isAutoSpinning);
  const zoomScaleRef         = useRef(zoomScale);
  const framesCountRef       = useRef(1);
  const pinchStartDistRef    = useRef(0);
  const pinchStartScaleRef   = useRef(1);
  const touchStartTimeRef    = useRef(0);
  const autoSpinResumeTimerRef = useRef(null);
  const tapTimeoutRef        = useRef(null);

  // SNO 13-C: Track whether the user explicitly pressed Pause (vs touch-pause)
  // When true, the auto-resume timer after touch release will NOT re-enable spin.
  const userExplicitlyPausedRef = useRef(false);
  const prevAutoSpinRef         = useRef(isAutoSpinning);

  // SNO 13-A: Prevent 1-2s flicker — hide the animated frame layer until
  // at least one frame has been rendered by the <Image> component.
  const [firstFrameRendered, setFirstFrameRendered] = useState(
    // If we have seed frames from cache or in static mode, consider rendered
    isStatic || !!seedFrames
  );

  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [staticImageUrl, gifUrl]);

  useEffect(() => {
    return () => {
      if (autoSpinResumeTimerRef.current) clearTimeout(autoSpinResumeTimerRef.current);
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  // Reset firstFrameRendered when gifUrl changes
  useEffect(() => {
    if (!isStatic && gifUrl) {
      const cached = globalFramesCache.get(gifUrl);
      setFirstFrameRendered(!!cached);
    } else {
      setFirstFrameRendered(true);
    }
  }, [gifUrl, isStatic]);

  // Reset pan and offset when switching static image
  useEffect(() => {
    if (isStatic) {
      panOffset.current = { x: 0, y: 0 };
      pan.setValue({ x: 0, y: 0 });
    }
  }, [staticImageUrl, isStatic, pan]);

  currentFrameRef.current   = currentFrame;
  zoomScaleRef.current      = zoomScale;
  framesCountRef.current    = isStatic ? 1 : frames.length || 1;

  // SNO 13-C: Detect explicit user pause (isAutoSpinning went true → false)
  // vs touch-initiated pause (which is handled internally)
  useEffect(() => {
    if (prevAutoSpinRef.current === true && isAutoSpinning === false) {
      // Spin was explicitly stopped by the parent (user pressed Pause button)
      userExplicitlyPausedRef.current = true;
      // Clear any pending auto-resume timer
      if (autoSpinResumeTimerRef.current) {
        clearTimeout(autoSpinResumeTimerRef.current);
        autoSpinResumeTimerRef.current = null;
      }
    } else if (isAutoSpinning === true) {
      // User re-enabled spin — clear the explicit-pause flag
      userExplicitlyPausedRef.current = false;
    }
    prevAutoSpinRef.current = isAutoSpinning;
    isAutoSpinningRef.current = isAutoSpinning;
  }, [isAutoSpinning]);

  // ── Sync zoomScale prop → scaleAnim ────────────────────────────────────
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: zoomScale,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
    if (zoomScale <= 1.05) {
      panOffset.current = { x: 0, y: 0 };
      pitchOffset.current = 0;
      yawOffset.current = 0;
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        friction: 7,
      }).start();
      Animated.spring(pitchAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
      }).start();
      Animated.spring(yawAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
      }).start();
    }
  }, [zoomScale, scaleAnim, pan, pitchAnim, yawAnim]);

  // ── Reset pitch and yaw when angle resets to 0 at normal scale ─────────
  useEffect(() => {
    if (angle === 0 && zoomScale <= 1.05) {
      pitchOffset.current = 0;
      yawOffset.current = 0;
      Animated.spring(pitchAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
      }).start();
      Animated.spring(yawAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
      }).start();
    }
  }, [angle, zoomScale, pitchAnim, yawAnim]);

  // ── Main loading pipeline ───────────────────────────────────────────────
  useEffect(() => {
    let alive = true;

    if (isStatic || !gifUrl) {
      setPhase(Phase.IDLE);
      return;
    }

    // Cache hit → already prefetched, use instantly
    if (globalFramesCache.has(gifUrl)) {
      const cached = globalFramesCache.get(gifUrl);
      if (cached && cached.length > 0) {
        setFrames(cached);
        setCurrentFrame(0);
        setPhase(Phase.READY);
        requestAnimationFrame(() => { if (alive) onFramesReady?.(); });
        return;
      }
    }

    const run = async () => {
      // Step 1 ─ fetch frame list from backend
      setPhase(Phase.FETCHING);

      let list = null;
      try {
        const endpoint = `${articles360FramesApi}?gifUrl=${encodeURIComponent(gifUrl)}`;
        const res = await apiFunction(endpoint, [], {}, 'GET');
        list = res?.frames || res?.data?.frames || res?.data?.data?.frames;
      } catch (e) {
        console.warn('360 frames fetch error:', e);
      }

      if (!alive) return;
      if (!Array.isArray(list) || list.length === 0) {
        setPhase(Phase.IDLE);
        return;
      }

      // Step 2 ─ Only prefetch if URLs are remote HTTP/HTTPS (base64 data URIs are already in memory)
      const isHttp = typeof list[0] === 'string' && list[0].startsWith('http');
      if (isHttp) {
        setPhase(Phase.PREFETCHING);
        try {
          await Promise.all(
            list.map(async (url) => {
              try { await Image.prefetch(url); } catch (_) {}
            })
          );
        } catch (_) {}
      }

      if (!alive) return;

      // Step 3 ─ commit frames to state; auto-spin effect fires on next render
      globalFramesCache.set(gifUrl, list);
      setFrames(list);
      setCurrentFrame(0);
      setPhase(Phase.READY);
      requestAnimationFrame(() => { if (alive) onFramesReady?.(); });
    };

    run();
    return () => { alive = false; };
  }, [gifUrl, isStatic]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when source is cleared
  useEffect(() => {
    if (!gifUrl || isStatic) setPhase(isStatic || !gifUrl ? Phase.IDLE : Phase.FETCHING);
  }, [gifUrl, isStatic]);

  // ── Manual angle → frame sync ───────────────────────────────────────────
  useEffect(() => {
    if (isStatic || isAutoSpinning || frames.length <= 1) return;
    const total = frames.length;
    const norm  = ((Math.round(angle) % 360) + 360) % 360;
    setCurrentFrame(Math.round((norm / 360) * total) % total);
  }, [angle, isAutoSpinning, isStatic, frames.length]);

  // ── Auto-spin — Fires reliably whenever isAutoSpinning is true and multiple frames exist ───────
  useEffect(() => {
    if (isStatic || !isAutoSpinning || frames.length <= 1) return;
    const t = setInterval(() => setCurrentFrame(p => (p + 1) % frames.length), 95);
    return () => clearInterval(t);
  }, [isAutoSpinning, isStatic, frames.length]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getTouchDist = useCallback((touches) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // ── PanResponder ─────────────────────────────────────────────────────────
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onMoveShouldSetPanResponder: (evt, gs) => {
      // Always claim 2-finger pinch
      if (evt.nativeEvent.touches?.length === 2) return true;
      // Claim on any meaningful drag in any direction (X or Y)
      return Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3;
    },

    // Block parent ScrollView from hijacking touch during active interaction
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: (evt) => {
      touchStartTimeRef.current = Date.now();
      if (autoSpinResumeTimerRef.current) {
        clearTimeout(autoSpinResumeTimerRef.current);
        autoSpinResumeTimerRef.current = null;
      }
      // Pause auto-spin on touch
      if (!isStatic && isAutoSpinningRef.current) onAutoSpinChange?.(false);

      const t = evt.nativeEvent.touches;
      if (t?.length === 2) {
        pinchStartDistRef.current  = getTouchDist(t);
        pinchStartScaleRef.current = zoomScaleRef.current;
        return;
      }

      startXRef.current = currentFrameRef.current;

      // Double-tap → toggle zoom between 1.0x ↔ 2.5x
      const now = Date.now();
      if (now - lastTapRef.current < 280) {
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
          tapTimeoutRef.current = null;
        }
        const targetScale = zoomScaleRef.current > 1.2 ? 1.0 : 2.5;
        panOffset.current = { x: 0, y: 0 };
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 8,
          tension: 50,
        }).start();
        onScaleChange?.(targetScale);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    },

    onPanResponderMove: (evt, gs) => {
      const t = evt.nativeEvent.touches;

      // 2-finger pinch zoom
      if (t?.length === 2) {
        const dist = getTouchDist(t);
        if (pinchStartDistRef.current <= 0) {
          pinchStartDistRef.current = dist;
          pinchStartScaleRef.current = zoomScaleRef.current;
          return;
        }
        const newScale = Math.max(
          0.7,
          Math.min(3.5, pinchStartScaleRef.current * (dist / pinchStartDistRef.current))
        );
        onScaleChange?.(newScale);
        return;
      }

      // 1-finger horizontal rotation (drag along X axis rotates around Y axis)
      if (framesCountRef.current > 1) {
        const total = framesCountRef.current;
        let next = (startXRef.current - Math.round(gs.dx / 8)) % total;
        if (next < 0) next += total;
        currentFrameRef.current = next;
        setCurrentFrame(next);
        onAngleChange?.(Math.round((next / total) * 360) % 360);
      } else {
        // Continuous 3D Y-axis rotation for static or single photo
        const targetYaw = Math.max(-180, Math.min(180, yawOffset.current + gs.dx * 0.45));
        yawAnim.setValue(targetYaw);
      }

      // 1-finger vertical tilt (drag along Y axis rotates around X axis)
      const targetPitch = Math.max(-30, Math.min(30, pitchOffset.current - gs.dy * 0.35));
      pitchAnim.setValue(targetPitch);
    },

    onPanResponderRelease: (evt, gs) => {
      pinchStartDistRef.current = 0;
      pitchOffset.current = Math.max(-30, Math.min(30, pitchOffset.current - gs.dy * 0.35));
      if (framesCountRef.current <= 1) {
        yawOffset.current = Math.max(-180, Math.min(180, yawOffset.current + gs.dx * 0.45));
      }

      // Auto-resume auto-spin after 2.5s of touch inactivity (only for 3D multi-frame items)
      if (!isStatic && framesCountRef.current > 1 && !userExplicitlyPausedRef.current) {
        if (autoSpinResumeTimerRef.current) clearTimeout(autoSpinResumeTimerRef.current);
        autoSpinResumeTimerRef.current = setTimeout(() => {
          if (!userExplicitlyPausedRef.current) {
            onAutoSpinChange?.(true);
          }
        }, 2500);
      }
    },
  }), [isStatic, getTouchDist, onAngleChange, onAutoSpinChange, onScaleChange, yawAnim, pitchAnim, pan]);

  // ── URI selection ────────────────────────────────────────────────────────
  const isGif = useCallback((url) => {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.gif') || lower.includes('.gif?') || lower.includes('.gif#') || lower.includes('360-frames');
  }, []);

  const cleanStatic = useMemo(() => {
    if (staticImageUrl && !isGif(staticImageUrl)) return staticImageUrl;
    return null;
  }, [staticImageUrl, isGif]);

  const staticSource = useMemo(() => {
    return cleanStatic ? { uri: cleanStatic } : null;
  }, [cleanStatic]);

  // Loading state labels
  const isLoadingPhase = phase === Phase.FETCHING || phase === Phase.PREFETCHING;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View
      style={[styles.container, height ? { height } : null, containerStyle]}
      {...panResponder.panHandlers}
    >
      {/*
       * cropLayer: visual overflow:hidden lives here, NOT on the outer container.
       * This lets translateX / translateY move the image visibly in both X and Y
       * instead of being silently clipped by the container's own overflow:hidden.
       */}
      <View
        style={[
          styles.cropLayer,
          containerStyle?.borderRadius !== undefined
            ? { borderRadius: containerStyle.borderRadius }
            : null,
        ]}
      >
        {/*
         * Fallback schematic layer: rendered if no image or GIF is available or if image fails to load.
         */}
        {((!cleanStatic && !staticImageUrl && !gifUrl && frames.length === 0) || hasImageError) ? (
          <View style={[StyleSheet.absoluteFill, styles.layerCenter]}>
            <PartSchematicFallback
              partName={partName}
              brand={brand}
              partNo={partNo}
              size="large"
            />
          </View>
        ) : (
          <>
            {/*
             * Steady poster underlayer: ONLY needed for 3D mode before first frame loads.
             * NEVER rendered in isStatic mode to eliminate ghosting / duplicate images!
             */}
            {!isStatic && (cleanStatic || staticImageUrl || gifUrl) && !firstFrameRendered && (
              <View style={[StyleSheet.absoluteFill, styles.layerCenter]}>
                <Image
                  source={cleanStatic ? { uri: cleanStatic } : (staticImageUrl ? { uri: staticImageUrl } : { uri: gifUrl })}
                  style={styles.frameImage}
                  resizeMode="contain"
                  fadeDuration={0}
                  onError={() => setHasImageError(true)}
                />
              </View>
            )}

            {/*
             * Active Frame / Zoom & Pan Layer.
             */}
            {(phase === Phase.READY || isStatic || frames.length > 0) && (
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  styles.frameLayer,
                  {
                    // In static mode or once first frame rendered, layer is visible
                    opacity: (isStatic || firstFrameRendered) ? 1 : 0,
                    transform: [
                      { perspective: 1000 },
                      { scale: scaleAnim },
                      { translateX: pan.x },
                      { translateY: pan.y },
                      {
                        rotateX: pitchAnim.interpolate({
                          inputRange: [-30, 30],
                          outputRange: ['-30deg', '30deg'],
                        }),
                      },
                      {
                        rotateY: yawAnim.interpolate({
                          inputRange: [-180, 180],
                          outputRange: ['-180deg', '180deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {isStatic ? (
                  <Image
                    key={`static-${staticImageUrl || gifUrl || 'img'}`}
                    source={staticSource || (staticImageUrl ? { uri: staticImageUrl } : { uri: gifUrl })}
                    style={styles.frameImage}
                    resizeMode="contain"
                    fadeDuration={0}
                    onError={() => setHasImageError(true)}
                  />
                ) : frames.length > 0 ? (
                  <Image
                    source={{ uri: frames[currentFrame] }}
                    style={styles.frameImage}
                    resizeMode="contain"
                    fadeDuration={0}
                    onError={() => setHasImageError(true)}
                    onLoad={() => {
                      // SNO 13-A: Mark first frame rendered to fade in the layer
                      if (!firstFrameRendered) setFirstFrameRendered(true);
                    }}
                  />
                ) : null}
              </Animated.View>
            )}
          </>
        )}
      </View>{/* end cropLayer */}

      {/* Non-blocking loading pill — top-right corner during fetch */}
      {isLoadingPhase && !isStatic && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color="#E31837" />
          <Text style={styles.loadingOverlayText}>Loading 360° Studio...</Text>
        </View>
      )}

      {/* Tap-to-fullscreen hint badge — only shown when READY */}
      {showTapHint && onPressImage && phase === Phase.READY && (
        <TouchableOpacity
          style={styles.tapToExpandBadge}
          onPress={onPressImage}
          activeOpacity={0.75}
        >
          <Maximize2 size={11} color="#334155" />
          <Text style={styles.tapToExpandText}>Tap image for fullscreen studio</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 360,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    // NO overflow:hidden here — it clips translated/panned images
    // The inner cropLayer handles the visual clipping
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropLayer: {
    // The actual visual clip boundary that trims the overflow without blocking transforms
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  layerCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameLayer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameImage: {
    width: '90%',
    height: '90%',
  },
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  loadingOverlayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  tapToExpandBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  tapToExpandText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
});

export default Product360Viewer;
