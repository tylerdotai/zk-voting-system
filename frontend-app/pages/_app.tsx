import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

// Browser polyfill for snarkjs / blake-hash (uses Buffer)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Buffer: BrowserBuffer } = require('buffer');
  if (!window.Buffer) window.Buffer = BrowserBuffer;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Rob&apos;s Rules Voting</title>
        <meta name="theme-color" content="#f9fafb" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
