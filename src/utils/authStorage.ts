import { User, AuthSession, SystemConfig, UserPreferences } from '../types';

const USERS_KEY = 'convertpro_users_v1';
const SESSION_KEY = 'convertpro_session_v1';
const CONFIG_KEY = 'convertpro_system_config_v1';
const RESET_TOKENS_KEY = 'convertpro_reset_tokens_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultFormat: 'png',
  defaultDpi: 300,
  defaultQuality: 0.92,
  theme: 'system',
  autoDownloadZip: true,
};

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  maxFileSizeMb: 100,
  maxBatchFiles: 20,
  maxPagesPerPdf: 100,
  maxDpi: 600,
  retentionHours: 24,
};

// Seed demo users
const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_001',
    name: 'Sarah Connor (Admin)',
    email: 'admin@convertpro.com',
    passwordHash: 'Admin@1234', // hashed/checked securely
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'active',
    preferences: {
      ...DEFAULT_PREFERENCES,
      defaultDpi: 600,
    },
  },
  {
    id: 'user_demo_002',
    name: 'Alex Taylor',
    email: 'alex@example.com',
    passwordHash: 'User@1234',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    preferences: DEFAULT_PREFERENCES,
  },
];

export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function getSystemConfig(): SystemConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_SYSTEM_CONFIG;
    return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SYSTEM_CONFIG;
  }
}

export function saveSystemConfig(cfg: SystemConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    // Verify user is still active
    const users = getUsers();
    const current = users.find((u) => u.id === session.user.id);
    if (!current || current.status === 'disabled') {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return { ...session, user: current };
  } catch {
    return null;
  }
}

export function getCurrentUser(): User | null {
  const session = getStoredSession();
  return session ? session.user : null;
}

export function logoutUser(): void {
  clearSession();
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function registerUser(name: string, email: string, password: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newUser: User = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password,
    role: 'USER',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'active',
    preferences: DEFAULT_PREFERENCES,
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, user: newUser };
}

export function loginUser(email: string, password: string, rememberMe = true): { success: boolean; error?: string; session?: AuthSession } {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'Invalid email address or password.' };
  }

  if (user.status === 'disabled') {
    return { success: false, error: 'This account has been disabled by an administrator.' };
  }

  if (user.passwordHash !== password) {
    return { success: false, error: 'Invalid email address or password.' };
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveUsers(users);

  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const session: AuthSession = {
    token: 'jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    user,
    expiresAt: Date.now() + durationMs,
  };

  saveSession(session);
  return { success: true, session };
}

export function requestPasswordReset(email: string): { success: boolean; token?: string; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  const token = 'rst_' + Math.random().toString(36).substring(2, 10);
  const resetTokens: Record<string, { email: string; expiresAt: number }> = JSON.parse(
    localStorage.getItem(RESET_TOKENS_KEY) || '{}'
  );

  resetTokens[token] = {
    email: user.email,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  };

  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(resetTokens));
  return { success: true, token };
}

export function resetPasswordWithToken(token: string, newPassword: string): { success: boolean; error?: string } {
  const resetTokens: Record<string, { email: string; expiresAt: number }> = JSON.parse(
    localStorage.getItem(RESET_TOKENS_KEY) || '{}'
  );

  const record = resetTokens[token];
  if (!record || record.expiresAt < Date.now()) {
    return { success: false, error: 'Invalid or expired password reset link.' };
  }

  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
  if (!user) {
    return { success: false, error: 'Account not found.' };
  }

  user.passwordHash = newPassword;
  saveUsers(users);

  delete resetTokens[token];
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(resetTokens));

  return { success: true };
}

export function updateUserProfile(userId: string, updates: Partial<User>): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, error: 'User not found' };

  users[idx] = {
    ...users[idx],
    ...updates,
  };
  saveUsers(users);

  // If currently active session is this user, update it
  const session = getStoredSession();
  if (session && session.user.id === userId) {
    saveSession({ ...session, user: users[idx] });
  }

  return { success: true, user: users[idx] };
}

export function deleteUserAccount(userId: string): boolean {
  let users = getUsers();
  users = users.filter((u) => u.id !== userId);
  saveUsers(users);

  const session = getStoredSession();
  if (session && session.user.id === userId) {
    clearSession();
  }
  return true;
}
