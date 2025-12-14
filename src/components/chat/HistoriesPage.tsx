import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const HistoriesPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [messageSearch, setMessageSearch] = useState('');

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
  const resultBadge = isDark ? 'bg-[rgba(255,255,255,0.05)]' : 'bg-[rgba(15,23,42,0.05)]';

  // Static data
  const messageHistory = [
    { chat: 'Design Team', snippet: '"Wireframe..."', date: '' },
    { chat: 'Client', snippet: '"Proposal..."', date: '' },
  ];

  const callHistory = [
    { contact: 'Support', type: 'Voice', when: '', result: 'Completed' },
    { contact: 'Client', type: 'Video', when: '', result: 'Missed' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Message History Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Message History</h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Search Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  placeholder="Search messages..."
                  className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  }`}
                />
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                >
                  Search
                </button>
              </div>

              {/* Filter Button */}
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
              >
                Filter
              </button>

              {/* Message History Table */}
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Chat
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Snippet
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messageHistory.map((message, index) => (
                    <tr key={index}>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {message.chat}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {message.snippet}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {message.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Call History Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Call History</h2>
              <button
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
              >
                Logs
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Call History Table */}
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
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {callHistory.map((call, index) => (
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${resultBadge} ${textPrimary}`}>
                          {call.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={`text-xs ${textMuted}`}>
                If recording is enabled, surface links here (policy-based).
              </p>
            </div>
          </section>

          {/* Sessions & Exports Section - Spans both columns */}
          <section className={`lg:col-span-2 ${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Sessions & Exports</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Security
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Active sessions Card */}
                <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                  <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Active sessions</h3>
                  <p className={`text-xs mb-4 ${textMuted}`}>
                    List devices, locations (approx), last active.
                  </p>
                  <button
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Manage
                  </button>
                </div>

                {/* Download my data Card */}
                <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                  <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Download my data</h3>
                  <p className={`text-xs mb-4 ${textMuted}`}>
                    Request export (async job).
                  </p>
                  <button
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Request
                  </button>
                </div>

                {/* Audit Card */}
                <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                  <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Audit</h3>
                  <p className={`text-xs mb-4 ${textMuted}`}>
                    Personal audit logs.
                  </p>
                  <button
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HistoriesPage;

