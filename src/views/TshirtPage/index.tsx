import { useEffect, useState } from 'react';
import { supabase } from '@src/lib/supabase';
import * as S from './style';
import PageLayout from '@src/components/common/PageLayout';
import OrderSheet from './components/OrderSheet';
import ImageSlider from './components/ImageSlider';

interface TshirtData {
  id: number;
  name: string;
  description: string;
  deadline: string;
}

interface TshirtOption {
  id: number;
  size: string;
  color: string;
  stock: number;
  price: number;
}

interface DeadlineInfo {
  display: string;
  rawDate: string;
}

interface PriceInfo {
  basePrice: number;
  bulkDiscountAmount: number;
  bulkDiscountMinQuantity: number;
  specialSizePrice: {
    size: string;
    price: number;
  }[];
}

export default function TshirtPage() {
  const [tshirt, setTshirt] = useState<TshirtData | null>(null);
  const [options, setOptions] = useState<TshirtOption[]>([]);
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null);

  const priceInfo: PriceInfo = {
    basePrice: 10000,
    bulkDiscountAmount: 1000,
    bulkDiscountMinQuantity: 2,
    specialSizePrice: [
      { size: '3XL', price: 11000 }
    ]
  };

  // YYYYMMDD 형식의 문자열을 Date 객체로 변환하는 함수
  const parseDateFromString = (dateString: string) => {
    if (dateString.length !== 8) return null;
    
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // 월은 0-11로 표현
    const day = parseInt(dateString.substring(6, 8));
    
    return new Date(year, month, day);
  };

  // 남은 날짜 계산 및 표시 형식 생성 함수
  const formatDeadline = (dateString: string, dayInfo?: string): DeadlineInfo => {
    const deadlineDate = parseDateFromString(dateString);
    
    if (!deadlineDate) {
      return {
        display: dateString,
        rawDate: dateString
      };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 괄호 안에 표시할 날짜 정보. 우선 day 값을 사용하고, 없으면 날짜 형식 사용
    const displayDate = dayInfo || `${deadlineDate.getFullYear()}년 ${(deadlineDate.getMonth() + 1).toString().padStart(2, '0')}월 ${deadlineDate.getDate().toString().padStart(2, '0')}일`;
    
    let displayText = '';
    if (diffDays < 0) {
      displayText = `예약 마감됨 (${displayDate})`;
    } else if (diffDays === 0) {
      displayText = `오늘 마감! (${displayDate})`;
    } else {
      displayText = `예약 종료 ${diffDays}일 남음 (${displayDate})`;
    }
    
    return {
      display: displayText,
      rawDate: dateString
    };
  };

  useEffect(() => {
    async function fetchTshirtData() {
      try {
        const { data: tshirtData, error: tshirtError } = await supabase
          .from('tshirts')
          .select('*')
          .single();

        if (tshirtError) throw tshirtError;
        setTshirt(tshirtData);

        // 스케줄에서 티셔츠 예약 마감일 가져오기
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedules')
          .select('title, day, end_time')
          .eq('title', '티셔츠 예약 마감')
          .single();
        
        if (!scheduleError && scheduleData) {
          // end_time으로 남은 날짜 계산하고, day 값을 괄호 안에 표시
          setDeadlineInfo(formatDeadline(scheduleData.end_time, scheduleData.day));
        } else {
          setDeadlineInfo(formatDeadline(tshirtData.deadline));
        }

        const { data: optionsData, error: optionsError } = await supabase
          .from('tshirt_options')
          .select('*')
          .eq('tshirt_id', tshirtData.id);

        if (optionsError) throw optionsError;
        
        // 옵션별 가격 설정
        const optionsWithPrice = optionsData.map(option => ({
          ...option,
          price: option.size === '3XL' ? priceInfo.specialSizePrice[0].price : priceInfo.basePrice
        }));
        
        setOptions(optionsWithPrice);
      } catch (error) {
        console.error('Error fetching tshirt data:', error);
      }
    }

    fetchTshirtData();
  }, []);

  const handleOrder = () => {
    setIsOrderSheetOpen(true);
  };

  if (!tshirt) return <div>로딩 중...</div>;

  return (
    <PageLayout>
      <S.Container>
        <S.Content>
          <ImageSlider />

          <S.InfoSection>
            <S.ProductTitle>{tshirt.name}</S.ProductTitle>
            <S.Deadline>{deadlineInfo?.display || tshirt.deadline}</S.Deadline>
            <S.Price>{priceInfo.basePrice.toLocaleString()}원~</S.Price>
            <S.Notice>
              ⭐️ 2장 이상 구매시 장당 {priceInfo.bulkDiscountAmount.toLocaleString()}원 할인<br/>
              ⭐️ 3XL 사이즈는 {priceInfo.specialSizePrice[0].price.toLocaleString()}원
            </S.Notice>

            <S.SizeGuide>
              <S.SizeGuideTitle>사이즈 가이드</S.SizeGuideTitle>
              <S.Table>
                <thead>
                  <tr>
                    <th></th>
                    <th>S<br/>(85)</th>
                    <th>M<br/>(90)</th>
                    <th>L<br/>(95)</th>
                    <th>XL<br/>(100)</th>
                    <th>2XL<br/>(105)</th>
                    <th>3XL<br/>(110)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>가슴단면</th>
                    <td>47</td>
                    <td>49</td>
                    <td>52</td>
                    <td>54</td>
                    <td>56</td>
                    <td>59</td>
                  </tr>
                  <tr>
                    <th>총 길이</th>
                    <td>62</td>
                    <td>65</td>
                    <td>68</td>
                    <td>71</td>
                    <td>74</td>
                    <td>77</td>
                  </tr>
                </tbody>
              </S.Table>
            </S.SizeGuide>

            <S.ButtonGroup>
              <S.OrderButton onClick={handleOrder}>예약하기 →</S.OrderButton>
            </S.ButtonGroup>
          </S.InfoSection>
        </S.Content>

        {isOrderSheetOpen && tshirt && (
          <OrderSheet
            tshirtId={tshirt.id}
            options={options}
            priceInfo={priceInfo}
            onClose={() => setIsOrderSheetOpen(false)}
          />
        )}
      </S.Container>
    </PageLayout>
  );
} 