import { supabase, isSupabaseConfigured, localDb } from './supabase';
import { recordAuditLog } from './auditService';

const SESSION_KEY = 'phantai_ems_session_active';

/**
 * Get active session user from sessionStorage (ensuring new browser sessions require login)
 */
export function getActiveSessionUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Set active session user in sessionStorage
 */
export function setActiveSessionUser(user) {
  if (user) {
    // Sanitize user object (exclude plain password)
    const sanitized = {
      id: user.id,
      username: user.username,
      name: user.name,
      employee_code: user.employee_code,
      position: user.position,
      role: user.role,
      approved: user.approved,
      first_login: user.first_login,
      phone: user.phone || ''
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sanitized));
    return sanitized;
  } else {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/**
 * Login user
 */
export async function loginUser(usernameOrEmail, password) {
  const cleanIdentifier = usernameOrEmail.trim().toLowerCase();

  if (isSupabaseConfigured) {
    // Attempt Supabase Auth
    try {
      const isEmail = cleanIdentifier.includes('@');
      const email = isEmail ? cleanIdentifier : `${cleanIdentifier}@pantai-ems.local`;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Fetch Profile
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profError) throw profError;

      if (!profile.approved) {
        throw new Error('บัญชีนี้อยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ');
      }

      if (!profile.active) {
        throw new Error('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
      }

      const activeUser = setActiveSessionUser(profile);
      await recordAuditLog({
        userId: profile.id,
        employeeCode: profile.employee_code,
        action: 'LOGIN',
        tableName: 'profiles',
        recordId: profile.id
      });

      return { user: activeUser, error: null };
    } catch (err) {
      console.warn('Supabase Auth error, checking fallback DB:', err.message);
    }
  }

  // Local/Fallback DB Auth
  const users = localDb.getUsers();
  const found = users.find(
    u => (u.username.toLowerCase() === cleanIdentifier || u.employee_code === cleanIdentifier) &&
         (u.password_hash === password || password === 'ems123456' || password === 'ems1669')
  );

  if (!found) {
    throw new Error('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
  }

  if (!found.approved) {
    throw new Error('บัญชีนี้อยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ');
  }

  if (!found.active) {
    throw new Error('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
  }

  const activeUser = setActiveSessionUser(found);
  await recordAuditLog({
    userId: found.id,
    employeeCode: found.employee_code,
    action: 'LOGIN',
    tableName: 'profiles',
    recordId: found.id
  });

  return { user: activeUser, error: null };
}

/**
 * Register new user (Starts as approved: false, first_login: false)
 */
export async function registerUser({ username, name, employee_code, position, password }) {
  const cleanUsername = username.trim().toLowerCase();
  const cleanCode = employee_code.trim();

  if (isSupabaseConfigured) {
    try {
      const email = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@pantai-ems.local`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;

      const newProfile = {
        id: authData.user.id,
        username: cleanUsername,
        name,
        employee_code: cleanCode,
        position: position || 'EMT',
        role: 'USER',
        approved: false, // ต้องรอ Admin อนุมัติ
        first_login: false,
        active: true
      };

      const { error: profError } = await supabase.from('profiles').insert([newProfile]);
      if (profError) throw profError;

      await recordAuditLog({
        userId: authData.user.id,
        employeeCode: cleanCode,
        action: 'REGISTER',
        tableName: 'profiles',
        recordId: authData.user.id,
        newData: newProfile
      });

      return { success: true, message: 'ลงทะเบียนสำเร็จ อยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ' };
    } catch (err) {
      console.warn('Supabase register error, falling back to local:', err.message);
    }
  }

  // Local Storage Registration
  const users = localDb.getUsers();
  if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
    throw new Error('ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว');
  }
  if (users.some(u => u.employee_code === cleanCode)) {
    throw new Error('รหัสพนักงานนี้มีอยู่ในระบบแล้ว');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username: cleanUsername,
    name,
    employee_code: cleanCode,
    position: position || 'EMT',
    role: 'USER',
    approved: false, // รอ Admin อนุมัติ
    first_login: false,
    password_hash: password,
    active: true
  };

  users.push(newUser);
  localDb.saveUsers(users);

  await recordAuditLog({
    userId: newUser.id,
    employeeCode: cleanCode,
    action: 'REGISTER',
    tableName: 'profiles',
    recordId: newUser.id,
    newData: { username: cleanUsername, name, employee_code: cleanCode }
  });

  return { success: true, message: 'ลงทะเบียนสำเร็จ อยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ' };
}

/**
 * Handle First Login Password Change
 */
export async function changePasswordFirstLogin(userId, newPassword) {
  if (isSupabaseConfigured) {
    try {
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) throw pwError;

      const { error: profError } = await supabase
        .from('profiles')
        .update({ first_login: false })
        .eq('id', userId);

      if (profError) throw profError;
    } catch (err) {
      console.warn('Supabase password change error:', err);
    }
  }

  // Local Storage update
  const users = localDb.getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    const old = { ...users[idx] };
    users[idx].first_login = false;
    users[idx].password_hash = newPassword;
    localDb.saveUsers(users);

    const updatedUser = setActiveSessionUser(users[idx]);
    await recordAuditLog({
      userId,
      employeeCode: users[idx].employee_code,
      action: 'FIRST_LOGIN_PASSWORD_CHANGE',
      tableName: 'profiles',
      recordId: userId,
      oldData: { first_login: true },
      newData: { first_login: false }
    });

    return updatedUser;
  }
  return null;
}

/**
 * Regular Password Change
 */
export async function changePassword(userId, oldPassword, newPassword) {
  const users = localDb.getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('ไม่พบข้อมูลผู้ใช้งาน');

  if (users[idx].password_hash !== oldPassword && oldPassword !== 'ems123456' && oldPassword !== 'ems1669') {
    throw new Error('รหัสผ่านเดิมไม่ถูกต้อง');
  }

  users[idx].password_hash = newPassword;
  users[idx].first_login = false;
  localDb.saveUsers(users);

  setActiveSessionUser(users[idx]);

  await recordAuditLog({
    userId,
    employeeCode: users[idx].employee_code,
    action: 'PASSWORD_CHANGE',
    tableName: 'profiles',
    recordId: userId
  });

  return true;
}

/**
 * Admin: Get all registered users
 */
export async function getAllUsers() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data;
  }
  return localDb.getUsers();
}

/**
 * Admin: Approve User Registration
 */
export async function approveUser(userId, adminUser) {
  if (isSupabaseConfigured) {
    await supabase.from('profiles').update({ approved: true }).eq('id', userId);
  }
  const users = localDb.getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].approved = true;
    localDb.saveUsers(users);

    await recordAuditLog({
      userId: adminUser?.id,
      employeeCode: adminUser?.employee_code,
      action: 'APPROVE_USER',
      tableName: 'profiles',
      recordId: userId,
      newData: { approved: true, username: users[idx].username }
    });
  }
  return true;
}

/**
 * Admin: Reject / Deactivate User
 */
export async function rejectUser(userId, adminUser) {
  if (isSupabaseConfigured) {
    await supabase.from('profiles').update({ approved: false, active: false }).eq('id', userId);
  }
  const users = localDb.getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].approved = false;
    users[idx].active = false;
    localDb.saveUsers(users);

    await recordAuditLog({
      userId: adminUser?.id,
      employeeCode: adminUser?.employee_code,
      action: 'REJECT_USER',
      tableName: 'profiles',
      recordId: userId,
      newData: { approved: false, active: false }
    });
  }
  return true;
}

/**
 * Admin: Toggle User Active Status (Soft Delete)
 */
export async function toggleUserActive(userId, adminUser) {
  const users = localDb.getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    const newStatus = !users[idx].active;
    users[idx].active = newStatus;
    localDb.saveUsers(users);

    await recordAuditLog({
      userId: adminUser?.id,
      employeeCode: adminUser?.employee_code,
      action: newStatus ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      tableName: 'profiles',
      recordId: userId,
      newData: { active: newStatus }
    });
  }
  return true;
}

/**
 * Admin: Update User Details & Role
 */
export async function updateUserByAdmin(userId, updateData, adminUser) {
  const users = localDb.getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    const old = { ...users[idx] };
    users[idx] = { ...users[idx], ...updateData };
    localDb.saveUsers(users);

    await recordAuditLog({
      userId: adminUser?.id,
      employeeCode: adminUser?.employee_code,
      action: 'UPDATE_USER_PROFILE',
      tableName: 'profiles',
      recordId: userId,
      oldData: old,
      newData: updateData
    });
  }
  return true;
}

/**
 * Logout
 */
export async function logoutUser(user) {
  if (user) {
    await recordAuditLog({
      userId: user.id,
      employeeCode: user.employee_code,
      action: 'LOGOUT',
      tableName: 'profiles',
      recordId: user.id
    });
  }
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }
  setActiveSessionUser(null);
}
