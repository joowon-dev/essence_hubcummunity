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
      <S.Contents isOpened={isOpened}>ESSENCE</S.Contents>
    </S.Root>
  );
}

export default CollapseLi;
