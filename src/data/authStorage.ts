export type LoginMethod = 'email' | 'dni';
export type DocumentType = 'DNI' | 'CE';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  password: string;
  role: string;
  region: string;
  provider?: 'password' | 'google' | 'microsoft';
}

export interface AuthSession {
  user: Omit<UserAccount, 'password'>;
  loginMethod: LoginMethod | 'google' | 'microsoft';
  loggedInAt: string;
  sessionId: string;
}

const USERS_STORAGE_KEY = 'portal_peru_users_v1';
const REMEMBER_STORAGE_KEY = 'portal_peru_remember_v1';
const SESSION_STORAGE_KEY = 'portal_peru_session_v1';
const SCENE_STORAGE_KEY = 'portal_peru_scene_v1';

export const SEEDED_USERS: UserAccount[] = [
  {
    id: 'usr-pe-01',
    fullName: 'Mateo Quispe Huamán',
    email: 'mateo.quispe@peru.pe',
    documentType: 'DNI',
    documentNumber: '72485910',
    password: 'Peru2026!',
    role: 'Usuario Verificado',
    region: 'Lima Metropolitana, PE',
    provider: 'password',
  },
  {
    id: 'usr-pe-02',
    fullName: 'Lucía Mendoza Paredes',
    email: 'lucia.mendoza@peru.pe',
    documentType: 'DNI',
    documentNumber: '48192035',
    password: 'Cusco2026!',
    role: 'Cuenta Corporativa',
    region: 'Cusco, PE',
    provider: 'password',
  },
];

export interface RememberedCredentials {
  method: LoginMethod;
  documentType: DocumentType;
  identifier: string;
}

export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEEDED_USERS));
      return SEEDED_USERS;
    }
    const parsed = JSON.parse(raw) as UserAccount[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEEDED_USERS;
  } catch {
    return SEEDED_USERS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage quota issues in restricted environments
  }
}

export function findAccountByIdentifier(
  identifier: string,
  method: LoginMethod,
  documentType?: DocumentType,
): UserAccount | undefined {
  const users = getStoredUsers();
  const normalized = identifier.trim().toLowerCase();
  if (method === 'email') {
    return users.find((u) => u.email.toLowerCase() === normalized);
  }
  return users.find(
    (u) =>
      u.documentNumber.toLowerCase() === normalized &&
      (!documentType || u.documentType === documentType),
  );
}

export function authenticateUser(params: {
  method: LoginMethod;
  identifier: string;
  documentType: DocumentType;
  password: string;
}): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const { method, identifier, documentType, password } = params;
  const trimmed = identifier.trim();

  if (!trimmed) {
    return {
      ok: false,
      error:
        method === 'email'
          ? 'Ingresa tu correo electrónico.'
          : `Ingresa tu número de ${documentType}.`,
    };
  }

  const account = findAccountByIdentifier(trimmed, method, documentType);

  if (!account) {
    return {
      ok: false,
      error:
        'No encontramos una cuenta asociada a esos datos. Verifica tu usuario o utiliza la cuenta de prueba.',
    };
  }

  if (account.password !== password) {
    return {
      ok: false,
      error: 'La contraseña ingresada es incorrecta. Inténtalo nuevamente.',
    };
  }

  const { password: _removed, ...safeUser } = account;
  const session: AuthSession = {
    user: safeUser,
    loginMethod: method,
    loggedInAt: new Date().toISOString(),
    sessionId: `PE-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
      .toString()
      .slice(-4)}`,
  };

  saveSession(session);
  return { ok: true, session };
}

export function registerAccount(params: {
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  password: string;
}): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const users = getStoredUsers();
  const emailNorm = params.email.trim().toLowerCase();
  const docNorm = params.documentNumber.trim().toUpperCase();

  if (users.some((u) => u.email.toLowerCase() === emailNorm)) {
    return {
      ok: false,
      error: 'Ya existe una cuenta registrada con este correo electrónico.',
    };
  }

  if (users.some((u) => u.documentNumber.toUpperCase() === docNorm)) {
    return {
      ok: false,
      error: `Este número de ${params.documentType} ya está asociado a una cuenta.`,
    };
  }

  const newUser: UserAccount = {
    id: `usr-pe-${Date.now().toString(36)}`,
    fullName: params.fullName.trim(),
    email: emailNorm,
    documentType: params.documentType,
    documentNumber: docNorm,
    password: params.password,
    role: 'Cuenta Personal',
    region: 'Lima, Perú',
    provider: 'password',
  };

  saveUsers([...users, newUser]);

  const { password: _removed, ...safeUser } = newUser;
  const session: AuthSession = {
    user: safeUser,
    loginMethod: 'email',
    loggedInAt: new Date().toISOString(),
    sessionId: `PE-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
      .toString()
      .slice(-4)}`,
  };

  saveSession(session);
  return { ok: true, session };
}

export function updateAccountPassword(
  identifier: string,
  method: LoginMethod,
  newPassword: string,
): boolean {
  const users = getStoredUsers();
  const normalized = identifier.trim().toLowerCase();
  let updated = false;
  const next = users.map((u) => {
    const match =
      method === 'email'
        ? u.email.toLowerCase() === normalized
        : u.documentNumber.toLowerCase() === normalized;
    if (match) {
      updated = true;
      return { ...u, password: newPassword };
    }
    return u;
  });
  if (updated) {
    saveUsers(next);
  }
  return updated;
}

export function createSsoSession(params: {
  provider: 'google' | 'microsoft';
  fullName: string;
  email: string;
  region: string;
}): AuthSession {
  const session: AuthSession = {
    user: {
      id: `sso-${params.provider}-${Date.now().toString(36)}`,
      fullName: params.fullName,
      email: params.email,
      documentType: 'DNI',
      documentNumber: '74108293',
      role:
        params.provider === 'google'
          ? 'Acceso Google Workspace'
          : 'Acceso Microsoft Entra ID',
      region: params.region,
      provider: params.provider,
    },
    loginMethod: params.provider,
    loggedInAt: new Date().toISOString(),
    sessionId: `PE-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
      .toString()
      .slice(-4)}`,
  };
  saveSession(session);
  return session;
}

export function saveRememberedCredentials(data: RememberedCredentials | null): void {
  try {
    if (!data) {
      localStorage.removeItem(REMEMBER_STORAGE_KEY);
      return;
    }
    localStorage.setItem(REMEMBER_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadRememberedCredentials(): RememberedCredentials | null {
  try {
    const raw = localStorage.getItem(REMEMBER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RememberedCredentials) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function savePreferredSceneId(sceneId: string): void {
  try {
    localStorage.setItem(SCENE_STORAGE_KEY, sceneId);
  } catch {
    // ignore
  }
}

export function loadPreferredSceneId(): string | null {
  try {
    return localStorage.getItem(SCENE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidDocument(docType: DocumentType, value: string): boolean {
  const clean = value.trim();
  if (docType === 'DNI') {
    return /^\d{8}$/.test(clean);
  }
  return /^[A-Za-z0-9]{9,12}$/.test(clean);
}

export function maskDocument(docNumber: string): string {
  if (docNumber.length <= 4) return docNumber;
  return `${'•'.repeat(docNumber.length - 4)}${docNumber.slice(-4)}`;
}
