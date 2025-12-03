import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Shield, LogOut, ArrowLeft, Edit2 } from 'lucide-react';

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const authData = localStorage.getItem('iru-auth');
    if (!authData) {
      navigate('/auth');
      return;
    }

    try {
      const parsed = JSON.parse(authData);
      setUser(parsed.user);
      setEditedName(parsed.user?.name || parsed.user?.fullName || '');
      setEditedEmail(parsed.user?.email || '');
    } catch (e) {
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('iru-auth');
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/');
  };

  const handleSave = async () => {
    // TODO: In the future, make an API call to update the user profile
    // For now, just update local storage
    const authData = localStorage.getItem('iru-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        parsed.user.name = editedName;
        parsed.user.email = editedEmail;
        localStorage.setItem('iru-auth', JSON.stringify(parsed));
        setUser(parsed.user);
        setIsEditing(false);
        toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
      } catch (e) {
        toast({
          title: 'Update failed',
          description: 'Failed to update profile. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center text-text-secondary hover:text-text mb-6 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text mb-2">Account Settings</h1>
            <p className="text-text-secondary">Manage your account information and preferences</p>
          </div>

          {/* Account Card */}
          <div className="bg-bg-card rounded-2xl shadow-lg border border-border p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-text flex items-center">
                <User className="mr-3 w-6 h-6 text-brand-blue" />
                Profile Information
              </h2>
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-900 bg-white"
                  />
                ) : (
                  <div className="px-4 py-2 bg-bg-secondary rounded-lg text-text">
                    {user.name || user.fullName}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center">
                  <Mail className="mr-2 w-4 h-4" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-900 bg-white"
                  />
                ) : (
                  <div className="px-4 py-2 bg-bg-secondary rounded-lg text-text">
                    {user.email}
                  </div>
                )}
              </div>

              {/* Account Created Date */}
              {user.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center">
                    <Shield className="mr-2 w-4 h-4" />
                    Member Since
                  </label>
                  <div className="px-4 py-2 bg-bg-secondary rounded-lg text-text">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="btn-hero">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(user.name || user.fullName || '');
                      setEditedEmail(user.email || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-bg-card rounded-2xl shadow-lg border border-border p-8">
            <h2 className="text-2xl font-semibold text-text mb-6">Account Actions</h2>
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="mr-2 w-5 h-5" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;

