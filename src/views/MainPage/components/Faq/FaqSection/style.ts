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
  font-family: "Wanted Sans", sans-serif;
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
  line-height: 180%;
  letter-spacing: -0.03em;
  white-space: pre-line;
  color: black;
  font-size: 20rem;
  font-weight: 400;
  font-style: normal;
  @media (max-width: 48rem) {
    font-size: 14rem;
  }

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
