import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';
import SmartBackButton from '../components/shared/SmartBackButton';
import Button from '../components/shared/Button';
import { processConsultationBooking } from '../services/geminiService';
import Card from '../components/shared/Card';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const ConsultationBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { openPayment } = usePayment();
  const isLight = theme.mode === 'light';

  const {
    consultationType,
    optionId,
    price,
    title,
    returnPath,
    scrollPosition,
    serviceType,
    reportContext
  } = location.state || {};

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultationResult, setConsultationResult] = useState<any>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    if (returnPath) {
      navigate(returnPath, { replace: true });
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
      await openPayment(
        async (paymentDetails?: any) => {
          const bookingData = {
            consultationType,
            optionId,
            userData: {
              userId: user?.id || 'guest',
              ...formData
            },
            reportContext: reportContext || { serviceType: serviceType || 'astrology' },
            paymentDetails: paymentDetails || {
              orderId: `ORD-${Date.now()}`,
              transactionId: `TXN-${Date.now()}`,
              amount: price,
              status: "success",
              timestamp: new Date().toISOString()
            }
          };

          const result = await processConsultationBooking(bookingData);
          setConsultationResult(result);
          setIsSubmitting(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        title || 'Consultation Booking',
        price || 499
      );
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to complete booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner fullScreen text="The Sage is analyzing your request..." />;
  }

  if (consultationResult) {
    return (
      <div className={`min-h-screen py-16 px-4 transition-colors duration-500 ${isLight ? 'bg-amber-50' : 'bg-gray-950'}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <div className="inline-block p-4 bg-green-500 rounded-full mb-4 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className={`text-4xl font-cinzel font-black uppercase mb-2 ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>Booking Confirmed</h1>
            <p className="font-mono text-sm opacity-60">ID: {consultationResult.confirmationId}</p>
          </div>

          <Card className="p-8 border-2 border-green-500/30">
            <div className="prose prose-amber max-w-none" dangerouslySetInnerHTML={{ __html: consultationResult.emailBody }} />
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-cinzel font-bold text-amber-500 mb-4 uppercase tracking-widest">Expert Insights</h3>
              <div className="space-y-4">
                {consultationResult.preliminaryInsights.map((insight: any, i: number) => (
                  <div key={i} className="border-l-2 border-amber-500/30 pl-4">
                    <p className="text-xs font-black uppercase text-amber-600 mb-1">{insight.category}</p>
                    <p className="text-sm italic mb-2 opacity-80">{insight.observation}</p>
                    <p className="text-sm font-bold text-amber-700">{insight.recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-cinzel font-bold text-amber-500 mb-4 uppercase tracking-widest">Next Steps</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Timeline:</strong> {consultationResult.nextSteps.timeline}</p>
                <p><strong>Contact via:</strong> <span className="uppercase">{consultationResult.nextSteps.contactMethod}</span></p>
                <p><strong>Preparation:</strong> {consultationResult.nextSteps.preparation}</p>
              </div>
            </Card>
          </div>

          <div className="text-center pt-8">
            <Button onClick={() => navigate('/home')}>Return to Sanctuary</Button>
          </div>
        </div>
      </div>
    );
  }

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
    <div className={`min-h-screen py-16 px-4 transition-colors duration-500 ${isLight ? 'bg-gradient-to-b from-amber-50 to-orange-50' : 'bg-gray-950'}`}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={handleBack}
            className={`bg-transparent border-none text-sm font-bold uppercase tracking-widest ${
              isLight ? 'text-amber-800 hover:text-amber-950' : 'text-amber-400 hover:text-amber-200'
            }`}
          >
            ← Back to Report
          </Button>
        </div>

        <div className={`rounded-3xl p-8 md:p-12 shadow-2xl border-2 ${isLight ? 'bg-white border-amber-200' : 'bg-gray-900 border-amber-500/20'}`}>
          <div className="text-center mb-10">
            <h1 className={`text-4xl font-cinzel font-black uppercase tracking-widest mb-3 ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
              {title}
            </h1>
            <p className={`text-2xl font-bold ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
              ₹{price}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white' : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'}`}
              />
            </div>

            <div>
              <label className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white' : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'}`}
              />
            </div>

            <div>
              <label className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white' : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'}`}
              />
            </div>

            {consultationType === 'book-session' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white' : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'}`}
                  />
                </div>
                <div>
                  <label className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all ${isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white' : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'}`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block mb-2 font-cinzel text-xs font-black uppercase tracking-wider ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                {consultationType === 'send-query' ? 'Your Question *' : 'Additional Notes'}
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required={consultationType === 'send-query'}
                rows={5}
                className={`w-full p-4 border-2 rounded-2xl text-lg outline-none transition-all resize-none ${isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600 focus:bg-white' : 'bg-black/40 border-amber-500/20 text-white focus:border-amber-400'}`}
                placeholder={consultationType === 'send-query' ? 'Describe your question in detail...' : 'Any specific topics you want to discuss?'}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 text-xl font-cinzel font-bold tracking-wider uppercase rounded-full shadow-2xl"
            >
              {isSubmitting ? 'Processing...' : `Proceed to Payment (₹${price})`}
            </Button>
          </form>

          <div className={`mt-8 p-4 rounded-xl text-center text-sm ${isLight ? 'bg-amber-100/50 text-amber-900' : 'bg-amber-900/20 text-amber-200'}`}>
            <p>✨ Secure payment • 100% confidential • Get response within 48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationBookingPage;