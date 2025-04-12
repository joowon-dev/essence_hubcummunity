import { useEffect, useState } from "react";
import { FaqItem, getMainPageFaqs } from "@src/lib/api/faq";
import FaqSection from "../FaqSection";
import * as S from "./style";
import Link from "next/link";

function RulesList() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const data = await getMainPageFaqs();
        setFaqs(data);
      } catch (error) {
        console.error("FAQ 로드 중 오류:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFaqs();
  }, []);

  if (loading) {
    return <S.LoadingText>FAQ 불러오는 중...</S.LoadingText>;
  }

  return (
    <>
      <S.Ul>
        {faqs.length > 0 ? (
          faqs.map((item) => (
            <FaqSection
              key={item.id}
              tag={item.tag}
              title={item.title}
              contents={item.contents}
            />
          ))
        ) : (
          <S.NoData>FAQ 정보가 없습니다.</S.NoData>
        )}
      </S.Ul>
      <S.ViewAllButton>
        <Link href="/FAQ">
          <S.ButtonText>전체보기</S.ButtonText>
        </Link>
      </S.ViewAllButton>
    </>
  );
}

export default RulesList;
