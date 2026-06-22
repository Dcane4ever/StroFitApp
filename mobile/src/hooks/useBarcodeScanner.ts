import { useState, useCallback, useRef } from 'react';
import { Camera } from 'react-native-vision-camera';

export type CameraPermissionStatus = 'checking' | 'granted' | 'denied' | 'blocked';

interface UseBarcodeScanner {
  permissionStatus: CameraPermissionStatus;
  requestPermission: () => Promise<void>;
  scanned: boolean;
  resetScan: () => void;
  onBarcodeScanned: (value: string, onResult: (barcode: string) => void) => void;
}

export function useBarcodeScanner(): UseBarcodeScanner {
  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>('checking');
  const [scanned, setScanned] = useState(false);
  const cooldownRef = useRef(false);

  const requestPermission = useCallback(async () => {
    // v3: 'granted' | 'not-determined' | 'denied' | 'restricted'
    const current = await Camera.getCameraPermissionStatus();
    if (current === 'granted') {
      setPermissionStatus('granted');
      return;
    }
    // 'restricted' = permanently blocked (parental controls etc.)
    if (current === 'restricted') {
      setPermissionStatus('blocked');
      return;
    }
    // 'not-determined' or 'denied' → prompt
    const result = await Camera.requestCameraPermission();
    // v3 requestCameraPermission returns 'granted' | 'denied'
    if (result === 'granted') {
      setPermissionStatus('granted');
    } else {
      // After prompt denial, treat as blocked (won't prompt again)
      setPermissionStatus('blocked');
    }
  }, []);

  const resetScan = useCallback(() => {
    setScanned(false);
    cooldownRef.current = false;
  }, []);

  const onBarcodeScanned = useCallback(
    (value: string, onResult: (barcode: string) => void) => {
      if (cooldownRef.current || scanned) return;
      cooldownRef.current = true;
      setScanned(true);
      onResult(value);
    },
    [scanned],
  );

  return { permissionStatus, requestPermission, scanned, resetScan, onBarcodeScanned };
}
