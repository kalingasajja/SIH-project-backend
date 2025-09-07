/**
 * GPS and Geographic Validation Utilities
 * Handles GPS coordinate validation, location verification, and geographic calculations
 */

/**
 * Validate GPS coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {object} Validation result with success status and message
 */
const validateCoordinates = (latitude, longitude) => {
  try {
    // Check if coordinates are numbers
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return {
        isValid: false,
        message: "Latitude and longitude must be valid numbers"
      };
    }

    // Check latitude range (-90 to 90)
    if (latitude < -90 || latitude > 90) {
      return {
        isValid: false,
        message: "Latitude must be between -90 and 90 degrees"
      };
    }

    // Check longitude range (-180 to 180)
    if (longitude < -180 || longitude > 180) {
      return {
        isValid: false,
        message: "Longitude must be between -180 and 180 degrees"
      };
    }

    // Check for NaN or Infinity
    if (!isFinite(latitude) || !isFinite(longitude)) {
      return {
        isValid: false,
        message: "Coordinates must be finite numbers"
      };
    }

    return {
      isValid: true,
      message: "Coordinates are valid"
    };
  } catch (error) {
    return {
      isValid: false,
      message: `Coordinate validation error: ${error.message}`
    };
  }
};

/**
 * Check if coordinates are within Indian territory
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {object} Validation result with success status and message
 */
const verifyIndianTerritory = (latitude, longitude) => {
  try {
    // Indian territory boundaries (approximate)
    const indiaBounds = {
      north: 37.1,
      south: 6.4,
      east: 97.4,
      west: 68.1
    };

    const isWithinIndia = 
      latitude >= indiaBounds.south && 
      latitude <= indiaBounds.north &&
      longitude >= indiaBounds.west && 
      longitude <= indiaBounds.east;

    return {
      isWithinIndia,
      message: isWithinIndia ? "Location is within Indian territory" : "Location is outside Indian territory",
      bounds: indiaBounds
    };
  } catch (error) {
    return {
      isWithinIndia: false,
      message: `Territory verification error: ${error.message}`,
      bounds: null
    };
  }
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {object} Distance calculation result
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  try {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return {
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      unit: "kilometers",
      message: `Distance: ${Math.round(distance * 100) / 100} km`
    };
  } catch (error) {
    return {
      distance: null,
      unit: "kilometers",
      message: `Distance calculation error: ${error.message}`
    };
  }
};

/**
 * Format location data for storage and display
 * @param {object} locationData - Raw location data
 * @returns {object} Formatted location data
 */
const formatLocationData = (locationData) => {
  try {
    const { latitude, longitude, altitude, accuracy, timestamp } = locationData;
    
    // Validate coordinates first
    const coordValidation = validateCoordinates(latitude, longitude);
    if (!coordValidation.isValid) {
      throw new Error(coordValidation.message);
    }

    // Check if within Indian territory
    const territoryCheck = verifyIndianTerritory(latitude, longitude);

    return {
      coordinates: {
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6)),
        altitude: altitude ? parseFloat(altitude.toFixed(2)) : null
      },
      accuracy: accuracy ? parseFloat(accuracy.toFixed(2)) : null,
      timestamp: timestamp || new Date().toISOString(),
      isWithinIndia: territoryCheck.isWithinIndia,
      formattedAddress: null, // Could be populated with reverse geocoding
      validation: {
        coordinatesValid: coordValidation.isValid,
        withinIndia: territoryCheck.isWithinIndia
      }
    };
  } catch (error) {
    return {
      error: true,
      message: `Location formatting error: ${error.message}`,
      coordinates: null
    };
  }
};

/**
 * Check location authenticity by comparing with known farm locations
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {array} knownFarmLocations - Array of known farm locations
 * @param {number} toleranceRadius - Tolerance radius in kilometers (default: 5km)
 * @returns {object} Authenticity check result
 */
const checkLocationAuthenticity = (latitude, longitude, knownFarmLocations = [], toleranceRadius = 5) => {
  try {
    if (!Array.isArray(knownFarmLocations) || knownFarmLocations.length === 0) {
      return {
        isAuthentic: true, // If no known locations, assume authentic
        message: "No known farm locations to compare against",
        nearestFarm: null,
        distance: null
      };
    }

    let nearestFarm = null;
    let minDistance = Infinity;

    // Find nearest known farm location
    for (const farm of knownFarmLocations) {
      const distance = calculateDistance(
        latitude, 
        longitude, 
        farm.latitude, 
        farm.longitude
      );
      
      if (distance.distance < minDistance) {
        minDistance = distance.distance;
        nearestFarm = {
          ...farm,
          distance: distance.distance
        };
      }
    }

    const isWithinTolerance = minDistance <= toleranceRadius;

    return {
      isAuthentic: isWithinTolerance,
      message: isWithinTolerance 
        ? `Location is within ${toleranceRadius}km of known farm location`
        : `Location is ${minDistance.toFixed(2)}km away from nearest known farm (tolerance: ${toleranceRadius}km)`,
      nearestFarm,
      distance: minDistance,
      toleranceRadius
    };
  } catch (error) {
    return {
      isAuthentic: false,
      message: `Location authenticity check error: ${error.message}`,
      nearestFarm: null,
      distance: null
    };
  }
};

/**
 * Generate a unique batch ID based on location and timestamp
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} species - Species name
 * @returns {string} Generated batch ID
 */
const generateBatchId = (latitude, longitude, species) => {
  try {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const latCode = Math.abs(latitude).toFixed(2).replace('.', '');
    const lonCode = Math.abs(longitude).toFixed(2).replace('.', '');
    const speciesCode = species ? species.substring(0, 3).toUpperCase() : 'HERB';
    const randomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    return `AH_${timestamp}_${latCode}_${lonCode}_${speciesCode}_${randomCode}`;
  } catch (error) {
    // Fallback to timestamp-based ID
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomCode = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `AH_${timestamp}_${randomCode}`;
  }
};

/**
 * Validate GPS coordinates for collection event
 * @param {object} gpsData - GPS data object
 * @returns {object} Comprehensive validation result
 */
const validateCollectionLocation = (gpsData) => {
  try {
    const { latitude, longitude, altitude, accuracy } = gpsData;
    
    // Basic coordinate validation
    const coordValidation = validateCoordinates(latitude, longitude);
    if (!coordValidation.isValid) {
      return {
        isValid: false,
        message: coordValidation.message,
        details: { coordinateValidation: coordValidation }
      };
    }

    // Territory verification
    const territoryCheck = verifyIndianTerritory(latitude, longitude);
    if (!territoryCheck.isWithinIndia) {
      return {
        isValid: false,
        message: "Collection location must be within Indian territory",
        details: { territoryCheck }
      };
    }

    // Accuracy check (optional but recommended)
    if (accuracy && accuracy > 100) {
      return {
        isValid: false,
        message: "GPS accuracy is too low for reliable location tracking",
        details: { accuracy: accuracy, recommendedMax: 100 }
      };
    }

    return {
      isValid: true,
      message: "Location validation passed",
      details: {
        coordinateValidation: coordValidation,
        territoryCheck,
        accuracy: accuracy ? { value: accuracy, status: accuracy <= 100 ? 'good' : 'poor' } : null
      }
    };
  } catch (error) {
    return {
      isValid: false,
      message: `Location validation error: ${error.message}`,
      details: { error: error.message }
    };
  }
};

module.exports = {
  validateCoordinates,
  verifyIndianTerritory,
  calculateDistance,
  formatLocationData,
  checkLocationAuthenticity,
  generateBatchId,
  validateCollectionLocation
};
