import React, { useState } from 'react';
import { useTheme } from 'next-themes';

const WorkflowAutomationsPage: React.FC = () => {
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

  const workflows = [
    { name: 'Auto-Reply', trigger: 'Keyword', status: 'Active' },
    { name: 'Task Assignment', trigger: 'Message', status: 'Active' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className={`text-2xl font-semibold ${textPrimary}`}>Workflow Automations</h1>
            <p className={`text-sm ${textMuted}`}>
              Create automated workflows, triggers, and actions for chat interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Create Workflow</h2>
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}>
                  Templates
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className={`block text-xs ${textMuted}`}>Workflow name</label>
                  <input
                    type="text"
                    placeholder="e.g., Auto-Reply"
                    className={`w-full px-3 py-2 rounded-lg ${cardHeaderBg} border ${cardBorder} ${textPrimary} text-sm`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-xs ${textMuted}`}>Trigger</label>
                  <select className={`w-full px-3 py-2 rounded-lg ${cardHeaderBg} border ${cardBorder} ${textPrimary} text-sm`}>
                    <option>Keyword</option>
                    <option>Message</option>
                    <option>Time</option>
                    <option>User Action</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={`block text-xs ${textMuted}`}>Action</label>
                  <select className={`w-full px-3 py-2 rounded-lg ${cardHeaderBg} border ${cardBorder} ${textPrimary} text-sm`}>
                    <option>Send Message</option>
                    <option>Assign Task</option>
                    <option>Create Summary</option>
                    <option>Webhook</option>
                  </select>
                </div>
                <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonActive}`}>
                  Create Workflow
                </button>
                <p className={`text-xs ${textMuted}`}>
                  Wireframe: visual workflow builder with conditions and actions.
                </p>
              </div>
            </section>

            <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${cardBorder} ${cardHeaderBg}`}>
                <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Active Workflows</h2>
              </div>
              <div className="p-4 space-y-4">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Name
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Trigger
                      </th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflows.map((workflow, index) => (
                      <tr key={index}>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{workflow.name}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{workflow.trigger}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{workflow.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={`text-xs ${textMuted}`}>
                  Manage and monitor your automated workflows.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkflowAutomationsPage;

