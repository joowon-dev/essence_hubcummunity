import { useState, useEffect } from 'react';
import { supabase } from '@src/lib/supabase';
import { useAuthStore } from '@src/store/auth';
import * as S from './style';
import { useRouter } from 'next/router';
import OrderConfirmation from '../OrderConfirmation';

interface CartItem {
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface OrderSheetProps {
  tshirtId: number;
  options: {
    id: number;
    size: string;
    color: string;
    stock: number;
    price: number;
  }[];
  onClose: () => void;
}

// 장바구니 데이터 관련 로컬스토리지 키
const CART_STORAGE_KEY = 'tshirt_cart_data';
const REDIRECT_STORAGE_KEY = 'login_redirect';

// 입금 계좌 정보
const BANK_ACCOUNT = {
  bank: '신한은행',
  account: '123-456-789012',
  holder: '에센스'
};

export default function OrderSheet({ tshirtId, options, onClose }: OrderSheetProps) {
  const router = useRouter();
  const { phoneNumber, isAuthenticated } = useAuthStore();
  const [userName, setUserName] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hasPendingOrders, setHasPendingOrders] = useState(false);
  const [isCheckingOrders, setIsCheckingOrders] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // 컴포넌트 마운트 시 로컬스토리지에서 장바구니 데이터 복원
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCartItems(parsedCart);
          calculateTotalPrice(parsedCart);
          localStorage.removeItem(CART_STORAGE_KEY); // 복원 후 삭제
        }
      } catch (e) {
        console.error('장바구니 데이터 복원 실패:', e);
      }
    }
  }, []);

  // 사용자 이름 가져오기
  useEffect(() => {
    async function fetchUserName() {
      if (!isAuthenticated || !phoneNumber) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name')
          .eq('phone_number', phoneNumber)
          .single();
        
        if (error) throw error;
        if (data && data.name) {
          setUserName(data.name);
        }
      } catch (err) {
        console.error('사용자 이름 조회 중 오류 발생:', err);
      }
    }
    
    fetchUserName();
  }, [isAuthenticated, phoneNumber]);

  // 총 가격 계산 함수
  const calculateTotalPrice = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
    return total;
  };

  // 사용자가 로그인되어 있는 경우 미입금/입금확인중 주문이 있는지 확인
  useEffect(() => {
    async function checkPendingOrders() {
      if (!isAuthenticated || !phoneNumber) return;
      
      setIsCheckingOrders(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('status')
          .eq('user_phone', phoneNumber)
          .in('status', ['미입금', '입금확인중']);
        
        if (error) throw error;
        
        setHasPendingOrders(data && data.length > 0);
      } catch (err) {
        console.error('주문 상태 확인 중 오류 발생:', err);
      } finally {
        setIsCheckingOrders(false);
      }
    }
    
    checkPendingOrders();
  }, [isAuthenticated, phoneNumber]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setError('사이즈와 색상을 선택해주세요.');
      return;
    }

    // 선택한 옵션의 가격 찾기
    const selectedOption = options.find(
      opt => opt.size === selectedSize && opt.color === selectedColor
    );

    if (!selectedOption) {
      setError('선택한 옵션이 유효하지 않습니다.');
      return;
    }

    setCartItems(prevItems => {
      // 같은 사이즈와 색상의 아이템이 있는지 확인
      const existingItemIndex = prevItems.findIndex(
        item => item.size === selectedSize && item.color === selectedColor
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // 기존 아이템이 있으면 수량만 추가
        newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        };
      } else {
        // 새로운 아이템 추가
        newItems = [...prevItems, {
          size: selectedSize,
          color: selectedColor,
          quantity: quantity,
          price: selectedOption.price
        }];
      }
      
      // 총 가격 다시 계산
      calculateTotalPrice(newItems);
      return newItems;
    });

    setError('');
    // 선택 초기화
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
  };

  const handleRemoveFromCart = (index: number) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newItems);
    calculateTotalPrice(newItems);
  };

  const saveCartAndRedirect = () => {
    // 장바구니 데이터를 로컬스토리지에 저장
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    
    // 현재 경로를 저장하여 로그인 후 돌아올 수 있도록 함
    localStorage.setItem(REDIRECT_STORAGE_KEY, '/tshirt');
    
    // 로그인 페이지로 이동
    router.push('/login');
  };

  const handleProceedToConfirmation = async () => {
    if (cartItems.length === 0) {
      setError('장바구니가 비어있습니다.');
      return;
    }

    if (!isAuthenticated || !phoneNumber) {
      saveCartAndRedirect();
      return;
    }

    // 미입금이나 입금확인중 상태의 주문이 있는지 다시 확인
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, order_id')
        .eq('user_phone', phoneNumber)
        .in('status', ['미입금', '입금확인중']);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // 미입금이나 입금확인중 상태의 주문이 있는 경우
        const orderIds = data.map(order => order.order_id).join(', ');
        setError(`이전 주문(#${orderIds})의 입금 처리가 완료되지 않았습니다. 입금 확인 후 다시 시도해주세요.`);
        return;
      }

      // 주문 확인 페이지로 이동
      setShowConfirmation(true);
      
    } catch (err) {
      console.error('주문 상태 확인 중 오류 발생:', err);
      setError('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleOrder = async (depositorName: string) => {
    try {
      // 1. 주문 생성 (총 가격과 입금자명 포함)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_phone: phoneNumber,
          status: '입금확인중',
          total_price: totalPrice,
          name: depositorName // 입금자명 저장
        })
        .select('order_id')
        .single();

      if (orderError) throw orderError;
      
      const orderId = orderData.order_id;
      
      // 2. 주문 항목 추가 (price 필드 제외)
      const orderItems = cartItems.map((item, index) => ({
        order_id: orderId,
        item_id: index + 1,
        tshirt_id: tshirtId,
        size: item.size,
        color: item.color,
        quantity: item.quantity
        // price 필드 제거
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
      
      alert('주문이 완료되었습니다. 주문번호: ' + orderId + '\n입금 후 확인까지 시간이 소요될 수 있습니다.');
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      setError('주문 중 오류가 발생했습니다.');
    }
  };

  const getTotalQuantity = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
  };

  const availableSizes = Array.from(new Set(options.map(option => option.size)));
  const availableColors = Array.from(new Set(options.map(option => option.color)));

  // 주문 확인 페이지
  if (showConfirmation) {
    return (
      <OrderConfirmation
        cartItems={cartItems}
        totalPrice={totalPrice}
        bankAccount={BANK_ACCOUNT}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={handleOrder}
        formatPrice={formatPrice}
        userName={userName}
        userPhone={phoneNumber || undefined}
      />
    );
  }

  return (
    <S.Container>
      <S.Sheet>
        <S.Title>주문하기</S.Title>
        
        {hasPendingOrders && (
          <S.WarningMessage>
            입금 확인이 필요한 주문이 있습니다. 입금 확인 후 추가 주문이 가능합니다.
          </S.WarningMessage>
        )}
        
        <S.Section>
          <S.Label>사이즈</S.Label>
          <S.OptionGroup>
            {availableSizes.map(size => (
              <S.OptionButton
                key={size}
                selected={selectedSize === size}
                onClick={() => setSelectedSize(size)}
                disabled={hasPendingOrders}
              >
                {size}
              </S.OptionButton>
            ))}
          </S.OptionGroup>
        </S.Section>

        <S.Section>
          <S.Label>색상</S.Label>
          <S.OptionGroup>
            {availableColors.map(color => (
              <S.OptionButton
                key={color}
                selected={selectedColor === color}
                onClick={() => setSelectedColor(color)}
                disabled={hasPendingOrders}
              >
                {color}
              </S.OptionButton>
            ))}
          </S.OptionGroup>
        </S.Section>

        <S.Section>
          <S.Label>수량</S.Label>
          <S.QuantityControl>
            <S.QuantityButton
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              disabled={hasPendingOrders}
            >
              -
            </S.QuantityButton>
            <S.QuantityDisplay>{quantity}</S.QuantityDisplay>
            <S.QuantityButton
              onClick={() => setQuantity(prev => prev + 1)}
              disabled={hasPendingOrders}
            >
              +
            </S.QuantityButton>
          </S.QuantityControl>
        </S.Section>

        <S.AddToCartButton 
          onClick={handleAddToCart}
          disabled={hasPendingOrders}
        >
          장바구니 담기
        </S.AddToCartButton>

        {cartItems.length > 0 && (
          <S.CartSection>
            <S.CartTitle>장바구니 ({getTotalQuantity()}개)</S.CartTitle>
            {cartItems.map((item, index) => (
              <S.CartItem key={index}>
                <S.CartItemInfo>
                  <span>{item.color}</span>
                  <span>{item.size}</span>
                  <span>{item.quantity}개</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </S.CartItemInfo>
                <S.RemoveButton onClick={() => handleRemoveFromCart(index)}>
                  삭제
                </S.RemoveButton>
              </S.CartItem>
            ))}
            <S.TotalPrice>총 결제금액: {formatPrice(totalPrice)}</S.TotalPrice>
          </S.CartSection>
        )}

        {error && <S.Error>{error}</S.Error>}

        <S.ButtonGroup>
          <S.CancelButton onClick={onClose}>취소</S.CancelButton>
          <S.OrderButton 
            onClick={handleProceedToConfirmation}
            disabled={hasPendingOrders || isCheckingOrders || cartItems.length === 0}
          >
            {!isAuthenticated ? '로그인 후 주문하기' : 
              hasPendingOrders ? '입금 확인 필요' :
              (cartItems.length > 0 ? `주문서 작성하기` : '주문하기')}
          </S.OrderButton>
        </S.ButtonGroup>
      </S.Sheet>
      <S.Overlay onClick={onClose} />
    </S.Container>
  );
} 