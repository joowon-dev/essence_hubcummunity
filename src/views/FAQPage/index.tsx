import styled from '@emotion/styled';
import PageLayout from '@src/components/common/PageLayout';
import { useIsDesktop } from '@src/hooks/useDevice';
import { RulesHead, RulesList, UnderlinedText } from './components';

const FAQ_TITLE = 'FAQ';

function FAQ() {
  const isDesktopOrTablet = useIsDesktop('48.0625rem');

  return (
    <PageLayout>
      <Root>
        <RulesHead />
        <Content>
          <UnderlinedText fontSize={isDesktopOrTablet ? '25px' : '35px'}>
            {FAQ_TITLE}
          </UnderlinedText>
          <RulesList />
        </Content>
      </Root>
    </PageLayout>
  );
}

const Content = styled.div`
  margin-top: 140px;
  margin-bottom: 130px;
  width: 100%;
  max-width: 1192px;
  @media screen and (max-width: 80rem) {
    width: 92%;
  }
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
`;

export default FAQ;
