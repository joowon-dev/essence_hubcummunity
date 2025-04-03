import styled from "@emotion/styled";
import { colors } from "@sopt-makers/colors";
import Image from "next/image";
import IcDownScroll from "@src/assets/icons/ic_downScroll.svg";

export const Container = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: calc((413 / 360) * 100vw); /* 기본 높이는 유지하되, 더 늘어날 수 있음 */
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

export const ButtonContainer = styled.section`
  width: calc((320 / 360) * 100vw);
  height: calc((52 / 360) * 100vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ED2725;
  background-repeat: no-repeat;
  background-size: contain;
  position: relative;

`;

export const ButtonContainer1 = styled.section`
  width: calc((320 / 360) * 100vw);
  height: calc((52 / 360) * 100vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  background-repeat: no-repeat;
  background-size: contain;
  position: relative;
  margin-bottom: 12px;
`;

export const Button = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  cursor: pointer;
`;

export const ButtonText = styled.span`
  color: white;
 color: #000000;
  font-family: "Wanted Sans", sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.56px;
  line-height: 37px;
`;


