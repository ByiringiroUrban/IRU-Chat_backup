import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const ActionBoardPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeAction, setActiveAction] = useState<'primary' | 'secondary'>('primary');

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
  const tableBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const pillActive = isDark
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const pillInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';

  // Static data
  const dataPanelItems = [
    { item: '—', status: '—', updated: '—' },
    { item: '—', status: '—', updated: '—' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Action Board Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Action Board</h2>
              <p className={`text-xs mt-1 mb-0 ${textMuted}`}>
                Tasks extracted from chats with owners, due dates, reminders.
              </p>
            </div>
            <div className="p-4 space-y-4">
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveAction('primary')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    activeAction === 'primary' ? pillActive : pillInactive
                  }`}
                >
                  Primary action
                </button>
                <button
                  onClick={() => setActiveAction('secondary')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    activeAction === 'secondary' ? pillActive : pillInactive
                  }`}
                >
                  Secondary
                </button>
              </div>

              {/* Suggested Components */}
              <div className="space-y-2">
                <h3 className={`text-xs font-medium ${textPrimary}`}>Suggested components:</h3>
                <ul className={`space-y-1.5 list-disc list-inside ${textMuted} text-xs`}>
                  <li>Task extraction from messages</li>
                  <li>Assign owner + due date</li>
                  <li>Reminders & escalation</li>
                  <li>Per-chat Action Board view</li>
                  <li>Export to CSV / Jira / Trello</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Panel Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Data Panel</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Placeholder
              </span>
            </div>
            <div className="p-4 space-y-4">
              {/* Data Table */}
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Item
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Status
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataPanelItems.map((row, index) => (
                    <tr key={index}>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {row.item}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {row.status}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {row.updated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={`text-xs ${textMuted}`}>
                Connect to your API + persistence layer.
              </p>
            </div>
          </section>

          {/* Notes Section - Spans both columns */}
          <section className={`lg:col-span-2 ${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Notes</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Implementation
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Permissions Card */}
                <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                  <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Permissions</h3>
                  <p className={`text-xs ${textMuted}`}>
                    Define RBAC access for this tool.
                  </p>
                </div>

                {/* Events Card */}
                <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                  <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Events</h3>
                  <p className={`text-xs ${textMuted}`}>
                    Emit audit + analytics events.
                  </p>
                </div>

                {/* Integrations Card */}
                <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                  <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Integrations</h3>
                  <p className={`text-xs ${textMuted}`}>
                    Webhooks / exports / automation hooks.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ActionBoardPage;

