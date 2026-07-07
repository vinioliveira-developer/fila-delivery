import { useEffect, useState } from 'react';
import { SystemService } from '../services/systemService';
import { AdminService } from '../services/adminService';
import { UsersService } from '../services/usersService';

export function useConfig() {
  const [systemInfo, setSystemInfo] = useState<any | null>(null);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const [sys, dash, users] = await Promise.all([
          SystemService.version(),
          AdminService.getDashboard(),
          UsersService.list()
        ]);

        if (!isMounted) return;

        setSystemInfo(sys);
        setDashboard(dash);
        const admin = users.users.find((u: any) => u.role === 'ADMIN');
        setAdminEmail(admin?.email ?? null);
        setError('');
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar configuracoes.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { systemInfo, dashboard, adminEmail, isLoading, error };
}
