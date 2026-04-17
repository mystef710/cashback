import React, { useState, useEffect } from 'react';
import { LayoutGrid, ChevronRight, Clock, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PhonePreview } from './PhonePreview';

const DEFAULT_VISIBILITY = { instant: true, daily: true, weekly: true, monthly: true };
type TurnoverLevel = { puzzle: string, pvp: string, other: string };
interface TurnoverTable {
  instant: TurnoverLevel;
  daily: TurnoverLevel;
  weekly: TurnoverLevel;
  monthly: TurnoverLevel;
}
const DEFAULT_TURNOVER: TurnoverTable = {
  instant: { puzzle: "0.2", pvp: "0.1", other: "0.1" },
  daily: { puzzle: "0.2", pvp: "0.1", other: "0.1" },
  weekly: { puzzle: "0.1", pvp: "0.05", other: "0.05" },
  monthly: { puzzle: "0.05", pvp: "0.05", other: "0.05" }
};
const DEFAULT_SCHEDULE = { weekly: "Friday", monthly: "21" };
const DEFAULT_RESET_TIMES = { daily: "20:00:00", weekly: "23:00:00", monthly: "18:00:00" };

export default function App() {
  const [visibilities, setVisibilities] = useState(DEFAULT_VISIBILITY);
  const [draftTurnover, setDraftTurnover] = useState<TurnoverTable>(DEFAULT_TURNOVER);
  const [savedTurnover, setSavedTurnover] = useState<TurnoverTable>(DEFAULT_TURNOVER);
  const [draftSchedule, setDraftSchedule] = useState(DEFAULT_SCHEDULE);
  const [savedSchedule, setSavedSchedule] = useState(DEFAULT_SCHEDULE);
  const [draftResetTimes, setDraftResetTimes] = useState(DEFAULT_RESET_TIMES);
  const [savedResetTimes, setSavedResetTimes] = useState(DEFAULT_RESET_TIMES);
  const [saveCount, setSaveCount] = useState(0);
  const [phoneResetCount, setPhoneResetCount] = useState(0);
  const [timeErrors, setTimeErrors] = useState({ daily: false, weekly: false, monthly: false });
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const validateTime = (val: string) => /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(val);

  const handleTimeChange = (type: 'daily' | 'weekly' | 'monthly', val: string) => {
    setDraftResetTimes(prev => ({ ...prev, [type]: val }));
    setTimeErrors(prev => ({ ...prev, [type]: !validateTime(val) }));
  };

  const handleSave = () => {
    if (Object.values(timeErrors).some(err => err)) {
      alert("Please fix invalid time formats (HH:MM:SS) before saving.");
      return;
    }
    setSavedTurnover(draftTurnover);
    setSavedSchedule(draftSchedule);
    setSavedResetTimes(draftResetTimes);
    setSaveCount(c => c + 1);
    setShowToast(true);
  };

  const handleLaptopReset = () => {
    setDraftTurnover(DEFAULT_TURNOVER);
    setDraftSchedule(DEFAULT_SCHEDULE);
    setDraftResetTimes(DEFAULT_RESET_TIMES);
    setTimeErrors({ daily: false, weekly: false, monthly: false });
    setVisibilities(DEFAULT_VISIBILITY);
  };

  const handlePhoneReset = () => {
    setPhoneResetCount(c => c + 1);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 lg:p-8 gap-8 overflow-hidden">
      {/* Computer Screen Wrapper */}
      <div className="flex flex-col flex-1 shrink-0 max-w-5xl relative">
        <div className="w-full h-[800px] bg-slate-100 text-slate-800 font-sans p-4 md:p-8 rounded-2xl shadow-2xl border-[8px] lg:border-[12px] lg:border-gray-800 overflow-y-auto relative flex flex-col">
          
          {/* Toast Notification */}
          <AnimatePresence>
            {showToast && (
              <motion.div 
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="absolute top-8 left-1/2 z-50 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-green-400 whitespace-nowrap"
              >
                Settings Updated!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center text-sm text-blue-500 mb-6">
          <LayoutGrid className="w-4 h-4 mr-2" />
          <span className="hover:underline cursor-pointer font-medium">Promotions</span>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
          <span className="text-slate-600">Cashback Settings</span>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-slate-200 mb-6">
          <button className="pb-3 text-blue-500 border-b-2 border-blue-500 font-medium text-sm">
            Settings
          </button>
          <button className="pb-3 text-slate-500 hover:text-slate-700 font-medium text-sm">
            How to Earn Instructions
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            {/* General Settings Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-slate-900">General Settings</h2>
              <p className="text-sm text-slate-500 mb-6">Applies to all cashback types</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="text-[11px] uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-4 font-semibold tracking-wider text-left w-1/4"></th>
                      <th className="py-2 px-4 font-semibold tracking-wider text-center w-1/4">Minimum Claim</th>
                      <th className="py-2 px-4 font-semibold tracking-wider text-center w-1/4">Claim Reset Frequency</th>
                      <th className="py-2 px-4 font-semibold tracking-wider text-center w-1/4">Claim Reset Time</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {/* Instant */}
                    <tr className="border-b border-slate-200">
                      <td className="py-6 px-4 font-medium text-slate-700">Instant</td>
                      <td className="py-6 px-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 bg-white">
                            <input type="text" defaultValue="0.01" className="w-20 px-3 py-2 text-center outline-none" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">Credit(s)</span>
                          </div>
                          <span className="text-xs text-slate-400 mt-2">Minimum 0.01 credit</span>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 bg-white">
                            <input type="text" defaultValue="0.25" className="w-20 px-3 py-2 text-center outline-none" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">Hours</span>
                          </div>
                          <span className="text-xs text-slate-400 mt-2">Minimum 0.25 hours</span>
                        </div>
                      </td>
                      <td className="py-6 px-4"></td>
                    </tr>
                    {/* Daily */}
                    <tr className="border-b border-slate-200">
                      <td className="py-6 px-4 font-medium text-slate-700">Daily</td>
                      <td className="py-6 px-4"></td>
                      <td className="py-6 px-4"></td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className={`flex items-center border rounded-md px-3 py-2 w-40 focus-within:ring-1 focus-within:ring-blue-500 bg-white ${timeErrors.daily ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
                            <input type="text" value={draftResetTimes.daily} onChange={(e) => handleTimeChange('daily', e.target.value)} className={`w-full outline-none text-slate-700 ${timeErrors.daily ? 'text-red-500' : ''}`} />
                            <X className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 ml-2 flex-shrink-0" onClick={() => handleTimeChange('daily', DEFAULT_RESET_TIMES.daily)} />
                            <Clock className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Weekly */}
                    <tr className="border-b border-slate-200">
                      <td className="py-6 px-4 font-medium text-slate-700">Weekly</td>
                      <td className="py-6 px-4"></td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="relative w-40">
                            <select 
                              value={draftSchedule.weekly}
                              onChange={(e) => setDraftSchedule(s => ({ ...s, weekly: e.target.value }))}
                              className="w-full appearance-none border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-700"
                            >
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className={`flex items-center border rounded-md px-3 py-2 w-40 focus-within:ring-1 focus-within:ring-blue-500 bg-white ${timeErrors.weekly ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
                            <input type="text" value={draftResetTimes.weekly} onChange={(e) => handleTimeChange('weekly', e.target.value)} className={`w-full outline-none text-slate-700 ${timeErrors.weekly ? 'text-red-500' : ''}`} />
                            <X className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 ml-2 flex-shrink-0" onClick={() => handleTimeChange('weekly', DEFAULT_RESET_TIMES.weekly)} />
                            <Clock className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Monthly */}
                    <tr>
                      <td className="py-6 px-4 font-medium text-slate-700">Monthly</td>
                      <td className="py-6 px-4"></td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="relative w-40">
                            <select 
                              value={draftSchedule.monthly}
                              onChange={(e) => setDraftSchedule(s => ({ ...s, monthly: e.target.value }))}
                              className="w-full appearance-none border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-700"
                            >
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                <option key={day} value={String(day)}>{day}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className={`flex items-center border rounded-md px-3 py-2 w-40 focus-within:ring-1 focus-within:ring-blue-500 bg-white ${timeErrors.monthly ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
                            <input type="text" value={draftResetTimes.monthly} onChange={(e) => handleTimeChange('monthly', e.target.value)} className={`w-full outline-none text-slate-700 ${timeErrors.monthly ? 'text-red-500' : ''}`} />
                            <X className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 ml-2 flex-shrink-0" onClick={() => handleTimeChange('monthly', DEFAULT_RESET_TIMES.monthly)} />
                            <Clock className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors">Save</button>
              </div>
            </div>

            {/* Portion of Turnover Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Portion of Turnover</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="text-[11px] uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-4 font-semibold tracking-wider text-left w-1/4"></th>
                      <th className="py-2 px-4 font-semibold tracking-wider text-center w-1/4">Puzzle Games</th>
                      <th className="py-2 px-4 font-semibold tracking-wider text-center w-1/4">PVP Games</th>
                      <th className="py-2 px-4 font-semibold tracking-wider text-center w-1/4">Other Games</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {/* Instant */}
                    <tr className="border-b border-slate-200">
                      <td className="py-6 px-4 font-medium text-slate-700">Instant</td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.instant.puzzle} onChange={(e) => setDraftTurnover(t => ({ ...t, instant: { ...t.instant, puzzle: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.instant.pvp} onChange={(e) => setDraftTurnover(t => ({ ...t, instant: { ...t.instant, pvp: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.instant.other} onChange={(e) => setDraftTurnover(t => ({ ...t, instant: { ...t.instant, other: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Daily */}
                    <tr className="border-b border-slate-200">
                      <td className="py-6 px-4 font-medium text-slate-700">Daily</td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.daily.puzzle} onChange={(e) => setDraftTurnover(t => ({ ...t, daily: { ...t.daily, puzzle: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.daily.pvp} onChange={(e) => setDraftTurnover(t => ({ ...t, daily: { ...t.daily, pvp: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.daily.other} onChange={(e) => setDraftTurnover(t => ({ ...t, daily: { ...t.daily, other: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Weekly */}
                    <tr className="border-b border-slate-200">
                      <td className="py-6 px-4 font-medium text-slate-700">Weekly</td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.weekly.puzzle} onChange={(e) => setDraftTurnover(t => ({ ...t, weekly: { ...t.weekly, puzzle: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.weekly.pvp} onChange={(e) => setDraftTurnover(t => ({ ...t, weekly: { ...t.weekly, pvp: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.weekly.other} onChange={(e) => setDraftTurnover(t => ({ ...t, weekly: { ...t.weekly, other: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Monthly */}
                    <tr>
                      <td className="py-6 px-4 font-medium text-slate-700">Monthly</td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.monthly.puzzle} onChange={(e) => setDraftTurnover(t => ({ ...t, monthly: { ...t.monthly, puzzle: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.monthly.pvp} onChange={(e) => setDraftTurnover(t => ({ ...t, monthly: { ...t.monthly, pvp: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex justify-center">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 w-28 bg-white">
                            <input type="text" value={draftTurnover.monthly.other} onChange={(e) => setDraftTurnover(t => ({ ...t, monthly: { ...t.monthly, other: e.target.value } }))} className="w-full px-3 py-2 text-center outline-none text-slate-700" />
                            <span className="bg-white px-3 py-2 text-slate-500 border-l border-slate-200">%</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors">Save</button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-72">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-6">Visibility on Game Site</h2>
              
              <div className="space-y-5">
                <ToggleRow label="Instant Cashback" checked={visibilities.instant} onChange={(v) => setVisibilities(prev => ({...prev, instant: v}))} />
                <ToggleRow label="Daily Cashback" checked={visibilities.daily} onChange={(v) => setVisibilities(prev => ({...prev, daily: v}))} />
                <ToggleRow label="Weekly Cashback" checked={visibilities.weekly} onChange={(v) => setVisibilities(prev => ({...prev, weekly: v}))} />
                <ToggleRow label="Monthly Cashback" checked={visibilities.monthly} onChange={(v) => setVisibilities(prev => ({...prev, monthly: v}))} />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
        <div className="mt-8 text-center">
          <button 
            onClick={handleLaptopReset}
            className="px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-slate-600 font-medium transition-colors text-sm"
          >
            Reset Admin Settings to Default
          </button>
        </div>
      </div>

      {/* Phone Screen Simulator */}
      <div className="hidden xl:flex shrink-0 relative mt-[24px] flex-col items-center">
        {/* Adds a slight visual alignment offset if needed */}
        <PhonePreview visibility={visibilities} saveCount={saveCount} turnover={savedTurnover} schedule={savedSchedule} resetTimes={savedResetTimes} phoneResetCount={phoneResetCount} />
        
        <div className="mt-8 text-center">
          <button 
            onClick={handlePhoneReset}
            className="px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-slate-600 font-medium transition-colors text-sm"
          >
            Reset Phone Values
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center">
      <button 
        type="button"
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-500' : 'bg-slate-200'}`}
        onClick={() => onChange(!checked)}
      >
        <span 
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
      <span className="ml-3 text-sm text-slate-700">{label}</span>
    </div>
  );
}
