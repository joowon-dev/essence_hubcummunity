import { useState } from "react";
import * as S from "./style";
import DayButton from "../DayButton";

function CollapseLi() {
  const [isOpened, setIsOpened] = useState(false);

  const handleClick = () => {
    setIsOpened((prev) => !prev);
  };

  return (
    <S.Root>
      <S.Section onClick={handleClick}>
        <DayButton text={"4.13 - 27"} />
        <S.TItle>Day 1</S.TItle>
        <S.Button isOpened={isOpened} />
      </S.Section>
      <S.Contents isOpened={isOpened}>ESSENCE</S.Contents>
    </S.Root>
  );
}

export default CollapseLi;
