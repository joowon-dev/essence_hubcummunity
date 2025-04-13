import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // GET 요청 처리: FAQ 목록 불러오기
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      return res.status(200).json(data);
    }
    
    // POST 요청 처리: 새 FAQ 추가
    if (req.method === 'POST') {
      const { tag, title, contents, is_visible, display_order } = req.body;
      
      if (!tag || !title || !contents) {
        return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
      }
      
      const { data, error } = await supabase
        .from('faqs')
        .insert([{
          tag,
          title,
          contents,
          is_visible: is_visible === undefined ? true : is_visible,
          display_order: display_order || 0
        }])
        .select();
      
      if (error) throw error;
      
      return res.status(201).json(data[0]);
    }
    
    // 지원하지 않는 HTTP 메서드
    return res.status(405).json({ message: '허용되지 않는 메서드입니다.' });
  } catch (error: any) {
    console.error('FAQ API 오류:', error.message);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
} 