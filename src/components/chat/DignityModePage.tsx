import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const DignityModePage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBg = isDark ? 'bg-[#101828]' : 'bg-white';
  const cardBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const cardHeaderBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const textPrimary = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const textMuted = isDark ? 'text-[#9bb0d0]' : 'text-[#475569]';
  const shadow = isDark ? 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_10px_25px_rgba(2,6,23,0.08)]';
  const buttonInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';
  const buttonActive = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';

  const [dignityModeEnabled, setDignityModeEnabled] = useState(false);
  const [filterLevel, setFilterLevel] = useState('moderate');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className={`text-2xl font-semibold ${textPrimary}`}>IRU Dignity Mode</h1>
            <p className={`text-sm ${textMuted}`}>
              Advanced content filtering and respectful communication tools.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Dignity Mode Settings</h2>
              </div>
              <div className="p-4 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className={`text-sm ${textPrimary}`}>Enable Dignity Mode</span>
                  <input
                    type="checkbox"
                    checked={dignityModeEnabled}
                    onChange={(e) => setDignityModeEnabled(e.target.checked)}
                    className={`w-4 h-4 rounded ${cardBorder} ${cardHeaderBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'}`}
                  />
                </label>
                <div className="space-y-2">
                  <label className={`block text-xs ${textMuted}`}>Filter level</label>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg ${cardHeaderBg} border ${cardBorder} ${textPrimary} text-sm`}
                  >
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="strict">Strict</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className={`w-4 h-4 rounded ${cardBorder} ${cardHeaderBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'}`}
                    />
                    <span className={`text-sm ${textPrimary}`}>Filter offensive language</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className={`w-4 h-4 rounded ${cardBorder} ${cardHeaderBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'}`}
                    />
                    <span className={`text-sm ${textPrimary}`}>Block harassment</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className={`w-4 h-4 rounded ${cardBorder} ${cardHeaderBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'}`}
                    />
                    <span className={`text-sm ${textPrimary}`}>Respectful tone enforcement</span>
                  </label>
                </div>
                <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonActive}`}>
                  Save Settings
                </button>
                <p className={`text-xs ${textMuted}`}>
                  Wireframe: AI-powered content moderation and respectful communication.
                </p>
              </div>
            </section>

            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Filter Statistics</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${textMuted}`}>Messages filtered today</span>
                    <span className={`text-xs ${textPrimary}`}>—</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${textMuted}`}>Warnings issued</span>
                    <span className={`text-xs ${textPrimary}`}>—</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${textMuted}`}>Blocks applied</span>
                    <span className={`text-xs ${textPrimary}`}>—</span>
                  </div>
                </div>
                <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}>
                  View Reports
                </button>
                <p className={`text-xs ${textMuted}`}>
                  Monitor filter effectiveness and user feedback.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DignityModePage;

