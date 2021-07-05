import { useEffect } from 'react';
import { useAuth } from '@/services';

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, []);

  return <p />;
}
