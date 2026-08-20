import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number;
  accuracy: number | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const requestLocation = async () => {
    setIsGettingLocation(true);
    setErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsGettingLocation(false);
        return null;
      }

      // First get a quick estimate
      let currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Try to get heading if available
      let heading = 0;
      try {
        const headingObj = await Location.getHeadingAsync();
        heading = headingObj.trueHeading > 0 ? headingObj.trueHeading : headingObj.magHeading;
      } catch (e) {
        // Heading not available on some devices or needs different permissions
      }

      const locData: LocationData = {
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
        heading: heading,
        accuracy: currentLoc.coords.accuracy,
      };

      setLocation(locData);
      setIsGettingLocation(false);
      return locData;
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to get location');
      setIsGettingLocation(false);
      return null;
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { location, errorMsg, isGettingLocation, requestLocation };
}
