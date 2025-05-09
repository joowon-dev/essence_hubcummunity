import { PropsWithChildren, useState } from "react";
import * as S from "./style";

interface BannerColor {
  mainColor: string;
  highColor: string;
}
export default function RecruitButton({
  children,
}: PropsWithChildren<BannerColor>) {
  const [blurPosition, setBlurPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setBlurPosition({ x, y });
  };

  return (
    <S.RecruitButtonWrapper href="/">
      <S.MouseTrackerWrapper
        onMouseMove={handleMouseMove}
        x={blurPosition.x}
        y={blurPosition.y}
      >
        <div>{children}</div>
      </S.MouseTrackerWrapper>
    </S.RecruitButtonWrapper>
  );
}
