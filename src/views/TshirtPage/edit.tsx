import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@src/lib/supabase';
import * as S from './style';
import PageLayout from '@src/components/common/PageLayout';
import { useAuthStore } from '@src/store/auth';

interface TshirtOption {
  id: number;
  tshirt_id: number;
  size: string;
  color: string;
  stock: number;
  price: number;
}

interface TshirtOrderItem {
  item_id: number;
  size: string;
  color: string;
  quantity: number;
}

interface TshirtOrder {
  order_id: number;
  order_date: string;
  status: string;
  items: TshirtOrderItem[];
  total_price?: number;
  total_quantity?: number;
}

interface TshirtData {
  id: number;
  name: string;
  price: number;
  description: string;
  deadline: string;
}

interface CartItem {
  size: string;
  color: string;
  quantity: number;
  original_item_id?: number;
}

export default function TshirtEditPage() {
  const router = useRouter();
  const { order_id } = router.query;
  const { phoneNumber, isAuthenticated } = useAuthStore();
  const [originalOrder, setOriginalOrder] = useState<TshirtOrder | null>(null);
  const [tshirt, setTshirt] = useState<TshirtData | null>(null);
  const [options, setOptions] = useState<TshirtOption[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [originalTotalQuantity, setOriginalTotalQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deadline, setDeadline] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated || !phoneNumber) {
      router.push('/login');
      return;
    }

    async function fetchOrderData() {
      if (!order_id) return;

      try {
        setIsLoading(true);
        
        // 주문 정보 가져오기
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('order_id, order_date, status, total_price')
          .eq('order_id', order_id)
          .eq('user_phone', phoneNumber)
          .single();

        if (orderError) throw orderError;
        
        // 주문 항목 가져오기
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('item_id, tshirt_id, size, color, quantity')
          .eq('order_id', order_id);

        if (itemsError) throw itemsError;
        
        if (!itemsData || itemsData.length === 0) {
          throw new Error('주문 항목을 찾을 수 없습니다.');
        }
        
        // 티셔츠 정보 가져오기
        const tshirtId = itemsData[0].tshirt_id;
        
        const { data: tshirtData, error: tshirtError } = await supabase
          .from('tshirts')
          .select('*')
          .eq('id', tshirtId)
          .single();

        if (tshirtError) throw tshirtError;
        
        // 옵션 정보 가져오기
        const { data: optionsData, error: optionsError } = await supabase
          .from('tshirt_options')
          .select('*')
          .eq('tshirt_id', tshirtId);

        if (optionsError) throw optionsError;
        
        // 스케줄에서 티셔츠 예약 마감일 가져오기
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedules')
          .select('title, day, end_time')
          .eq('title', '티셔츠 예약 마감')
          .single();
          
        if (!scheduleError && scheduleData) {
          setDeadline(scheduleData.day);
        } else {
          setDeadline(tshirtData.deadline);
        }
        
        const optionsWithPrice = optionsData.map(option => ({
          ...option,
          price: tshirtData.price
        }));
        
        // 초기 장바구니 항목 설정 (기존 주문 항목)
        const initialCartItems = itemsData.map(item => ({
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          original_item_id: item.item_id
        }));
        
        // 총 수량 계산
        const totalQty = itemsData.reduce((sum, item) => sum + item.quantity, 0);
        
        setTshirt(tshirtData);
        setOptions(optionsWithPrice);
        setCartItems(initialCartItems);
        setOriginalOrder({
          ...orderData,
          items: itemsData
        });
        setTotalQuantity(totalQty);
        setOriginalTotalQuantity(totalQty);
        
      } catch (error) {
        console.error('주문 정보 로딩 중 오류 발생:', error);
        setError('주문 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderData();
  }, [order_id, phoneNumber, isAuthenticated, router]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setError('사이즈와 색상을 선택해주세요.');
      return;
    }

    // 총 수량 제한 확인
    const newTotalQuantity = totalQuantity + quantity;
    if (newTotalQuantity > originalTotalQuantity) {
      setError(`총 수량은 ${originalTotalQuantity}개를 초과할 수 없습니다.`);
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
          quantity: quantity
        }];
      }
      
      return newItems;
    });

    setTotalQuantity(newTotalQuantity);
    setError('');
    // 선택 초기화
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
  };

  const handleRemoveFromCart = (index: number) => {
    const itemToRemove = cartItems[index];
    const newTotalQuantity = totalQuantity - itemToRemove.quantity;
    
    const newItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newItems);
    setTotalQuantity(newTotalQuantity);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const diffQuantity = newQuantity - cartItems[index].quantity;
    const newTotalQuantity = totalQuantity + diffQuantity;
    
    if (newTotalQuantity > originalTotalQuantity) {
      setError(`총 수량은 ${originalTotalQuantity}개를 초과할 수 없습니다.`);
      return;
    }
    
    const newCartItems = [...cartItems];
    newCartItems[index] = {
      ...newCartItems[index],
      quantity: newQuantity
    };
    
    setCartItems(newCartItems);
    setTotalQuantity(newTotalQuantity);
    setError('');
  };

  const handleSaveChanges = async () => {
    if (cartItems.length === 0) {
      setError('장바구니가 비어있습니다.');
      return;
    }
    
    if (totalQuantity !== originalTotalQuantity) {
      setError(`총 수량이 원래 주문과 일치하지 않습니다. 현재: ${totalQuantity}, 원래: ${originalTotalQuantity}`);
      return;
    }

    try {
      // 기존 주문 항목 삭제
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order_id);
        
      if (deleteError) throw deleteError;
      
      // 새 주문 항목 추가
      const orderItems = cartItems.map((item, index) => ({
        order_id: order_id,
        item_id: index + 1,
        tshirt_id: tshirt?.id,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      }));

      const { error: insertError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (insertError) throw insertError;
      
      alert('주문이 성공적으로 변경되었습니다.');
      router.push('/myinfo');
      
    } catch (error) {
      console.error('주문 변경 중 오류 발생:', error);
      setError('주문 변경 중 오류가 발생했습니다.');
    }
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
  };

  const availableSizes = Array.from(new Set(options.map(option => option.size)));
  const availableColors = Array.from(new Set(options.map(option => option.color)));

  if (isLoading) {
    return (
      <PageLayout>
        <S.Container>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>로딩 중...</div>
        </S.Container>
      </PageLayout>
    );
  }

  if (!originalOrder || !tshirt) {
    return (
      <PageLayout>
        <S.Container>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            {error || '주문 정보를 불러올 수 없습니다.'}
            <div style={{ marginTop: '20px' }}>
              <button onClick={() => router.push('/myinfo')}>
                내 정보 페이지로 돌아가기
              </button>
            </div>
          </div>
        </S.Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <S.Container>
        <S.Content>
          <S.InfoSection2>
            <S.ProductTitle>티셔츠 주문 변경</S.ProductTitle>
            <S.Deadline>주문 번호: {originalOrder.order_id}</S.Deadline>
            <S.Notice>
              * 색상, 사이즈, 각 항목별 수량을 변경할 수 있습니다.<br />
              * 총 수량({originalTotalQuantity}개)은 변경할 수 없습니다.<br />
              * 모든 변경은 {deadline || tshirt.deadline}까지만 가능합니다.
            </S.Notice>

            <S.Sheet>
              <S.Section>
                <S.Label>사이즈</S.Label>
                <S.OptionGroup>
                  {availableSizes.map(size => (
                    <S.OptionButton
                      key={size}
                      selected={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
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
                  >
                    -
                  </S.QuantityButton>
                  <S.QuantityDisplay>{quantity}</S.QuantityDisplay>
                  <S.QuantityButton
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    +
                  </S.QuantityButton>
                </S.QuantityControl>
              </S.Section>

              <S.AddToCartButton onClick={handleAddToCart}>
                장바구니 담기
              </S.AddToCartButton>

              {cartItems.length > 0 && (
                <S.CartSection>
                  <S.CartTitle>장바구니 ({totalQuantity}/{originalTotalQuantity}개)</S.CartTitle>
                  {cartItems.map((item, index) => (
                    <S.CartItem key={index}>
                      <S.CartItemInfo>
                        <span>{item.color}</span>
                        <span>{item.size}</span>
                        <S.QuantityControl>
                          <S.QuantityButton
                            onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                          >
                            -
                          </S.QuantityButton>
                          <S.QuantityDisplay>{item.quantity}</S.QuantityDisplay>
                          <S.QuantityButton
                            onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                          >
                            +
                          </S.QuantityButton>
                        </S.QuantityControl>
                      </S.CartItemInfo>
                      <S.RemoveButton onClick={() => handleRemoveFromCart(index)}>
                        삭제
                      </S.RemoveButton>
                    </S.CartItem>
                  ))}
                </S.CartSection>
              )}

              {error && <S.Error>{error}</S.Error>}

              <S.ButtonGroup>
                <S.CancelButton onClick={() => router.push('/myinfo')}>
                  취소
                </S.CancelButton>
                <S.OrderButton 
                  onClick={handleSaveChanges}
                  disabled={cartItems.length === 0 || totalQuantity !== originalTotalQuantity}
                >
                  변경사항 저장
                </S.OrderButton>
              </S.ButtonGroup>
            </S.Sheet>
          </S.InfoSection2>
        </S.Content>
      </S.Container>
    </PageLayout>
  );
} 