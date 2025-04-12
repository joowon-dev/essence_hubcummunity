import styled from "@emotion/styled";

export const Container = styled.section`
  width: 100%;
  height: calc((520 / 360) * 100vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('/images/essence-banner.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  position: relative;

  @media (min-width: 58.75rem) {
    height: 830px;
    width: 100%;
    max-width: 600px;
    background-size: cover;
  }
`;

