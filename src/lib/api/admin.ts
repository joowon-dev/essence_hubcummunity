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

// 주문 아이템 가져오기
export interface OrderItemDetail {
  item_id: number;
  order_id: number;
  tshirt_id: number;
  size: string;
  color: string;
  quantity: number;
}

export async function getOrderItems(orderId: number): Promise<OrderItemDetail[]> {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('item_id', { ascending: true });

    if (error) {
      console.error('주문 아이템 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('주문 아이템 조회 중 오류:', error);
    return [];
  }
}

// 티셔츠 옵션별 주문 수량 통계 가져오기
export async function getTshirtOrderStats(): Promise<any> {
  try {
    // 모든 주문 아이템 가져오기
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*, orders(status)');

    if (orderItemsError) {
      console.error('주문 아이템 통계 조회 오류:', orderItemsError);
      return null;
    }

    // 티셔츠 옵션 가져오기
    const { data: tshirtOptions, error: tshirtOptionsError } = await supabase
      .from('tshirt_options')
      .select('size, color')
      .order('size', { ascending: true });

    if (tshirtOptionsError) {
      console.error('티셔츠 옵션 조회 오류:', tshirtOptionsError);
      return null;
    }

    // 옵션별로 그룹화
    const uniqueOptions = Array.from(
      new Set(tshirtOptions.map(option => `${option.size}|${option.color}`))
    ).map(combined => {
      const [size, color] = combined.split('|');
      return { size, color };
    });

    // 상태별 통계 초기화 (인덱스 시그니처 추가)
    const stats: {
      '미입금': Record<string, number>;
      '입금확인중': Record<string, number>;
      '입금완료': Record<string, number>;
      '취소됨': Record<string, number>;
      '합계': Record<string, number>;
      [key: string]: Record<string, number>;
    } = {
      '미입금': {},
      '입금확인중': {},
      '입금완료': {},
      '취소됨': {},
      '합계': {}
    };

    // 각 옵션에 대해 초기화
    uniqueOptions.forEach(option => {
      const key = `${option.size}|${option.color}`;
      stats['미입금'][key] = 0;
      stats['입금확인중'][key] = 0;
      stats['입금완료'][key] = 0;
      stats['취소됨'][key] = 0;
      stats['합계'][key] = 0;
    });

    // 각 주문 아이템 처리
    orderItems.forEach(item => {
      const status = item.orders?.status || '미입금';
      const key = `${item.size}|${item.color}`;
      
      if (stats[status] && stats[status][key] !== undefined) {
        stats[status][key] += item.quantity;
        stats['합계'][key] += item.quantity;
      }
    });

    return {
      stats,
      options: uniqueOptions
    };
  } catch (error) {
    console.error('주문 통계 조회 중 오류:', error);
    return null;
  }
} 