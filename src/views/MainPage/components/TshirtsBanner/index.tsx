import * as S from "./style";
import { useRouter } from "next/router";
import { useState } from "react";

export default function TshirtsBanner() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleTshirtOrder = async () => {
    setIsLoading(true);
    
    // 잠시 로딩 시간을 주기 위해 setTimeout 사용
    setTimeout(() => {
      router.push("/tshirt");
    }, 800);
  };

  return (
    <>
      <S.Container />
      <S.ButtonContainer>
        <S.Button onClick={handleTshirtOrder} disabled={isLoading}>
          <S.ButtonText>
          {isLoading ? "이동중..." : "티셔츠 구매하기 →"}
          </S.ButtonText>
        </S.Button>
      </S.ButtonContainer>
      
      {isLoading && (
        <S.LoadingOverlay>
          <S.LoadingSpinner />
          <S.LoadingText>페이지 이동 중...</S.LoadingText>
        </S.LoadingOverlay>
      )}
    </>
  );
}
