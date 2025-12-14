import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Radio } from 'lucide-react';

const LiveStreamPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [organization, setOrganization] = useState('Training');
  const [enableChat, setEnableChat] = useState(true);
  const [enableQA, setEnableQA] = useState(true);
  const [enableRecording, setEnableRecording] = useState(false);
  const [streamFilter, setStreamFilter] = useState<'upcoming' | 'past'>('upcoming');

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
  const tabActive = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const tabInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';

  // Static streams data
  const streams = [
    { title: 'Weekly Update', status: 'Upcoming', when: '—', visibility: 'Org', action: 'Open' },
    { title: 'Training Session', status: 'Past', when: '—', visibility: 'Private', action: 'Replay' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Go Live Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Go Live</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Broadcast
              </span>
            </div>
            <div className="p-4 space-y-4">
              {/* Title Input */}
              <div className="space-y-2">
                <label className={`block text-xs ${textMuted}`} htmlFor="streamTitle">
                  Title
                </label>
                <input
                  id="streamTitle"
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="e.g., Weekly IRU Update"
                  className={`w-full px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  }`}
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className={`block text-xs ${textMuted}`} htmlFor="streamDescription">
                  Description
                </label>
                <textarea
                  id="streamDescription"
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  placeholder="What's this stream about?"
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  } resize-none`}
                />
              </div>

              {/* Organization Dropdown */}
              <div className="space-y-2">
                <label className={`block text-xs ${textMuted}`} htmlFor="organization">
                  Organization
                </label>
                <select
                  id="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  }`}
                >
                  <option>Training</option>
                  <option>Development</option>
                  <option>Marketing</option>
                </select>
              </div>

              {/* Feature Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableChat}
                    onChange={(e) => setEnableChat(e.target.checked)}
                    className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${
                      isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                    }`}
                  />
                  <span className={`text-sm ${textPrimary}`}>Enable chat</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableQA}
                    onChange={(e) => setEnableQA(e.target.checked)}
                    className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${
                      isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                    }`}
                  />
                  <span className={`text-sm ${textPrimary}`}>Enable Q&A</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableRecording}
                    onChange={(e) => setEnableRecording(e.target.checked)}
                    className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${
                      isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                    }`}
                  />
                  <span className={`text-sm ${textPrimary}`}>Enable recording</span>
                </label>
              </div>

              {/* Start Stream Button */}
              <button
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${buttonActive}`}
              >
                Start Stream
              </button>

              <p className={`text-xs ${textMuted}`}>
                Wireframe: integrate RTMP/WebRTC + moderation tools.
              </p>
            </div>
          </section>

          {/* Live Session Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Live Session</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Player
              </span>
            </div>
            <div className="p-4 space-y-4">
              {/* Video Player Placeholder */}
              <div className={`aspect-video rounded-lg ${inputBg} border ${inputBorder} flex items-center justify-center`}>
                <p className={`text-sm ${textMuted}`}>Video player placeholder</p>
              </div>

              {/* Chat and Q&A Panels */}
              <div className="grid grid-cols-2 gap-4">
                {/* Chat Panel */}
                <div className={`p-3 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${textPrimary}`}>Chat</span>
                    <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-[10px]`}>
                      Live
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted}`}>Messages appear here...</p>
                </div>

                {/* Q&A Panel */}
                <div className={`p-3 rounded-lg border ${cardBorder} ${cardHeaderBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${textPrimary}`}>Q&A</span>
                    <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-[10px]`}>
                      Queue
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted}`}>Questions appear here...</p>
                </div>
              </div>
            </div>
          </section>

          {/* Streams Section - Spans both columns */}
          <section className={`lg:col-span-2 ${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Streams</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setStreamFilter('upcoming')}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border ${
                    streamFilter === 'upcoming' ? tabActive : tabInactive
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setStreamFilter('past')}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border ${
                    streamFilter === 'past' ? tabActive : tabInactive
                  }`}
                >
                  Past
                </button>
              </div>
            </div>
            <div className="p-4">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Title
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Status
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      When
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Visibility
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {streams.map((stream, index) => (
                    <tr key={index}>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {stream.title}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {stream.status}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {stream.when}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        {stream.visibility}
                      </td>
                      <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                        <button
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                        >
                          {stream.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={`text-xs ${textMuted} mt-4`}>
                Store stream metadata + recordings links here.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LiveStreamPage;


