import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TurnoverLevel {
  puzzle: string;
  pvp: string;
  other: string;
}
interface TurnoverTable {
  instant: TurnoverLevel;
  daily: TurnoverLevel;
  weekly: TurnoverLevel;
  monthly: TurnoverLevel;
}

interface PhonePreviewProps {
  visibility: {
    instant: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  saveCount: number;
  phoneResetCount: number;
  turnover: TurnoverTable;
  schedule: { weekly: string; monthly: string };
  resetTimes: { daily: string; weekly: string; monthly: string };
  instantFreq: string;
  howToEarnText: string;
}

const BASE_AMOUNTS = { puzzle: 1000, pvp: 500, other: 2300 };

const IMAGE_MAP = {
  instant: 'https://vaazojyvfvvybisheprd.supabase.co/storage/v1/object/public/side-project/instant.png',
  daily: 'https://vaazojyvfvvybisheprd.supabase.co/storage/v1/object/public/side-project/daily.png',
  weekly: 'https://vaazojyvfvvybisheprd.supabase.co/storage/v1/object/public/side-project/weekly.png',
  monthly: 'https://vaazojyvfvvybisheprd.supabase.co/storage/v1/object/public/side-project/monthly.png'
};

function formatTime(ms: number) {
  if (ms <= 0) return "00:00";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((ms % (1000 * 60)) / 1000);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function PhonePreview({ visibility, saveCount, phoneResetCount, turnover, schedule, resetTimes, instantFreq, howToEarnText }: PhonePreviewProps) {
  const [flash, setFlash] = useState(false);
  const [effects, setEffects] = useState<{ id: number; type: string; txt: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'how-to-earn'>('overview');
  
  const [lastClaim, setLastClaim] = useState<{ [key: string]: number | null }>({
    instant: null, daily: null, weekly: null, monthly: null
  });
  
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const int = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(int);
  }, []);

  // Flash UI on save
  useEffect(() => {
    if (saveCount > 0) {
      setFlash(true);
      const timerCount = setTimeout(() => setFlash(false), 500);
      return () => {
        clearTimeout(timerCount);
      };
    }
  }, [saveCount]);

  // Reset claims when phone reset clicked
  useEffect(() => {
    if (phoneResetCount > 0) {
      setLastClaim({ instant: null, daily: null, weekly: null, monthly: null });
    }
  }, [phoneResetCount]);

  const handleClaim = (type: string, amount: string) => {
    setLastClaim(prev => ({ ...prev, [type]: Date.now() }));
    
    const effectId = Date.now();
    setEffects(prev => [...prev, { id: effectId, type, txt: `+$${amount}` }]);
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== effectId));
    }, 1200);
  };

  const getNextReset = (type: string, lastTime: number | null) => {
    if (!lastTime) return 0;
    
    if (type === 'instant') {
      const freqHours = parseFloat(instantFreq);
      const ms = (isNaN(freqHours) ? 0.25 : freqHours) * 60 * 60 * 1000;
      return lastTime + ms;
    }
    
    const timeStr = resetTimes[type as keyof typeof resetTimes];
    const [h = 0, m = 0, s = 0] = timeStr ? timeStr.split(':').map(Number) : [0, 0, 0];

    const d = new Date();
    d.setHours(h, m, s, 0);

    const timeHasPassedToday = Date.now() >= d.getTime();

    if (type === 'daily') {
      if (timeHasPassedToday) {
        d.setDate(d.getDate() + 1);
      }
      return d.getTime();
    }
    
    if (type === 'weekly') {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const targetIdx = days.indexOf(schedule.weekly);
      
      if (timeHasPassedToday || d.getDay() !== targetIdx) {
        d.setDate(d.getDate() + 1); // Start checking from tomorrow
        while (d.getDay() !== targetIdx) {
          d.setDate(d.getDate() + 1);
        }
      }
      return d.getTime();
    }
    
    if (type === 'monthly') {
      const targetDay = parseInt(schedule.monthly, 10);
      d.setDate(targetDay);
      if (d.getTime() <= Date.now()) {
        d.setMonth(d.getMonth() + 1);
      }
      return d.getTime();
    }
    return 0;
  };

  const calcAmount = (level: TurnoverLevel) => 
    (parseFloat(level.puzzle) || 0)/100 * BASE_AMOUNTS.puzzle + 
    (parseFloat(level.pvp) || 0)/100 * BASE_AMOUNTS.pvp + 
    (parseFloat(level.other) || 0)/100 * BASE_AMOUNTS.other;

  const amounts = {
    instant: calcAmount(turnover.instant).toFixed(2),
    daily: calcAmount(turnover.daily).toFixed(2),
    weekly: calcAmount(turnover.weekly).toFixed(2),
    monthly: calcAmount(turnover.monthly).toFixed(2),
  };

  const renderCard = (type: keyof typeof amounts, title: string) => {
    const isClaimed = lastClaim[type] !== null;
    const nextReset = getNextReset(type, lastClaim[type]);
    const timeLeft = isClaimed ? nextReset - now : 0;
    
    // Auto reset if time passed
    if (isClaimed && timeLeft <= 0) {
      setTimeout(() => setLastClaim(prev => ({ ...prev, [type]: null })), 0);
    }

    const currentAmount = isClaimed && timeLeft > 0 ? "0.00" : amounts[type];

    return (
      <div className={`rounded-xl border border-[#4a2e2e] flex flex-col items-center justify-between relative overflow-hidden h-[240px]`}>
        {/* Background Image */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-all duration-300 ${isClaimed && timeLeft > 0 ? 'grayscale opacity-60' : ''}`} 
          style={{ backgroundImage: `url(${IMAGE_MAP[type]})` }} 
        />
        
        {/* Half circle overlay at bottom for readability */}
        <div className="absolute -bottom-10 inset-x-0 h-48 bg-black/80 rounded-t-[100%] blur-sm pointer-events-none" />
        {/* Subtle gradient to ease the contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

        <h3 className="text-white font-bold text-lg z-10 pt-4 drop-shadow-md tracking-wider text-center w-full">{title}</h3>
        
        <div className="flex-1 flex items-center justify-center relative w-full mt-2 z-10">
          <div className="absolute bottom-4 font-black text-3xl text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
            {currentAmount}
          </div>
          <AnimatePresence>
            {effects.filter(e => e.type === type).map(e => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1.2, y: -40 }}
                exit={{ opacity: 0, scale: 0.8, y: -60 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute font-black text-2xl text-green-400 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] z-50 pointer-events-none"
              >
                {e.txt}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="w-full text-center z-10 mt-2 relative p-4 pt-0">
          {(!isClaimed || timeLeft <= 0) ? (
            <button 
              onClick={() => handleClaim(type, amounts[type])}
              className="w-full py-2.5 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 rounded-lg text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(239,68,68,0.5)] border border-red-400/50 transition-all uppercase tracking-wide"
            >
              Claim
            </button>
          ) : (
            <div className="w-full pb-1">
              <p className="text-[10px] font-bold text-[#c22519] mb-1.5 tracking-wider uppercase drop-shadow">CLAIM SOON!</p>
              <div className="h-4 bg-[#1a0a0a]/80 backdrop-blur-md rounded-full overflow-hidden w-full relative border border-[#5a3a3a]">
                <div className="absolute left-0 top-0 bottom-0 bg-[#c22519] transition-all duration-1000" style={{ width: `${Math.max(5, (timeLeft / (nextReset - lastClaim[type]!)) * 100)}%`}} />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] z-10">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-[375px] h-full max-h-[812px] min-h-[500px] bg-[#1a1111] rounded-[40px] overflow-hidden shadow-2xl border-[8px] border-black flex flex-col relative shrink-0">
      
      {/* Top Bar */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between z-10 relative">
        <ArrowLeft className="w-6 h-6 text-white" />
        <h1 className="text-2xl font-bold bg-gradient-to-b from-[#ffeaea] to-[#b37a7a] bg-clip-text text-transparent drop-shadow-md tracking-tight">
          Cashback
        </h1>
        <div className="relative">
          <Share2 className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-2 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full w-4 h-4 flex items-center justify-center">
             <div className="bg-yellow-100 rounded-full w-2 h-2" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 text-center py-3 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('how-to-earn')}
          className={`flex-1 text-center py-3 font-medium text-sm transition-colors ${activeTab === 'how-to-earn' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}
        >
          How to Earn
        </button>
      </div>

      {/* Main Content */}
      <motion.div 
        className="flex-1 overflow-y-auto px-4 py-6"
        animate={{ scale: flash ? 1.02 : 1, filter: flash ? "brightness(1.5)" : "brightness(1)", opacity: flash ? 0.9 : 1 }}
        transition={{ duration: 0.15 }}
      >
        {activeTab === 'overview' ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold drop-shadow-sm text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-400">Claim your reward below</span> 🎉
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-6">
              {visibility.instant && renderCard('instant', 'Instant')}
              {visibility.daily && renderCard('daily', 'Daily')}
              {visibility.weekly && renderCard('weekly', 'Weekly')}
              {visibility.monthly && renderCard('monthly', 'Monthly')}
            </div>
          </>
        ) : (
          <div className="text-white text-sm whitespace-pre-wrap leading-relaxed pb-6 text-left opacity-90">
            {howToEarnText}
          </div>
        )}
      </motion.div>
      
      {/* Home Indicator */}
      <div className="h-8 w-full flex justify-center items-center absolute bottom-0 bg-transparent pointer-events-none z-50">
        <div className="w-1/3 h-1 bg-white/70 rounded-full drop-shadow-lg" />
      </div>
    </div>
  );
}
