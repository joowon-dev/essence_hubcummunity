import React from "react";
import * as S from "./style";
function RecruitButton() {
  return (
    <S.Box>
      <S.Group>
        <S.OverlapGroup>
          <S.Rectangle />
          <S.Text>신청하기</S.Text>
        </S.OverlapGroup>
      </S.Group>
    </S.Box>
  );
}
export default RecruitButton;
