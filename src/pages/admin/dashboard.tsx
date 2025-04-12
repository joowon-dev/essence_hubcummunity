import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import AdminLayout from '@src/components/AdminLayout';
import { getOrderStatusStats } from '@src/lib/api/admin';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number>>({
    '미입금': 0,
    '입금확인중': 0,
    '입금완료': 0,
    '취소됨': 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await getOrderStatusStats();
        setStats(data);
      } catch (error) {
        console.error('통계 정보 로드 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);
  
  // 전체 주문 수 계산
  const totalOrders = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  // 취소된 주문을 제외한 유효 주문 수
  const validOrders = totalOrders - stats['취소됨'];
  
  // 완료율 계산 (완료 주문 수 / 취소된 주문을 제외한 유효 주문 수)
  const completionRate = validOrders > 0 ? Math.round((stats['입금완료'] / validOrders) * 100) : 0;
  
  return (
    <>
      <Head>
        <title>관리자 대시보드 | 허브 커뮤니티</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <AdminLayout title="관리자 대시보드">
        {loading ? (
          <LoadingMessage>통계 정보를 불러오는 중...</LoadingMessage>
        ) : (
          <>
            <StatCardsContainer>
              <StatCard>
                <StatTitle>전체 주문</StatTitle>
                <StatValue>{totalOrders}</StatValue>
                <StatDescription>총 주문 건수</StatDescription>
              </StatCard>
              
              <StatCard>
                <StatTitle>미입금</StatTitle>
                <StatValue color="#ef4444">{stats['미입금']}</StatValue>
                <StatDescription>미입금 주문</StatDescription>
              </StatCard>
              
              <StatCard>
                <StatTitle>입금확인중</StatTitle>
                <StatValue color="#f97316">{stats['입금확인중']}</StatValue>
                <StatDescription>입금 확인 필요</StatDescription>
              </StatCard>
              
              <StatCard>
                <StatTitle>입금완료</StatTitle>
                <StatValue color="#10b981">{stats['입금완료']}</StatValue>
                <StatDescription>처리 완료된 주문</StatDescription>
              </StatCard>
              
              <StatCard>
                <StatTitle>취소됨</StatTitle>
                <StatValue color="#6b7280">{stats['취소됨']}</StatValue>
                <StatDescription>취소된 주문</StatDescription>
              </StatCard>
            </StatCardsContainer>
            
            <CompletionRateCard>
              <CompletionRateTitle>입금 완료율</CompletionRateTitle>
              <CompletionRateValue>{completionRate}%</CompletionRateValue>
              <ProgressBarContainer>
                <ProgressBar width={`${completionRate}%`} />
              </ProgressBarContainer>
            </CompletionRateCard>
            
            <QuickActionsContainer>
              <QuickActionTitle>바로가기</QuickActionTitle>
              <QuickActionGrid>
                <QuickActionCard>
                  <Link href="/admin/tshirtsorder">
                    <QuickActionContent>
                      <QuickActionIcon>📦</QuickActionIcon>
                      <QuickActionText>티셔츠 주문 관리</QuickActionText>
                    </QuickActionContent>
                  </Link>
                </QuickActionCard>
                
                <QuickActionCard>
                  <Link href="/admin/inquiries">
                    <QuickActionContent>
                      <QuickActionIcon>📝</QuickActionIcon>
                      <QuickActionText>문의사항 관리</QuickActionText>
                    </QuickActionContent>
                  </Link>
                </QuickActionCard>
              </QuickActionGrid>
            </QuickActionsContainer>
          </>
        )}
      </AdminLayout>
    </>
  );
}

// 스타일 컴포넌트
const LoadingMessage = styled.div`
  text-align: center;
  padding: 32px;
  color: #6b7280;
  font-weight: 500;
`;

const StatCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

const StatTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 16px 0;
`;

const StatValue = styled.div<{ color?: string }>`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.color || '#1f2937'};
  margin-bottom: 8px;
`;

const StatDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const CompletionRateCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
`;

const CompletionRateTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 16px 0;
`;

const CompletionRateValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 16px;
`;

const ProgressBarContainer = styled.div`
  background-color: #e5e7eb;
  border-radius: 9999px;
  height: 8px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ width: string }>`
  background-color: #10b981;
  height: 100%;
  width: ${props => props.width};
  border-radius: 9999px;
  transition: width 0.5s ease;
`;

const QuickActionsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const QuickActionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 16px 0;
`;

const QuickActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const QuickActionCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border-color: #d1d5db;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
`;

const QuickActionContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const QuickActionIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const QuickActionText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`; 