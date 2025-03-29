import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import { useIsDesktop, useIsMobile, useIsTablet } from "@src/hooks/useDevice";
import DesktopHeader from "./Desktop";
import MobileHeader from "./Mobile";
import { imgLogoHub } from "@src/assets/mainLogo";
import { useRouter } from "next/router";
import * as S from "./style";

export function Header() {
  const pathname = usePathname();
  const isRootPath = pathname === "/";
  const isDesktop = useIsDesktop("58.75rem");
  const isTablet = useIsTablet("48rem", "58.6875rem");
  const isMobile = useIsMobile();
  const router = useRouter();

  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (!isRootPath) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const start = window.innerHeight * 0.53; // 변화 시작 시점
      const end = window.innerHeight * 0.59; // 완전 불투명해질 시점

      if (scrollY <= start) {
        setOpacity(0);
      } else if (scrollY >= end) {
        setOpacity(1);
      } else {
        const ratio = (scrollY - start) / (end - start);
        setOpacity(ratio);
      }
    };

    handleScroll(); // 초기값 반영
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isRootPath]);

  return (
    <S.Wrapper opacity={isRootPath ? opacity : 1}>
      <Logo
        onClick={() => router.push("/")}
        opacity={isRootPath ? opacity : 1}
      />

      {/* {isDesktop && <DesktopHeader />}
      {(isTablet || isMobile) && <MobileHeader />} */}
      <MobileHeader />
    </S.Wrapper>
  );
}
export const Logo = styled.button<{ opacity: number }>`
  width: 112px;
  height: 20px;
  margin-left: 20px;
  background: url(${imgLogoHub.src}) center no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  opacity: ${({ opacity }) => opacity};
  transition: opacity 0.3s ease;
`;
