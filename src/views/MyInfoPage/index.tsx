import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, initializeAuthState } from '@src/store/auth';
import { supabase } from '@src/lib/supabase';
import * as S from './style';
import PageLayout from '@src/components/common/PageLayout';
import { useRouter } from 'next/router';
import { getCachedBankAccount, BankAccount } from '@src/lib/api/bank';
import { usePageTransition } from '@src/hooks/usePageTransition';

interface UserInfo {
  name: string;
  group_name: string;
  phone_number: string;
  // 선택적 필드로 변경 (일반 사용자만 해당)
  departure_time?: string;
  return_time?: string;
}

interface TshirtOrder {
  order_id: number;
  order_date: string;
  status: string;
  items: TshirtOrderItem[];
  total_price?: number;
  name: string;
}

interface TshirtOrderItem {
  item_id: number;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface ScheduleInfo {
  title: string;
  day: string;
  end_time: string;
}

interface OrderConfirmationProps {
  order: TshirtOrder;
  onClose: () => void;
}

export default function MyInfoPage() {
  const router = useRouter();
  const { phoneNumber, isAuthenticated, logout } = useAuthStore();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tshirtOrders, setTshirtOrders] = useState<TshirtOrder[]>([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [carChangeInfo, setCarChangeInfo] = useState<ScheduleInfo | null>(null);
  const [tshirtChangeInfo, setTshirtChangeInfo] = useState<ScheduleInfo | null>(null);
  const [isCarChangeAvailable, setIsCarChangeAvailable] = useState(false);
  const [isTshirtChangeAvailable, setIsTshirtChangeAvailable] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TshirtOrder | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [userType, setUserType] = useState<'normal' | 'tshirt'>('normal'); // 사용자 유형 상태 추가
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    bank: '',
    account: '',
    holder: ''
  });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [selectedQRData, setSelectedQRData] = useState<string>('');
  const { navigateTo } = usePageTransition();
  const [showConfirmOrder, setShowConfirmOrder] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<TshirtOrder | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false); // 주문 확정 로딩 상태 추가
  
  // YYYYMMDD 형식의 문자열을 Date 객체로 변환하는 함수
  const parseDateFromString = (dateString: string) => {
    if (dateString.length !== 8) return null;
    
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // 월은 0-11로 표현
    const day = parseInt(dateString.substring(6, 8));
    
    return new Date(year, month, day);
  };

  const handleViewOrderDetails = (order: TshirtOrder) => {
    setSelectedOrder(order);
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSelectedOrder(null);
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
  };

  // 클립보드 복사 함수
  const copyToClipboard = (text: string, type: string) => {
    try {
      let copyText = '';
      
      if (type === 'account') {
        copyText = `${bankAccount.bank} ${bankAccount.account}`;
      } else if (type === 'depositor') {
        copyText = userInfo?.name || '';
      }
      
      if (textAreaRef.current) {
        textAreaRef.current.value = copyText;
        textAreaRef.current.select();
        textAreaRef.current.setSelectionRange(0, 99999);

        if (document.execCommand('copy')) {
          textAreaRef.current.blur();
          setCopiedText(type);
          setTimeout(() => setCopiedText(null), 2000);
          return;
        }
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(copyText)
          .then(() => {
            setCopiedText(type);
            setTimeout(() => setCopiedText(null), 2000);
          })
          .catch(err => {
            console.error('클립보드 복사 중 오류가 발생했습니다:', err);
            alert('복사하지 못했습니다. 텍스트를 직접 선택하여 복사해주세요.');
          });
      } else {
        alert('이 브라우저에서는 자동 복사가 지원되지 않습니다. 텍스트를 직접 선택하여 복사해주세요.');
      }
    } catch (err) {
      console.error('복사 중 오류가 발생했습니다:', err);
      alert('복사 중 오류가 발생했습니다. 텍스트를 직접 선택하여 복사해주세요.');
    }
  };

  // 주문 취소 함수
  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('입금하지 않았을 경우 취소가 가능합니다. 취소 하시겠습니까?')) {
      try {
        // 주문 상태를 '취소됨'으로 업데이트
        const { error } = await supabase
          .from('orders')
          .update({ status: '취소됨' })
          .eq('order_id', orderId);
          
        if (error) throw error;
        
        // 로컬 상태 업데이트
        const updatedOrders = tshirtOrders.map(order => 
          order.order_id === orderId 
            ? { ...order, status: '취소됨' } 
            : order
        );
        
        // 취소된 주문을 마지막으로 정렬
        const sortedOrders = [...updatedOrders].sort((a, b) => {
          if (a.status === '취소됨' && b.status !== '취소됨') return 1;
          if (a.status !== '취소됨' && b.status === '취소됨') return -1;
          return b.order_id - a.order_id;
        });
        
        setTshirtOrders(sortedOrders);
        
        // 모달 닫기
        setShowConfirmation(false);
        setSelectedOrder(null);
        
        alert('주문이 취소되었습니다.');
      } catch (error) {
        console.error('주문 취소 중 오류 발생:', error);
        alert('주문 취소 처리 중 오류가 발생했습니다.');
      }
    }
  };
  
  // 점 인디케이터 클릭 핸들러
  const handleDotClick = (index: number) => {
    setCurrentCard(index);
    setDragX(0);
  };

  // 터치/마우스 시작
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setStartX(clientX);
  };

  // 터치/마우스 이동
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    // preventDefault를 호출하지 않음 (패시브 이벤트 문제 해결)
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = (clientX - startX);
    
    // 드래그 범위 제한
    if (
      (currentCard === 0 && diff > 0) || 
      (currentCard === tshirtOrders.length - 1 && diff < 0)
    ) {
      setDragX(diff * 0.2); // 끝에서는 저항감 있게
    } else {
      setDragX(diff);
    }
  };

  // 터치/마우스 종료
  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = window.innerWidth * 0.2; // 20% 이상 드래그 시 슬라이드 변경
    
    if (Math.abs(dragX) > threshold) {
      if (dragX > 0 && currentCard > 0) {
        setCurrentCard(currentCard - 1);
      } else if (dragX < 0 && currentCard < tshirtOrders.length - 1) {
        setCurrentCard(currentCard + 1);
      }
    }
    
    setDragX(0);
  };

  // 슬라이더 스타일 계산
  const getSliderStyle = () => {
    const baseTransform = -(currentCard * 100); // 100%씩 이동
    const dragPercent = (dragX / (window.innerWidth || 1)) * 100;
    
    return {
      transform: `translateX(${baseTransform + dragPercent}%)`,
    };
  };

  // 주문 확인서 컴포넌트
  const OrderConfirmation = ({ order, onClose }: OrderConfirmationProps) => {
    const [depositorName, setDepositorName] = useState<string>(userInfo?.name || '');
    const canCancel = order.status === '입금확인중' || order.status === '미입금';
    
    // 총 가격 계산 함수
    const calculateTotalPrice = (items: TshirtOrderItem[]) => {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const baseTotal = items.reduce((sum, item) => {
        // 3XL은 11,000원, 나머지는 10,000원
        const itemPrice = item.size === '3XL' ? 11000 : 10000;
        return sum + (itemPrice * item.quantity);
      }, 0);
      
      // 2장 이상 주문 시 장당 1,000원 할인
      const discountAmount = totalQuantity >= 2 ? totalQuantity * 1000 : 0;
      const finalTotal = baseTotal - discountAmount;
      
      return {
        baseTotal,
        discountAmount,
        finalTotal
      };
    };

    useEffect(() => {
      if (userInfo?.name) {
        const phoneLastDigits = userInfo.phone_number ? userInfo.phone_number.slice(-4) : '';
        const initialDepositorName = userInfo.name + (phoneLastDigits ? phoneLastDigits : '');
        setDepositorName(initialDepositorName);
      }
    }, [userInfo]);

    return (
      <S.ModalContainer>
        <S.ModalSheet>
          <textarea
            ref={textAreaRef}
            readOnly
            style={{
              position: 'absolute',
              left: '-9999px',
              top: '0',
              opacity: 0,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
          
          <S.ModalTitle>주문 확인</S.ModalTitle>
          
          <S.Section>
            <S.ModalSectionTitle>주문 상품</S.ModalSectionTitle>
            <S.OrderList>
              {order.items.map((item, index) => (
                <S.OrderItem key={index}>
                  <S.OrderInfo>
                    <S.ProductName>
                      {item.color} / {item.size}
                    </S.ProductName>
                    <S.ProductDetails>
                      수량: {item.quantity}개
                    </S.ProductDetails>
                  </S.OrderInfo>
                  {order.total_price && (
                    <S.ItemPrice>
                      {formatPrice((item.size === '3XL' ? 11000 : 10000) * item.quantity)}
                    </S.ItemPrice>
                  )}
                </S.OrderItem>
              ))}
            </S.OrderList>
          </S.Section>
          
          <S.Section>
            <S.ModalSectionTitle>결제 정보</S.ModalSectionTitle>
            <S.PaymentInfo>
              <S.PaymentDetail>
                <S.PaymentRow>
                  <S.PaymentLabel>상품 금액</S.PaymentLabel>
                  <S.PaymentValue>₩{calculateTotalPrice(order.items).baseTotal.toLocaleString()}원</S.PaymentValue>
                </S.PaymentRow>
                {calculateTotalPrice(order.items).discountAmount > 0 && (
                  <>
                    <S.PaymentRow>
                      <S.PaymentLabel>할인 금액</S.PaymentLabel>
                      <S.PaymentValue style={{ color: '#E23D3D' }}>
                        -₩{calculateTotalPrice(order.items).discountAmount.toLocaleString()}원
                      </S.PaymentValue>
                    </S.PaymentRow>
                    <S.PaymentRow>
                      <S.PaymentLabel>할인 내용</S.PaymentLabel>
                      <S.PaymentValue>2장 이상 구매 할인 (장당 1,000원)</S.PaymentValue>
                    </S.PaymentRow>
                  </>
                )}
                <S.PaymentRow>
                  <S.PaymentLabel>총 결제금액</S.PaymentLabel>
                  <S.PaymentValue style={{ fontWeight: 'bold' }}>
                    ₩{calculateTotalPrice(order.items).finalTotal.toLocaleString()}원
                  </S.PaymentValue>
                </S.PaymentRow>
              </S.PaymentDetail>
            </S.PaymentInfo>
          </S.Section>
          
          <S.Section>
            <S.ModalSectionTitle>입금 계좌 정보</S.ModalSectionTitle>
            <S.BankInfo>
              <S.StaticInfoRow>
                <S.InfoLabel>은행</S.InfoLabel>
                <S.InfoValue>{bankAccount.bank}</S.InfoValue>
              </S.StaticInfoRow>
              <S.StaticInfoRow>
                <S.InfoLabel>계좌번호</S.InfoLabel>
                <S.InfoValue>{bankAccount.account}</S.InfoValue>
              </S.StaticInfoRow>
              <S.StaticInfoRow>
                <S.InfoLabel>예금주</S.InfoLabel>
                <S.InfoValue>{bankAccount.holder}</S.InfoValue>
              </S.StaticInfoRow>
              <S.CopyButton onClick={() => copyToClipboard('', 'account')}>
                계좌정보 복사하기
                {copiedText === 'account' && <S.CopiedBadge>복사됨</S.CopiedBadge>}
              </S.CopyButton>
            </S.BankInfo>
          </S.Section>
          
          <S.Section>
            <S.ModalSectionTitle>입금자 정보</S.ModalSectionTitle>
            <S.DepositorInfo>
              <S.InfoInputRow>
                <S.InfoLabel>입금자명</S.InfoLabel>
                <S.DepositorInput 
                  value={canCancel ? depositorName : order.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepositorName(e.target.value)}
                  placeholder="이름+전화번호 뒷자리 (예: 홍길동1234)"
                  readOnly
                />
              </S.InfoInputRow>
              <S.InfoNote>* 이미 송금했을 경우 실제 송금자명으로 수정 요망</S.InfoNote>
              <S.CopyButton onClick={() => copyToClipboard('', 'depositor')}>
                입금자명 복사하기
                {copiedText === 'depositor' && <S.CopiedBadge>복사됨</S.CopiedBadge>}
              </S.CopyButton>
            </S.DepositorInfo>
          </S.Section>
          
          <S.Notice>
            * 입금 확인 후 주문이 확정됩니다.<br />
            * 입금자명은 동일해야합니다. ex.홍길동1234 or 홍길동 <br />
            * 24시간 내에 입금이 확인되지 않으면 주문은 자동 취소됩니다.
          </S.Notice>
          
          <S.ButtonGroup>
            {canCancel && (
              <S.CancelOrderButton onClick={() => handleCancelOrder(order.order_id)}>
                주문 취소
              </S.CancelOrderButton>
            )}
            <S.CancelButton onClick={onClose}>닫기</S.CancelButton>
          </S.ButtonGroup>
        </S.ModalSheet>
        <S.ModalOverlay onClick={onClose} />
      </S.ModalContainer>
    );
  };

  // 사이즈 변경 페이지로 이동
  const handleSizeChange = (order: TshirtOrder) => {
    // order_id를 쿼리 파라미터로 전달
    //router.push(`/tshirt/edit?order_id=${order.order_id}`);
  };

  // 마감일 지났는지 체크하는 함수
  const isDeadlinePassed = () => {
    if (!tshirtChangeInfo) return true;
    
    const now = new Date();
    const deadlineDate = parseDateFromString(tshirtChangeInfo.end_time);
    
    if (!deadlineDate) return true;
    
    return now > deadlineDate;
  };
  
  // QR 코드 데이터 생성
  const generateQRData = (orderId: number) => {
    return `${orderId}-${phoneNumber}`;
  };
  
  // QR 코드 모달 열기
  const handleOpenQRCode = (orderId: number) => {
    setSelectedQRData(generateQRData(orderId));
    setShowQRCode(true);
  };
  
  // QR 코드 모달 닫기
  const handleCloseQRCode = () => {
    setShowQRCode(false);
  };

  const handleFaqClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('/FAQ');
  };

  // 새로운 메뉴 핸들러 추가
  const handleMealsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('/meals');
  };

  const handleAccommodationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('/accommodation');
  };

  const handleLostItemsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('/lost-items');
  };

  const handleAnnouncementsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('/announcements');
  };

  useEffect(() => {
    // 세션 초기화 및 페이지 로드 시 인증 상태 검증
    if (typeof window !== 'undefined') {
      // 강제로 인증 상태 초기화
      const isAuthenticated = initializeAuthState();
      
      // 인증 상태 재확인 (initializeAuthState 후에도 인증되지 않았을 경우)
      if (!isAuthenticated && !useAuthStore.getState().isAuthenticated) {
        console.log('인증되지 않은 사용자: 로그인 페이지로 리다이렉트');
        // 로그인 후 돌아올 경로 저장
        localStorage.setItem('login_redirect', '/myinfo');
        // push 대신 replace를 사용하여 히스토리 스택에서 내정보 페이지를 제거
        router.replace('/login');
        return;
      }
    }

    // 계좌 정보 로드
    async function loadBankAccount() {
      const account = await getCachedBankAccount();
      setBankAccount(account);
    }

    async function fetchData() {
      try {
        // 전화번호가 없으면 정보를 가져올 수 없음
        if (!phoneNumber) {
          console.error('전화번호 정보가 없습니다.');
          setLoading(false);
          return;
        }

        // 1. 일반 사용자 정보 확인
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, group_name, departure_time, return_time, phone_number')
          .eq('phone_number', phoneNumber)
          .single();

        if (!userError && userData) {
          setUserInfo(userData);
          setUserType('normal');
        } else {
          // 2. 티셔츠 전용 사용자 정보 확인
          const { data: tshirtUserData, error: tshirtUserError } = await supabase
            .from('tshirt_users')
            .select('name, group_name, phone_number')
            .eq('phone_number', phoneNumber)
            .single();

          if (tshirtUserError) {
            console.error('사용자 정보 조회 실패:', phoneNumber, tshirtUserError);
            
            // 마지막 시도: 기본 사용자 정보 생성 (전화번호만 있는 경우)
            setUserInfo({
              name: '사용자',
              group_name: '정보 없음',
              phone_number: phoneNumber
            });
            setUserType('tshirt');
            
            // 추가 조치 필요 로그 출력
            console.warn('기본 사용자 정보로 임시 복구됨. 관리자에게 문의하세요.');
          } else {
            setUserInfo(tshirtUserData);
            setUserType('tshirt');
          }
        }

        // 티셔츠 주문 내역 조회 (모든 사용자 유형에 공통)
        // 1. 주문 조회
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('order_id, order_date, status, total_price, name')
          .eq('user_phone', phoneNumber)
          .order('order_date', { ascending: false });

        if (ordersError) throw ordersError;
        
        if (ordersData && ordersData.length > 0) {
          // 주문 상태 업데이트: 입금확인중 → 미입금 (24시간 경과)
          await updateOrderStatuses(ordersData);
          
          // 2. 각 주문에 대한 주문 항목 조회
          const ordersWithItems = await Promise.all(ordersData.map(async (order) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('order_items')
              .select('item_id, size, color, quantity')
              .eq('order_id', order.order_id)
              .order('item_id', { ascending: true });
            
            if (itemsError) throw itemsError;
            
            return {
              order_id: order.order_id,
              order_date: order.order_date,
              status: order.status,
              total_price: order.total_price,
              name: order.name,
              items: itemsData ? itemsData.map(item => ({
                ...item,
                price: item.size === '3XL' ? 11000 : 10000
              })) : []
            };
          }));
          
          // 주문 정렬: 취소된 주문('취소됨' 상태)은 마지막에 표시
          const sortedOrders = [...ordersWithItems].sort((a, b) => {
            // '취소됨' 상태의 주문은 맨 뒤로
            if (a.status === '취소됨' && b.status !== '취소됨') return 1;
            if (a.status !== '취소됨' && b.status === '취소됨') return -1;
            
            // 그 외의 주문은 최신순(order_id 내림차순)
            return b.order_id - a.order_id;
          });
          
          setTshirtOrders(sortedOrders);
        }

        // 차량 변경 정보는 일반 사용자만 필요
        if (userData) {
          // 스케줄 정보 조회 - 차량 변경 마감
          const { data: carChangeData, error: carChangeError } = await supabase
            .from('schedules')
            .select('title, day, end_time')
            .eq('title', '차량 변경 마감')
            .single();

          if (!carChangeError && carChangeData) {
            setCarChangeInfo(carChangeData);
            
            // 현재 시간과 마감 시간 비교
            const now = new Date();
            const endTimeDate = parseDateFromString(carChangeData.end_time);
            
            if (endTimeDate) {
              setIsCarChangeAvailable(now < endTimeDate);
            }
          }
        }

        // 스케줄 정보 조회 - 티셔츠 구매 및 변경 마감 (모든 사용자 유형에 공통)
        const { data: tshirtChangeData, error: tshirtChangeError } = await supabase
          .from('schedules')
          .select('title, day, end_time')
          .eq('title', '티셔츠 예약 마감')
          .single();

        if (!tshirtChangeError && tshirtChangeData) {
          setTshirtChangeInfo(tshirtChangeData);
          
          // 현재 시간과 마감 시간 비교
          const now = new Date();
          const endTimeDate = parseDateFromString(tshirtChangeData.end_time);
          
          if (endTimeDate) {
            setIsTshirtChangeAvailable(now < endTimeDate);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    // 주문 상태 업데이트 함수
    async function updateOrderStatuses(orders: Array<{
      order_id: number;
      order_date: string;
      status: string;
      total_price?: number;
    }>) {
      const now = new Date();
      const oneDayInMs =  60 * 60 * 1000; // 24시간
      
      const ordersToUpdate = orders.filter(order => {
        if (order.status !== '입금확인중') return false;
        
        const orderDate = new Date(order.order_date);
        const timeDiff = now.getTime() - orderDate.getTime();
        
        return timeDiff > oneDayInMs;
      });
      
      if (ordersToUpdate.length > 0) {
        const orderIds = ordersToUpdate.map(order => order.order_id);
        
        // 상태 업데이트
        const { error } = await supabase
          .from('orders')
          .update({ status: '미입금' })
          .in('order_id', orderIds);
          
        if (error) {
          console.error('주문 상태 업데이트 중 오류 발생:', error);
        } else {
          // 로컬 상태도 업데이트
          orders.forEach(order => {
            if (orderIds.includes(order.order_id)) {
              order.status = '미입금';
            }
          });
        }
      }
    }

    loadBankAccount(); // 계좌 정보 로드
    fetchData();
  }, [phoneNumber, router]);

  const handleCarChange = () => {
    if (isCarChangeAvailable) {
      // 카카오톡 오픈채팅 링크로 연결
      window.open('https://open.kakao.com/o/sFUY4Ooh', '_blank');
    }
  };

  // 사이즈별 수량 문자열 생성 함수 (형식 변경)
  const getSizesString = (items: TshirtOrderItem[], color: string) => {
    return items
      .filter(item => item.color === color)
      .map(item => ` ${item.size} ${item.quantity}`)
      .join(', ');
  };

  // 주문확정 모달 열기
  const handleConfirmOrder = (e: React.MouseEvent, order: TshirtOrder) => {
    e.stopPropagation(); // 부모 요소 클릭 방지
    setOrderToConfirm(order);
    setShowConfirmOrder(true);
  };

  // 주문확정 모달 닫기
  const handleCloseConfirmOrder = () => {
    setShowConfirmOrder(false);
    setOrderToConfirm(null);
  };

  // 주문 상태를 주문확정으로 변경
  const confirmOrder = async () => {
    if (!orderToConfirm || confirmLoading) return;
    
    setConfirmLoading(true); // 로딩 상태 시작
    
    try {
      // 1. 주문 상태를 '주문확정'으로 업데이트
      const { error } = await supabase
        .from('orders')
        .update({ status: '주문확정' })
        .eq('order_id', orderToConfirm.order_id);
        
      if (error) throw error;
      
      // 2. confirm_order 테이블에 주문 확정 데이터 저장
      const confirmOrderData = {
        order_id: orderToConfirm.order_id,
        user_phone: phoneNumber,
        confirm_date: new Date().toISOString(),
        name: userInfo?.name || '',
        total_price: orderToConfirm.total_price || calculateTotalPrice(orderToConfirm.items).finalTotal
      };
      
      const { data: confirmData, error: confirmError } = await supabase
        .from('confirm_order')
        .insert(confirmOrderData)
        .select('id')
        .single();
      
      if (confirmError) {
        console.error('주문 확정 데이터 저장 중 오류:', confirmError);
        throw confirmError;
      }
      
      // 3. confirm_order_items 테이블에 주문 항목 데이터 저장
      if (confirmData && confirmData.id) {
        const confirmId = confirmData.id;
        
        // 주문 항목들을 confirm_order_items 테이블에 저장할 데이터로 변환
        const confirmOrderItems = orderToConfirm.items.map(item => ({
          confirm_id: confirmId,
          item_id: item.item_id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price || (item.size === '3XL' ? 11000 : 10000)
        }));
        
        // 주문 항목 데이터 저장
        const { error: itemsError } = await supabase
          .from('confirm_order_items')
          .insert(confirmOrderItems);
        
        if (itemsError) {
          console.error('주문 항목 확정 데이터 저장 중 오류:', itemsError);
          // 주문 항목 저장 실패해도 주문 확정은 유지
          console.warn('주문 항목 저장에 실패했으나, 주문 확정은 처리되었습니다.');
        }
      }
      
      // 4. 로컬 상태 업데이트
      const updatedOrders = tshirtOrders.map(order => 
        order.order_id === orderToConfirm.order_id 
          ? { ...order, status: '주문확정' } 
          : order
      );
      
      setTshirtOrders(updatedOrders);
      setShowConfirmOrder(false);
      setOrderToConfirm(null);
      
      alert('주문이 확정되었습니다.');
    } catch (error) {
      console.error('주문 확정 중 오류 발생:', error);
      alert('주문 확정 처리 중 오류가 발생했습니다.');
    } finally {
      setConfirmLoading(false); // 로딩 상태 종료
    }
  };
  
  // 총 가격 계산 함수 (주문 확정용)
  const calculateTotalPrice = (items: TshirtOrderItem[]) => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const baseTotal = items.reduce((sum, item) => {
      // 3XL은 11,000원, 나머지는 10,000원
      const itemPrice = item.size === '3XL' ? 11000 : 10000;
      return sum + (itemPrice * item.quantity);
    }, 0);
    
    // 2장 이상 주문 시 장당 1,000원 할인
    const discountAmount = totalQuantity >= 2 ? totalQuantity * 1000 : 0;
    const finalTotal = baseTotal - discountAmount;
    
    return {
      baseTotal,
      discountAmount,
      finalTotal
    };
  };
  
  // 주문 상태에 따른 색상 반환
  const getStatusColor = (status: string) => {
    switch(status) {
      case '미입금':
        return '#F8D7DA';
      case '입금확인중':
        return '#fff3cd';
      case '입금완료':
        return '#D4EDDA';
      case '취소됨':
        return '#E2E3E5';
      case '주문확정':
        return '#ed2725'; // 빨간색으로 변경
      default:
        return '#8c8c8c';
    }
  };

  if (!isAuthenticated || !phoneNumber) {
    return null;
  }

  if (loading) {
    return (
      <PageLayout>
        <S.Container>
          <S.LoadingWrapper>
            로딩 중...
          </S.LoadingWrapper>
        </S.Container>
      </PageLayout>
    );
  }

  if (!userInfo) {
    return (
      <PageLayout>
        <S.Container>
          <S.ErrorWrapper>
            사용자 정보를 찾을 수 없습니다.
            <S.RetryButton onClick={() => window.location.reload()}>
              다시 시도
            </S.RetryButton>
          </S.ErrorWrapper>
        </S.Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <S.Container>        
       
        {showConfirmation && selectedOrder && (
          <OrderConfirmation 
            order={selectedOrder}
            onClose={handleCloseConfirmation}
          />
        )}
        
        {showConfirmOrder && orderToConfirm && (
          <S.ModalContainer>
            <S.ModalSheet>
              <S.ModalTitle>주문 확정</S.ModalTitle>
              
              <S.Section>
                <S.ModalSectionTitle>주문 정보</S.ModalSectionTitle>
                <S.OrderList>
                  {Array.from(new Set(orderToConfirm.items.map((item: TshirtOrderItem) => item.color))).map((color: string) => (
                    <S.OrderItem key={color}>
                      <S.ProductName>
                        {color}
                      </S.ProductName>
                      <S.ProductDetails>
                        {orderToConfirm.items
                          .filter((item: TshirtOrderItem) => item.color === color)
                          .map((item: TshirtOrderItem) => `${item.size} ${item.quantity}개`)
                          .join(', ')}
                      </S.ProductDetails>
                    </S.OrderItem>
                  ))}
                </S.OrderList>
              </S.Section>
              
              <S.ConfirmText>이 주문을 확정하시겠습니까?</S.ConfirmText>
              <S.ConfirmNote>주문 확정 후에는 변경이 불가능합니다.</S.ConfirmNote>
              
              <S.ButtonGroup>
                <S.CancelButton onClick={handleCloseConfirmOrder} disabled={confirmLoading}>취소</S.CancelButton>
                <S.RedConfirmButton 
                  onClick={confirmOrder} 
                  disabled={confirmLoading}
                >
                  {confirmLoading ? (
                    <>
                      <S.LoadingSpinner />
                      처리 중...
                    </>
                  ) : '확인'}
                </S.RedConfirmButton>
              </S.ButtonGroup>
            </S.ModalSheet>
            <S.ModalOverlay onClick={confirmLoading ? undefined : handleCloseConfirmOrder} />
          </S.ModalContainer>
        )}
        
        {showQRCode && (
          <S.ModalContainer>
            <S.ModalSheet>
              <S.ModalTitle>교환권</S.ModalTitle>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                {selectedOrder && selectedOrder.status === '주문확정' && (
                  <>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedQRData}`} 
                      alt="QR 코드" 
                      style={{ width: '200px', height: '200px' }} 
                    />
                    
                    {/* 수동 입력용 코드 표시 */}
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '10px', 
                      backgroundColor: '#f0f9ff', 
                      borderRadius: '8px',
                      border: '1px solid #bae6fd',
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: '300px'
                    }}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        color: '#1e40af',
                        padding: '5px',
                        letterSpacing: '0.5px'
                      }}>
                        {selectedQRData}
                      </div>
                    </div>
                  </>
                )}
                
                {/* 주문 정보 표시 */}
                {tshirtOrders.map(order => {
                  const [orderId] = selectedQRData.split('-');
                  if (order.order_id.toString() === orderId) {
                    return (
                      <div key={order.order_id} style={{
                        marginTop: '20px',
                        width: '100%',
                        maxWidth: '300px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '15px'
                      }}>
                        {/* 주문자 정보 - 크게 표시 */}
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold',
                          color: '#1f2937',
                          textAlign: 'center',
                          marginBottom: '20px',
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px'
                        }}>
                          {order.name}
                        </div>
                        
                        {/* 주문 상품 정보 - 크게 표시 */}
                        <div style={{ 
                          marginTop: '15px', 
                          marginBottom: '20px',
                          padding: '15px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px'
                        }}>
                          {Array.from(new Set(order.items.map(item => item.color))).map((color) => (
                            <div key={color} style={{ 
                              marginBottom: '15px',
                              backgroundColor: '#ffffff',
                              padding: '10px',
                              borderRadius: '6px',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}>
                              <div style={{ 
                                color: '#1f2937', 
                                fontSize: '22px', 
                                fontWeight: '700',
                                marginBottom: '5px',
                                textAlign: 'center'
                              }}>
                                {color}
                              </div>
                              <div style={{ 
                                color: '#4b5563', 
                                fontSize: '18px', 
                                fontWeight: '500',
                                textAlign: 'center'
                              }}>
                                {order.items
                                  .filter(item => item.color === color)
                                  .map(item => `${item.size} ${item.quantity}개`)
                                  .join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* 기타 정보 - 작게 표시 */}
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          borderTop: '1px solid #e5e7eb',
                          paddingTop: '10px',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>주문번호: #{order.order_id}</span>
                          <span>상태: 
                            <span style={{ 
                              display: 'inline-block',
                              marginLeft: '5px',
                              padding: '2px 6px',
                              backgroundColor: getStatusColor(order.status),
                              color: order.status === '주문확정' ? '#ffffff' : 'inherit',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {order.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              <S.ButtonGroup>
                <S.CancelButton onClick={handleCloseQRCode}>닫기</S.CancelButton>
              </S.ButtonGroup>
            </S.ModalSheet>
            <S.ModalOverlay onClick={handleCloseQRCode} />
          </S.ModalContainer>
        )}
        
        <S.Content>
          <S.Title>{userInfo.name}</S.Title>
          <S.Subtitle>{userInfo.group_name}</S.Subtitle>

          {/* 일반 사용자만 차량 정보 표시 */}
          {userType === 'normal' && (
            <S.Section>
              <S.SectionTitle>차량 정보</S.SectionTitle>
              <S.TimeInfo>
                <S.TimeBlock>
                  <S.TimeLabel>출발 차량</S.TimeLabel>
                  <S.Time>{userInfo.departure_time}</S.Time>
                </S.TimeBlock>
                <S.TimeBlock>
                  <S.TimeLabel>복귀 차량</S.TimeLabel>
                  <S.Time>{userInfo.return_time}</S.Time>
                </S.TimeBlock>
              </S.TimeInfo>
              {isCarChangeAvailable && carChangeInfo ? (
                <S.ChangeNotice onClick={handleCarChange}>
                  <S.ChangeIcon>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.99995 1.67332C9.93462 1.67332 12.3266 4.06528 12.3266 6.99995C12.3266 9.93462 9.93462 12.3266 6.99995 12.3266C4.06528 12.3266 1.67332 9.93462 1.67332 6.99995C1.67332 4.06528 4.06528 1.67332 6.99995 1.67332ZM6.99995 0.467285C3.39191 0.467285 0.467285 3.39191 0.467285 6.99995C0.467285 10.608 3.39191 13.5326 6.99995 13.5326C10.608 13.5326 13.5326 10.608 13.5326 6.99995C13.5326 3.39191 10.608 0.467285 6.99995 0.467285Z" fill="#000000"/>
                      <path d="M7.603 6.26636H6.39697V10.2865H7.603V6.26636Z" fill="#000000"/>
                      <path d="M6.99986 3.75391C6.5878 3.75391 6.24609 4.08556 6.24609 4.50768C6.24609 4.92979 6.5878 5.26144 6.99986 5.26144C7.41192 5.26144 7.75363 4.91974 7.75363 4.50768C7.75363 4.09561 7.42197 3.75391 6.99986 3.75391Z" fill="#000000"/>
                    </svg>
                  </S.ChangeIcon>
                  <S.ChangeText>
                  차량정보 변경하기({carChangeInfo.day}까지)
                  </S.ChangeText>
                </S.ChangeNotice>
              ) : (
                <S.Note>차량 변경 기간 마감</S.Note>
              )}
            </S.Section>
          )}

          <S.Section>
            <S.SectionTitle>티셔츠 정보</S.SectionTitle>
            {tshirtOrders.length > 0 ? (
              <>
                <S.OrderCardCarousel>
                  <S.OrderCardsSlider
                    ref={sliderRef}
                    className={isDragging ? 'dragging' : ''}
                    style={getSliderStyle()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove as any}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleTouchStart}
                    onMouseMove={handleTouchMove as any}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                  >
                    {tshirtOrders.map((order) => (
                      <S.OrderCard 
                        key={order.order_id} 
                        onClick={order.status !== '취소됨' ? () => {
                          if (order.status === '주문확정' || order.status === '수령완료') {
                            handleOpenQRCode(order.order_id);
                          } else {
                            handleViewOrderDetails(order);
                          }
                        } : undefined}
                        style={{
                          ...(order.status === '주문확정' || order.status === '수령완료' ? {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          } : {})
                        }}
                      >
                        <S.OrderHeader style={order.status === '주문확정' || order.status === '수령완료' ? { width: '100%' } : {}}>
                          <S.OrderStatus 
                            status={order.status}
                            style={{ 
                              backgroundColor: getStatusColor(order.status),
                              color: (order.status === '주문확정' || order.status === '수령완료') ? '#ffffff' : 'inherit'
                            }}
                          >
                            {order.status}
                          </S.OrderStatus>
                          <S.OrderNumber>주문 #{order.order_id}</S.OrderNumber>
                        </S.OrderHeader>
                        
                        <S.OrderSummary style={order.status === '주문확정' || order.status === '수령완료' ? { alignItems: 'center' } : {}}>
                          {(order.status === '주문확정') && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenQRCode(order.order_id);
                              }} 
                              style={{ 
                                marginBottom: '16px', 
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                              }}
                            >
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${generateQRData(order.order_id)}`} 
                                alt="QR 코드" 
                                style={{ width: '100px', height: '100px' }} 
                              />
                              <div style={{ fontSize: '12px', marginTop: '4px', textAlign: 'center', color: '#000' }}>
                                클릭하여 확대
                              </div>
                            </div>
                          )}
                          
                          {Array.from(new Set(order.items.map(item => item.color))).map(color => (
                            <React.Fragment key={color}>
                              <S.ColorRow>
                                <S.ItemColor>{color}</S.ItemColor>
                                <S.ItemSizes>{getSizesString(order.items, color)}</S.ItemSizes>
                              </S.ColorRow>
                            </React.Fragment>
                          ))}
                        </S.OrderSummary>
                        
                        <S.OrderActionsContainer>
                          {/* 입금완료 상태면 주문확정 버튼 표시 */}
                          {order.status === '입금완료' && (
                            <S.ConfirmOrderButton 
                              onClick={(e) => handleConfirmOrder(e, order)}
                            >
                              주문확정
                            </S.ConfirmOrderButton>
                          )}
                          
                          {/* 취소된 항목은 버튼 제거, 상세정보 보기 등 */}
                          {order.status !== '취소됨' && !isDeadlinePassed() && (
                            order.status === '입금완료' ? (
                              <></>
                            ) : (
                              <S.ViewDetailText>
                                상세정보 보기
                                <S.ViewDetailIcon>›</S.ViewDetailIcon>
                              </S.ViewDetailText>
                            )
                          )}
                        </S.OrderActionsContainer>
                      </S.OrderCard>
                    ))}
                  </S.OrderCardsSlider>
                </S.OrderCardCarousel>
                
                {/* 주문 인디케이터 */}
                {tshirtOrders.length > 1 && (
                  <S.Indicators>
                    {tshirtOrders.map((_, index) => (
                      <S.IndicatorDot
                        key={index}
                        active={currentCard === index}
                        onClick={() => handleDotClick(index)}
                      />
                    ))}
                  </S.Indicators> 
                )}
                
                {/* 변경 가능 기간 안내 */}
                {isTshirtChangeAvailable && tshirtChangeInfo ? (
                  <S.ChangeNotice >
                    <S.ChangeIcon>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.99995 1.67332C9.93462 1.67332 12.3266 4.06528 12.3266 6.99995C12.3266 9.93462 9.93462 12.3266 6.99995 12.3266C4.06528 12.3266 1.67332 9.93462 1.67332 6.99995C1.67332 4.06528 4.06528 1.67332 6.99995 1.67332ZM6.99995 0.467285C3.39191 0.467285 0.467285 3.39191 0.467285 6.99995C0.467285 10.608 3.39191 13.5326 6.99995 13.5326C10.608 13.5326 13.5326 10.608 13.5326 6.99995C13.5326 3.39191 10.608 0.467285 6.99995 0.467285Z" fill="#000000"/>
                        <path d="M7.603 6.26636H6.39697V10.2865H7.603V6.26636Z" fill="#000000"/>
                        <path d="M6.99986 3.75391C6.5878 3.75391 6.24609 4.08556 6.24609 4.50768C6.24609 4.92979 6.5878 5.26144 6.99986 5.26144C7.41192 5.26144 7.75363 4.91974 7.75363 4.50768C7.75363 4.09561 7.42197 3.75391 6.99986 3.75391Z" fill="#000000"/>
                      </svg>
                    </S.ChangeIcon>
                    <S.ChangeText>
                    사이즈 변경하기({tshirtChangeInfo.day}까지)
                    </S.ChangeText>
                  </S.ChangeNotice>
                ) : (
                  <S.Note>티셔츠 구매 및 변경 기간 마감</S.Note>
                )}
              </>
            ) : (
              <S.TshirtMessage>
                <S.InfoIcon>i</S.InfoIcon>
                {userType === 'tshirt' ? '아직 티셔츠를 구매하지 않았어요.' : '티셔츠를 구매하지 않았어요.'}
              </S.TshirtMessage>
            )}
          </S.Section>

          {/* 새로운 메뉴 섹션 추가 */}
          <S.Section>
            <S.SectionTitle>허브업 정보</S.SectionTitle>
            <S.MenuGrid>
              <S.MenuItem onClick={handleMealsClick}>
                <S.MenuIcon>🍽️</S.MenuIcon>
                <S.MenuText>식단표</S.MenuText>
              </S.MenuItem>
              
              <S.MenuItem onClick={handleAccommodationClick}>
                <S.MenuIcon>🏠</S.MenuIcon>
                <S.MenuText>숙소 정보</S.MenuText>
              </S.MenuItem>
              
              <S.MenuItem onClick={handleLostItemsClick}>
                <S.MenuIcon>🔍</S.MenuIcon>
                <S.MenuText>분실물</S.MenuText>
              </S.MenuItem>
              
              <S.MenuItem onClick={handleAnnouncementsClick}>
                <S.MenuIcon>📢</S.MenuIcon>
                <S.MenuText>공지사항</S.MenuText>
              </S.MenuItem>
              
              <S.MenuItem onClick={handleFaqClick}>
                <S.MenuIcon>❓</S.MenuIcon>
                <S.MenuText>FAQ</S.MenuText>
              </S.MenuItem>
            </S.MenuGrid>
          </S.Section>

          <S.LogoutButton onClick={logout}>로그아웃</S.LogoutButton>    
        </S.Content>
      </S.Container>
    </PageLayout>
  );
} 