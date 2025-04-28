import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 현재 경로 가져오기
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  // 로그인 페이지 경로
  const loginPath = '/admin/login';
  
  // 로그인 페이지인 경우 미들웨어 처리 생략
  if (pathname === loginPath) {
    return NextResponse.next();
  }
  
  // admin_phone 쿠키로 인증 상태 확인
  const adminPhone = request.cookies.get('admin_phone')?.value;
  const sessionExpiry = request.cookies.get('admin_session_expiry')?.value;
  
  // 인증 상태 확인 (쿠키가 있고 만료되지 않은 경우)
  const isAuthenticated = !!(adminPhone && sessionExpiry && parseInt(sessionExpiry) > Date.now());
  
  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    url.pathname = loginPath;
    // 리디렉션 후 로그인 성공 시 돌아올 경로 저장
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// /admin 경로와 그 하위 경로에 대해 미들웨어 적용
export const config = {
  matcher: ['/admin/:path*'],
}; 