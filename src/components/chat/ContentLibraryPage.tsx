import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const ContentLibraryPage: React.FC = () => {
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
  const tableBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';

  const content = [
    { name: 'Video Intro', type: 'Video', size: '—', date: '—' },
    { name: 'Thumbnail Template', type: 'Image', size: '—', date: '—' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className={`text-2xl font-semibold ${textPrimary}`}>Content Library</h1>
            <p className={`text-sm ${textMuted}`}>
              Organize and manage your media files, templates, and content assets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Upload Content</h2>
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}>
                  Browse
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className={`border-2 border-dashed ${cardBorder} rounded-lg p-8 text-center`}>
                  <p className={`text-sm ${textMuted} mb-4`}>Drag and drop files here</p>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonActive}`}>
                    Select Files
                  </button>
                </div>
                <div className="space-y-2">
                  <label className={`block text-xs ${textMuted}`}>Content type</label>
                  <select className={`w-full px-3 py-2 rounded-lg ${cardHeaderBg} border ${cardBorder} ${textPrimary} text-sm`}>
                    <option>Video</option>
                    <option>Image</option>
                    <option>Audio</option>
                    <option>Document</option>
                  </select>
                </div>
                <p className={`text-xs ${textMuted}`}>
                  Wireframe: file upload with progress and organization.
                </p>
              </div>
            </section>

            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>My Content</h2>
              </div>
              <div className="p-4 space-y-4">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Name
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Type
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Size
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.map((item, index) => (
                      <tr key={index}>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{item.name}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{item.type}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{item.size}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={`text-xs ${textMuted}`}>
                  Organize your content with folders and tags.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContentLibraryPage;

