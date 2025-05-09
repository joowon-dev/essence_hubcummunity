import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { supabase } from '@src/lib/supabase';
import { useAuthStore, initializeAuthState } from '@src/store/auth';
import PageLayout from '@src/components/common/PageLayout';
import Head from 'next/head';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 상태에 따른 색상을 반환하는 헬퍼 함수
const getStatusColorValue = (status: string) => {
  switch (status) {
    case 'found': return '#10B981';
    case 'returned': return '#6B7280';
    default: return '#3B82F6';
  }
};

interface LostItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  location: string;
  found_date: string;
  status: string;
  contact_info: string;
  created_at: string;
}

export default function LostItemsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'found' | 'returned'>('all');

  useEffect(() => {
    // 인증 상태 확인
    if (typeof window !== 'undefined') {
      const isAuth = initializeAuthState();
      if (!isAuth && !useAuthStore.getState().isAuthenticated) {
        localStorage.setItem('login_redirect', '/lost-items');
        router.replace('/login');
        return;
      }
    }

    const fetchLostItems = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('lost_items')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setLostItems(data);
        }
      } catch (error) {
        console.error('분실물 로딩 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLostItems();
  }, [router]);

  const handleItemClick = (item: LostItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy년 M월 d일', { locale: ko });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'found': return '보관중';
      case 'returned': return '찾아감';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    return getStatusColorValue(status);
  };

  // 필터링된 분실물 목록
  const filteredItems = filter === 'all' 
    ? lostItems 
    : lostItems.filter(item => item.status === filter);

  return (
    <PageLayout>
      <Head>
        <title>분실물 | 허브 커뮤니티</title>
      </Head>
      
      <Container>
        <Title>분실물</Title>
        <Subtitle>찾아가세요! 소망수양관에서 발견된 분실물 목록입니다.</Subtitle>
        
        <FilterContainer>
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            전체
          </FilterButton>
          <FilterButton 
            active={filter === 'found'} 
            onClick={() => setFilter('found')}
          >
            보관중
          </FilterButton>
          <FilterButton 
            active={filter === 'returned'} 
            onClick={() => setFilter('returned')}
          >
            찾아감
          </FilterButton>
        </FilterContainer>
        
        {loading ? (
          <LoadingWrapper>로딩 중...</LoadingWrapper>
        ) : filteredItems.length > 0 ? (
          <ItemsGrid>
            {filteredItems.map(item => (
              <ItemCard key={item.id} onClick={() => handleItemClick(item)}>
                <ItemImageContainer>
                  <ItemImage src={item.image_url || '/images/placeholder.png'} alt={item.title} />
                  <ItemStatus status={item.status}>
                    {getStatusText(item.status)}
                  </ItemStatus>
                </ItemImageContainer>
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemLocation>{item.location}</ItemLocation>
                  <ItemDate>{formatDate(item.found_date)}</ItemDate>
                </ItemContent>
              </ItemCard>
            ))}
          </ItemsGrid>
        ) : (
          <NoItemsMessage>
            {filter === 'all' 
              ? '등록된 분실물이 없습니다.' 
              : filter === 'found' 
                ? '현재 보관 중인 분실물이 없습니다.' 
                : '찾아간 분실물이 없습니다.'}
          </NoItemsMessage>
        )}
        
        <BackButton onClick={() => router.back()}>
          돌아가기
        </BackButton>
      </Container>
      
      {/* 분실물 상세 모달 */}
      {showModal && selectedItem && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalCloseButton onClick={closeModal}>×</ModalCloseButton>
            
            <ModalImageContainer>
              <ModalImage 
                src={selectedItem.image_url || '/images/placeholder.png'} 
                alt={selectedItem.title} 
              />
              <ModalStatus status={selectedItem.status}>
                {getStatusText(selectedItem.status)}
              </ModalStatus>
            </ModalImageContainer>
            
            <ModalTitle>{selectedItem.title}</ModalTitle>
            
            <ModalDetails>
              <ModalDetailRow>
                <ModalDetailLabel>발견 장소</ModalDetailLabel>
                <ModalDetailValue>{selectedItem.location}</ModalDetailValue>
              </ModalDetailRow>
              
              <ModalDetailRow>
                <ModalDetailLabel>발견 일자</ModalDetailLabel>
                <ModalDetailValue>{formatDate(selectedItem.found_date)}</ModalDetailValue>
              </ModalDetailRow>
              
              {selectedItem.description && (
                <ModalDescription>
                  <ModalDetailLabel>상세 설명</ModalDetailLabel>
                  <ModalDescriptionText>{selectedItem.description}</ModalDescriptionText>
                </ModalDescription>
              )}
              
              {selectedItem.contact_info && selectedItem.status === 'found' && (
                <ModalContactInfo>
                  <ModalContactLabel>문의 정보</ModalContactLabel>
                  <ModalContactValue>{selectedItem.contact_info}</ModalContactValue>
                </ModalContactInfo>
              )}
            </ModalDetails>
            
            <ModalFooter>
              {selectedItem.status === 'found' ? (
                <ModalFooterText>
                  본인의 물건이라면 위 연락처로 문의해주세요.
                </ModalFooterText>
              ) : (
                <ModalFooterText>
                  이미 주인을 찾은 물건입니다.
                </ModalFooterText>
              )}
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageLayout>
  );
}

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 88px; /* 헤더 높이만큼 상단 패딩 추가 */
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 24px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'white' : '#1f2937'};
  background-color: ${props => props.active ? '#3b82f6' : '#f3f4f6'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#2563eb' : '#e5e7eb'};
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #6b7280;
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ItemCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ItemImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 비율 */
  overflow: hidden;
`;

const ItemImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ItemStatus = styled.div<{ status: string }>`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${props => getStatusColorValue(props.status)};
`;

const ItemContent = styled.div`
  padding: 12px;
`;

const ItemTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemLocation = styled.div`
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemDate = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const NoItemsMessage = styled.div`
  text-align: center;
  padding: 32px;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

// 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  color: #4b5563;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    background-color: rgba(255, 255, 255, 1);
    color: #1f2937;
  }
`;

const ModalImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 비율 */
`;

const ModalImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ModalStatus = styled.div<{ status: string }>`
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: ${props => getStatusColorValue(props.status)};
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  padding: 16px 16px 8px;
`;

const ModalDetails = styled.div`
  padding: 0 16px 16px;
`;

const ModalDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
`;

const ModalDetailLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const ModalDetailValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  text-align: right;
`;

const ModalDescription = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
`;

const ModalDescriptionText = styled.div`
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin-top: 8px;
  white-space: pre-wrap;
`;

const ModalContactInfo = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
`;

const ModalContactLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const ModalContactValue = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #3b82f6;
`;

const ModalFooter = styled.div`
  padding: 16px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
`;

const ModalFooterText = styled.div`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`; 