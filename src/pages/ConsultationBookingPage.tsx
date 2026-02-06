import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';
import SmartBackButton from '../components/shared/SmartBackButton';
import Button from '../components/shared/Button';

const ConsultationBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const openPayment = usePayment();
  const isLight = theme.mode === 'light';

  const {
    consultationType,
    optionId,
    price,
    title,
    returnPath,
    scrollPosition,
    serviceType,
  } = location.state || {};

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    if (returnPath) {
      navigate(returnPath, { replace: true });
      // Restore scroll position
      setTimeout(() => {
        window.scrollTo({ top: scrollPosition || 0, behavior: 'smooth' });
      }, 100);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Open payment
      await openPayment(
        async (paymentDetails?: any) => {
          // Save consultation booking to database
          // Fix: cast import.meta to any to access env properties in non-standard TS environments
          await fetch(`${(import.meta as any).env.VITE_API_URL}/api/consultation-booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              consultationType,
              optionId,
              ...formData,
              paymentDetails,
              serviceType,
            }),
          });

          // Show success and navigate back
          alert('Consultation booked successfully! We will contact you shortly.');
          handleBack();
        },
        title || 'Consultation Booking',
        price || 499
      );
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!consultationType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Invalid consultation type</p>
          <Button onClick={() => navigate('/home')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-16 px-4 transition-colors duration-500 ${
        isLight ? 'bg-gradient-to-b from-amber-50 to-orange-50' : 'bg-gray-950'
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <SmartBackButton
          label="← Back to Report"
          onClick={handleBack}
          className={`mb-8 ${
            isLight ? 'text-amber-800 hover:text-amber-950' : 'text-amber-400'
          }`}
        />

        <div
          className={`rounded-3xl p-8 md:p-12 shadow-2xl border-2 ${
            isLight
              ? 'bg-white border-amber-200'
              : 'bg-gray-900 border-amber-500/20'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1
              className={`text-4xl font-cinzel font-black uppercase tracking-widest mb-3 ${
                isLight ? 'text-amber-900' : 'text-amber-400'
              }`}
            >
              {title}
            </h1>
            <p
              className={`text-2xl font-bold ${
                isLight ? 'text-amber-700' : 'text-amber-300'
              }`}
            >
              ₹{price}
            </p>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${
                  isLight ? 'text-amber-900' : 'text-amber-200'
                }`}
              >
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${
                  isLight
                    ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white'
                    : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label
                className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${
                  isLight ? 'text-amber-900' : 'text-amber-200'
                }`}
              >
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${
                  isLight
                    ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white'
                    : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'
                }`}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${
                  isLight ? 'text-amber-900' : 'text-amber-200'
                }`}
              >
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${
                  isLight
                    ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white'
                    : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'
                }`}
              />
            </div>

            {/* Date & Time (for sessions) */}
            {consultationType === 'book-session' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${
                      isLight ? 'text-amber-900' : 'text-amber-200'
                    }`}
                  >
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${
                      isLight
                        ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white'
                        : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${
                      isLight ? 'text-amber-900' : 'text-amber-200'
                    }`}
                  >
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${
                      isLight
                        ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white'
                        : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label
                className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${
                  isLight ? 'text-amber-900' : 'text-amber-200'
                }`}
              >
                {consultationType === 'send-query' ? 'Your Question *' : 'Additional Notes'}
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required={consultationType === 'send-query'}
                rows={5}
                className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all resize-none ${
                  isLight
                    ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white'
                    : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'
                }`}
                placeholder={
                  consultationType === 'send-query'
                    ? 'Describe your question in detail...'
                    : 'Any specific topics you want to discuss?'
                }
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 text-xl font-cinzel font-bold tracking-wider uppercase rounded-full shadow-2xl"
            >
              {isSubmitting ? 'Processing...' : `Proceed to Payment (₹${price})`}
            </Button>
          </form>

          {/* Info Box */}
          <div
            className={`mt-8 p-4 rounded-xl text-center text-sm ${
              isLight
                ? 'bg-amber-100/50 text-amber-900'
                : 'bg-amber-900/20 text-amber-200'
            }`}
          >
            <p>✨ Secure payment • 100% confidential • Get response within 48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationBookingPage;