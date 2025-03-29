import * as S from "./style";
import { Box } from "./TopTitle";
import { Label } from "./Label";
import Task1 from "./Task1";
import Day2 from "./Day2";
import Day3 from "./Day3";

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
            <Task1 />
            <Day2 />
            <Day3 />
          </S.Content>
        </S.ContentWrapper>
      </S.Container>
      <div id="nextContainer" />
    </>
  );
}
