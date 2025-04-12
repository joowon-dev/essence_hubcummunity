import { supabase } from '@src/lib/supabase';

// 관리자 인증 관련 타입
export interface AdminLoginCredentials {
  phoneNumber: string;
  password: string;
}

export interface OrderItem {
  order_id: number;
  user_phone: string;
  order_date: string;
  status: string;
  total_price: number;
  name: string;
}

// 관리자 로그인
export async function loginAdmin(credentials: AdminLoginCredentials): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('phone_number')
      .eq('phone_number', credentials.phoneNumber)
      .eq('password', credentials.password);

    if (error || !data || data.length === 0) {
      console.error('관리자 로그인 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('관리자 로그인 처리 중 오류:', error);
    return false;
  }
}

// 티셔츠 주문 목록 가져오기
export async function getTshirtOrders(): Promise<OrderItem[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) {
      console.error('티셔츠 주문 목록 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('티셔츠 주문 목록 조회 중 오류:', error);
    return [];
  }
}

// 주문 상태 업데이트
export async function updateOrderStatus(orderId: number, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', orderId);

    if (error) {
      console.error('주문 상태 업데이트 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('주문 상태 업데이트 중 오류:', error);
    return false;
  }
}

// 주문 상세 정보 가져오기
export async function getOrderDetails(orderId: number): Promise<OrderItem | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('주문 상세 정보 조회 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('주문 상세 정보 조회 중 오류:', error);
    return null;
  }
}

// 사용자 이름으로 주문 검색
export async function searchOrdersByName(name: string): Promise<OrderItem[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('name', `%${name}%`)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('주문 검색 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('주문 검색 중 오류:', error);
    return [];
  }
}

// 전화번호로 주문 검색
export async function searchOrdersByPhone(phone: string): Promise<OrderItem[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('user_phone', `%${phone}%`)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('전화번호 검색 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('전화번호 검색 중 오류:', error);
    return [];
  }
}

// 주문 상태별 통계 가져오기
export async function getOrderStatusStats(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status');

    if (error) {
      console.error('주문 상태 통계 조회 오류:', error);
      return { '미입금': 0, '입금확인중': 0, '입금완료': 0, '취소됨': 0 };
    }

    const stats: Record<string, number> = { 
      '미입금': 0, 
      '입금확인중': 0, 
      '입금완료': 0, 
      '취소됨': 0 
    };
    
    data.forEach((order) => {
      const status = order.status as string;
      if (stats[status] !== undefined) {
        stats[status]++;
      } else {
        stats[status] = 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('주문 상태 통계 조회 중 오류:', error);
    return { '미입금': 0, '입금확인중': 0, '입금완료': 0, '취소됨': 0 };
  }
} 