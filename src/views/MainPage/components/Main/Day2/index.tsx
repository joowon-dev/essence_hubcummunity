import { useState } from "react";
import * as S from "./style";

function CollapseLi() {
  const [isOpened, setIsOpened] = useState(false);

  const handleClick = () => {
    setIsOpened((prev) => !prev);
  };

  return (
    <S.Root>
      <S.Section onClick={handleClick}>
        <S.TItle>Day 2</S.TItle>
        <S.Button isOpened={isOpened} />
      </S.Section>
      <S.Contents isOpened={isOpened}>
      <S.Essence>
          <S.Tag>Essence 2</S.Tag>
          <S.EssenceTitle>
            <S.FirstWord>Solus</S.FirstWord>{" "}
            <S.SecondWord>Christus</S.SecondWord>
          </S.EssenceTitle>
          <S.EssenceContents>
            <S.Speaker>최성민 목사</S.Speaker>
            <S.Group>SNS 청년부</S.Group>
          </S.EssenceContents>
        </S.Essence>
        <S.Essence>
          <S.Tag>Essence 3</S.Tag>
          <S.EssenceTitle>
            <S.FirstWord>Solus</S.FirstWord>{" "}
            <S.SecondWord>Christus</S.SecondWord>
          </S.EssenceTitle>
          <S.EssenceContents>
            <S.Speaker>최성민 목사</S.Speaker>
            <S.Group>SNS 청년부</S.Group>
          </S.EssenceContents>
        </S.Essence>
        <S.EssenceLast>
          <S.Tag>Essence 4</S.Tag>
          <S.EssenceTitle>
            <S.FirstWord>멘토토크쇼 : 소제목</S.FirstWord>{" "}
            <S.SecondWord></S.SecondWord>
          </S.EssenceTitle>
          <S.EssenceContents>
            <S.Speaker>최성민 목사</S.Speaker>
            <S.Group>SNS 청년부</S.Group>
          </S.EssenceContents>
        </S.EssenceLast>
      </S.Contents>
    </S.Root>
  );
}

export default CollapseLi;
