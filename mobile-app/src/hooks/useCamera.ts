import { useState, useEffect } from 'react';
import { Camera, CameraType, PermissionStatus, useCameraPermissions } from 'expo-camera';

export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
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
