import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { supabase } from '@src/lib/supabase';
import { useAuthStore, initializeAuthState } from '@src/store/auth';
import PageLayout from '@src/components/common/PageLayout';
import Head from 'next/head';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_important: boolean;
  attachment_url?: string;
  admin_name: string;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    // 인증 상태 확인
    if (typeof window !== 'undefined') {
      const isAuth = initializeAuthState();
      if (!isAuth && !useAuthStore.getState().isAuthenticated) {
        localStorage.setItem('login_redirect', '/announcements');
        router.replace('/login');
        return;
      }
    }

    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('is_important', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('공지사항 로딩 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [router]);

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncement(true);
  };

  const handleBack = () => {
    setShowAnnouncement(false);
    setSelectedAnnouncement(null);
  };

  // 날짜 형식 변환
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}. ${month}. ${day}`;
  };

  return (
    <PageLayout>
      <Head>
        <title>공지사항 | 허브 커뮤니티</title>
      </Head>
      
      <Container>
        {showAnnouncement && selectedAnnouncement ? (
          // 공지사항 상세 화면
          <AnnouncementDetail>
            <BackButtonSmall onClick={handleBack}>
              &lt; 돌아가기
            </BackButtonSmall>
            
            <DetailHeader>
              {selectedAnnouncement.is_important && (
                <ImportantBadge>중요</ImportantBadge>
              )}
              <DetailTitle>{selectedAnnouncement.title}</DetailTitle>
              <DetailMeta>
                <MetaItem>{selectedAnnouncement.admin_name}</MetaItem>
                <MetaDivider>|</MetaDivider>
                <MetaItem>{formatDate(selectedAnnouncement.created_at)}</MetaItem>
              </DetailMeta>
            </DetailHeader>
            
            <DetailContent dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }} />
            
            {selectedAnnouncement.attachment_url && (
              <AttachmentSection>
                <AttachmentTitle>첨부파일</AttachmentTitle>
                <AttachmentLink href={selectedAnnouncement.attachment_url} target="_blank" rel="noopener noreferrer">
                  <DownloadIcon>📎</DownloadIcon>
                  첨부파일 다운로드
                </AttachmentLink>
              </AttachmentSection>
            )}
          </AnnouncementDetail>
        ) : (
          // 공지사항 목록 화면
          <>
            <Title>공지사항</Title>
            <Subtitle>허브 커뮤니티의 공지사항 및 안내를 확인하세요.</Subtitle>
            
            {loading ? (
              <LoadingWrapper>로딩 중...</LoadingWrapper>
            ) : announcements.length > 0 ? (
              <AnnouncementList>
                {announcements.map(announcement => (
                  <AnnouncementItem 
                    key={announcement.id} 
                    important={announcement.is_important}
                    onClick={() => handleAnnouncementClick(announcement)}
                  >
                    <AnnouncementHeader>
                      {announcement.is_important && (
                        <ImportantBadge>중요</ImportantBadge>
                      )}
                      <AnnouncementTitle>{announcement.title}</AnnouncementTitle>
                    </AnnouncementHeader>
                    
                    <AnnouncementMeta>
                      <MetaItem>{announcement.admin_name}</MetaItem>
                      <MetaDivider>|</MetaDivider>
                      <MetaItem>{formatDate(announcement.created_at)}</MetaItem>
                    </AnnouncementMeta>
                  </AnnouncementItem>
                ))}
              </AnnouncementList>
            ) : (
              <NoAnnouncementsMessage>
                등록된 공지사항이 없습니다.
              </NoAnnouncementsMessage>
            )}
            
            <BackButton onClick={() => router.back()}>
              돌아가기
            </BackButton>
          </>
        )}
      </Container>
    </PageLayout>
  );
}

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding: 20px;
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

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #6b7280;
`;

const AnnouncementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const AnnouncementItem = styled.div<{ important: boolean }>`
  background-color: ${props => props.important ? '#f0f9ff' : 'white'};
  border: 1px solid ${props => props.important ? '#bae6fd' : '#e5e7eb'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const AnnouncementHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const ImportantBadge = styled.span`
  background-color: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
`;

const AnnouncementTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const AnnouncementMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #6b7280;
`;

const MetaItem = styled.span``;

const MetaDivider = styled.span`
  margin: 0 8px;
`;

const NoAnnouncementsMessage = styled.div`
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

// 공지사항 상세 화면 스타일
const AnnouncementDetail = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
`;

const BackButtonSmall = styled.button`
  background-color: transparent;
  border: none;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    color: #1f2937;
  }
`;

const DetailHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const DetailTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 8px 0;
`;

const DetailMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
`;

const DetailContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #1f2937;
  margin-bottom: 24px;
  
  p {
    margin-bottom: 16px;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
  }
  
  ul, ol {
    margin-left: 20px;
    margin-bottom: 16px;
  }
  
  li {
    margin-bottom: 8px;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 16px 0;
  }
  
  a {
    color: #3b82f6;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 16px;
    color: #6b7280;
    font-style: italic;
    margin: 16px 0;
  }
  
  code {
    background-color: #f3f4f6;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
  }
  
  pre {
    background-color: #f3f4f6;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
`;

const AttachmentSection = styled.div`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const AttachmentTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 12px;
`;

const AttachmentLink = styled.a`
  display: inline-flex;
  align-items: center;
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DownloadIcon = styled.span`
  margin-right: 8px;
`; 