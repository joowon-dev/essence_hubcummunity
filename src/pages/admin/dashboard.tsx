import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import AdminLayout from '@src/components/AdminLayout';
import { getOrderStatusStats, getTshirtOrderStats } from '@src/lib/api/admin';
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
  const [orderStats, setOrderStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setStatsLoading(true);
      try {
        // 기본 통계 로드
        const data = await getOrderStatusStats();
        setStats(data);
        
        // 상세 통계 로드
        const detailedStats = await getTshirtOrderStats();
        setOrderStats(detailedStats);
      } catch (error) {
        console.error('통계 정보 로드 중 오류:', error);
      } finally {
        setLoading(false);
        setStatsLoading(false);
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
  
  // 합계 계산 함수 (취소됨 상태 제외)
  const calculateTotalWithoutCancelled = (status: string) => {
    if (!orderStats || !orderStats.stats || !orderStats.stats[status]) return 0;
    
    return Object.values(orderStats.stats[status]).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
  };
  
  // 옵션별 총합계 계산 (취소됨 상태 제외)
  const calculateOptionTotalWithoutCancelled = (optionKey: string) => {
    if (!orderStats || !orderStats.stats) return 0;
    
    return ['미입금', '입금확인중', '입금완료'].reduce((sum: number, status: string) => {
      return sum + (orderStats.stats[status][optionKey] || 0);
    }, 0);
  };
  
  // 색상 및 사이즈 정렬 순서 정의
  const sizeOrder = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const colorOrder = ['BLACK', 'WHITE'];

  // 옵션 정렬 함수
  const sortOptions = (options: any[]) => {
    if (!options) return [];
    return [...options].sort((a, b) => {
      // 우선 색상으로 정렬
      const colorAIndex = colorOrder.indexOf(a.color);
      const colorBIndex = colorOrder.indexOf(b.color);
      
      if (colorAIndex !== colorBIndex) {
        return colorAIndex - colorBIndex;
      }
      
      // 색상이 같으면 사이즈로 정렬
      const sizeAIndex = sizeOrder.indexOf(a.size);
      const sizeBIndex = sizeOrder.indexOf(b.size);
      return sizeAIndex - sizeBIndex;
    });
  };

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
            
            {/* 티셔츠 주문 통계 테이블 */}
            {!statsLoading && orderStats && (
              <StatsCard>
                <StatsCardHeader>
                  <StatsCardTitle>티셔츠 주문 상세 통계</StatsCardTitle>
                  <StatsCardSubtitle>옵션별 주문 수량 (취소됨 상태는 합계에 미포함)</StatsCardSubtitle>
                </StatsCardHeader>
                
                <StatsTableContainer>
                  <StatisticsTable>
                    <thead>
                      <tr>
                        <StatisticsTableHeader rowSpan={2}>상태 / 옵션</StatisticsTableHeader>
                        {/* 색상별로 그룹화 */}
                        {colorOrder.map(color => {
                          // 해당 색상의 사이즈 수 계산
                          const sizesCount = sizeOrder.length;
                          return (
                            <StatisticsTableHeader 
                              key={`color-${color}`}
                              colSpan={sizesCount}
                              colorHeader={true}
                            >
                              {color}
                            </StatisticsTableHeader>
                          );
                        })}
                        <StatisticsTableHeader rowSpan={2}>합계</StatisticsTableHeader>
                      </tr>
                      <tr>
                        {/* 색상별 사이즈 표시 */}
                        {colorOrder.map(color => (
                          sizeOrder.map(size => (
                            <StatisticsTableHeader 
                              key={`${color}-${size}`}
                              sizeHeader={true}
                            >
                              {size}
                            </StatisticsTableHeader>
                          ))
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['미입금', '입금확인중', '입금완료', '취소됨'].map(status => (
                        <StatisticsTableRow key={status}>
                          <StatisticsTableCell>
                            <StatusBadge status={status}>{status}</StatusBadge>
                          </StatisticsTableCell>
                          {colorOrder.map(color => (
                            sizeOrder.map(size => {
                              const key = `${size}|${color}`;
                              const value = orderStats.stats[status][key] || 0;
                              return (
                                <StatisticsTableCell 
                                  key={key}
                                  highlighted={false}
                                >
                                  {value}
                                </StatisticsTableCell>
                              );
                            })
                          ))}
                          <StatisticsTableCell highlighted={false}>
                            {calculateTotalWithoutCancelled(status)}
                          </StatisticsTableCell>
                        </StatisticsTableRow>
                      ))}
                      <StatisticsTableRow>
                        <StatisticsTableCell>
                          <StatusBadge status="합계">유효 합계</StatusBadge>
                        </StatisticsTableCell>
                        {colorOrder.map(color => (
                          sizeOrder.map(size => {
                            const key = `${size}|${color}`;
                            const total = calculateOptionTotalWithoutCancelled(key);
                            return (
                              <StatisticsTableCell 
                                key={key}
                                highlighted={true}
                              >
                                {total}
                              </StatisticsTableCell>
                            );
                          })
                        ))}
                        <StatisticsTableCell highlighted={true}>
                          {['미입금', '입금확인중', '입금완료'].reduce((sum, status) => 
                            sum + calculateTotalWithoutCancelled(status), 0)}
                        </StatisticsTableCell>
                      </StatisticsTableRow>
                    </tbody>
                  </StatisticsTable>
                </StatsTableContainer>
              </StatsCard>
            )}
            
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

                <QuickActionCard>
                  <Link href="/admin/schedules">
                    <QuickActionContent>
                      <QuickActionIcon>🗓️</QuickActionIcon>
                      <QuickActionText>스케줄 관리</QuickActionText>
                    </QuickActionContent>
                  </Link>
                </QuickActionCard>
                
                <QuickActionCard>
                  <Link href="/admin/faqs">
                    <QuickActionContent>
                      <QuickActionIcon>❓</QuickActionIcon>
                      <QuickActionText>FAQ 관리</QuickActionText>
                    </QuickActionContent>
                  </Link>
                </QuickActionCard>
                
                <QuickActionCard>
                  <Link href="/admin/spreadsheet">
                    <QuickActionContent>
                      <QuickActionIcon>📊</QuickActionIcon>
                      <QuickActionText>스프레드시트 동기화</QuickActionText>
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

// 통계 테이블 관련 스타일
const StatsCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  overflow: hidden;
`;

const StatsCardHeader = styled.div`
  margin-bottom: 16px;
`;

const StatsCardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 8px 0;
`;

const StatsCardSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const StatsTableContainer = styled.div`
  overflow-x: auto;
  margin: 0 -16px;
`;

const StatisticsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const StatisticsTableHeader = styled.th<{ colorHeader?: boolean; sizeHeader?: boolean }>`
  background-color: ${props => props.sizeHeader ? '#6ba6ed' : '#4a90e2'};
  color: white;
  padding: ${props => props.colorHeader ? '14px 18px' : '12px 15px'};
  text-align: center;
  font-weight: 600;
  font-size: ${props => props.colorHeader ? '16px' : '14px'};
  &:first-child {
    text-align: left;
  }
  border: 1px solid #e2e8f0;
`;

const StatisticsTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  &:last-child {
    font-weight: bold;
    background-color: #e9ecef;
  }
`;

const StatisticsTableCell = styled.td<{ highlighted?: boolean }>`
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #ddd;
  border: 1px solid #e2e8f0;
  color: ${props => props.highlighted ? '#10b981' : '#1f2937'};
  font-weight: ${props => props.highlighted ? '700' : '400'};
  font-size: 15px;
  &:first-child {
    text-align: left;
  }
`;

const StatisticsSectionTitle = styled.h3`
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
`;

const StatisticsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${props => {
    switch (props.status) {
      case '미입금': return '#ef4444';
      case '입금확인중': return '#f97316';
      case '입금완료': return '#10b981';
      case '취소됨': return '#6b7280';
      case '합계': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
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