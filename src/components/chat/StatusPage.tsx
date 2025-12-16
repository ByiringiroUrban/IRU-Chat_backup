import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface StatusData {
  status: string;
  customStatus?: string | null;
  statusExpiresAt?: string | null;
  showLastSeen: boolean;
  sendReadReceipts: boolean;
  allowStatusVisibility: boolean;
  autoAway: boolean;
}

interface StatusHistoryEntry {
  id: string;
  time: string;
  status: string;
  note: string;
}

const StatusPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [presence, setPresence] = useState<'online' | 'away' | 'dnd' | 'invisible'>('online');
  const [customStatus, setCustomStatus] = useState('');
  const [statusExpiry, setStatusExpiry] = useState('30 min');
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [sendReadReceipts, setSendReadReceipts] = useState(true);
  const [allowStatusVisibility, setAllowStatusVisibility] = useState(false);
  const [autoAway, setAutoAway] = useState(true);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);

  // Get auth token
  const getAuthToken = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (!authData) return null;
      const parsed = JSON.parse(authData);
      return parsed.token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Load status data
  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) {
          console.log('No auth token, cannot load status');
          setLoading(false);
          return;
        }

        // Load status and privacy settings
        const statusResponse = await fetch(`${API_BASE_URL}/api/status`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (statusResponse.ok) {
          const data: StatusData = await statusResponse.json();
          setPresence((data.status as any) || 'online');
          setCustomStatus(data.customStatus || '');
          setShowLastSeen(data.showLastSeen ?? true);
          setSendReadReceipts(data.sendReadReceipts ?? true);
          setAllowStatusVisibility(data.allowStatusVisibility ?? false);
          setAutoAway(data.autoAway ?? true);

          // Calculate status expiry from statusExpiresAt
          if (data.statusExpiresAt) {
            const expiresAt = new Date(data.statusExpiresAt);
            const now = new Date();
            const diffMs = expiresAt.getTime() - now.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            if (diffMins <= 30) {
              setStatusExpiry('30 min');
            } else if (diffMins <= 60) {
              setStatusExpiry('1 hour');
            } else {
              setStatusExpiry('Today');
            }
          }
        }

        // Load status history
        const historyResponse = await fetch(`${API_BASE_URL}/api/status/history?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setStatusHistory(historyData.history || []);
        }
      } catch (error) {
        console.error('Error loading status:', error);
        toast.error('Failed to load status settings');
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  // Save status changes
  const saveStatus = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();
      if (!token) {
        toast.error('Please login to update status');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: presence,
          customStatus: customStatus || null,
          statusExpiry: customStatus ? statusExpiry : null,
          showLastSeen,
          sendReadReceipts,
          allowStatusVisibility,
          autoAway,
        }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        // Reload status history
        const historyResponse = await fetch(`${API_BASE_URL}/api/status/history?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setStatusHistory(historyData.history || []);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Only show error if it's not a migration-related error
        if (!errorData.error?.includes('migration')) {
          toast.error(errorData.error || 'Failed to update status');
        } else {
          // Silently handle migration errors - status will work with defaults
          console.warn('Status update: Migration not applied yet, using default values');
        }
      }
    } catch (error) {
      console.error('Error saving status:', error);
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  // Handle presence change
  const handlePresenceChange = (newPresence: 'online' | 'away' | 'dnd' | 'invisible') => {
    setPresence(newPresence);
    // Auto-save on presence change
    setTimeout(() => {
      saveStatus();
    }, 100);
  };

  // Handle privacy setting change
  const handlePrivacyChange = () => {
    // Auto-save on privacy change
    setTimeout(() => {
      saveStatus();
    }, 300);
  };

  // Theme-aware colors
  const cardBg = isDark ? 'bg-[#101828]' : 'bg-white';
  const cardBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const cardHeaderBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const textPrimary = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const textMuted = isDark ? 'text-[#9bb0d0]' : 'text-[#475569]';
  const shadow = isDark ? 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_10px_25px_rgba(2,6,23,0.08)]';
  const inputBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const inputBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const inputText = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const inputPlaceholder = isDark ? 'placeholder-[#9bb0d0]' : 'placeholder-[#475569]';
  const buttonActive = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const buttonInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';
  const divider = isDark ? 'bg-[rgba(255,255,255,0.09)]' : 'bg-[rgba(15,23,42,0.10)]';
  const tableBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const badgeBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const badgeBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Presence Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Presence</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Personal
              </span>
            </div>
            <div className="p-4 space-y-4">
              {/* Presence Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePresenceChange('online')}
                  disabled={saving || loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    presence === 'online' ? buttonActive : buttonInactive
                  } ${saving || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Online
                </button>
                <button
                  onClick={() => handlePresenceChange('away')}
                  disabled={saving || loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    presence === 'away' ? buttonActive : buttonInactive
                  } ${saving || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Away
                </button>
                <button
                  onClick={() => handlePresenceChange('dnd')}
                  disabled={saving || loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    presence === 'dnd' ? buttonActive : buttonInactive
                  } ${saving || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Do Not Disturb
                </button>
                <button
                  onClick={() => handlePresenceChange('invisible')}
                  disabled={saving || loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    presence === 'invisible' ? buttonActive : buttonInactive
                  } ${saving || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Invisible
                </button>
              </div>

              {/* Custom Status */}
              <div className="space-y-2">
                <label className={`block text-xs ${textMuted}`} htmlFor="customStatus">
                  Custom status
                </label>
                <div className="flex gap-2">
                  <input
                    id="customStatus"
                    type="text"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="e.g., In a meeting until 4 PM"
                    className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'}`}
                  />
                  <select
                    value={statusExpiry}
                    onChange={(e) => setStatusExpiry(e.target.value)}
                    className={`px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'}`}
                    aria-label="Expiry"
                  >
                    <option value="30 min">30 min</option>
                    <option value="1 hour">1 hour</option>
                    <option value="Today">Today</option>
                    <option value="Custom…">Custom…</option>
                  </select>
                </div>
                <button
                  onClick={saveStatus}
                  disabled={saving || loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    saving || loading
                      ? 'opacity-50 cursor-not-allowed'
                      : buttonActive
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </div>
          </section>

          {/* Privacy Quick Toggles Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Privacy Quick Toggles</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Controls
              </span>
            </div>
            <div className="p-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLastSeen}
                  onChange={(e) => {
                    setShowLastSeen(e.target.checked);
                    handlePrivacyChange();
                  }}
                  disabled={loading}
                  className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'}`}
                />
                <span className={`text-sm ${textPrimary}`}>Show last seen</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendReadReceipts}
                  onChange={(e) => {
                    setSendReadReceipts(e.target.checked);
                    handlePrivacyChange();
                  }}
                  disabled={loading}
                  className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'}`}
                />
                <span className={`text-sm ${textPrimary}`}>Send read receipts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowStatusVisibility}
                  onChange={(e) => {
                    setAllowStatusVisibility(e.target.checked);
                    handlePrivacyChange();
                  }}
                  disabled={loading}
                  className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'}`}
                />
                <span className={`text-sm ${textPrimary}`}>Allow status visibility to everyone</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAway}
                  onChange={(e) => {
                    setAutoAway(e.target.checked);
                    handlePrivacyChange();
                  }}
                  disabled={loading}
                  className={`w-4 h-4 rounded ${inputBorder} ${inputBg} ${isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]'} focus:ring-2 ${isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'}`}
                />
                <span className={`text-sm ${textPrimary}`}>Auto-away on inactivity</span>
              </label>

              <div className={`h-px ${divider} my-2.5`} />

              <p className={`text-xs ${textMuted}`}>
                For enterprise policies, enforce these in <strong className={textPrimary}>Enterprise Tools</strong>.
              </p>
            </div>
          </section>

          {/* Status History Section - Spans both columns */}
          <section className={`lg:col-span-2 ${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Status History</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Last 10
              </span>
            </div>
            <div className="p-4">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Time
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Status
                    </th>
                    <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className={`border-b ${tableBorder} px-2 py-2.5 ${textMuted} text-center`}>
                        Loading history...
                      </td>
                    </tr>
                  ) : statusHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={`border-b ${tableBorder} px-2 py-2.5 ${textMuted} text-center`}>
                        No status history yet
                      </td>
                    </tr>
                  ) : (
                    statusHistory.map((entry) => (
                      <tr key={entry.id}>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {entry.time && entry.time !== '—' 
                            ? format(new Date(entry.time), 'MMM d, yyyy h:mm a')
                            : '—'}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {entry.status}
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {entry.note || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StatusPage;

