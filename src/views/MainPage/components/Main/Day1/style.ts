import styled from "@emotion/styled";
import { colors } from "@sopt-makers/colors";
import { css } from "@emotion/react";
import {
  ArrowDownAnimation,
  ArrowUpAnimation,
} from "@src/lib/styles/animation";

interface ButtonStyleProps {
  isOpened: boolean;
}

export const Root = styled.div`
  border-bottom: 1px solid #000000;
  width: 80vw;
  @media (max-width: 48rem) {
    padding-bottom: 20px;
  }
`;
export const Section = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
  @media (max-width: 48rem) {
    padding-top: 20px;
  }
`;

export const TItle = styled.h3`
  color: #000000;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.56px;
  line-height: normal;
  white-space: nowrap;
`;

export const Button = styled.button<ButtonStyleProps>`
  outline: inherit;
  background: no-repeat url("/plus.svg");
  cursor: pointer;
  width: 16px;
  height: 16px;

  /* stylelint-disable */
  @media (max-width: 48rem) {
    width: 16px;
    height: 16px;
  }
  ${ArrowDownAnimation}
  ${ArrowUpAnimation}
  
  animation: ${({ isOpened }) =>
    isOpened ? "ArrowUp 0.3s forwards" : "ArrowDown 0.3s forwards"};
  -moz-animation: ${({ isOpened }) =>
    isOpened ? "ArrowUp 0.3s forwards" : "ArrowDown 0.3s forwards"};
  -webkit-animation: ${({ isOpened }) =>
    isOpened ? "ArrowUp 0.3s forwards" : "ArrowDown 0.3s forwards"};
  -o-animation: ${({ isOpened }) =>
    isOpened ? "ArrowUp 0.3s forwards" : "ArrowDown 0.3s forwards"};
  color: inherit;
`;

export const Contents = styled.div<ButtonStyleProps>`
  overflow: hidden;
  

  ${({ isOpened }) =>
    isOpened
      ? css`
          transition: max-height 0.2s ease-in;
          max-height: 3500px;
          @media screen and (max-width: 80rem) {
            max-height: 5000px;
          }
        `
      : css`
          transition: max-height 0.15s ease-out;
          max-height: 0;
        `}
`;
export const Essence = styled.div`
  width: 80vw;
  margin-top: 20px;
  @media (max-width: 48rem) {
  }
`;

export const Tag = styled.span`
  color: #000000;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.32px;
`;

export const EssenceTitle = styled.h3`
  color: #000000;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.56px;
  line-height: normal;
  white-space: nowrap;
  margin-top: 4px;
  margin-bottom: 7px;
`;

export const EssenceContents = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  letter-spacing: -0.24px;
  font-size: 12px;
  font-weight: 600;
  font-style: normal;
`;

export const Speaker = styled.span`
  color: #000000;
`;

export const Group = styled.span`
  color: #A1A1A1;
`;

export const FirstWord = styled.span`
  color: #000000;
`;

export const SecondWord = styled.span`
  color: #ED2725;
`;
