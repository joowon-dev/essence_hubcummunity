import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { FaqItem, getAllFaqs, searchFaqs } from '@src/lib/api/faq';
import FaqSection from '@src/views/MainPage/components/Faq/FaqSection';
import Link from 'next/link';
import Head from 'next/head';
import PageLayout from '@src/components/common/PageLayout';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadFaqs() {
      try {
        const data = await getAllFaqs();
        setFaqs(data);
        setFilteredFaqs(data);
      } catch (error) {
        console.error("FAQ 로드 중 오류:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFaqs();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredFaqs(faqs);
      return;
    }

    try {
      setLoading(true);
      const results = await searchFaqs(searchQuery);
      setFilteredFaqs(results);
    } catch (error) {
      console.error("FAQ 검색 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (

    <PageLayout>
      <Head>
        <title>자주 묻는 질문 (FAQ) | 허브 커뮤니티</title>
        <meta name="description" content="허브 커뮤니티의 자주 묻는 질문들을 확인하세요." />
      </Head>

      <Container>
        <Header>

          <Title>자주 묻는 질문</Title>
        </Header>

        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>검색</SearchButton>
        </SearchContainer>

        <Content>
          {loading ? (
            <LoadingText>FAQ 불러오는 중...</LoadingText>
          ) : (
            <>
              {filteredFaqs.length > 0 ? (
                <FaqList>
                  {filteredFaqs.map((item) => (
                    <FaqSection
                      key={item.id}
                      tag={item.tag}
                      title={item.title}
                      contents={item.contents}
                    />
                  ))}
                </FaqList>
              ) : (
                <NoData>검색 결과가 없습니다. 다른 검색어로 시도해 보세요.</NoData>
              )}
            </>
          )}
        </Content>
      </Container>
      </PageLayout>

  );
}

const Container = styled.div`
  max-width: 100%;
  padding: 0;
  background-color: #fff;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  
  @media (min-width: 768px) {
    max-width: 375px;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.header`
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  background-color: #fff;
  position: relative;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 16px 0 0 0;
  text-align: center;
  letter-spacing: -0.48px;
  color: #000;
`;


const SearchContainer = styled.div`
  display: flex;
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
  outline: none;
  
  &:focus {
    border-color: #000;
  }
`;

const SearchButton = styled.button`
  padding: 10px 16px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background:rgb(56, 55, 55);
  }
`;

const Content = styled.main`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FaqList = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  list-style: none;
  gap: 12px;
  margin: 0 auto;
  padding: 0;
  
  li {
    width: 100%;
  }
`;

const LoadingText = styled.div`
  width: 100%;
  text-align: center;
  padding: 20px;
  color: #777;
  font-size: 16px;
`;

const NoData = styled.div`
  width: 100%;
  text-align: center;
  padding: 20px;
  color: #777;
  font-size: 16px;
`;
