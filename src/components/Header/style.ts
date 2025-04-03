import styled from "@emotion/styled";

export const Wrapper = styled.header<{ opacity: number }>`
  width: 100%;
  min-height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 100;
  top: 0;
  padding: 0 20px;

  background-color: rgba(255, 255, 255, ${({ opacity }) => opacity});
  backdrop-filter: blur(${({ opacity }) => opacity * 5}px);
  transition: background-color 0.2s ease, backdrop-filter 0.2s ease;

  @media (max-width: 58.75rem) and (min-width: 48rem) {
    height: 60px;
    padding: 0;
  }

  @media (max-width: 47.9375rem) {
    height: 60px;
    min-height: 60px;
    padding: 0;
    justify-content: space-between;
  }
`;
