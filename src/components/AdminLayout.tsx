import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useAdminAuthStore } from '@src/store/adminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, checkSessionExpiry, logout } = useAdminAuthStore();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    checkSessionExpiry();
    
    if (!isAuthenticated || !isAdmin) {
      router.push('/admin');
    }
  }, [isAuthenticated, isAdmin, router, checkSessionExpiry]);
  
  const handleLogout = () => {
    logout();
    router.push('/admin');
  };
  
  if (!isClient || !isAuthenticated || !isAdmin) {
    return null; // 클라이언트 측 렌더링 전이거나 인증되지 않은 경우 아무것도 표시하지 않음
  }
  
  return (
    <Container>
      <Sidebar>
        <Logo>HUB ADMIN</Logo>
        <Nav>
          <NavItem isActive={router.pathname === '/admin/dashboard'}>
            <Link href="/admin/dashboard">대시보드</Link>
          </NavItem>
          <NavItem isActive={router.pathname === '/admin/tshirtsorder'}>
            <Link href="/admin/tshirtsorder">티셔츠 주문 관리</Link>
          </NavItem>
          <NavItem isActive={router.pathname === '/admin/inquiries'}>
            <Link href="/admin/inquiries">문의사항 관리</Link>
          </NavItem>
        </Nav>
        <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
      </Sidebar>
      
      <Content>
        <Header>
          <Title>{title}</Title>
        </Header>
        <Main>{children}</Main>
      </Content>
    </Container>
  );
}

// 스타일 컴포넌트
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: 250px;
  background-color: #222;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #444;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const NavItem = styled.div<{ isActive: boolean }>`
  margin-bottom: 8px;
  
  a {
    display: block;
    padding: 12px 16px;
    color: ${props => props.isActive ? 'white' : '#aaa'};
    text-decoration: none;
    border-radius: 4px;
    background-color: ${props => props.isActive ? '#444' : 'transparent'};
    
    &:hover {
      background-color: ${props => props.isActive ? '#444' : '#333'};
      color: white;
    }
  }
`;

const LogoutButton = styled.button`
  background-color: transparent;
  border: 1px solid #666;
  color: #ccc;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 16px;
  
  &:hover {
    background-color: #333;
    color: white;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background-color: white;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const Main = styled.main`
  padding: 24px;
`; 