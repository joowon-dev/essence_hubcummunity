import { useEffect, useState } from 'react';
import { supabase } from '@src/lib/supabase';
import FaqSection from "../FaqSection";
import * as S from "./style";

interface Schedule {
  id: number;
  title: string;
  end_time: string;
  day: string;
  mainvisible: number;
}

function RulesList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .order('mainvisible', { ascending: true })
          .not('mainvisible', 'is', null)
          .limit(3);

        if (error) throw error;
        
        // end_time 형식을 YYYYMMDD로 변환
        const formattedData = data?.map(item => ({
          ...item,
          end_time: item.end_time.replace(/[^0-9]/g, '').padStart(8, '0')
        })) || [];
        
        setSchedules(formattedData);
      } catch (error) {
        console.error('스케줄 데이터 조회 중 오류:', error);
      }
    }

    fetchSchedules();
  }, []);

  return (
    <S.Ul>
      {schedules.map((item) => (
        <FaqSection
          key={item.id}
          title={item.title}
          endTime={item.end_time}
          day={item.day}
        />
      ))}
    </S.Ul>
  );
}

export default RulesList;
