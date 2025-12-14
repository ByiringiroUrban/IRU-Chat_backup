import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const ReportsModerationPage: React.FC = () => {
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
  const statusPending = isDark ? 'bg-[rgba(251,191,36,0.14)] text-[#fbbf24]' : 'bg-[rgba(251,191,36,0.14)] text-[#ca8a04]';
  const statusResolved = isDark ? 'bg-[rgba(34,197,94,0.14)] text-[#4ade80]' : 'bg-[rgba(34,197,94,0.14)] text-[#16a34a]';
  const tableBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';

  const reports = [
    { id: '#001', type: 'Harassment', status: 'Pending', date: '—' },
    { id: '#002', type: 'Spam', status: 'Resolved', date: '—' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className={`text-2xl font-semibold ${textPrimary}`}>Reports & Moderation</h1>
            <p className={`text-sm ${textMuted}`}>
              Review and manage user reports, moderation actions, and safety incidents.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Recent Reports</h2>
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}>
                  View All
                </button>
              </div>
              <div className="p-4 space-y-4">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        ID
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Type
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Status
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report, index) => (
                      <tr key={index}>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{report.id}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{report.type}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'Pending' ? statusPending : statusResolved
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{report.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={`text-xs ${textMuted}`}>
                  Wireframe: connect to moderation queue and review system.
                </p>
              </div>
            </section>

            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Moderation Actions</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive} text-left`}>
                    Review Queue
                  </button>
                  <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive} text-left`}>
                    Ban Management
                  </button>
                  <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive} text-left`}>
                    Appeal Process
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${textMuted}`}>Pending reviews</span>
                    <span className={`text-xs ${textPrimary}`}>—</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${textMuted}`}>Resolved today</span>
                    <span className={`text-xs ${textPrimary}`}>—</span>
                  </div>
                </div>
                <p className={`text-xs ${textMuted}`}>
                  Manage moderation workflows and policies.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsModerationPage;

