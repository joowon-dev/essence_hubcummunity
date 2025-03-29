import { useState } from "react";
import * as S from "./style";

interface FaqSectionProps {
  // tag: string;
  title: string;
  contents: string;
}

function FaqSection({ title, contents }: FaqSectionProps) {
  const [isOpened, setIsOpened] = useState(false);

  const handleClick = () => {
    setIsOpened((prev) => !prev);
  };

  return (
    <S.Root>
      <S.Section onClick={handleClick}>
        {/* <S.Tag>{tag}</S.Tag> */}
        <S.TItle>{title}</S.TItle>
        <S.Button isOpened={isOpened} />
      </S.Section>
      <S.Contents isOpened={isOpened}>{contents}</S.Contents>
    </S.Root>
  );
}

export default FaqSection;
