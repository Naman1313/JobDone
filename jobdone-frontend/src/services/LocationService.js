export const LocationService = {
  requestLocation(onSuccess, onError) {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("[LocationService] Got real coordinates:", coords);
          if (onSuccess) onSuccess(coords);
        },
        (error) => {
          console.warn("[LocationService] Geolocation error:", error.message);
          // Fallback to mock coords if denied or error
          if (onError) onError();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.warn("[LocationService] Geolocation not supported by browser.");
      if (onError) onError();
    }
  }
};
