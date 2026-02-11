import React, { useState, useMemo } from 'react';
import { X, MapPin, User, Phone, Home, Mail, Search } from 'lucide-react';
import Button from './shared/Button';
import { useTheme } from '../context/ThemeContext';

// Indian Cities Database (Top 100 cities)
const INDIAN_CITIES = [
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Bangalore', state: 'Karnataka' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Surat', state: 'Gujarat' },
    { city: 'Lucknow', state: 'Uttar Pradesh' },
    { city: 'Kanpur', state: 'Uttar Pradesh' },
    { city: 'Nagpur', state: 'Maharashtra' },
    { city: 'Indore', state: 'Madhya Pradesh' },
    { city: 'Thane', state: 'Maharashtra' },
    { city: 'Bhopal', state: 'Madhya Pradesh' },
    { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
    { city: 'Pimpri-Chinchwad', state: 'Maharashtra' },
    { city: 'Patna', state: 'Bihar' },
    { city: 'Vadodara', state: 'Gujarat' },
    { city: 'Ghaziabad', state: 'Uttar Pradesh' },
    { city: 'Ludhiana', state: 'Punjab' },
    { city: 'Agra', state: 'Uttar Pradesh' },
    { city: 'Nashik', state: 'Maharashtra' },
    { city: 'Faridabad', state: 'Haryana' },
    { city: 'Meerut', state: 'Uttar Pradesh' },
    { city: 'Rajkot', state: 'Gujarat' },
    { city: 'Kalyan-Dombivali', state: 'Maharashtra' },
    { city: 'Vasai-Virar', state: 'Maharashtra' },
    { city: 'Varanasi', state: 'Uttar Pradesh' },
    { city: 'Srinagar', state: 'Jammu and Kashmir' },
    { city: 'Aurangabad', state: 'Maharashtra' },
    { city: 'Dhanbad', state: 'Jharkhand' },
    { city: 'Amritsar', state: 'Punjab' },
    { city: 'Navi Mumbai', state: 'Maharashtra' },
    { city: 'Allahabad', state: 'Uttar Pradesh' },
    { city: 'Ranchi', state: 'Jharkhand' },
    { city: 'Howrah', state: 'West Bengal' },
    { city: 'Coimbatore', state: 'Tamil Nadu' },
    { city: 'Jabalpur', state: 'Madhya Pradesh' },
    { city: 'Gwalior', state: 'Madhya Pradesh' },
    { city: 'Vijayawada', state: 'Andhra Pradesh' },
    { city: 'Jodhpur', state: 'Rajasthan' },
    { city: 'Madurai', state: 'Tamil Nadu' },
    { city: 'Raipur', state: 'Chhattisgarh' },
    { city: 'Kota', state: 'Rajasthan' },
    { city: 'Chandigarh', state: 'Chandigarh' },
    { city: 'Guwahati', state: 'Assam' },
    { city: 'Solapur', state: 'Maharashtra' },
    { city: 'Hubli-Dharwad', state: 'Karnataka' },
    { city: 'Mysore', state: 'Karnataka' },
    { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
    { city: 'Bareilly', state: 'Uttar Pradesh' },
    { city: 'Aligarh', state: 'Uttar Pradesh' },
    { city: 'Tiruppur', state: 'Tamil Nadu' },
    { city: 'Moradabad', state: 'Uttar Pradesh' },
    { city: 'Jalandhar', state: 'Punjab' },
    { city: 'Bhubaneswar', state: 'Odisha' },
    { city: 'Salem', state: 'Tamil Nadu' },
    { city: 'Warangal', state: 'Telangana' },
    { city: 'Guntur', state: 'Andhra Pradesh' },
    { city: 'Bhiwandi', state: 'Maharashtra' },
    { city: 'Saharanpur', state: 'Uttar Pradesh' },
    { city: 'Gorakhpur', state: 'Uttar Pradesh' },
    { city: 'Bikaner', state: 'Rajasthan' },
    { city: 'Amravati', state: 'Maharashtra' },
    { city: 'Noida', state: 'Uttar Pradesh' },
    { city: 'Jamshedpur', state: 'Jharkhand' },
    { city: 'Bhilai', state: 'Chhattisgarh' },
    { city: 'Cuttack', state: 'Odisha' },
    { city: 'Firozabad', state: 'Uttar Pradesh' },
    { city: 'Kochi', state: 'Kerala' },
    { city: 'Nellore', state: 'Andhra Pradesh' },
    { city: 'Bhavnagar', state: 'Gujarat' },
    { city: 'Dehradun', state: 'Uttarakhand' },
    { city: 'Durgapur', state: 'West Bengal' },
    { city: 'Asansol', state: 'West Bengal' },
    { city: 'Rourkela', state: 'Odisha' },
    { city: 'Nanded', state: 'Maharashtra' },
    { city: 'Kolhapur', state: 'Maharashtra' },
    { city: 'Ajmer', state: 'Rajasthan' },
    { city: 'Akola', state: 'Maharashtra' },
    { city: 'Gulbarga', state: 'Karnataka' },
    { city: 'Jamnagar', state: 'Gujarat' },
    { city: 'Ujjain', state: 'Madhya Pradesh' },
    { city: 'Loni', state: 'Uttar Pradesh' },
    { city: 'Siliguri', state: 'West Bengal' },
    { city: 'Jhansi', state: 'Uttar Pradesh' },
    { city: 'Ulhasnagar', state: 'Maharashtra' },
    { city: 'Jammu', state: 'Jammu and Kashmir' },
    { city: 'Mangalore', state: 'Karnataka' },
    { city: 'Erode', state: 'Tamil Nadu' },
    { city: 'Belgaum', state: 'Karnataka' },
    { city: 'Ambattur', state: 'Tamil Nadu' },
    { city: 'Tirunelveli', state: 'Tamil Nadu' },
    { city: 'Malegaon', state: 'Maharashtra' },
    { city: 'Gaya', state: 'Bihar' },
    { city: 'Thiruvananthapuram', state: 'Kerala' },
    { city: 'Udaipur', state: 'Rajasthan' },
    { city: 'Maheshtala', state: 'West Bengal' }
];

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'UAE', 'Singapore'];

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (address: AddressFormData) => void;
    existingAddresses?: any[];
}

