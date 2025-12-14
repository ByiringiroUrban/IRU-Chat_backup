import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const ConsentControlsPage: React.FC = () => {
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

  const [dataCollection, setDataCollection] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className={`text-2xl font-semibold ${textPrimary}`}>Consent Controls</h1>
            <p className={`text-sm ${textMuted}`}>
              Manage your privacy preferences and data consent settings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Privacy Preferences</h2>
              </div>
              <div className="p-4 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className={`text-sm ${textPrimary}`}>Data collection</span>
                    <p className={`text-xs ${textMuted}`}>Allow collection of usage data</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dataCollection}
                    onChange={(e) => setDataCollection(e.target.checked)}
                    className={`w-4 h-4 rounded ${cardBorder} ${cardHeaderBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'}`}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className={`text-sm ${textPrimary}`}>Analytics</span>
                    <p className={`text-xs ${textMuted}`}>Help improve the platform</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className={`w-4 h-4 rounded ${cardBorder} ${cardHeaderBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'}`}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className={`text-sm ${textPrimary}`}>Marketing communications</span>
                    <p className={`text-xs ${textMuted}`}>Receive updates and offers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className={`w-4 h-4 rounded ${cardBorder} ${cardHeaderBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'}`}
                  />
                </label>
                <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonActive}`}>
                  Save Preferences
                </button>
                <p className={`text-xs ${textMuted}`}>
                  Your consent preferences are stored and can be updated anytime.
                </p>
              </div>
            </section>

            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Consent History</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-medium ${textPrimary}`}>Data Collection</span>
                      <span className={`text-xs ${textMuted}`}>—</span>
                    </div>
                    <p className={`text-xs ${textMuted}`}>Last updated: —</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-medium ${textPrimary}`}>Analytics</span>
                      <span className={`text-xs ${textMuted}`}>—</span>
                    </div>
                    <p className={`text-xs ${textMuted}`}>Last updated: —</p>
                  </div>
                </div>
                <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}>
                  Export Consent Data
                </button>
                <p className={`text-xs ${textMuted}`}>
                  Download your consent history for records.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsentControlsPage;

