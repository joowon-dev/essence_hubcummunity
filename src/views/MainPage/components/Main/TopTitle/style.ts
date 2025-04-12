import styled from "@emotion/styled";
import DateIcon from "@src/assets/icons/ic_date.svg";
import LocationIcon from "@src/assets/icons/ic_location.svg";

export const BoxWrapper = styled.div`
  position: relative;
  width: 211px;
  height: 37px;
  
  @media (min-width: 58.75rem) {
    width: 100%;
    max-width: 300px;
  }
`;

export const Group = styled.div`
  width: 211px;
  height: 37px;
  display: flex;
  align-items: center;
  
  @media (min-width: 58.75rem) {
    width: 100%;
    max-width: 300px;
  }
`;

export const DateWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const DateText = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  line-height: 37px;
`;

export const Date = styled(DateIcon)`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

export const GroupWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 4px;
`;

export const Location = styled(LocationIcon)`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

export const Text = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  line-height: 37px;
`;
