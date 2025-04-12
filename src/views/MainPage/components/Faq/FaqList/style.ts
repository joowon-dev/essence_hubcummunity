import styled from "@emotion/styled";

export const Ul = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  list-style: none;
  gap: 12px;
  margin: 0 auto;
  padding: 0;
  margin-top: 20px;
  font-family: var(--font-wanted);
  max-width: 800px;
  
  li {
    width: 100%;
    &:last-child {
      border: none;
    }
  }
  
  @media screen and (max-width: 80rem) {
  }
`;

export const LoadingText = styled.div`
  width: 100%;
  text-align: center;
  padding: 20px;
  color: #777;
  font-size: 16px;
`;

export const NoData = styled.div`
  width: 100%;
  text-align: center;
  padding: 20px;
  color: #777;
  font-size: 16px;
`;

export const ViewAllButton = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

export const ButtonText = styled.span`
  display: inline-block;
  padding: 10px 20px;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;
