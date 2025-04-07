import styled from "@emotion/styled";

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding-top: 87px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #FFFFFF;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 22px;
  white-space: pre-line;
  line-height: 37px;
  letter-spacing: -0.56px;
  color: #000000;
`;

export const Form = styled.form`
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
`;

export const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #D7D7D7;
  border-radius: 4px;
  font-size: 16px;
  font-family: var(--font-wanted);
  font-weight: 600;
  color: #000000;

  &::placeholder {
    color: #A1A1A1;
  }

  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

export const LoginProblem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #FFF5F5;
  border-radius: 4px;
  margin-top: 8px;
`;

export const InfoIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #FFE3E3;
  color: #FF6B6B;
  font-size: 12px;
`;

export const LoginProblemText = styled.span`
  font-size: 14px;
  color: #FF6B6B;
  line-height: 1.5;
`;

export const LoginButton = styled.button`
  width: 100%;
  height: 48px;
  background-color: #000000;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin-top: 24px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #333333;
  }
`;

export const ErrorMessage = styled.div`
  color: #FF0000;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
`;

export const HelpContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  width: 100%;
`;

export const HelpLink = styled.a`
  display: flex;
  align-items: center;
  color: #000000;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border-bottom: 1px solid #000000;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
  
  svg {
    margin-right: 6px;
  }
`; 