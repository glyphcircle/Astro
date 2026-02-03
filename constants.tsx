import React from 'react';
import type { ServiceOption } from './types';

export const ADMIN_EMAILS = [
  'mitaakxi@glyphcircle.com',
  'master@glyphcircle.com', 
  'admin@glyphcircle.com', 
  'admin@glyph.circle',
  'master@gylphcircle.com',
  'admin@gylphcircle.com'
];

export const FALLBACK_IMAGES = {
  REPORT_DEFAULT: 'https://images.unsplash.com/photo-1509228627129-6690a87531bc?q=80&w=800',
  FEATURE_DEFAULT: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800',
  LOGO_DEFAULT: 'https://images.unsplash.com/photo-1600609842388-3e4b489d71c6?q=80&w=600'
};

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'calendar',
    name: 'Kalnirnaye Calendar',
    description: 'Ancient Hindu Panchang with Tithi, Nakshatra, and Shubh Muhurats.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 11v4m0 0l2-2m-2 2l-2-2" />
        <circle cx="12" cy="13" r="4" strokeDasharray="2 2" />
      </svg>
    ),
    path: '/calendar',
  },
  {
    id: 'numerology',
    name: 'Numerology',
    description: 'Uncover the secrets hidden in your name and birth date.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    path: '/numerology',
  },
  {
    id: 'astrology',
    name: 'Astrology',
    description: 'Explore your destiny written in the stars and planets.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    path: '/astrology',
  },
  {
    id: 'ayurveda',
    name: 'Ayurvedic Dosha',
    description: 'Analyze your body constitution (Prakriti) and get diet plans.',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
    ),
    path: '/ayurveda',
  },
  {
    id: 'muhurat',
    name: 'Shubh Muhurat',
    description: 'Find the most auspicious time for your activities.',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    path: '/muhurat',
  },
  {
    id: 'moon-journal',
    name: 'Moon Journal',
    description: 'Track your mood aligned with the lunar phases.',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    ),
    path: '/moon-journal',
  },
  {
    id: 'cosmic-sync',
    name: 'Cosmic Sync',
    description: 'Compare charts with friends for spiritual compatibility.',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    path: '/cosmic-sync',
  },
  {
    id: 'voice-oracle',
    name: 'Voice Oracle',
    description: 'Speak to the Sage directly and receive spoken wisdom.',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    ),
    path: '/voice-oracle',
  },
  {
    id: 'gemstones',
    name: 'Gemstones & Mantras',
    description: 'Find your power stone and sacred sound vibrations.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    path: '/gemstones',
  },
  {
    id: 'matchmaking',
    name: 'Vedic Matchmaking',
    description: 'Check marital compatibility using the ancient Guna Milan system.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    path: '/matchmaking',
  },
  {
    id: 'tarot',
    name: 'Tarot',
    description: 'Draw a card and gain insight into your past, present, and future.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    path: '/tarot',
  },
  {
    id: 'palmistry',
    name: 'Palmistry',
    description: 'Read the lines on your hand to understand your character and future.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    path: '/palmistry',
  },
  {
    id: 'face-reading',
    name: 'Face Reading',
    description: 'Discover what your facial features reveal about your personality.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: '/face-reading',
  },
  {
    id: 'dream-analysis',
    name: 'Dream Analysis',
    description: 'Decode the symbols of your subconscious and find your lucky numbers.',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    ),
    path: '/dream-analysis',
  },
  {
    id: 'remedy',
    name: 'Personal Guidance',
    description: 'Get personalized remedies and guidance for your life challenges.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: '/remedy',
  },
  {
    id: 'store',
    name: 'Vedic Store',
    description: 'Authentic Rudraksha, Yantras, and Gemstones for your spiritual path.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    path: '/store',
  },
];

export const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1531162232855-369463387517?q=80&w=1920',
  'https://images.unsplash.com/photo-1515524738708-327f6b0037a2?q=80&w=1920',
  'https://images.unsplash.com/photo-1605333116398-1c39a3f898e3?q=80&w=1920',
  'https://images.unsplash.com/photo-1590387120759-4f86a5578507?q=80&w=1920',
];