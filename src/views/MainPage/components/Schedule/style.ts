import styled from "@emotion/styled";
import { colors } from "@sopt-makers/colors";
import Image from "next/image";
import IcDownScroll from "@src/assets/icons/ic_downScroll.svg";

export const Container = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 66vh;
  transition: height 0.3s ease;
  align-items: center;
  background-color: #000000;
  font-family: var(--font-wanted);
`;

export const Content = styled.main`
  display: flex;
  align-items: center;
  flex-direction: column;
  font-family: var(--font-wanted);
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
  font-family: var(--font-wanted);

  @media (max-width: 90rem) {
  }

  @media (max-width: 48rem) {
  }
`;

export const DayButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
  font-family: var(--font-wanted);
`;
