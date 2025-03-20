import { useRouter } from 'next/router';
import { FC } from 'react';
import { ReactComponent as ArrowRight } from '@src/assets/icons/arrow_right_16x16.svg';
import Channels from '@src/components/Footer/Channels';
import * as St from './style';

const OriginFooter: FC = () => {
  const router = useRouter();

  const handleClick = () => {
    //router.push('/rules');
  };

  return (
    <St.Root>
      <St.ContentWrap>
        <div>
          <St.TitleButton onClick={handleClick}>
            <span>HUB 대학부</span>
            <ArrowRight />
          </St.TitleButton>
          <St.CopyrightText>
            HUB TECH
            <br />
            Copyrightⓒ2025.HUB. All rights reserved.
          </St.CopyrightText>
        </div>
        <St.ChannelsWrap>
          <St.ChannelTitleText>HUB 채널 바로가기</St.ChannelTitleText>
          <Channels isFooter={true} />
        </St.ChannelsWrap>
      </St.ContentWrap>
    </St.Root>
  );
};

export default OriginFooter;
