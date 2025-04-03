import { useState } from "react";
import * as S from "./style";

interface FaqSectionProps {
  tag: string;
  title: string;
  contents: string;
}

function FaqSection({ tag, title, contents }: FaqSectionProps) {
  const [isOpened, setIsOpened] = useState(false);

  const handleClick = () => {
    setIsOpened((prev) => !prev);
  };

  return (
    <S.Root>
       <S.Tag>{tag}</S.Tag>
      <S.Section onClick={handleClick}>
        <S.Title>{title}</S.Title>
        <S.Button isOpened={isOpened} />
      </S.Section>
      <S.Contents isOpened={isOpened}>{contents}</S.Contents>
    </S.Root>
  );
}

export default FaqSection;
