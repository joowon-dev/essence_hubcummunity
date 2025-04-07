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
  padding-bottom: 14px;
  padding-top: 14px;
  @media (max-width: 48rem) {
    
  }
`;
export const Section = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
  padding-top: 6px;
  @media (max-width: 48rem) {
  }
`;
export const Tag = styled.span`
  color: #838383;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-wanted);
  letter-spacing: -0.24px;
`;

export const Title = styled.h3`
  color: #000000;
  font-family: var(--font-wanted);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.36px;
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

  white-space: pre-line;
  color: black;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.28px;
  line-height: 21px;


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
