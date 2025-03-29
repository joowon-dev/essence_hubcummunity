import styled from "@emotion/styled";
import { colors } from "@sopt-makers/colors";
import Image from "next/image";
import IcDownScroll from "@src/assets/icons/ic_downScroll.svg";
import ESSENCE from "@src/assets/icons/ESSENCE.svg";
export const Container = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 66vh;
  align-items: center;
  background-color: #ff5e36;
`;

export const BannerWrapper = styled.main`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

export const BannerImage = styled(Image)`
  object-fit: cover;
`;

export const Content = styled.main`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;

export const ContentWrapper = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  height: 66vh;
  position: absolute;

  padding-bottom: 20vh;
  justify-content: flex-end;

  @media (max-width: 90rem) {
    padding-bottom: 6vh;
  }

  @media (max-width: 48rem) {
    padding-bottom: 6vh;
  }
`;

export const ESSENCELOGO = styled(ESSENCE)`
  height: 80vh;
  position: absolute;
  width: 80vw;
`;
