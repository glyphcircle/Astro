import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from './shared/Card';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import FullReport from './FullReport';
import { generatePDF } from '../utils/pdfGenerator';

const ReadingHistory: React.FC = () => {
  const { history, toggleFavorite, isLoading } = useAuth();
  const { t, getRegionalPrice } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [selectedReading, setSelectedReading] = useState<any>(null);

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(r => r.is_favorite);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewReport = (reading: any) => {
    console.log('📄 Opening full report flow for:', reading.id);
    
    // Store reading in sessionStorage for the service component to pick up
    sessionStorage.setItem('viewReport', JSON.stringify({
      reading: reading,
      isPaid: true,
      timestamp: Date.now(),
    }));
    
    // Navigate to the specific service page
    const routes: Record<string, string> = {
        'tarot': '/tarot',
        'palmistry': '/palmistry',
        'astrology': '/astrology',
        'numerology': '/numerology',
        'face-reading': '/face-reading',
        'remedy': '/remedy',
        'matchmaking': '/matchmaking',
        'dream-analysis': '/dream-analysis'
    };
    
    const target = routes[reading.type] || '/home';
    navigate(target);
  };

  const handleDownloadPDF = async (reading: any) => {
    // 🔑 For high-fidelity enriched layouts, we navigate to the service 
    // and let its own handler trigger automatically via the flag.
    const ENRICHED_TYPES = ['astrology', 'numerology', 'palmistry', 'tarot', 'face-reading', 'dream-analysis', 'remedy', 'ayurveda'];
    
    if (ENRICHED_TYPES.includes(reading.type)) {
        sessionStorage.setItem('autoDownloadPDF', '1');
        handleViewReport(reading);
        return;
    }
    
    // Fallback for simple/generic types
    setSelectedReading(reading);
    setTimeout(() => {
        generatePDF('report-detail-view', {
            filename: `Report-${reading.title.replace(/\s+/g, '-')}.pdf`,
            marginSide: 5
        });
    }, 1000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tarot': return '🔮';
      case 'palmistry': return '✋';
      case 'astrology': return '🌟';
      case 'numerology': return '🔢';
      case 'face-reading': return '😐';
      case 'remedy': return '🧘';
      case 'matchmaking': return '❤️';
      case 'dream-analysis': return '🌙';
      default: return '📜';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
           <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
          </Link>
          <h2 className="text-3xl font-cinzel font-bold text-amber-300 drop-shadow-lg">My Journey</h2>
          <p className="text-amber-200/60 text-sm font-lora">Your spiritual timeline and saved insights.</p>
        </div>

        <div className="flex bg-gray-900/80 rounded-lg p-1 mt-4 md:mt-0 border border-amber-500/20 backdrop-blur-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'all' ? 'bg-amber-600 text-white shadow-lg' : 'text-amber-200 hover:text-white hover:bg-gray-800'}`}
          >
            All Readings
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'favorites' ? 'bg-amber-600 text-white shadow-lg' : 'text-amber-200 hover:text-white hover:bg-gray-800'}`}
          >
            Favorites
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-amber-200 animate-pulse font-cinzel">Summoning your history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <Card className="p-16 text-center bg-black/40 border-dashed border-amber-500/30">
          <div className="text-6xl mb-4 opacity-50">📜</div>
          <p className="text-amber-200/80 text-xl font-cinzel mb-2">The Scroll is Empty</p>
          <p className="text-amber-200/50 mb-6">You haven't saved any {filter === 'favorites' ? 'favorites' : 'readings'} yet.</p>
          <Link to="/home">
            <button className="px-8 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors shadow-lg">
                Begin a New Reading
            </button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((reading) => (
            <div key={reading.id} className="relative group h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-600 to-purple-900 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
              <Card className="relative h-full bg-gray-900/90 border-amber-500/10 group-hover:border-amber-500/30 transition-all duration-300 flex flex-col group-hover:-translate-y-1">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/50 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
                        {getTypeIcon(reading.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-cinzel font-bold text-amber-100 leading-tight">{reading.title}</h3>
                        <p className="text-[10px] text-amber-500 uppercase tracking-widest mt-0.5">{reading.subtitle || reading.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(reading.id); }}
                      className={`transform transition-all duration-300 hover:scale-110 p-1 rounded-full hover:bg-white/5 ${reading.is_favorite ? 'text-amber-400' : 'text-gray-600 hover:text-amber-200'}`}
                      title="Toggle Favorite"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={reading.is_favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-amber-100/70 font-lora italic border-l-2 border-amber-500/20 pl-4 mb-6 line-clamp-3 text-sm flex-grow">
                    "{reading.content}"
                  </div>

                  {reading.payment_amount && (
                    <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-amber-500/80">
                      Amount: {getRegionalPrice(reading.payment_amount).display}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                        onClick={() => handleViewReport(reading)}
                        className="bg-emerald-700/80 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                      📄 View Full
                    </button>
                    <button 
                        onClick={() => handleDownloadPDF(reading)}
                        className="bg-gray-800 hover:bg-gray-700 text-amber-100 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all border border-amber-500/20"
                    >
                      📥 PDF
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-amber-200/40 border-t border-amber-500/10 pt-4 mt-auto">
                    <span>{formatDate(reading.timestamp)}</span>
                    <span className="flex items-center gap-1 text-green-400/80 bg-green-900/20 px-2 py-0.5 rounded-full border border-green-500/20">
                      Saved
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Quick Detail Modal */}
      {selectedReading && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm">
              <div className="min-h-screen px-4 text-center">
                  <div className="fixed inset-0" onClick={() => setSelectedReading(null)}></div>
                  <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                  <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform relative">
                      <button 
                        onClick={() => setSelectedReading(null)}
                        className="fixed top-4 right-4 md:absolute md:-top-2 md:-right-10 text-white hover:text-amber-400 z-[60] bg-black/50 rounded-full p-2"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                      <div id="report-detail-view">
                          <FullReport 
                              reading={selectedReading.content}
                              title={selectedReading.title}
                              subtitle={selectedReading.subtitle}
                              imageUrl={selectedReading.image_url}
                              chartData={selectedReading.meta_data}
                          />
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ReadingHistory;
