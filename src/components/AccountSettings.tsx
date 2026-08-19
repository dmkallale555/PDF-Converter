import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Shield, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Key, 
  LogOut, 
  Trash2, 
  DownloadCloud,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { User, ImageFormat, ThemeMode } from '../types';
import { updateUserProfile, deleteUserAccount } from '../utils/authStorage';
import { clearUserHistory, getConversionHistory } from '../utils/historyStorage';

interface AccountSettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  user,
  onUpdateUser,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'data'>('profile');

  // Profile Form
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');

  // Preferences Form
  const [defaultFormat, setDefaultFormat] = useState<ImageFormat>(user.preferences?.defaultFormat || 'png');
  const [defaultDpi, setDefaultDpi] = useState<number>(user.preferences?.defaultDpi || 300);
  const [defaultQuality, setDefaultQuality] = useState<number>(user.preferences?.defaultQuality || 0.92);

  // Security Form (Password change)
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = updateUserProfile(user.id, { name, avatar });
    if (res.success && res.user) {
      onUpdateUser(res.user);
      setSuccess('Profile updated successfully.');
    } else {
      setError(res.error || 'Failed to update profile.');
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = updateUserProfile(user.id, {
      preferences: {
        ...user.preferences,
        defaultFormat,
        defaultDpi,
        defaultQuality,
        theme,
      },
    });

    if (res.success && res.user) {
      onUpdateUser(res.user);
      setSuccess('Conversion preferences saved.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (user.passwordHash && oldPassword !== user.passwordHash) {
      setError('Incorrect current password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    const res = updateUserProfile(user.id, { passwordHash: newPassword });
    if (res.success) {
      setSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleExportData = () => {
    const history = getConversionHistory(user.id);
    const exportObject = {
      userProfile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        preferences: user.preferences,
      },
      conversionHistory: history,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ConvertPro_Account_Data_${user.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action is permanent.')) {
      deleteUserAccount(user.id);
      clearUserHistory(user.id);
      onLogout();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xs">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>Account Settings</span>
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Manage your profile, default conversion quality presets, security, and data privacy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-6 text-xs font-bold">
        {[
          { key: 'profile', label: 'Profile Info', icon: UserIcon },
          { key: 'preferences', label: 'Conversion Presets', icon: Settings },
          { key: 'security', label: 'Security & Password', icon: Shield },
          { key: 'data', label: 'Data & Privacy', icon: HardDrive },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              setError(null);
              setSuccess(null);
            }}
            className={`pb-3.5 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-1">Email address is permanently linked to your conversions.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Avatar Image URL (Optional)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            Save Profile Changes
          </button>
        </form>
      )}

      {/* PREFERENCES TAB */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Default Output Format
            </label>
            <select
              value={defaultFormat}
              onChange={(e) => setDefaultFormat(e.target.value as ImageFormat)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="png">PNG (Lossless & Sharp)</option>
              <option value="jpg">JPG / JPEG (Standard)</option>
              <option value="webp">WEBP (Compact Web)</option>
              <option value="tiff">TIFF (Archival Print)</option>
              <option value="bmp">BMP (Bitmap)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Default DPI Resolution
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[96, 150, 300, 600].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDefaultDpi(d)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    defaultDpi === d
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {d} DPI
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              <span>Default Image Quality</span>
              <span className="text-indigo-600">{Math.round(defaultQuality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={defaultQuality}
              onChange={(e) => setDefaultQuality(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Application Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'light', label: 'Light', icon: Sun },
                { key: 'dark', label: 'Dark', icon: Moon },
                { key: 'system', label: 'System', icon: Monitor },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onToggleTheme(t.key as ThemeMode)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    theme === t.key
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            Save Conversion Presets
          </button>
        </form>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-xl">
          <form onSubmit={handleChangePassword} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
              Change Account Password
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
            >
              Update Password
            </button>
          </form>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Active Sessions</h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-xs">
              <div>
                <div className="font-bold text-gray-800 dark:text-gray-200">Current Web Browser Session</div>
                <div className="text-[10px] text-gray-400">Authenticated • JWT Secure Token</div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                Active Now
              </span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out from this device</span>
            </button>
          </div>
        </div>
      )}

      {/* DATA & PRIVACY TAB */}
      {activeTab === 'data' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-6 max-w-xl">
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Export Your Data</h4>
            <p className="text-xs text-gray-400 mt-1">
              Download a complete JSON export of your profile information and full conversion history records.
            </p>
            <button
              onClick={handleExportData}
              className="mt-3 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Export Account Data (JSON)</span>
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-extrabold text-red-600">Danger Zone</h4>
            <p className="text-xs text-gray-400 mt-1">
              Permanently delete your account and all associated conversion history logs from local storage.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="mt-3 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Permanently Delete Account</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
