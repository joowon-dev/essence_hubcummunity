import * as S from './style';
import PageLayout from "@src/components/common/PageLayout";
import { useState, useEffect } from 'react';
import { supabase } from '@src/lib/supabase';
import { useRouter } from 'next/router';
import { useAuthStore } from '@src/store/auth';

// 리다이렉션 관련 로컬스토리지 키
const REDIRECT_STORAGE_KEY = 'login_redirect';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirectPath, setRedirectPath] = useState('/myinfo'); // 기본 리다이렉션 경로

  // 컴포넌트 마운트 시 리다이렉션 경로 확인
  useEffect(() => {
    const savedRedirectPath = localStorage.getItem(REDIRECT_STORAGE_KEY);
    if (savedRedirectPath) {
      setRedirectPath(savedRedirectPath);
    }
  }, []);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 11) {
      let formattedNumber = '';
      if (value.length <= 3) {
        formattedNumber = value;
      } else if (value.length <= 7) {
        formattedNumber = `${value.slice(0, 3)}-${value.slice(3)}`;
      } else {
        formattedNumber = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
      }
      setPhoneNumber(formattedNumber);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setPassword(value);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone_number')
        .eq('phone_number', phoneNumber)
        .eq('password', password)
        .single();

      if (error) {
        throw new Error('로그인에 실패했습니다. 전화번호와 비밀번호를 확인해주세요.');
      }

      if (data) {
        setUser(phoneNumber, true);
        
        // 저장된 리다이렉션 경로로 이동
        localStorage.removeItem(REDIRECT_STORAGE_KEY); // 사용 후 삭제
        router.push(redirectPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
      console.error('Login error:', err);
    }
  };

  return (
    <PageLayout>
      <S.Container>
        <S.Title>
          신청 폼에 기재했던 <br />
          나의 정보를 입력해주세요.
        </S.Title>
        <S.Form onSubmit={handleLogin}>
          <S.Input
            type="tel"
            placeholder="전화번호 (010-0000-0000)"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}"
            required
          />
          <S.Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          {error && (
            <S.LoginProblem>
              <S.InfoIcon>i</S.InfoIcon>
              <S.LoginProblemText>{error}</S.LoginProblemText>
            </S.LoginProblem>
          )}
          <S.HelpContainer>
            <S.HelpLink href="#" onClick={(e) => { e.preventDefault(); alert("관리자에게 문의해주세요. 010-0000-0000"); }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.99995 1.67332C9.93462 1.67332 12.3266 4.06528 12.3266 6.99995C12.3266 9.93462 9.93462 12.3266 6.99995 12.3266C4.06528 12.3266 1.67332 9.93462 1.67332 6.99995C1.67332 4.06528 4.06528 1.67332 6.99995 1.67332ZM6.99995 0.467285C3.39191 0.467285 0.467285 3.39191 0.467285 6.99995C0.467285 10.608 3.39191 13.5326 6.99995 13.5326C10.608 13.5326 13.5326 10.608 13.5326 6.99995C13.5326 3.39191 10.608 0.467285 6.99995 0.467285Z" fill="#000000"/>
                <path d="M7.603 6.26636H6.39697V10.2865H7.603V6.26636Z" fill="#000000"/>
                <path d="M6.99986 3.75391C6.5878 3.75391 6.24609 4.08556 6.24609 4.50768C6.24609 4.92979 6.5878 5.26144 6.99986 5.26144C7.41192 5.26144 7.75363 4.91974 7.75363 4.50768C7.75363 4.09561 7.42197 3.75391 6.99986 3.75391Z" fill="#000000"/>
              </svg>
              로그인에 문제가 있나요?
            </S.HelpLink>
          </S.HelpContainer>
          <S.LoginButton type="submit">로그인 →</S.LoginButton>
        </S.Form>
      </S.Container>
    </PageLayout>
  );
} 