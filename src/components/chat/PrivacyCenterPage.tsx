import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const PrivacyCenterPage: React.FC = () => {
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className={`text-2xl font-semibold ${textPrimary}`}>Privacy Center</h1>
            <p className={`text-sm ${textMuted}`}>
              Manage your privacy settings, data rights, and account security.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Privacy Settings</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`text-sm ${textPrimary}`}>Profile visibility</span>
                      <p className={`text-xs ${textMuted}`}>Who can see your profile</p>
                    </div>
                    <select className={`px-3 py-1.5 rounded-lg ${cardHeaderBg} border ${cardBorder} ${textPrimary} text-xs`}>
                      <option>Public</option>
                      <option>Contacts</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`text-sm ${textPrimary}`}>Read receipts</span>
                      <p className={`text-xs ${textMuted}`}>Show when you read messages</p>
                    </div>
                    <input
                      type="checkbox"
                      className={`w-4 h-4 rounded ${cardBorder} ${cardHeaderBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'}`}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`text-sm ${textPrimary}`}>Last seen</span>
                      <p className={`text-xs ${textMuted}`}>Show when you were last active</p>
                    </div>
                    <input
                      type="checkbox"
                      className={`w-4 h-4 rounded ${cardBorder} ${cardHeaderBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'}`}
                    />
                  </div>
                </div>
                <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonActive}`}>
                  Save Settings
                </button>
                <p className={`text-xs ${textMuted}`}>
                  Control who can see your information and activity.
                </p>
              </div>
            </section>

            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Data Rights</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive} text-left`}>
                    Download My Data
                  </button>
                  <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive} text-left`}>
                    Delete My Account
                  </button>
                  <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive} text-left`}>
                    Request Data Portability
                  </button>
                </div>
                <div className={`p-3 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                  <p className={`text-xs ${textMuted}`}>
                    You have the right to access, modify, or delete your personal data at any time. Requests are processed within 30 days.
                  </p>
                </div>
                <p className={`text-xs ${textMuted}`}>
                  Wireframe: GDPR/CCPA compliance tools and data management.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyCenterPage;

