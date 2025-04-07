import React from "react";
import {
  BoxWrapper,
  Group,
  Text,
  DateWrapper,
  DateText,
  GroupWrapper,
  Location,
  Date,
} from "./style";

export const Box = () => {
  return (
    <BoxWrapper>
      <Group>
        <DateWrapper>
          <Date />
          <DateText>2025.5.16-18</DateText>
        </DateWrapper>
        <GroupWrapper>
          <Location />
          <Text>소망수양관</Text>
        </GroupWrapper>
      </Group>
    </BoxWrapper>
  );
};
