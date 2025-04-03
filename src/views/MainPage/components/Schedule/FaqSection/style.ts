import styled from "@emotion/styled";

export const Root = styled.div<{ isClosed: boolean }>`
  border-bottom: 1px solid
    ${({ isClosed }) => (isClosed ? "#888888" : "#ffffff")};
  width: 80vw;
  padding-top: 20px;
  padding-bottom: 20px;
  }
  @media (max-width: 48rem) {
    
`;

export const Section = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  cursor: pointer;
  width: 100%;

  @media (max-width: 48rem) {
    padding-top: 20px;
  }
`;

export const Title = styled.h3<{ isClosed: boolean }>`
  color: ${({ isClosed }) => (isClosed ? "#888888" : "#ffffff")};
  font-family: "Wanted Sans", sans-serif;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.56px;
  line-height: normal;
  white-space: nowrap;
`;

export const Status = styled.span<{ isClosed: boolean }>`
  color: ${({ isClosed }) => (isClosed ? "#888888" : "#888888")};
  font-family: "Wanted Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.56px;
`;

export const Contents = styled.div<{ isClosed: boolean }>`
  color: ${({ isClosed }) => (isClosed ? "#888888" : "#ffffff")};
  font-family: "Wanted Sans", sans-serif;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: -0.56px;
`;
export const Icon = styled.svg`
  width: 16px;
  height: 16px;
  margin-right: 2px;
`;
export const Rectangle = styled.div<{
  isClosed: boolean;
  isLong: boolean;
}>`
  background-color: ${({ isClosed }) => (isClosed ? "#888888" : "#ED2725")};
  width: ${({ isLong }) => (isLong ? "92px" : "60px")};
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DateBadge = styled.span<{ isClosed: boolean }>`
  font-family: "Wanted Sans", sans-serif;
  color: ${({ isClosed }) => (isClosed ? "#000000" : "#ffffff")};
  font-weight: 700;
  letter-spacing: -0.56px;
  font-size: 16px;
  white-space: nowrap;
`;

export const DaySection = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
`;
