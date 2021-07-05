import Head from 'next/head';
import Header from '@/components/Header';
import { useAuth } from '@/services';

import 'normalize.css';
import '@/assets/styles/index.css';

export default function App({ Component, pageProps }) {
  const { isLoading } = useAuth();

  if (isLoading) return <p />;

  const getLayout = Component.getLayout || ((page) => page);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Selections | Open Summer of Code</title>
      </Head>
      <Header />
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}
