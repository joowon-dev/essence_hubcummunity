import styled from "@emotion/styled";

export const Container = styled.section`
  width: 100%;
  height: calc((228 / 360) * 100vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('/images/Tshirts_Banner.png');
  background-position: center;
  background-color: #ED2725;
  background-repeat: no-repeat;
  background-size: contain;
  position: relative;

`;


export const ButtonContainer = styled.section`
  width: 100%;
  height: calc((52 / 360) * 100vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  background-repeat: no-repeat;
  background-size: contain;
  position: relative;

`;

export const Button = styled.button`
  width: 100%;
  height: 100%;
  background-color: #000000;
  border: none;
  cursor: pointer;
`;

export const ButtonText = styled.span`
  color: white;
 color: #FFFFFF;
  font-family: "Wanted Sans", sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.56px;
  line-height: 37px;
`;

