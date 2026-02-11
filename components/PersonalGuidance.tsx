import React, { useState, useEffect, useRef } from 'react';
import { useDb } from '../hooks/useDb';
import { useAuth } from '../context/AuthContext';
import Button from './shared/Button';
import SmartBackButton from './shared/SmartBackButton';
import FullReport from './FullReport';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import { supabase } from '../services/supabaseClient';
import { cloudManager } from '../services/cloudManager';
import { findProductInStore } from '../services/productMatcher';
import { generatePersonalizedGuidance } from '../services/personalGuidanceAI';

const CONCERN_TYPES = [
  { value: 'health', label: 'Health & Wellness', emoji: '🏥', color: 'bg-green-500' },
  { value: 'wealth', label: 'Wealth & Finance', emoji: '💰', color: 'bg-yellow-500' },
  { value: 'relationships', label: 'Love & Relationships', emoji: '❤️', color: 'bg-pink-500' },
  { value: 'career', label: 'Career & Success', emoji: '💼', color: 'bg-blue-500' },
  { value: 'spiritual', label: 'Spiritual Growth', emoji: '🕉️', color: 'bg-purple-500' },
  { value: 'general', label: 'General Guidance', emoji: '✨', color: 'bg-indigo-500' },
];

const PersonalGuidance: React.FC = () => {
  const [concernType, setConcernType] = useState('');
  const [concernDescription, setConcernDescription] = useState('');
  const [currentChallenges, setCurrentChallenges] = useState('');
  const [goals, setGoals] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [servicePrice, setServicePrice] = useState(49);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<string>('');
  const [readingId, setReadingId] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);
  const { db } = useDb();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { openPayment } = usePayment();

  const reportImage = db?.image_assets?.find((a: any) => a.id === 'report_bg_guidance')?.path || 
    "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=800";

  useEffect(() => {
    fetchServicePrice();
  }, []);

  const fetchServicePrice = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('price')
        .eq('name', 'Personal Guidance')
        .eq('status', 'active')
        .single();

      if (!error && data) {
        setServicePrice(data.price);
        console.log('✅ Service price loaded:', data.price);
      }
    } catch (err) {
      console.error('Error fetching price:', err);
    }
  };

  useEffect(() => {
    if (isPaid && reportRef.current) {
      setTimeout(() => {
        reportRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
    }
  }, [isPaid]);

  const validateForm = () => {
    if (!concernType) {
      alert('❌ Please select a concern type');
      return false;
    }
    if (!concernDescription.trim() || concernDescription.trim().length < 50) {
      alert('❌ Please describe your concern in detail (minimum 50 characters)');
      return false;
    }
    if (!currentChallenges.trim() || currentChallenges.trim().length < 30) {
      alert('❌ Please describe your current challenges (minimum 30 characters)');
      return false;
    }
    if (!goals.trim() || goals.trim().length < 30) {
      alert('❌ Please share your goals in detail (minimum 30 characters)');
      return false;
    }
    return true;
  };

  const generateReport = async () => {
    const concernEmoji = CONCERN_TYPES.find(c => c.value === concernType)?.emoji || '✨';
    const concernLabel = CONCERN_TYPES.find(c => c.value === concernType)?.label || concernType;

    console.log('🤖 Generating personalized guidance with products...');

    // Get AI-powered guidance
    const aiGuidance = await generatePersonalizedGuidance(
      concernType,
      concernDescription,
      currentChallenges,
      goals
    );

    console.log('✅ Guidance received, fetching products from store...');

    // Match AI-recommended products with store items
    const productsWithDetails = await Promise.all(
      aiGuidance.recommended_products.map(async (product) => {
        const match = await findProductInStore(product.name, concernType);
        return {
          name: match?.name || product.name,
          price: match?.price || 499,
          image_url: match?.image_url || 'https://images.unsplash.com/photo-1615529182904-14819d19f5d4?w=400',
          store_id: match?.id,
          reason: product.reason,
          confidence: match?.confidence || 0,
          available: match !== null && match.confidence >= 50
        };
      })
    );

    console.log('✅ All products matched:', productsWithDetails.length);

    return `# Personal Guidance & Remedies ${concernEmoji}

**Report Generated:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

**Concern Area:** ${concernLabel}

---

## 🔍 Understanding Your Challenge

Based on your detailed description, you are experiencing significant challenges in **${concernLabel.toLowerCase()}**.

### Your Current Situation
${concernDescription}

### Challenges You're Facing
${currentChallenges}

### Your Desired Outcomes
${goals}

---

## 💎 Your Personalized Healing Path

${aiGuidance.healing_approach}

---

## 🛍️ Sacred Tools for Your Journey

Based on your unique situation, these powerful spiritual tools will support your transformation:

${productsWithDetails.map((product, i) => `### ${i + 1}. ${product.name} ${product.available ? '✅' : '⏳'}

![${product.name}](${product.image_url})

**Why This Helps You:**
${product.reason}

**Price:** ₹${product.price} ${product.available ? '' : '*(Being added to our collection)*'}

${product.store_id ? `**[🛒 Shop Now](/store/item/${product.store_id})**` : '**[📱 Contact Us for This Item](/contact)**'}
`).join('\n\n---\n\n')}

### 🎁 Exclusive Offer
*Use code **GUIDANCE10** for 10% off your first purchase from our store*

---

## 🕉️ Your Daily Spiritual Practice

Follow these practices consistently for best results:

${aiGuidance.daily_practices.map((practice, i) => `### ${i + 1}. ${practice.title}

${practice.description}

**⏰ Best Time:** ${practice.timing}`).join('\n\n')}

---

## ✨ Powerful Affirmations for ${concernLabel}

Repeat these daily with deep faith and feeling. Feel each word as truth:

${aiGuidance.affirmations.map((aff, i) => `${i + 1}. _"${aff}"_`).join('\n\n')}

---

## 📅 Your 30-Day Sacred Transformation Journey

### Week 1: Foundation & Preparation (Days 1-7)
- Acquire your recommended spiritual tools from our store
- Set up a dedicated sacred space in your home
- Begin 10-minute daily meditation practice
- Start using affirmations every morning
- Keep a spiritual journal

### Week 2: Building Sacred Energy (Days 8-14)
- Increase meditation to 15-20 minutes daily
- Work with your crystals/tools consistently
- Practice all recommended daily rituals
- Notice and journal subtle positive shifts
- Maintain unwavering faith in the process

### Week 3: Deep Integration & Healing (Days 15-21)
- Full practice routine becomes natural habit
- Add advanced energy healing techniques
- Observe significant behavioral/emotional changes
- Deepen spiritual connection through devotion
- Share gratitude for transformation

### Week 4: Manifestation & Mastery (Days 22-30)
- Witness clear manifestation of your goals
- Celebrate your incredible progress
- Create sustainable long-term practice plan
- Consider sharing your journey to inspire others
- Book follow-up consultation if needed

---

## 🙏 Important Guidance Notes

### For Deeper Astrological Insights
This guidance is based on your current situation and spiritual wisdom. For detailed predictions based on your exact birth chart (including planetary positions, dashas, and timing of events), please book a personal consultation with our expert Vedic astrologers.

**[📅 Book One-on-One Astrological Consultation →](/book-consultation)**

### Explore Our Sacred Collection
Visit our Vedic Store to explore our complete collection of authentic spiritual tools, crystals, yantras, and sacred items.

**[🛒 Browse All Products →](/store)**

---

**⚠️ Disclaimer:** This guidance combines ancient Vedic spiritual wisdom with modern insights. It is intended for spiritual growth and self-improvement purposes. This is not a substitute for professional medical, legal, or financial advice. For specific life predictions and birth chart analysis, please book a personal astrology consultation.

---

May divine grace, peace, and abundance flow into your life. 🙏✨

*~ With Blessings from the Glyph Circle Team*

---

*Report ID: ${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5).toUpperCase()}*`;
  };

  const saveToDatabase = async (report: string, currentReadingId?: string) => {
    try {
      console.log('💾 Saving to database...');
      
      let savedReadingId = currentReadingId;

      if (!savedReadingId) {
        const { data: readingRecord, error: readingError } = await supabase
          .from('readings')
          .insert([{
            user_id: user?.id,
            type: 'personal-guidance',
            title: `Personal Guidance - ${CONCERN_TYPES.find(c => c.value === concernType)?.label}`,
            subtitle: new Date().toLocaleDateString(),
            content: report,
            is_paid: isPaid,
            meta_data: { concern_type: concernType }
          }])
          .select()
          .single();

        if (readingError) throw readingError;
        savedReadingId = readingRecord.id;
        setReadingId(readingRecord.id);
        console.log('✅ Reading created:', readingRecord.id);
      }

      const { error: guidanceError } = await supabase
        .from('personal_guidance_readings')
        .insert([{
          user_id: user?.id,
          concern_type: concernType,
          concern_description: concernDescription,
          current_challenges: currentChallenges,
          goals: goals,
          guidance_summary: report.substring(0, 500),
          reading_id: savedReadingId,
          is_paid: isPaid
        }]);

      if (guidanceError) console.error('Guidance save error:', guidanceError);
      else console.log('✅ Guidance details saved');

      return savedReadingId;

    } catch (error) {
      console.error('❌ Database save error:', error);
      throw error;
    }
  };

  const savePaymentRecord = async (savedReadingId: string) => {
    try {
      console.log('💰 Saving payment record...');

      const { data: txn, error: txnError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user?.id,
          service_type: 'personal-guidance',
          service_title: 'Personal Guidance & Remedies',
          amount: servicePrice,
          currency: 'INR',
          status: 'success',
          payment_method: 'upi',
          payment_provider: 'manual',
          reading_id: savedReadingId,
          order_id: `GUIDANCE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            concern_type: concernType,
            analysis_date: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (txnError) throw txnError;
      console.log('✅ Transaction saved:', txn.id);

      await supabase
        .from('readings')
        .update({ is_paid: true })
        .eq('id', savedReadingId);

      await supabase
        .from('personal_guidance_readings')
        .update({ is_paid: true })
        .eq('reading_id', savedReadingId);

      console.log('✅ Payment completed and saved');

    } catch (error) {
      console.error('❌ Payment save error:', error);
      throw error;
    }
  };

  const handleGetGuidance = async () => {
    console.log('🎯 Get Guidance clicked');
    
    if (!validateForm()) return;

    console.log('✅ Validation passed');

    setIsGenerating(true);

    try {
      const report = await generateReport();
      setReportData(report);
      console.log('📄 Report generated');

      const savedReadingId = await saveToDatabase(report);
      console.log('✅ Initial save complete, reading ID:', savedReadingId);

      setIsGenerating(false);

      console.log('💳 Opening payment modal...');
      
      openPayment(
        async () => {
          console.log('✅ Payment success callback triggered');
          setIsSaving(true);
          
          try {
            await savePaymentRecord(savedReadingId!);
            setIsPaid(true);
            console.log('✅ All payment data saved');

            setTimeout(() => {
              reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);

          } catch (error) {
            console.error('❌ Error during payment save:', error);
            alert('Payment recorded but failed to save. Please contact support.');
          } finally {
            setIsSaving(false);
          }
        },
        'Personal Guidance & Remedies',
        servicePrice
      );
    } catch (error) {
      console.error('❌ Error during generation:', error);
      alert('Failed to generate report. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <SmartBackButton label={t('backToHome')} className="mb-6" />

      {/* Generating Loading State */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250]">
          <div className="bg-gradient-to-br from-purple-900 via-indigo-800 to-purple-900 p-10 rounded-3xl shadow-2xl border border-purple-500/30 max-w-md text-center">
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">🔮 Consulting Divine Wisdom</h3>
            <p className="text-purple-300 mb-2 text-lg">Analyzing your situation...</p>
            <p className="text-purple-400 text-sm">Matching sacred tools from our collection...</p>
            <p className="text-purple-500 text-sm mt-2">This may take 10-15 seconds 🕉️</p>
          </div>
        </div>
      )}

      {/* Saving Payment Loading State */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250]">
          <div className="bg-gradient-to-br from-purple-900 via-indigo-800 to-purple-900 p-10 rounded-3xl shadow-2xl border border-purple-500/30 max-w-md text-center">
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">Processing Payment</h3>
            <p className="text-purple-300 mb-2 text-lg">Saving your data...</p>
            <p className="text-purple-500 text-sm">This may take a moment 🕉️</p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-black/60 rounded-xl shadow-2xl border border-purple-500/30 backdrop-blur-md p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-cinzel font-bold text-purple-300 mb-2">✨ Personal Guidance</h2>
          <p className="text-purple-100/70 font-lora italic">Receive personalized spiritual guidance and practical remedies</p>
        </div>

        <div className="mb-6">
          <label className="block text-purple-300 font-semibold mb-3 text-sm uppercase tracking-wider">
            What area needs guidance? <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CONCERN_TYPES.map((concern) => (
              <button
                key={concern.value}
                onClick={() => setConcernType(concern.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  concernType === concern.value 
                    ? `${concern.color} border-white shadow-lg scale-105` 
                    : 'bg-gray-900/50 border-purple-500/20 hover:border-purple-500/50'
                }`}
              >
                <span className="text-3xl mb-2">{concern.emoji}</span>
                <span className={`text-xs text-center ${concernType === concern.value ? 'text-white font-bold' : 'text-purple-300'}`}>
                  {concern.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-purple-300 font-semibold mb-2 text-sm">
            Describe your situation in detail <span className="text-red-400">*</span>
          </label>
          <textarea
            value={concernDescription}
            onChange={(e) => setConcernDescription(e.target.value)}
            placeholder="Please share your situation in detail... What is troubling you? When did it start? How is it affecting your life?"
            rows={6}
            className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none placeholder-purple-400/30 font-lora leading-relaxed"
          />
          <p className="text-gray-500 text-xs mt-1">
            Minimum 50 characters • Current: {concernDescription.length}
            {concernDescription.length >= 50 && <span className="text-green-500 ml-2 font-semibold">✓ Good detail</span>}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-purple-300 font-semibold mb-2 text-sm">
            What specific challenges are you facing? <span className="text-red-400">*</span>
          </label>
          <textarea
            value={currentChallenges}
            onChange={(e) => setCurrentChallenges(e.target.value)}
            placeholder="What obstacles are blocking you? What have you already tried? What patterns do you notice?"
            rows={5}
            className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none placeholder-purple-400/30 font-lora"
          />
          <p className="text-gray-500 text-xs mt-1">
            Minimum 30 characters • Current: {currentChallenges.length}
            {currentChallenges.length >= 30 && <span className="text-green-500 ml-2 font-semibold">✓</span>}
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-purple-300 font-semibold mb-2 text-sm">
            What are your goals and desired outcomes? <span className="text-red-400">*</span>
          </label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="What would you like to achieve? How would you like your life to look? What would success mean to you?"
            rows={5}
            className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none placeholder-purple-400/30 font-lora"
          />
          <p className="text-gray-500 text-xs mt-1">
            Minimum 30 characters • Current: {goals.length}
            {goals.length >= 30 && <span className="text-green-500 ml-2 font-semibold">✓</span>}
          </p>
        </div>

        <Button
          onClick={handleGetGuidance}
          disabled={!concernType || concernDescription.length < 50 || currentChallenges.length < 30 || goals.length < 30 || isGenerating}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-pink-400/50 shadow-lg py-4 text-lg font-cinzel tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '🔮 Generating Guidance...' : `🔮 Get Divine Guidance - ₹${servicePrice}`}
        </Button>

        <p className="text-center text-gray-500 text-xs mt-3">
          <span className="text-red-500">*</span> All fields required • Detailed responses ensure better guidance
        </p>

        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-500/20">
          <p className="text-gray-700 dark:text-purple-300 text-xs text-center">
            💡 <strong>Note:</strong> For personalized astrological predictions based on your birth chart, 
            book a one-on-one consultation where your exact birth details can be analyzed by our expert astrologers.
          </p>
        </div>
      </div>

      {reportData && isPaid && (
        <div ref={reportRef} className="mt-8 scroll-mt-24">
          <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-black/60 rounded-xl shadow-2xl border border-purple-500/30 backdrop-blur-md p-8">
            <FullReport
              reading={reportData}
              category="personal-guidance"
              title="Personal Guidance & Remedies"
              subtitle={CONCERN_TYPES.find(c => c.value === concernType)?.label || 'Guidance Report'}
              imageUrl={cloudManager.resolveImage(reportImage)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalGuidance;
