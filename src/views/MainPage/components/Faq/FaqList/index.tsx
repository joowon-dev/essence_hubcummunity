import { RULES } from "@src/lib/constants/rules";
import FaqSection from "../FaqSection";
import * as S from "./style";

function RulesList() {
  return (
    <S.Ul>
      {RULES.map((item) => {
        return (
          <FaqSection
            key={item.title}
            title={item.title}
            contents={item.contents}
          />
        );
      })}
      ;
    </S.Ul>
  );
}

export default RulesList;
