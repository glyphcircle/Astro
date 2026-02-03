
# 🔮 Glyph Circle - AI Mystical Experiences

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-green.svg)](https://vitejs.dev)

## ✨ **What is Glyph Circle?**

**AI-powered mystical experiences** in your browser:

- 🔮 **Tarot Reading** - 78 card deck with 3D animations
- ✋ **Palmistry** - Upload palm → AI line analysis  
- 😐 **Face Reading** - Facial features → Personality insights
- 🔢 **Numerology** - Life path calculations
- 🌟 **Astrology** - Natal chart interpretations

**Multi-language:** English, Hindi, Français + more

## 🎯 **Features**

<div align="center">
<table>
<tr>
<td><b>✨ AI-Powered</b></td>
<td><b>💳 Payment Ready</b></td>
</tr>
<tr>
<td>
- Gemini AI integration<br>
- Real-time predictions<br>
- Multi-modal (image+text)
</td>
<td>
- Google Pay UPI<br>
- Credit/Debit Cards<br>
- PayPal (demo mode)<br>
- Full report unlock
</td>
</tr>
</table>
</div>

## 🛠️ **Quick Start**

```bash
# Install dependencies
npm install

# Get Gemini API Key
# https://aistudio.google.com/app/apikey

# Add to .env.local
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# Run
npm run dev
```

📱 Local: http://localhost:5173

## 🆙 Tech Stack
```text
Frontend: React 18 + Vite + Tailwind
AI: Google Gemini API
Payments: Demo Stripe/PayPal/UPI
State: React Context
DB: SQLite (local) / Supabase (Cloud)
Lang: i18next (EN/HI/FR)
```

## 📁 Folder Structure
```text
src/
├── components/     # TarotCard, PaymentModal
├── context/        # LanguageContext, PaymentContext
├── locales/        # en.json, hi.json
├── pages/          # Home, Tarot, Palmistry
└── hooks/          # useGemini.js
```

## 🔒 Security
✅ No API keys in repo  
✅ Payment demo mode only  
✅ XSS/CSRF protected  

## 📄 License
MIT License - Use freely!
