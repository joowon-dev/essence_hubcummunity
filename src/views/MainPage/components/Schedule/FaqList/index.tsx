import { SCHEDULE } from "@src/lib/constants/schedule";
import FaqSection from "../FaqSection";
import * as S from "./style";

function RulesList() {
  return (
    <S.Ul>
      {SCHEDULE.map((item) => {
        return (
          <FaqSection
            key={item.title}
            title={item.title}
            endTime={item.endTime}
            day={item.day}
          />
        );
      })}
      ;
    </S.Ul>
  );
}

export default RulesList;
