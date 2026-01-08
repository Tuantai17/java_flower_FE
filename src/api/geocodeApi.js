/**
 * ========================================
 * Geocode API Service
 * ========================================
 * 
 * API cho địa chỉ autocomplete với backend proxy
 * Endpoint: GET /api/geocode/search?q=...
 * 
 * Response format:
 * {
 *   items: [
 *     {
 *       label: "123 Nguyễn Huệ, Quận 1, TP.HCM",
 *       lat: 10.774,
 *       lng: 106.704,
 *       provider: "PHOTON",
 *       placeId: null
 *     }
 *   ]
 * }
 */

import axiosInstance from './axiosConfig';

/**
 * Search địa chỉ từ backend proxy
 * Backend sẽ gọi Photon API và cache kết quả
 * 
 * @param {string} query - Từ khóa tìm kiếm (min 3 ký tự)
 * @returns {Promise<Array>} Danh sách gợi ý địa chỉ
 */
export const searchAddress = async (query) => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const response = await axiosInstance.get('/geocode/search', {
      params: { q: query.trim() }
    });

    // Handle response format
    const data = response.data;
    
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    
    return [];
  } catch (error) {
    console.error('Geocode search error:', error);
    return [];
  }
};

/**
 * Default location (TP.HCM)
 */
export const DEFAULT_LOCATION = {
  lat: 10.8231,
  lng: 106.6297
};

/**
 * Reverse Geocode - Chuyển đổi tọa độ GPS thành địa chỉ
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} { success, address, lat, lng, provider, error? }
 */
export const reverseGeocode = async (lat, lng) => {
  if (lat == null || lng == null) {
    return { success: false, error: 'Thiếu thông tin tọa độ' };
  }

  try {
    const response = await axiosInstance.get('/geocode/reverse', {
      params: { lat, lng }
    });

    return response.data;
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return { 
      success: false, 
      error: 'Không thể xác định địa chỉ. Vui lòng thử lại.',
      lat,
      lng
    };
  }
};

/**
 * Get current GPS location using browser Geolocation API
 * 
 * @returns {Promise<Object>} { success, lat, lng, error? }
 */
export const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ 
        success: false, 
        error: 'Trình duyệt không hỗ trợ định vị GPS' 
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Không thể lấy vị trí GPS';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối cho phép truy cập vị trí. Vui lòng cấp quyền trong cài đặt trình duyệt.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Không thể xác định vị trí. Vui lòng kiểm tra GPS và thử lại.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Quá thời gian chờ định vị. Vui lòng thử lại.';
            break;
          default:
            break;
        }
        
        resolve({ success: false, error: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache 1 minute
      }
    );
  });
};

const geocodeApi = {
  searchAddress,
  reverseGeocode,
  getCurrentLocation,
  DEFAULT_LOCATION,
};

export default geocodeApi;
