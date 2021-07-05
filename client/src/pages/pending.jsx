import { useEffect } from 'react';
import { useAuth } from '@/services';
import { useRouter } from 'next/router';
import styles from '@/assets/styles/pending.module.css';

export default function Pending() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user && !user.isPending) router.push('/');
  }, [user]);
  return (
    <div className={styles.pending}>
      <h2 className={styles.title}>Hey {user && user.name} :)</h2>
      <p>
        To keep student data secure, your account is pending. We&apos;ll enable your account soon!
      </p>
      <div className={styles.logo}>
        <img src="/img/osoc.png" alt="Open Summer of Code logo" />
      </div>
    </div>
  );
}
