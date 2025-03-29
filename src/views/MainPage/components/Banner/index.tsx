import * as S from "./style";

interface BannerProps {
  mainColor: string;
  highColor: string;
}
export default function Banner({ mainColor, highColor }: BannerProps) {
  const onScrollMoveDown = () => {
    const element = document.getElementById("nextContainer");
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <S.Container>
        <S.ContentWrapper>
          <S.Content>
            <S.ESSENCELOGO />
          </S.Content>
        </S.ContentWrapper>
        <S.BannerWrapper></S.BannerWrapper>
      </S.Container>
      <div id="nextContainer" />
    </>
  );
}
