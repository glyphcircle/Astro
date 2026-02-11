import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SERVICE_OPTIONS } from '../constants';
import { useDb } from '../hooks/useDb';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { cloudManager } from '../services/cloudManager';

const Home: React.FC = () => {
    const { db } = useDb();
    const { t, getRegionalPrice } = useTranslation();
    const { isAdminVerified } = useAuth();
    const navigate = useNavigate();

    // 🛠️ ADMIN CONFIGURABLE OPACITY - Fixed Registry Path
    const hoverOpacity = useMemo(() => {
        const configVal = db.config?.find((c: any) => c.key === 'hover_opacity')?.value;
        return configVal ? parseFloat(configVal) : 0.85;
    }, [db.config]);

    const displayServices = useMemo(() => {
        const raw = Array.isArray(db?.services) ? db.services : [];
        return raw.filter((s: any) => s && s.status === 'active').map((service: any) => {
            const standardOpt = SERVICE_OPTIONS.find(opt =>
                opt.id === service.id ||
                service.name.toLowerCase().includes(opt.id.toLowerCase())
            );

            let iconToDisplay = standardOpt ? standardOpt.icon : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                </svg>
            );

            // Resolve Google Drive URLs properly
            const resolvedImageUrl = service.image ? cloudManager.resolveImage(service.image) : null;

            // Debug logging (remove after testing)
            if (service.image) {
                console.log('🖼️ Service:', service.name, {
                    original: service.image,
                    resolved: resolvedImageUrl
                });
            }

            return {
                ...service,
                icon: iconToDisplay,
                resolvedImageUrl
            };
        });
    }, [db?.services]);


    return (
        <div className="-mt-8 -mx-4 relative min-h-screen overflow-hidden bg-skin-base transition-colors duration-500">
            <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.15)_0%,transparent_50%)]"></div>
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-skin-base to-transparent"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-20 pb-32 flex flex-col items-center">

                {isAdminVerified && (
                    <div className="w-full max-w-5xl mb-12 animate-fade-in-up">
                        <div className="bg-skin-surface p-6 rounded-[2rem] border border-skin-border backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                            <div>
                                <h2 className="text-xl font-cinzel font-black text-skin-accent tracking-widest uppercase">Master Registry</h2>
                                <p className="text-[9px] text-skin-text opacity-40 uppercase tracking-[0.3em] font-bold">Configure 'hover_opacity' in registry</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => navigate('/admin/db/services')} className="bg-amber-600 hover:bg-amber-500 text-white font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95">Offerings</button>
                                <button onClick={() => navigate('/admin/config')} className="bg-gray-900 border border-amber-500/30 hover:bg-gray-800 text-amber-500 font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95">UI Config</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center mb-16 max-w-5xl mx-auto px-4">
                    <h1 className="text-6xl md:text-8xl font-cinzel font-black text-skin-text mb-6 tracking-tighter uppercase drop-shadow-2xl">
                        {t('glyphCircle')}
                    </h1>
                    <div className="flex items-center justify-center gap-6">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-skin-accent opacity-40"></div>
                        <p className="text-lg md:text-xl text-skin-text opacity-70 font-lora italic tracking-wide">
                            Gateway into the ancient mysteries.
                        </p>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-skin-accent opacity-40"></div>
                    </div>
                </div>

                {displayServices.length === 0 ? (
                    <div className="text-center py-24 bg-skin-surface rounded-[3rem] border border-dashed border-skin-border max-w-md w-full">
                        <div className="text-4xl mb-4 animate-pulse">📜</div>
                        <p className="text-skin-text opacity-40 font-lora italic">The Registry is being prepared...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[95rem] mx-auto w-full px-4">
                        {displayServices.map((service: any) => {
                            const dbPath = (service.path || '').trim();
                            const MAPPING: Record<string, string> = {
                                'store': '/store', 'voice': '/voice-oracle', 'palm': '/palmistry',
                                'tarot': '/tarot', 'face': '/face-reading', 'numerology': '/numerology',
                                'astrology': '/astrology', 'matchmaking': '/matchmaking', 'ayurveda': '/ayurveda',
                                'dream': '/dream-analysis', 'remedy': '/remedy', 'guidance': '/remedy',
                                'calendar': '/calendar', 'gemstone': '/gemstones', 'mantra': '/gemstones',
                                'muhurat': '/muhurat', 'sync': '/cosmic-sync', 'moon': '/moon-journal'
                            };

                            const sname = service.name.toLowerCase();
                            const matchedKeyword = Object.keys(MAPPING).find(keyword => sname.includes(keyword));
                            let targetPath = dbPath && dbPath !== '/coming-soon' ? dbPath : (matchedKeyword ? MAPPING[matchedKeyword] : `/coming-soon?id=${service.id}`);
                            const isImplemented = targetPath !== '/coming-soon' && !targetPath.startsWith('/coming-soon');

                            return (
                                <Link to={targetPath} key={service.id} className="group relative block h-full z-20">
                                    <div className="imperial-card h-full rounded-[2.5rem] p-10 text-center flex flex-col items-center relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">

                                        {service.resolvedImageUrl && (
                                            <div className="absolute inset-0 z-0 overflow-hidden">
                                                <img
                                                    src={service.resolvedImageUrl}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover opacity-30 transition-all duration-700 transform scale-100 group-hover:scale-110 group-hover:opacity-[var(--hover-opacity)] group-hover:brightness-110"
                                                />
                                                {/* Gradient mask that completely disappears on hover to show the sharp image */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-skin-base via-transparent to-skin-base opacity-40 group-hover:opacity-10 transition-opacity duration-700"></div>
                                            </div>
                                        )}

                                        <div className="relative z-10 mb-8 w-28 h-28 rounded-full sacred-circle-icon flex items-center justify-center transform group-hover:scale-110 transition-all duration-700 shadow-xl group-hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                                            <div className="text-white drop-shadow-lg">{service.icon}</div>
                                        </div>

                                        <div className="relative z-10 flex flex-col items-center h-full w-full">
                                            <h3 className="text-3xl font-cinzel font-black mb-4 text-skin-text uppercase tracking-wider group-hover:text-skin-accent transition-colors drop-shadow-xl leading-tight">
                                                {service.name}
                                            </h3>

                                            <p className="text-skin-text opacity-60 font-lora text-sm leading-relaxed mb-10 italic group-hover:opacity-90 transition-colors">
                                                {service.description || "Divine details currently masked."}
                                            </p>

                                            <div className="mt-auto w-full pt-8 border-t border-skin-border/20 flex flex-col items-center gap-4">
                                                <div className="text-skin-accent font-mono font-black text-xl tracking-tighter group-hover:scale-110 transition-transform">
                                                    {service.price > 0 ? getRegionalPrice(service.price).display : 'FREE'}
                                                </div>
                                                <div className={`w-full py-3 rounded-full border transition-all ${isImplemented ? 'bg-amber-600 border-amber-400 text-white shadow-lg group-hover:bg-amber-500 group-hover:shadow-[0_5px_15px_rgba(245,158,11,0.3)]' : 'bg-skin-surface border-skin-border/40 group-hover:border-skin-accent'}`}>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                                                        {isImplemented ? 'Manifest Portal' : 'Under Observation'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`
        .imperial-card:hover {
            box-shadow: 0 0 50px rgba(0,0,0,0.4), inset 0 0 20px rgba(245,158,11,0.1);
        }
      `}</style>
        </div>
    );
};

export default Home;
