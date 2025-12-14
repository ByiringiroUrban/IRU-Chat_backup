import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const EnterpriseToolsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [orgName, setOrgName] = useState('');
  const [domain, setDomain] = useState('');
  const [activeTab, setActiveTab] = useState<'invite' | 'groups' | 'roles'>('invite');
  const [retention, setRetention] = useState('Keep forever');
  const [legalHold, setLegalHold] = useState(false);
  const [blockExecutables, setBlockExecutables] = useState(false);
  const [detectKeywords, setDetectKeywords] = useState(false);

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
  const buttonPrimary = isDark
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc] hover:bg-[rgba(110,168,255,0.20)]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a] hover:bg-[rgba(37,99,235,0.20)]';
  const inputBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const inputBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const inputText = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const inputPlaceholder = isDark ? 'placeholder-[#9bb0d0]' : 'placeholder-[#475569]';
  const tableBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const tabActive = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const tabInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';

  // Static data
  const users = [
    { user: 'admin@...', role: 'Admin', status: 'Active', action: 'Manage' },
    { user: 'member@...', role: 'Member', status: 'Invited', action: 'Resend' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className={`text-2xl font-semibold ${textPrimary}`}>Enterprise Tools</h1>
            <p className={`text-sm ${textMuted}`}>
              Org setup, RBAC, policies, audits, compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organization Card */}
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Organization</h2>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                >
                  Setup
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Org Name Input */}
                <div className="space-y-2">
                  <label className={`block text-xs ${textMuted}`} htmlFor="orgName">
                    Org name
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g., IRU Business Group Ltd"
                    className={`w-full px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
                      isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                    }`}
                  />
                </div>

                {/* Domain Input */}
                <div className="space-y-2">
                  <label className={`block text-xs ${textMuted}`} htmlFor="domain">
                    Domain
                  </label>
                  <input
                    id="domain"
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g., irubusinessgroup.com"
                    className={`w-full px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
                      isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                    }`}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonPrimary}`}
                  >
                    Save
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                  >
                    Branding
                  </button>
                </div>

                <p className={`text-xs ${textMuted}`}>
                  Add logo upload, colors, and org profile here.
                </p>
              </div>
            </section>

            {/* Users & Access Card */}
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Users & Access</h2>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                >
                  RBAC
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Tabs */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('invite')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      activeTab === 'invite' ? tabActive : tabInactive
                    }`}
                  >
                    Invite
                  </button>
                  <button
                    onClick={() => setActiveTab('groups')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      activeTab === 'groups' ? tabActive : tabInactive
                    }`}
                  >
                    Groups
                  </button>
                  <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      activeTab === 'roles' ? tabActive : tabInactive
                    }`}
                  >
                    Roles
                  </button>
                </div>

                {/* Users Table */}
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        User
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Role
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Status
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={index}>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {user.user}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {user.role}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {user.status}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          <button
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                          >
                            {user.action}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Policies & Compliance Card - Spans both columns */}
            <section className={`lg:col-span-2 ${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Policies & Compliance</h2>
                <div className="flex gap-1">
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                    Retention
                  </span>
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                    Audit
                  </span>
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                    DLP
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Retention Sub-section */}
                  <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                    <h3 className={`text-sm font-medium mb-4 ${textPrimary}`}>Retention</h3>
                    <div className="space-y-4">
                      <select
                        value={retention}
                        onChange={(e) => setRetention(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm focus:outline-none focus:ring-2 ${
                          isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                        }`}
                      >
                        <option>Keep forever</option>
                        <option>30 days</option>
                        <option>90 days</option>
                        <option>1 year</option>
                      </select>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={legalHold}
                          onChange={(e) => setLegalHold(e.target.checked)}
                          className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${
                            isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                          }`}
                        />
                        <span className={`text-sm ${textPrimary}`}>Legal hold enabled</span>
                      </label>
                    </div>
                  </div>

                  {/* Audit Logs Sub-section */}
                  <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                    <h3 className={`text-sm font-medium mb-2 ${textPrimary}`}>Audit Logs</h3>
                    <p className={`text-xs mb-4 ${textMuted}`}>
                      Admin actions, sign-ins, exports.
                    </p>
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                      >
                        View logs
                      </button>
                      <button
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>

                  {/* DLP Sub-section */}
                  <div className={`p-4 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                    <h3 className={`text-sm font-medium mb-4 ${textPrimary}`}>DLP</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={blockExecutables}
                          onChange={(e) => setBlockExecutables(e.target.checked)}
                          className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${
                            isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                          }`}
                        />
                        <span className={`text-sm ${textPrimary}`}>Block executable files</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={detectKeywords}
                          onChange={(e) => setDetectKeywords(e.target.checked)}
                          className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${
                            isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                          }`}
                        />
                        <span className={`text-sm ${textPrimary}`}>Detect sensitive keywords</span>
                      </label>
                      <button
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                      >
                        Configure rules
                      </button>
                    </div>
                  </div>
                </div>
                <p className={`text-xs ${textMuted} mt-4`}>
                  Hook these controls to a policy engine + admin API.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnterpriseToolsPage;

