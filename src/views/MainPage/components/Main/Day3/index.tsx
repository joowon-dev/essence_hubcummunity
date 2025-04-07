import React, { useState } from "react";
import {
  Root,
  Section,
  TItle,
  Button,
  Contents,
  Essence,
  EssenceLast,
  Tag,
  EssenceTitle,
  EssenceContents,
  Speaker,
  Group,
  FirstWord,
  SecondWord,
} from "./style";

function CollapseLi() {
  const [isOpened, setIsOpened] = useState(false);

  const handleClick = () => {
    setIsOpened(!isOpened);
  };

  return (
    <Root>
      <Section onClick={handleClick}>
        <TItle>Day 3</TItle>
        <Button isOpened={isOpened} />
      </Section>
      <Contents isOpened={isOpened}>
        <Essence>
          <Tag>Essence 6</Tag>
          <EssenceTitle>
            <FirstWord>Sola </FirstWord>
            <SecondWord>Gratia</SecondWord>
          </EssenceTitle>
          <EssenceContents>
            <Speaker>최종현 목사</Speaker>
          </EssenceContents>
        </Essence>

        <EssenceLast>
          <Tag>Essence 7</Tag>
          <EssenceTitle>
            <FirstWord>Soli </FirstWord>
            <SecondWord>Deo Gloria</SecondWord>
          </EssenceTitle>
          <EssenceContents>
            <Speaker>최대흥 목사</Speaker>
            <Group>요셉 청년부</Group>
          </EssenceContents>
        </EssenceLast>
      </Contents>
    </Root>
  );
}

export default CollapseLi;
