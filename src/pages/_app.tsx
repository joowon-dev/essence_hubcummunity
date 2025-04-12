import isValidProp from "@emotion/is-prop-valid";
import { MotionConfig } from "framer-motion";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Global } from "@emotion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { global } from "@src/lib/styles/global";
import React from "react";
import { RecoilRoot } from 'recoil';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 1800000, // 30 mins
      gcTime: 3600000, // 60 mins
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Head>
        <title>HUB</title>
        <meta name="title" content="HUB" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <meta name="apple-mobile-web-app-title" content="HUB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />


        <link rel="manifest" href="/manifest.json" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0,  maximum-scale=1"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
      </Head>
      <Global styles={global} />
      <QueryClientProvider client={queryClient}>
        <MotionConfig isValidProp={isValidProp}>
          <Component {...pageProps} />
        </MotionConfig>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </RecoilRoot>
  );
}

export default MyApp;
