import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import {
  useCameraDevice,
  useCodeScanner,
  Camera,
} from 'react-native-vision-camera';
import { MainStackScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import CameraPermissionState from '../../components/barcode/CameraPermissionState';

type Props = MainStackScreenProps<'BarcodeScanner'>;

const FRAME_SIZE = 260;

export default function BarcodeScannerScreen({ route, navigation }: Props) {
  const { date, mealType } = route.params;
  const { colors } = useThemeStore();
  const s = styles(colors);

  const {
    permissionStatus,
    requestPermission,
    scanned,
    resetScan,
    onBarcodeScanned,
  } = useBarcodeScanner();

  const device = useCameraDevice('back');

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const handleScanned = useCallback(
    (barcode: string) => {
      navigation.replace('BarcodeResult', { barcode, date, mealType });
    },
    [navigation, date, mealType],
  );

  const codeScanner = useCodeScanner({
    codeTypes: [
      'ean-13', 'ean-8', 'upc-a', 'upc-e',
      'qr', 'code-128', 'code-39', 'code-93', 'itf',
    ],
    onCodeScanned: (codes: { value?: string }[]) => {
      const first = codes[0];
      if (!first?.value) return;
      onBarcodeScanned(first.value, handleScanned);
    },
  });

  const isNotGranted = permissionStatus !== 'granted';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Back button — always visible */}
      <TouchableOpacity
        style={s.backBtn}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={s.backText}>‹ Back</Text>
      </TouchableOpacity>

      {isNotGranted || !device ? (
        <CameraPermissionState
          status={permissionStatus}
          onRequest={requestPermission}
        />
      ) : (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={!scanned}
            codeScanner={codeScanner}
          />

          {/* Dark overlay with cutout frame */}
          <View style={s.overlay}>
            <View style={s.overlayTop} />
            <View style={s.overlayMiddle}>
              <View style={s.overlaySide} />
              <View style={s.frame}>
                {/* Corner markers */}
                <View style={[s.corner, s.cornerTL]} />
                <View style={[s.corner, s.cornerTR]} />
                <View style={[s.corner, s.cornerBL]} />
                <View style={[s.corner, s.cornerBR]} />
              </View>
              <View style={s.overlaySide} />
            </View>
            <View style={s.overlayBottom}>
              <Text style={s.instruction}>Align barcode inside the frame</Text>
              {scanned && (
                <TouchableOpacity style={s.scanAgainBtn} onPress={resetScan}>
                  <Text style={s.scanAgainText}>Tap to scan again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const OVERLAY_COLOR = 'rgba(0,0,0,0.62)';
const CORNER_SIZE = 28;
const CORNER_BORDER = 3;
const CORNER_COLOR = '#4CAF50';

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },

    backBtn: {
      position: 'absolute',
      top: 52,
      left: Spacing.md,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
    },
    backText: {
      color: '#fff',
      fontSize: Typography.base,
      fontWeight: Typography.medium,
    },

    // Overlay
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'column' },
    overlayTop: { flex: 1, backgroundColor: OVERLAY_COLOR },
    overlayMiddle: { height: FRAME_SIZE, flexDirection: 'row' },
    overlaySide: { flex: 1, backgroundColor: OVERLAY_COLOR },
    overlayBottom: {
      flex: 1,
      backgroundColor: OVERLAY_COLOR,
      alignItems: 'center',
      paddingTop: Spacing.xl,
    },

    // Transparent frame
    frame: {
      width: FRAME_SIZE,
      height: FRAME_SIZE,
      backgroundColor: 'transparent',
    },

    // Corner markers
    corner: {
      position: 'absolute',
      width: CORNER_SIZE,
      height: CORNER_SIZE,
      borderColor: CORNER_COLOR,
    },
    cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER },
    cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER },
    cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER },
    cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER },

    instruction: {
      color: '#fff',
      fontSize: Typography.base,
      fontWeight: Typography.medium,
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.7)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    scanAgainBtn: {
      marginTop: Spacing.lg,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.xl,
    },
    scanAgainText: {
      color: colors.textInverse,
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
    },
  });
