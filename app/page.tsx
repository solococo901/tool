"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Platform = 'FACEBOOK' | 'TIKTOK' | 'YOUTUBE'| 'INSTAGRAM';

export default function Downloader() {
  const [activeTab, setActiveTab] = useState<Platform>('FACEBOOK');
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!url) return;
    setLoading(true);
    setData(null);
    setError('');

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: JSON.stringify({ url, platform: activeTab }),
      });
      const result = await res.json();
      
      if (!res.ok || result.error) {
        throw new Error(result.error || "Không thể bóc tách dữ liệu");
      }
      
      setData(result);
    } catch (e: any) {
      setError(e.message || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const getPlatformColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'TIKTOK': return 'bg-[#ff0050]';
      case 'FACEBOOK': return 'bg-[#1877f2]';
      case 'YOUTUBE': return 'bg-[#ff0000]';
      default: return 'bg-white';
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-mono selection:bg-white selection:text-black">
      {/* Background Grid - Architectural Style */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <header className="mb-12 border-l-4 border-white pl-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">AnLe Dep Try / <br />Download Tools</h1>
          <p className="text-[10px] opacity-40 mt-2 tracking-[0.3em]">QUA DA</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide">
          {(['FACEBOOK', 'TIKTOK', 'YOUTUBE','INSTAGRAM'] as Platform[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setUrl(''); setData(null); setError(''); }}
              className={`px-8 py-5 text-[10px] tracking-[0.4em] font-black transition-all border-t border-l border-r border-transparent whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-black border-white' 
                  : 'opacity-30 hover:opacity-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="border-x border-b border-white/10 p-6 md:p-12 bg-white/[0.01] backdrop-blur-sm">
          <div className="flex flex-col gap-6">
            <label className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-bold">
              Input {activeTab} Source URL:
            </label>
            <div className="flex flex-col md:flex-row gap-0 border border-white/20 p-1">
              <input
                className="flex-1 bg-transparent p-4 outline-none focus:bg-white/5 transition-all text-sm md:text-base"
                placeholder={`Dán link ${activeTab.toLowerCase()} vào đây...`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                onClick={handleExtract}
                disabled={loading}
                className="bg-white text-black px-10 py-4 font-black uppercase text-xs tracking-widest hover:invert transition-all disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 border border-red-500/50 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                Error: {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Block */}
          {data && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 border border-white/20 overflow-hidden">
              <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${getPlatformColor(data.type || activeTab)}`} />
                  <span className="text-[10px] uppercase font-black tracking-widest italic">
                    {data.type || activeTab} Source Authenticated
                  </span>
                </div>
                <span className="text-[8px] opacity-30">#ID_{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Preview Side */}
                <div className="md:col-span-7 p-6 border-b md:border-b-0 md:border-r border-white/10 bg-black">
                  <div className="relative aspect-video group border border-white/5 overflow-hidden">
                    <video src={data.hd || data.sd} controls className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Download Side */}
                <div className="md:col-span-5 p-8 flex flex-col justify-between bg-white/[0.02]">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[8px] opacity-40 uppercase mb-1">Title / Metadata</p>
                      <h3 className="text-xs font-bold leading-relaxed line-clamp-3 uppercase tracking-tighter italic">
                        {data.title || "Video Stream Decoded Successfully"}
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {(data.hd || data.url) && (
                        <button
                          onClick={() => window.location.href = `/api/download?url=${encodeURIComponent(data.hd || data.url)}`}
                          className="w-full bg-white text-black p-4 font-black uppercase text-[10px] tracking-[0.2em] hover:invert transition-all flex justify-between items-center"
                        >
                          <span>Download High Quality</span>
                          <span>[HD]</span>
                        </button>
                      )}
                      
                      {data.sd && (
                        <button
                          onClick={() => window.location.href = `/api/download?url=${encodeURIComponent(data.sd)}`}
                          className="w-full border border-white/20 p-4 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all flex justify-between items-center"
                        >
                          <span>Standard Definition</span>
                          <span>[SD]</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-4 text-[9px] opacity-30 leading-loose">
                    * ALL DATA IS PROCESSED THROUGH ENCRYPTED PROXY.<br />
                    * MEDIA RETENTION: NULL (VOLATILE STREAM).
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}