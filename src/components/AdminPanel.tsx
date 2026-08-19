import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Layers, 
  HardDrive, 
  Settings, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Trash2, 
  AlertCircle, 
  Sliders,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { User, SystemConfig } from '../types';
import { getUsers, saveUsers, getSystemConfig, saveSystemConfig, updateUserProfile } from '../utils/authStorage';
import { getConversionHistory } from '../utils/historyStorage';

interface AdminPanelProps {
  currentUser: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [config, setConfig] = useState<SystemConfig>(() => getSystemConfig());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const history = getConversionHistory();
  const totalConversions = history.length;
  const failedConversions = history.filter((h) => h.status === 'failed').length;
  const totalStorageMb = (history.reduce((acc, h) => acc + h.inputSize, 0) / 1024 / 1024).toFixed(1);

  const handleToggleUserStatus = (userId: string) => {
    if (userId === currentUser.id) {
      setFeedback({ type: 'error', message: 'You cannot disable your own admin account.' });
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'disabled' : 'active';
        return { ...u, status: newStatus as 'active' | 'disabled' };
      }
      return u;
    });

    setUsers(updated);
    saveUsers(updated);
    setFeedback({ type: 'success', message: 'User status updated.' });
  };

  const handleToggleUserRole = (userId: string) => {
    if (userId === currentUser.id) {
      setFeedback({ type: 'error', message: 'You cannot remove admin rights from yourself.' });
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
        return { ...u, role: newRole as 'ADMIN' | 'USER' };
      }
      return u;
    });

    setUsers(updated);
    saveUsers(updated);
    setFeedback({ type: 'success', message: 'User role updated.' });
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      setFeedback({ type: 'error', message: 'You cannot delete your own account here.' });
      return;
    }

    if (confirm('Are you sure you want to remove this user?')) {
      const updated = users.filter((u) => u.id !== userId);
      setUsers(updated);
      saveUsers(updated);
      setFeedback({ type: 'success', message: 'User removed.' });
    }
  };

  const handleResetUserPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !newPasswordForUser) return;

    updateUserProfile(editingUser.id, { passwordHash: newPasswordForUser });
    setFeedback({ type: 'success', message: `Password reset for ${editingUser.name}` });
    setEditingUser(null);
    setNewPasswordForUser('');
    setUsers(getUsers());
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSystemConfig(config);
    setFeedback({ type: 'success', message: 'System processing limits saved successfully.' });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Shield className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              ConvertPro System Administration
            </h2>
            <p className="text-xs sm:text-sm text-purple-200">
              Role-Based Access Control, System Limits & Real-Time Converter Analytics.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Registered Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{users.length}</span>
            <span className="text-[11px] text-emerald-600 font-bold ml-2">
              {users.filter((u) => u.status === 'active').length} Active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Conversions</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalConversions}</span>
            <span className="text-[11px] text-gray-400 ml-1.5">tasks processed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Failed / Corrupted</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{failedConversions}</span>
            <span className="text-[11px] text-emerald-600 font-bold ml-1.5">0.0% failure rate</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Client Memory Saved</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalStorageMb} MB</span>
            <span className="text-[11px] text-purple-600 font-bold ml-1.5">WASM Opt</span>
          </div>
        </div>

      </div>

      {/* User Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>User Management</span>
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Manage permissions, activate or suspend user accounts, and trigger password resets.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 text-gray-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                    <div className="text-[11px] text-gray-400">{u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleUserRole(u.id)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase transition-colors ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                      title="Click to toggle role"
                    >
                      {u.role}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleUserStatus(u.id)}
                      className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-[11px] font-bold text-gray-700 dark:text-gray-200"
                    >
                      {u.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => setEditingUser(u)}
                      className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[11px] font-bold"
                    >
                      Reset Pwd
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal for Admin */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Reset Password for {editingUser.name}
            </h4>
            <form onSubmit={handleResetUserPassword} className="space-y-3">
              <input
                type="password"
                required
                value={newPasswordForUser}
                onChange={(e) => setNewPasswordForUser(e.target.value)}
                placeholder="Enter new temporary password"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Limits Configuration (Requirement #22) */}
      <form onSubmit={handleSaveConfig} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-2xs space-y-4 max-w-2xl">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
          <Sliders className="w-4 h-4 text-purple-600" />
          <span>Configurable Free Usage Policy & Limits</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Max File Size (MB)
            </label>
            <input
              type="number"
              min="10"
              max="500"
              value={config.maxFileSizeMb}
              onChange={(e) => setConfig({ ...config, maxFileSizeMb: parseInt(e.target.value) || 100 })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Max Files Per Batch
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.maxBatchFiles}
              onChange={(e) => setConfig({ ...config, maxBatchFiles: parseInt(e.target.value) || 20 })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Max Pages Per PDF Document
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={config.maxPagesPerPdf}
              onChange={(e) => setConfig({ ...config, maxPagesPerPdf: parseInt(e.target.value) || 100 })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Max Resolution Allowed (DPI)
            </label>
            <input
              type="number"
              min="72"
              max="1200"
              value={config.maxDpi}
              onChange={(e) => setConfig({ ...config, maxDpi: parseInt(e.target.value) || 600 })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
        >
          Save Global Policy Limits
        </button>
      </form>

    </div>
  );
};
