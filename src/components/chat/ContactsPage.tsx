import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Phone, PhoneCall, User, Plus, Download, Upload } from 'lucide-react';

const ContactsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware colors
  const cardBg = isDark ? 'bg-[#101828]' : 'bg-white';
  const cardBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const cardHeaderBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const textPrimary = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const textMuted = isDark ? 'text-[#9bb0d0]' : 'text-[#475569]';
  const shadow = isDark ? 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_10px_25px_rgba(2,6,23,0.08)]';
  const badgeBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const badgeBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const buttonBg = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const buttonInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';
  const inputBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const inputBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const inputText = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const inputPlaceholder = isDark ? 'placeholder-[#9bb0d0]' : 'placeholder-[#475569]';
  const divider = isDark ? 'bg-[rgba(255,255,255,0.09)]' : 'bg-[rgba(15,23,42,0.10)]';

  // Static favorites data
  const favorites: string[] = [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Favorites Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Favorites</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Quick
              </span>
            </div>
            <div className="p-4 space-y-3">
              {favorites.map((favorite, index) => (
                <button
                  key={index}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border text-left ${buttonInactive}`}
                >
                  {favorite}
                </button>
              ))}
              <p className={`text-xs ${textMuted}`}>
                Pin contacts for fast calls & chats.
              </p>
            </div>
          </section>

          {/* All Contacts Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>All Contacts</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Directory
              </span>
            </div>
            <div className="p-4 space-y-4">
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  New contact
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Import
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                >
                  <Upload className="w-4 h-4 inline mr-1" />
                  Export
                </button>
              </div>

              {/* Example Contact Card */}
              <div className={`p-3 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                <div className="mb-2">
                  <div className={`text-sm font-semibold ${textPrimary} mb-1`}>Alex N.</div>
                  <div className={`text-xs ${textMuted} space-y-0.5`}>
                    <div>IRU ID: —</div>
                    <div>Company • Role • Notes...</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonBg}`}
                  >
                    Chat
                  </button>
                  <button
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                  >
                    <PhoneCall className="w-3 h-3 inline mr-1" />
                    Call
                  </button>
                  <button
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                  >
                    Profile
                  </button>
                </div>
              </div>

              <p className={`text-xs ${textMuted}`}>
                Replace with search + pagination.
              </p>
            </div>
          </section>

          {/* Contact Profile Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Contact Profile</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Details
              </span>
            </div>
            <div className="p-4 space-y-4">
              <p className={`text-xs ${textMuted}`}>
                Select a contact to populate this panel.
              </p>

              {/* Contact Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textPrimary}`}>Name</span>
                  <span className={`text-sm ${textMuted}`}>—</span>
                </div>
                <div className={`h-px ${divider}`} />
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textPrimary}`}>Phone</span>
                  <span className={`text-sm ${textMuted}`}>—</span>
                </div>
                <div className={`h-px ${divider}`} />
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textPrimary}`}>Email</span>
                  <span className={`text-sm ${textMuted}`}>—</span>
                </div>
              </div>

              <div className={`h-px ${divider}`} />

              {/* Notes Section */}
              <div className="space-y-2">
                <label className={`block text-xs ${textMuted}`} htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={5}
                  placeholder="Internal notes…"
                  className={`w-full px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  } resize-none`}
                />
                <button
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg}`}
                >
                  Save notes
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ContactsPage;