export interface AddressFormData {
    label: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    is_default: boolean;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    existingAddresses = []
}) => {
    const { theme } = useTheme();
    const isLight = theme.mode === 'light';

    const [selectedExisting, setSelectedExisting] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(existingAddresses.length === 0);

    const [formData, setFormData] = useState<AddressFormData>({
        label: 'Home',
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        is_default: false
    });

    const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

    // Autocomplete states
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    // Filter cities based on search
    const filteredCities = useMemo(() => {
        if (!citySearch) return INDIAN_CITIES.slice(0, 10);
        const search = citySearch.toLowerCase();
        return INDIAN_CITIES.filter(
            c => c.city.toLowerCase().includes(search) || c.state.toLowerCase().includes(search)
        ).slice(0, 10);
    }, [citySearch]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

        if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
        if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zip.trim()) newErrors.zip = 'ZIP/PIN is required';
        else if (!/^[0-9]{4,10}$/.test(formData.zip)) newErrors.zip = 'Invalid ZIP/PIN code';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedExisting && !showNewForm) {
            const address = existingAddresses.find(a => a.id === selectedExisting);
            if (address) {
                onSubmit(address);
                return;
            }
        }

        if (validateForm()) {
            console.log('✅ Form validated, submitting:', formData);
            onSubmit(formData);
        } else {
            console.log('❌ Form validation failed:', errors);
        }
    };

    const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleCitySelect = (city: { city: string; state: string }) => {
        setFormData(prev => ({
            ...prev,
            city: city.city,
            state: city.state
        }));
        setCitySearch(city.city);
        setShowCityDropdown(false);
        if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
        if (errors.state) setErrors(prev => ({ ...prev, state: undefined }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            ></div>

            <div className={`relative w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden border-2 ${isLight ? 'bg-white border-amber-200' : 'bg-[#0b0c15] border-purple-500/30'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isLight ? 'border-amber-100' : 'border-purple-500/30'
                    }`}>
                    <div className="flex items-center gap-3">
                        <MapPin className={isLight ? 'text-amber-600' : 'text-purple-400'} size={28} />
                        <h2 className={`text-2xl font-bold font-cinzel ${isLight ? 'text-amber-950' : 'text-white'
                            }`}>
                            Shipping Address
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-amber-100' : 'hover:bg-purple-500/20'
                            }`}
                    >
                        <X className={isLight ? 'text-amber-900' : 'text-white'} size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                    {/* Existing Addresses */}
                    {existingAddresses.length > 0 && !showNewForm && (
                        <div className="space-y-4 mb-6">
                            <h3 className={`text-lg font-bold ${isLight ? 'text-amber-900' : 'text-white'}`}>
                                Select Saved Address
                            </h3>
                            {existingAddresses.map((addr) => (
                                <button
                                    key={addr.id}
                                    onClick={() => setSelectedExisting(addr.id)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedExisting === addr.id
                                        ? isLight
                                            ? 'border-amber-600 bg-amber-50'
                                            : 'border-purple-500 bg-purple-500/10'
                                        : isLight
                                            ? 'border-amber-200 hover:border-amber-400'
                                            : 'border-purple-500/30 hover:border-purple-500/50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className={`text-xs font-black uppercase tracking-widest mb-1 ${isLight ? 'text-amber-600' : 'text-purple-400'
                                                }`}>
                                                {addr.label} {addr.is_default && '(Default)'}
                                            </div>
                                            <div className={`font-bold mb-1 ${isLight ? 'text-amber-950' : 'text-white'}`}>
                                                {addr.full_name}
                                            </div>
                                            <div className={`text-sm ${isLight ? 'text-amber-800' : 'text-gray-300'}`}>
                                                {addr.address_line1}, {addr.city}, {addr.state} {addr.zip}
                                            </div>
                                            <div className={`text-xs mt-1 ${isLight ? 'text-amber-600' : 'text-gray-400'}`}>
                                                📱 {addr.phone}
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedExisting === addr.id
                                            ? isLight ? 'border-amber-600' : 'border-purple-500'
                                            : isLight ? 'border-amber-300' : 'border-gray-600'
                                            }`}>
                                            {selectedExisting === addr.id && (
                                                <div className={`w-3 h-3 rounded-full ${isLight ? 'bg-amber-600' : 'bg-purple-500'
                                                    }`}></div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}

                            <button
                                onClick={() => setShowNewForm(true)}
                                className={`w-full py-3 border-2 border-dashed rounded-xl font-bold text-sm transition-all ${isLight
                                    ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                                    : 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
                                    }`}
                            >
                                + Add New Address
                            </button>
                        </div>
                    )}

                    {/* New Address Form */}
                    {showNewForm && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {existingAddresses.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowNewForm(false)}
                                    className={`text-sm font-bold ${isLight ? 'text-amber-600 hover:text-amber-800' : 'text-purple-400 hover:text-purple-300'
                                        }`}
                                >
                                    ← Back to saved addresses
                                </button>
                            )}

                            {/* Label */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isLight ? 'text-amber-800' : 'text-gray-400'
                                    }`}>
                                    Address Label
                                </label>
                                <div className="flex gap-2">
                                    {['Home', 'Office', 'Other'].map(label => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => handleInputChange('label', label)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.label === label
                                                ? isLight
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-purple-600 text-white'
                                                : isLight
                                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isLight ? 'text-amber-800' : 'text-gray-400'
                                    }`}>
                                    <User size={14} className="inline mr-1" /> Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                                    className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${errors.full_name
                                        ? 'border-red-500'
                                        : isLight
                                            ? 'border-amber-200 focus:border-amber-600 bg-white'
                                            : 'border-gray-700 focus:border-purple-500 bg-gray-900 text-white'
                                        }`}
                                    placeholder="John Doe"
                                />
                                {errors.full_name && (
                                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.full_name}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isLight ? 'text-amber-800' : 'text-gray-400'
                                    }`}>
                                    <Phone size={14} className="inline mr-1" /> Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${errors.phone
                                        ? 'border-red-500'
                                        : isLight
                                            ? 'border-amber-200 focus:border-amber-600 bg-white'
                                            : 'border-gray-700 focus:border-purple-500 bg-gray-900 text-white'
                                        }`}
                                    placeholder="+91 98765 43210"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone}</p>
                                )}
                            </div>

                            {/* Address Line 1 */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isLight ? 'text-amber-800' : 'text-gray-400'
                                    }`}>
                                    <Home size={14} className="inline mr-1" /> Address Line 1 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.address_line1}
                                    onChange={(e) => handleInputChange('address_line1', e.target.value)}
                                    className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${errors.address_line1
                                        ? 'border-red-500'
                                        : isLight
                                            ? 'border-amber-200 focus:border-amber-600 bg-white'
                                            : 'border-gray-700 focus:border-purple-500 bg-gray-900 text-white'
                                        }`}
                                    placeholder="House No., Street Name"
                                />
                                {errors.address_line1 && (
                                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.address_line1}</p>
                                )}
                            </div>

                            {/* Address Line 2 */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isLight ? 'text-amber-800' : 'text-gray-400'
                                    }`}>
                                    Address Line 2 (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.address_line2}
                                    onChange={(e) => handleInputChange('address_line2', e.target.value)}
                                    className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${isLight
                                        ? 'border-amber-200 focus:border-amber-600 bg-white'
                                        : 'border-gray-700 focus:border-purple-500 bg-gray-900 text-white'
                                        }`}
                                    placeholder="Landmark, Area"
                                />
                            </div>

                            {/* City with Autocomplete */}
                            <div className="relative">
                                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isLight ? 'text-amber-800' : 'text-gray-400'
                                    }`}>
                                    <Search size={14} className="inline mr-1" /> City * (Search to Autocomplete)
                                </label>
                                <input
                                    type="text"
                                    value={citySearch || formData.city}
                                    onChange={(e) => {
                                        setCitySearch(e.target.value);
                                        handleInputChange('city', e.target.value);
                                        setShowCityDropdown(true);
                                    }}
                                    onFocus={() => setShowCityDropdown(true)}
                                    className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${errors.city
                                        ? 'border-red-500'
                                        : isLight
                                            ? 'border-amber-200 focus:border-amber-600 bg-white'
                                            : 'border-gray-700 focus:border-purple-500 bg-gray-900 text-white'
                                        }`}
                                    placeholder="Start typing city name..."
                                />
                                {showCityDropdown && filteredCities.length > 0 && (
                                    <div className={`absolute z-10 w-full mt-1 rounded-xl border-2 shadow-xl max-h-60 overflow-y-auto ${isLight ? 'bg-white border-amber-200' : 'bg-gray-900 border-gray-700'
                                        }`}>
                                        {filteredCities.map((city, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleCitySelect(city)}
                                                className={`w-full text-left p-3 hover:bg-opacity-10 transition-colors ${isLight ? 'hover:bg-amber-600' : 'hover:bg-purple-500'
                                                    }`}
                                            >
                                                <div className={`font-bold ${isLight ? 'text-amber-900' : 'text-white'}`}>
                                                    {city.city}
                                                </div>
                                                <div className={`text-xs ${isLight ? 'text-amber-600' : 'text-gray-400'}`}>
                                                    {city.state}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {errors.city && (
                                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.city}</p>
                                )}
                            </div>

                            {/* State */}
                            <div>
                                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isLight ? 'text-amber-800' : 'text-gray-400'
                                    }`}>
                                    State *
                                </label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${errors.state
                                        ? 'border-red-500'
                                        : isLight
                                            ? 'border-amber-200 focus:border-amber-600 bg-white'
                                            : 'border-gray-700 focus:border-purple-500 bg-gray-900 text-white'
                                        }`}
                                    placeholder="Maharashtra"
                                    readOnly={!!formData.state && filteredCities.some(c => c.city === formData.city)}
                                />
                                {errors.state && (
                                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.state}</p>
                                )}
                            </div>

                            {/* ZIP and Country */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isLight ? 'text-amber-800' : 'text-gray-400'
                                        }`}>
                                        ZIP/PIN Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.zip}
                                        onChange={(e) => handleInputChange('zip', e.target.value.replace(/\D/g, ''))}
                                        maxLength={10}
                                        className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${errors.zip
                                            ? 'border-red-500'
                                            : isLight
                                                ? 'border-amber-200 focus:border-amber-600 bg-white'
                                                : 'border-gray-700 focus:border-purple-500 bg-gray-900 text-white'
                                            }`}
                                        placeholder="400001"
                                    />
                                    {errors.zip && (
                                        <p className="text-red-500 text-xs mt-1 font-bold">{errors.zip}</p>
                                    )}
                                </div>

                                <div className="relative">
                                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isLight ? 'text-amber-800' : 'text-gray-400'
                                        }`}>
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => {
                                            handleInputChange('country', e.target.value);
                                            setShowCountryDropdown(true);
                                        }}
                                        onFocus={() => setShowCountryDropdown(true)}
                                        className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${isLight
                                            ? 'border-amber-200 focus:border-amber-600 bg-white'
                                            : 'border-gray-700 focus:border-purple-500 bg-gray-900 text-white'
                                            }`}
                                        placeholder="India"
                                    />
                                    {showCountryDropdown && (
                                        <div className={`absolute z-10 w-full mt-1 rounded-xl border-2 shadow-xl max-h-48 overflow-y-auto ${isLight ? 'bg-white border-amber-200' : 'bg-gray-900 border-gray-700'
                                            }`}>
                                            {COUNTRIES.filter(c => c.toLowerCase().includes(formData.country.toLowerCase())).map((country) => (
                                                <button
                                                    key={country}
                                                    type="button"
                                                    onClick={() => {
                                                        handleInputChange('country', country);
                                                        setShowCountryDropdown(false);
                                                    }}
                                                    className={`w-full text-left p-3 hover:bg-opacity-10 transition-colors ${isLight ? 'text-amber-900 hover:bg-amber-600' : 'text-white hover:bg-purple-500'
                                                        }`}
                                                >
                                                    {country}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Set as Default */}
                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={formData.is_default}
                                    onChange={(e) => handleInputChange('is_default', e.target.checked)}
                                    className={`w-5 h-5 rounded cursor-pointer ${isLight ? 'accent-amber-600' : 'accent-purple-600'
                                        }`}
                                />
                                <label
                                    htmlFor="is_default"
                                    className={`text-sm font-bold cursor-pointer ${isLight ? 'text-amber-900' : 'text-gray-300'
                                        }`}
                                >
                                    Set as default shipping address
                                </label>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex gap-3 p-6 border-t ${isLight ? 'border-amber-100' : 'border-purple-500/30'
                    }`}>
                    <button
                        onClick={onClose}
                        type="button"
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLight
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        type="button"
                        disabled={(!selectedExisting && !showNewForm)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLight
                            ? 'bg-amber-600 text-white hover:bg-amber-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Continue to Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressFormModal;
