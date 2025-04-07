import * as S from "./style";
import { Box } from "./TopTitle";
import { Label } from "./Label";
import RulesList from "./FaqList";
import BottomContent from "./BottomContent";

interface BannerProps {}

export default function Schedule({}: BannerProps) {
  const onScrollMoveDown = () => {
    const element = document.getElementById("nextContainer");
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <S.Container>
        <S.ContentWrapper>
          <S.Content>
            <Box />
            <Label />
            <RulesList />
            <BottomContent />
          </S.Content>
        </S.ContentWrapper>
      </S.Container>
      <div id="nextContainer" />
    </>
  );
}
