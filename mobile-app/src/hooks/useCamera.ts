import { useState, useEffect } from 'react';
import { Camera, CameraType, PermissionStatus } from 'expo-camera';

export function useCamera() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
      setIsReady(true);
    })();
  }, [permission]);

  return {
    permission,
    requestPermission,
    isReady,
  };
}
