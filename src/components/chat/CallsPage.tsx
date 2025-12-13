import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Phone, Video, Link, PhoneCall } from 'lucide-react';

const CallsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [callType, setCallType] = useState<'voice' | 'video' | 'meeting'>('voice');
  const [dialInput, setDialInput] = useState('');

  // Theme-aware colors
  const cardBg = isDark ? 'bg-[#101828]' : 'bg-white';
  const cardBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const cardHeaderBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const textPrimary = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const textMuted = isDark ? 'text-[#9bb0d0]' : 'text-[#475569]';
  const shadow = isDark ? 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_10px_25px_rgba(2,6,23,0.08)]';
  const badgeBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const badgeBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const buttonActive = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const buttonInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';
  const inputBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const inputBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const inputText = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const inputPlaceholder = isDark ? 'placeholder-[#9bb0d0]' : 'placeholder-[#475569]';
  const tableBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const divider = isDark ? 'bg-[rgba(255,255,255,0.09)]' : 'bg-[rgba(15,23,42,0.10)]';

  // Static recent calls data
  const recentCalls = [
    { contact: 'Design Team', type: 'Video', when: '—', duration: '—' },
    { contact: 'Client', type: 'Voice', when: '—', duration: '—' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Start a Call Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Start a Call</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Voice • Video
              </span>
            </div>
            <div className="p-4 space-y-4">
              {/* Call Type Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCallType('voice')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    callType === 'voice' ? buttonActive : buttonInactive
                  }`}
                >
                  Voice call
                </button>
                <button
                  onClick={() => setCallType('video')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    callType === 'video' ? buttonActive : buttonInactive
                  }`}
                >
                  Video call
                </button>
                <button
                  onClick={() => setCallType('meeting')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    callType === 'meeting' ? buttonActive : buttonInactive
                  }`}
                >
                  Create meeting link
                </button>
              </div>

              {/* Dial / Search */}
              <div className="space-y-2">
                <label className={`block text-xs ${textMuted}`} htmlFor="dial">
                  Dial / Search
                </label>
                <div className="flex gap-2">
                  <input
                    id="dial"
                    type="text"
                    value={dialInput}
                    onChange={(e) => setDialInput(e.target.value)}
                    placeholder="Type a name or number…"
                    className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
                      isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                    }`}
                  />
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonActive}`}
                  >
                    Call
                  </button>
                </div>
              </div>

              <p className={`text-xs ${textMuted}`}>
                Integrate WebRTC / SIP / provider SDK here.
              </p>
            </div>
          </section>

          {/* Device Check Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Device Check</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Audio/Video
              </span>
            </div>
            <div className="p-4 space-y-4">
              {/* Microphone and Speaker */}
              <div className="flex gap-2">
                <select
                  className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  }`}
                  aria-label="Microphone"
                >
                  <option>Microphone (default)</option>
                </select>
                <select
                  className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  }`}
                  aria-label="Speaker"
                >
                  <option>Speaker (default)</option>
                </select>
              </div>

              {/* Camera */}
              <div className="flex gap-2">
                <select
                  className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  }`}
                  aria-label="Camera"
                >
                  <option>Camera (default)</option>
                </select>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                >
                  Test
                </button>
              </div>

              <p className={`text-xs ${textMuted}`}>
                Add permissions + device enumeration in JS.
              </p>
            </div>
          </section>

          {/* Recent Calls Section - Spans both columns */}
          <section className={`lg:col-span-2 ${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Recent Calls</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Log
              </span>
            </div>
            <div className="p-4">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Contact
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Type
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      When
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Duration
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((call, index) => (
                    <tr key={index}>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {call.contact}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {call.type}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {call.when}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {call.duration}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        <button
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                        >
                          Call back
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={`text-xs ${textMuted} mt-4`}>
                Store this in your DB for user history + analytics.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CallsPage;

