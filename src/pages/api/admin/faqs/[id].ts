import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const faqId = Number(id);

    if (isNaN(faqId)) {
      return res.status(400).json({ message: '유효하지 않은 FAQ ID입니다.' });
    }

    // PUT 요청 처리: FAQ 수정
    if (req.method === 'PUT') {
      const { tag, title, contents, is_visible, display_order } = req.body;
      
      if (!tag || !title || !contents) {
        return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
      }
      
      const { data, error } = await supabase
        .from('faqs')
        .update({
          tag,
          title,
          contents,
          is_visible: is_visible === undefined ? true : is_visible,
          display_order: display_order !== undefined ? display_order : undefined
        })
        .eq('id', faqId)
        .select();
      
      if (error) throw error;
      
      if (data.length === 0) {
        return res.status(404).json({ message: 'FAQ를 찾을 수 없습니다.' });
      }
      
      return res.status(200).json(data[0]);
    }
    
    // DELETE 요청 처리: FAQ 삭제
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faqId);
      
      if (error) throw error;
      
      return res.status(200).json({ message: 'FAQ가 삭제되었습니다.' });
    }
    
    // 지원하지 않는 HTTP 메서드
    return res.status(405).json({ message: '허용되지 않는 메서드입니다.' });
  } catch (error: any) {
    console.error('FAQ API 오류:', error.message);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
} 