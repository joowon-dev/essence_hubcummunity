import styled from "@emotion/styled";
import { colors } from "@sopt-makers/colors";
import Image from "next/image";
import IcDownScroll from "@src/assets/icons/ic_downScroll.svg";

export const Container = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 66vh; /* 기본 높이는 유지하되, 더 늘어날 수 있음 */
  transition: height 0.3s ease;
  align-items: center;
  background-color: #000000;
`;

export const Content = styled.main`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const ContentWrapper = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  position: relative;
  z-index: 2;
  padding-bottom: 5px;
  padding-top: 50px;
  // justify-content: center;

  @media (max-width: 90rem) {
  }

  @media (max-width: 48rem) {
  }
`;
