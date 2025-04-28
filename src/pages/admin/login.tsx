import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { message } from 'antd';
import { loginAdmin } from '@src/lib/api/admin';
import { useAdminAuthStore, initializeAdminAuthState } from '@src/store/adminAuth';
import Head from 'next/head';

const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated, setAdmin, checkSessionExpiry } = useAdminAuthStore();
  
  useEffect(() => {
    // 세션 상태 초기화 및 만료 확인
    initializeAdminAuthState();
    checkSessionExpiry();
    
    // 이미 인증되어 있으면 관리자 대시보드로 리디렉션
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, checkSessionExpiry, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 입력 검증
    if (!phoneNumber.trim()) {
      setError('전화번호를 입력해주세요.');
      return;
    }
    
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      
      // 관리자 로그인 처리
      const success = await loginAdmin({
        phoneNumber: phoneNumber.trim(),
        password: password.trim()
      });
      
      if (success) {
        // 인증 상태 설정
        setAdmin(phoneNumber.trim());
        message.success('로그인 성공! 관리자 페이지로 이동합니다.');
        router.push('/admin/dashboard');
      } else {
        setError('인증에 실패했습니다. 전화번호와 비밀번호를 확인해주세요.');
      }
    } catch (err) {
      setError('로그인 처리 중 오류가 발생했습니다.');
      console.error('로그인 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>관리자 로그인 | 허브 커뮤니티</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="관리자 전용 로그인 페이지입니다." />
      </Head>
      <Container>
        <LoginBox>
          <Title>관리자 로그인</Title>
          
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>전화번호</Label>
              <Input
                type="text"
                value={phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                placeholder="전화번호를 입력하세요"
              />
            </InputGroup>
            
            <InputGroup>
              <Label>비밀번호</Label>
              <Input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
            </InputGroup>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <LoginButton type="submit" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </LoginButton>
          </Form>
        </LoginBox>
      </Container>
    </>
  );
};

export default AdminLoginPage;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const LoginBox = styled.div`
  width: 500px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #1890ff;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 14px;
  margin-top: -8px;
`;

const LoginButton = styled.button`
  padding: 12px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #40a9ff;
  }
  
  &:disabled {
    background-color: #bfbfbf;
    cursor: not-allowed;
  }
`; 