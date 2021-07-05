import { useEffect } from 'react';
import { Button } from 'evergreen-ui';
import { useRouter } from 'next/router';
import { useAuth } from '@/services';
import { auth } from '@/firebase';

import styles from '../assets/styles/pending.module.css';

export default function Login() {
  const router = useRouter();

  const { isLoggingIn, login, user } = useAuth();

  useEffect(() => {
    auth.getRedirectResult().then((result) => {
      if (result.user) router.push('/');
    });
  }, []);

  useEffect(() => {
    if (user && !user.isPending) router.push('/');
  }, [user]);

  return (
    <div className={styles.pending}>
      <h2 className={styles.title}>Hi!</h2>
      <p>
        Welcome to the Open Summer of Code selections app. <br />
        After you&apos;ve logged in with your Google account, we&apos;ll enable your account so you
        can get started. Nudge @Miet#7556 for verification!
      </p>
      <Button isLoading={isLoggingIn} onClick={login} appearance="primary">
        Log in
      </Button>
      <div className={styles.logo}>
        <img src="/img/osoc.png" alt="Open Summer of Code logo" />
      </div>
    </div>
  );
}
