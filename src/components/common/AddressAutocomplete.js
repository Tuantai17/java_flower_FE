/**
 * ========================================
 * AddressAutocomplete Component
 * ========================================
 * 
 * Component tìm kiếm địa chỉ với:
 * - Nút "Dùng vị trí hiện tại" (GPS)
 * - Nút "Dùng địa chỉ của tôi" (đã lưu)
 * - Autocomplete input với debounce 400ms
 * - Dropdown gợi ý từ Photon API
 * 
 * Props:
 * - value: { addressLine, lat, lng, provider, placeId }
 * - onChange: (value) => void
 * - userAddress: string - Địa chỉ đã lưu của user
 * - error: string (optional)
 * - label: string (optional)
 * - required: boolean (optional)
 */

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { MapPinIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { searchAddress, getCurrentLocation, reverseGeocode } from '../../api/geocodeApi';

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 400;

// GPS Icon Component
const GpsIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/**
 * AddressAutocomplete Component
 */
const AddressAutocomplete = ({
  value = {},
  onChange,
  userAddress = '',
  error,
  label = 'Địa chỉ giao hàng',
  required = false,
  placeholder = 'Nhập địa chỉ (VD: 12 Nguyễn Huệ, Quận 1)',
}) => {
  // Local state
  const [query, setQuery] = useState(value.addressLine || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // GPS states
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  
  // Ref để track mounted state
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sync query with external value
  useEffect(() => {
    if (value.addressLine && value.addressLine !== query) {
      setQuery(value.addressLine);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.addressLine]);

  // Debounced search
  useEffect(() => {
    const trimmedQuery = query.trim();
    
    // Skip if too short
    if (trimmedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    // Debounce
    const timeoutId = setTimeout(async () => {
      if (!isMounted.current) return;
      
      setIsLoading(true);
      try {
        const results = await searchAddress(trimmedQuery);
        if (isMounted.current) {
          setSuggestions(results);
        }
      } catch (err) {
        console.error('Search error:', err);
        if (isMounted.current) {
          setSuggestions([]);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Handle GPS location
  const handleUseGPS = useCallback(async () => {
    setGpsLoading(true);
    setGpsError('');

    try {
      // Bước 1: Lấy tọa độ GPS từ browser
      const locationResult = await getCurrentLocation();
      
      if (!locationResult.success) {
        setGpsError(locationResult.error);
        setGpsLoading(false);
        return;
      }

      // Bước 2: Chuyển đổi tọa độ thành địa chỉ (Reverse Geocoding)
      const reverseResult = await reverseGeocode(locationResult.lat, locationResult.lng);
      
      if (!isMounted.current) return;

      if (reverseResult.success) {
        // Thành công - cập nhật form
        setQuery(reverseResult.address);
        setSuggestions([]);
        setIsOpen(false);
        
        onChange({
          addressLine: reverseResult.address,
          lat: reverseResult.lat,
          lng: reverseResult.lng,
          provider: reverseResult.provider || 'GPS',
          placeId: null,
        });
      } else {
        // Reverse geocoding thất bại - vẫn lưu tọa độ nhưng hiện cảnh báo
        setGpsError(reverseResult.error || 'Không thể xác định địa chỉ cho vị trí này');
        
        // Vẫn cập nhật lat/lng để giao hàng
        onChange({
          addressLine: `Vị trí GPS: ${locationResult.lat.toFixed(6)}, ${locationResult.lng.toFixed(6)}`,
          lat: locationResult.lat,
          lng: locationResult.lng,
          provider: 'GPS_ONLY',
          placeId: null,
        });
        setQuery(`Vị trí GPS: ${locationResult.lat.toFixed(6)}, ${locationResult.lng.toFixed(6)}`);
      }

    } catch (err) {
      console.error('GPS error:', err);
      if (isMounted.current) {
        setGpsError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      if (isMounted.current) {
        setGpsLoading(false);
      }
    }
  }, [onChange]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);
    setGpsError(''); // Clear GPS error khi user bắt đầu gõ
    
    // Update parent with just addressLine (clear coordinates until selection)
    onChange({
      ...value,
      addressLine: text,
      lat: null,
      lng: null,
    });
  }, [value, onChange]);

  // Handle suggestion selection
  const handleSelect = useCallback((item) => {
    setQuery(item.label);
    setSuggestions([]);
    setIsOpen(false);
    setGpsError('');
    
    // Update parent with full data including coordinates
    onChange({
      addressLine: item.label,
      lat: item.lat,
      lng: item.lng,
      provider: item.provider || 'PHOTON',
      placeId: item.placeId || null,
    });
  }, [onChange]);

  // Handle "Use my address" button
  const handleUseMyAddress = useCallback(() => {
    if (!userAddress) return;
    
    setQuery(userAddress);
    setSuggestions([]);
    setIsOpen(false);
    setGpsError('');
    
    // Update parent - không có tọa độ vì đây là địa chỉ từ profile
    onChange({
      addressLine: userAddress,
      lat: null,
      lng: null,
      provider: null,
      placeId: null,
    });
  }, [userAddress, onChange]);

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setGpsError('');
    onChange({
      addressLine: '',
      lat: null,
      lng: null,
      provider: null,
      placeId: null,
    });
  }, [onChange]);

  // Handle focus/blur
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setIsOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay closing to allow click on suggestions
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  return (
    <div className="address-autocomplete space-y-3">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Quick Actions: GPS + My Address */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* GPS Button */}
        <button
          type="button"
          onClick={handleUseGPS}
          disabled={gpsLoading}
          className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-all flex-1 ${
            gpsLoading 
              ? 'border-blue-300 bg-blue-50 cursor-wait' 
              : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 group'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            gpsLoading ? 'bg-blue-200' : 'bg-blue-100 group-hover:bg-blue-200'
          }`}>
            {gpsLoading ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GpsIcon className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="text-left">
            <p className={`text-sm font-medium ${gpsLoading ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'}`}>
              {gpsLoading ? 'Đang định vị...' : 'Dùng vị trí hiện tại'}
            </p>
            <p className="text-xs text-gray-500">
              GPS tự động
            </p>
          </div>
        </button>

        {/* Use My Address Button */}
        {userAddress && (
          <button
            type="button"
            onClick={handleUseMyAddress}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-rose-400 hover:bg-rose-50 transition-all group flex-1"
          >
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center group-hover:bg-rose-200 transition-colors">
              <UserIcon className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 group-hover:text-rose-600">
                Địa chỉ đã lưu
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userAddress}
              </p>
            </div>
          </button>
        )}
      </div>

      {/* GPS Error Message */}
      {gpsError && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-amber-500 text-lg">⚠️</span>
          <p className="text-sm text-amber-700">{gpsError}</p>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-400">hoặc nhập địa chỉ</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Input with autocomplete */}
      <div className="relative">
        <div className="relative">
          {/* Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <MapPinIcon className="h-5 w-5" />
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors ${
              error ? 'border-red-500' : 'border-gray-200'
            } ${isFocused ? 'ring-2 ring-rose-500 border-rose-500' : ''}`}
          />

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
            style={{ maxHeight: '250px', overflowY: 'auto' }}
          >
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={() => handleSelect(item)}
                className="px-4 py-3 cursor-pointer hover:bg-rose-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {isOpen && query.length >= 3 && suggestions.length === 0 && !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
            <p className="text-sm text-gray-500 text-center">
              Không tìm thấy địa chỉ. Vui lòng nhập chi tiết hơn.
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Success indicator when location is selected */}
      {value.lat && value.lng && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          <span>✓</span>
          <span>
            Đã xác định vị trí giao hàng 
            ({value.lat.toFixed(4)}, {value.lng.toFixed(4)})
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(AddressAutocomplete);
