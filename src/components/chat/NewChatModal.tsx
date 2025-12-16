import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Users, Check } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface User {
  id: string;
  fullName: string;
  username?: string;
  profilePicture?: string;
  email: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chat: any) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onChatCreated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [chatType, setChatType] = useState<'one-to-one' | 'group'>('one-to-one');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    } else {
      setSearchQuery('');
      setSelectedUsers([]);
      setGroupName('');
      setChatType('one-to-one');
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No auth token, cannot load users');
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to load users:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.token;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query)
    );
  });

  const toggleUserSelection = (user: User) => {
    if (chatType === 'one-to-one') {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers(prev => {
        const exists = prev.find(u => u.id === user.id);
        if (exists) {
          return prev.filter(u => u.id !== user.id);
        } else {
          return [...prev, user];
        }
      });
    }
  };

  const createChat = async () => {
    if (chatType === 'one-to-one' && selectedUsers.length !== 1) {
      return;
    }
    if (chatType === 'group' && (selectedUsers.length < 1 || !groupName.trim())) {
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: chatType,
          name: chatType === 'group' ? groupName : undefined,
          memberIds: selectedUsers.map(u => u.id),
        }),
      });

      if (response.ok) {
        const chat = await response.json();
        onChatCreated(chat);
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || 'Failed to create chat';
        console.error('Chat creation error:', errorData);
        alert(errorMessage); // Show error to user
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      alert(error.message || 'Failed to create chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Chat</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Chat Type Selection */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setChatType('one-to-one');
                setSelectedUsers([]);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                chatType === 'one-to-one'
                  ? 'bg-[#075e54] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              One-to-One
            </button>
            <button
              onClick={() => {
                setChatType('group');
                setSelectedUsers([]);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                chatType === 'group'
                  ? 'bg-[#075e54] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Group
            </button>
          </div>
        </div>

        {/* Group Name Input */}
        {chatType === 'group' && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#075e54]"
            />
          </div>
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 bg-[#075e54] text-white px-3 py-1 rounded-full text-sm"
                >
                  <span>{user.fullName}</span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="hover:bg-[#064d44] rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#075e54]"
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No users found' : 'No users available'}
            </div>
          ) : (
            filteredUsers.map(user => {
            const isSelected = selectedUsers.some(u => u.id === user.id);
            return (
              <div
                key={user.id}
                onClick={() => toggleUserSelection(user)}
                className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.fullName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#075e54] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          }))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={createChat}
            disabled={loading || (chatType === 'one-to-one' && selectedUsers.length !== 1) || (chatType === 'group' && (selectedUsers.length < 1 || !groupName.trim()))}
            className="px-4 py-2 rounded-lg bg-[#075e54] text-white hover:bg-[#064d44] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;

