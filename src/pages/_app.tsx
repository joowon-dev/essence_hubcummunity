import isValidProp from "@emotion/is-prop-valid";
import { MotionConfig } from "framer-motion";
import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { Global } from "@emotion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { global } from "@src/lib/styles/global";
import React, { useEffect, useCallback } from "react";
import { RecoilRoot } from 'recoil';
import { useAuthStore, initializeAuthState } from "@src/store/auth";
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { LoadingProvider, useLoading } from "@src/contexts/LoadingContext";
import LoadingScreen from "@src/components/common/LoadingScreen";

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

// 서버사이드 렌더링 여부 확인
const isServer = typeof window === 'undefined';

// 세션 확인 컴포넌트
function SessionManager({ children }: { children: React.ReactNode }) {
  const { checkSessionExpiry } = useAuthStore();
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  
  // 상태 확인 함수를 메모이제이션
  const memoizedCheckSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      // 세션 만료 확인 및 필요시 상태 복원
      const isAuthenticated = checkSessionExpiry();
      
      // 세션 관련 디버그 정보 (필요시 주석 해제)
      // console.log('SessionManager: 세션 체크 결과', { isAuthenticated });
    }
  }, [checkSessionExpiry]);

  // 초기 로드 시 상태 복원
  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window !== 'undefined') {
      // 즉시 초기화 함수 호출
      initializeAuthState();
      
      // 즉시 세션 체크 수행 (지연 없이)
      memoizedCheckSession();
      
      // 또한 로컬 스토리지 변경 이벤트 리스너 추가
      const handleStorageChange = () => {
        memoizedCheckSession();
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // 페이지가 로드될 때마다 상태를 확인하기 위한 이벤트 리스너
      const handleLoad = () => {
        initializeAuthState(); // 페이지 로드 시 상태 직접 초기화
        memoizedCheckSession();
      };
      
      window.addEventListener('load', handleLoad);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('load', handleLoad);
      };
    }
  }, [memoizedCheckSession]);

  // 라우팅 변경 감지 및 로딩 처리
  useEffect(() => {
    // 페이지 변경 시작 시 로딩 표시
    const handleRouteChangeStart = () => {
      startLoading();
    };
    
    // 페이지 변경 완료 시 로딩 숨김
    const handleRouteChangeComplete = () => {
      memoizedCheckSession();
      stopLoading();
    };
    
    // 페이지 변경 오류 시 로딩 숨김
    const handleRouteChangeError = () => {
      stopLoading();
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    // 정기적으로 세션 확인 (5분마다)
    const interval = setInterval(() => {
      memoizedCheckSession();
    }, 5 * 60 * 1000);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
      clearInterval(interval);
    };
  }, [memoizedCheckSession, router, startLoading, stopLoading]);

  return <>{children}</>;
}

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

      {/* Jennifer Monitoring Script */}
      <Script id="jennifer-script" strategy="afterInteractive" dangerouslySetInnerHTML={{
        __html: `
          (function(j,ennifer) {
              j['dmndata']=[];j['jenniferFront']=function(args){window.dmndata.push(args)};
              j['dmnaid']=ennifer;j['dmnatime']=new Date();j['dmnanocookie']=false;j['dmnajennifer']='JENNIFER_FRONT@INTG';
          }(window, '49032406'));
        `
      }} />
      <Script id="jennifer-demian" src="https://d-collect.jennifersoft.com/49032406/demian.js" strategy="afterInteractive" />

      <Global styles={global} />
      <QueryClientProvider client={queryClient}>
        <MotionConfig isValidProp={isValidProp}>
          <LoadingProvider>
            <LoadingScreen />
            <SessionManager>
              <Component {...pageProps} />
              <Analytics />
              <SpeedInsights />
            </SessionManager>
          </LoadingProvider>
        </MotionConfig>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </RecoilRoot>
  );
}

export default MyApp;
