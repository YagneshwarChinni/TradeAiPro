import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Shield, Mail, RefreshCw, Download, Search } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  provider: string | null;
  role: 'admin' | 'user';
  is_disabled: boolean;
  created_at: string | null;
  last_sign_in_at: string | null;
}

const ADMIN_EMAIL = 'yagneshwarchinni@gmail.com';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAdvancedColumns, setHasAdvancedColumns] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  const extractErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
    }

    return fallback;
  };

  const normalizeUsers = (
    rows: Array<Partial<AdminUserRow> & { id: string; email?: string | null; full_name?: string | null; provider?: string | null }>,
    advancedColumnsAvailable: boolean,
  ): AdminUserRow[] => {
    return rows
      .filter((row) => typeof row.email === 'string' && row.email.trim().length > 0)
      .map((row) => {
        const email = (row.email as string).trim();
        const isPrimaryAdmin = email.toLowerCase() === ADMIN_EMAIL;

        return {
          id: row.id,
          email,
          full_name: row.full_name ?? null,
          provider: row.provider ?? null,
          role: isPrimaryAdmin ? 'admin' : advancedColumnsAvailable ? (row.role ?? 'user') : 'user',
          is_disabled: isPrimaryAdmin ? false : advancedColumnsAvailable ? Boolean(row.is_disabled) : false,
          created_at: row.created_at ?? null,
          last_sign_in_at: row.last_sign_in_at ?? null,
        };
      });
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const selectAttempts = [
        {
          columns: 'id, email, full_name, provider, role, is_disabled, created_at, last_sign_in_at',
          advanced: true,
          supportsCreatedAtSort: true,
        },
        {
          columns: 'id, email, full_name, provider, created_at, last_sign_in_at',
          advanced: false,
          supportsCreatedAtSort: true,
        },
        {
          columns: 'id, email, full_name, provider, created_at',
          advanced: false,
          supportsCreatedAtSort: true,
        },
        {
          columns: 'id, email, full_name, provider',
          advanced: false,
          supportsCreatedAtSort: false,
        },
      ] as const;

      let lastError: unknown = null;

      for (const attempt of selectAttempts) {
        let query = supabase.from('profiles').select(attempt.columns as string);

        if (attempt.supportsCreatedAtSort) {
          query = query.order('created_at', { ascending: false });
        }

        const response = await query;

        if (response.error) {
          lastError = response.error;
          continue;
        }

        setHasAdvancedColumns(attempt.advanced);
        setUsers(
          normalizeUsers(
            ((response.data || []) as unknown) as Array<Partial<AdminUserRow> & { id: string }>,
            attempt.advanced,
          ),
        );
        return;
      }

      throw lastError ?? new Error('Unable to load users');
    } catch (error) {
      const message = extractErrorMessage(error, 'Unable to load users');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-profiles-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          void loadUsers();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.email.toLowerCase().includes(query) ||
        (user.full_name || '').toLowerCase().includes(query);

      const userRole: 'admin' | 'user' = user.email.toLowerCase() === ADMIN_EMAIL ? 'admin' : user.role;
      const matchesRole = roleFilter === 'all' || userRole === roleFilter;

      const status = user.is_disabled ? 'disabled' : 'active';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const updateUser = async (userId: string, updates: Partial<Pick<AdminUserRow, 'role' | 'is_disabled'>>) => {
    if (!hasAdvancedColumns) {
      toast.error('Please apply the latest Supabase migration to enable role and disable actions.');
      return;
    }

    try {
      setUpdatingUserId(userId);
      const { error } = await supabase.from('profiles').update(updates).eq('id', userId);

      if (error) {
        throw error;
      }

      setUsers((previousUsers) =>
        previousUsers.map((user) => (user.id === userId ? { ...user, ...updates } : user)),
      );
      toast.success('User updated successfully');
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to update user');
      toast.error(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRoleChange = async (user: AdminUserRow, role: 'admin' | 'user') => {
    if (user.email.toLowerCase() === ADMIN_EMAIL) {
      return;
    }

    await updateUser(user.id, { role });
  };

  const handleStatusToggle = async (user: AdminUserRow) => {
    if (user.email.toLowerCase() === ADMIN_EMAIL) {
      return;
    }

    await updateUser(user.id, { is_disabled: !user.is_disabled });
  };

  const exportCsv = () => {
    const header = ['name', 'email', 'provider', 'role', 'status', 'created_at', 'last_sign_in_at'];
    const rows = filteredUsers.map((user) => {
      const role = user.email.toLowerCase() === ADMIN_EMAIL ? 'admin' : user.role;
      const status = user.is_disabled ? 'disabled' : 'active';

      return [
        user.full_name || '',
        user.email,
        user.provider || '',
        role,
        status,
        user.created_at || '',
        user.last_sign_in_at || '',
      ];
    });

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admin-users.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (value: string | null) => {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString();
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-[1920px] mx-auto space-y-6 sm:space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Administrator: {ADMIN_EMAIL}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl">{filteredUsers.length}</p>
                </div>
                <Users className="w-6 h-6 text-primary" />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admin Access</p>
                  <p className="text-base sm:text-lg break-all">{ADMIN_EMAIL}</p>
                </div>
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Refresh Users</p>
                  <p className="text-xs text-muted-foreground">Sync latest profile rows</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={exportCsv} disabled={loading}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void loadUsers()} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {!hasAdvancedColumns && (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
              Running in compatibility mode. Apply latest Supabase migration to enable role changes and disable actions.
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <GlassCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or email"
                  className="pl-9"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as 'all' | 'admin' | 'user')}
                aria-label="Filter users by role"
                className="h-9 rounded-md border border-input bg-background px-3"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'disabled')}
                aria-label="Filter users by status"
                className="h-9 rounded-md border border-input bg-background px-3"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard>
            <h2 className="text-lg sm:text-xl mb-4">Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Provider</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2">Last Sign In</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isPrimaryAdmin = user.email.toLowerCase() === ADMIN_EMAIL;
                    const role = isPrimaryAdmin ? 'admin' : user.role;

                    return (
                      <tr key={user.id} className="border-b border-border/50">
                        <td className="py-3 pr-4">{user.full_name || '-'}</td>
                        <td className="py-3 pr-4 break-all">{user.email}</td>
                        <td className="py-3 pr-4 capitalize">{user.provider || '-'}</td>
                        <td className="py-3 pr-4">
                          <select
                            value={role}
                            disabled={isPrimaryAdmin || updatingUserId === user.id}
                            onChange={(event) => void handleRoleChange(user, event.target.value as 'admin' | 'user')}
                            aria-label={`Change role for ${user.email}`}
                            className="h-8 rounded border border-input bg-background px-2 capitalize"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="py-3 pr-4">
                          <Button
                            size="sm"
                            variant={user.is_disabled ? 'destructive' : 'outline'}
                            disabled={isPrimaryAdmin || updatingUserId === user.id}
                            onClick={() => void handleStatusToggle(user)}
                          >
                            {user.is_disabled ? 'Disabled' : 'Active'}
                          </Button>
                        </td>
                        <td className="py-3 pr-4">{formatDate(user.created_at)}</td>
                        <td className="py-3">{formatDate(user.last_sign_in_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
