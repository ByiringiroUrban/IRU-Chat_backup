import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const AdvertiseMarketingPage: React.FC = () => {
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
  const buttonActive = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const buttonInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';
  const statusActive = isDark ? 'bg-[rgba(34,197,94,0.14)] text-[#4ade80]' : 'bg-[rgba(34,197,94,0.14)] text-[#16a34a]';
  const statusDraft = isDark ? 'bg-[rgba(251,191,36,0.14)] text-[#fbbf24]' : 'bg-[rgba(251,191,36,0.14)] text-[#ca8a04]';
  const statusOn = isDark ? 'bg-[rgba(34,197,94,0.14)] text-[#4ade80]' : 'bg-[rgba(34,197,94,0.14)] text-[#16a34a]';
  const statusOff = isDark ? 'bg-[rgba(107,114,128,0.14)] text-[#9ca3af]' : 'bg-[rgba(107,114,128,0.14)] text-[#6b7280]';
  const tableBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';

  // Static data
  const campaigns = [
    {
      name: 'IRU Chat Sponsored Card',
      status: 'Active',
      placement: 'Inbox',
      objective: 'Traffic',
      budget: '—',
      action: 'Open',
    },
    {
      name: 'Enterprise Webinar Promo',
      status: 'Draft',
      placement: 'Live Stream',
      objective: 'Registrations',
      budget: '',
      action: 'Edit',
    },
  ];

  const placements = [
    { placement: 'Inbox Sponsored', where: 'Chats list', format: 'Card', status: 'On' },
    { placement: 'Call Screen Banner', where: 'Calls', format: 'Banner', status: 'On' },
    { placement: 'Live Stream Promo', where: 'Live Stream', format: 'Overlay', status: 'On' },
    { placement: 'Settings Sponsor', where: 'Settings', format: 'Tile', status: 'Off' },
  ];

  const performance = [
    { campaign: 'Sponsored Card', impr: '—', clicks: '—', ctr: '—', spend: '—' },
    { campaign: 'Webinar Promo', impr: '—', clicks: '—', ctr: '—', spend: '—' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className={`text-2xl font-semibold ${textPrimary}`}>Advertise / Marketing</h1>
            <p className={`text-sm ${textMuted}`}>
              Campaigns, placements, creatives, approvals, analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaigns Section */}
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Campaigns</h2>
                <div className="flex gap-1">
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                  >
                    Create
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                  >
                    Manage
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonActive}`}
                  >
                    New Campaign
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Import
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Templates
                  </button>
                </div>

                {/* Campaigns List */}
                <div className="space-y-3">
                  {campaigns.map((campaign, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${cardBorder} ${cardHeaderBg}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-medium ${textPrimary}`}>{campaign.name}</h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                campaign.status === 'Active' ? statusActive : statusDraft
                              }`}
                            >
                              {campaign.status}
                            </span>
                          </div>
                          <p className={`text-xs ${textMuted}`}>
                            Placement: {campaign.placement}
                            {campaign.objective && ` • Objective: ${campaign.objective}`}
                            {campaign.budget && ` • Budget: ${campaign.budget}`}
                          </p>
                        </div>
                        <button
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                        >
                          {campaign.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className={`text-xs ${textMuted}`}>
                  Wireframe: connect to your ads service (campaign CRUD + targeting).
                </p>
              </div>
            </section>

            {/* Placements Section */}
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Placements</h2>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                >
                  Inventory
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Placements Table */}
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Placement
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Where
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Format
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {placements.map((placement, index) => (
                      <tr key={index}>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {placement.placement}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {placement.where}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {placement.format}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              placement.status === 'On' ? statusOn : statusOff
                            }`}
                          >
                            {placement.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Configure
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Pricing
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Policy
                  </button>
                </div>
              </div>
            </section>

            {/* Creatives & Approvals Section - Spans both columns */}
            <section className={`lg:col-span-2 ${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Creatives & Approvals</h2>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                >
                  Compliance
                </button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Upload Creative Card */}
                  <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                    <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Upload Creative</h3>
                    <p className={`text-xs mb-4 ${textMuted}`}>
                      Images, video, copy, CTA.
                    </p>
                    <button
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                    >
                      Upload
                    </button>
                  </div>

                  {/* Review Queue Card */}
                  <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                    <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Review Queue</h3>
                    <p className={`text-xs mb-4 ${textMuted}`}>
                      Moderation + brand safety checks.
                    </p>
                    <button
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                    >
                      Open queue
                    </button>
                  </div>

                  {/* Tracking Card */}
                  <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                    <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Tracking</h3>
                    <p className={`text-xs mb-4 ${textMuted}`}>
                      UTM, pixels, conversions.
                    </p>
                    <button
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Performance Section */}
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Performance</h2>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                >
                  Analytics
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Performance Table */}
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Campaign
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Impr.
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Clicks
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        CTR
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Spend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.map((row, index) => (
                      <tr key={index}>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {row.campaign}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {row.impr}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {row.clicks}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {row.ctr}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {row.spend}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className={`text-xs ${textMuted}`}>
                  Hook to metrics store (daily rollups + realtime).
                </p>
              </div>
            </section>

            {/* Billing Section */}
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Billing</h2>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                >
                  Invoices
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Billing Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${textMuted}`}>Plan</span>
                    <span className={`text-xs ${textPrimary}`}>—</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${textMuted}`}>Payment method</span>
                    <span className={`text-xs ${textPrimary}`}>—</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${textMuted}`}>Outstanding</span>
                    <span className={`text-xs ${textPrimary}`}>—</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Invoices
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Top up
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Tax info
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvertiseMarketingPage;

