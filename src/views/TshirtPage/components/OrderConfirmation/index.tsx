import React, { useState, useRef, useEffect } from 'react';
import * as S from './style';

interface CartItem {
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface BankAccount {
  bank: string;
  account: string;
  holder: string;
}

interface OrderConfirmationProps {
  cartItems: CartItem[];
  totalPrice: number;
  bankAccount: BankAccount;
  onCancel: () => void;
  onConfirm: (depositorName: string) => void;
  formatPrice: (price: number) => string;
  userName?: string;
  userPhone?: string;
}

export default function OrderConfirmation({
  cartItems,
  totalPrice,
  bankAccount,
  onCancel,
  onConfirm,
  formatPrice,
  userName = '',
  userPhone = ''
}: OrderConfirmationProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [depositorName, setDepositorName] = useState<string>('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // 초기 입금자명 설정
  useEffect(() => {
    // 사용자 이름과 전화번호 뒷자리(있는 경우)를 합쳐서 입금자명 생성
    const phoneLastDigits = userPhone ? userPhone.slice(-4) : '';
    const initialDepositorName = userName + (phoneLastDigits ? phoneLastDigits : '');
    setDepositorName(initialDepositorName);
  }, [userName, userPhone]);

  const copyToClipboard = (text: string, type: string) => {
    try {
      let copyText = '';
      
      if (type === 'account') {
        copyText = `${bankAccount.bank} ${bankAccount.account}`;
      } else if (type === 'depositor') {
        copyText = depositorName;
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

  return (
    <S.Container>
      <S.Sheet>
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
        
        <S.Title>주문 확인</S.Title>
        
        <S.Section>
          <S.SectionTitle>주문 상품</S.SectionTitle>
          <S.OrderList>
            {cartItems.map((item, index) => (
              <S.OrderItem key={index}>
                <S.OrderInfo>
                  <S.ProductName>
                    {item.color} / {item.size}
                  </S.ProductName>
                  <S.ProductDetails>
                    수량: {item.quantity}개
                  </S.ProductDetails>
                </S.OrderInfo>
                <S.ItemPrice>
                  {formatPrice(item.price * item.quantity)}
                </S.ItemPrice>
              </S.OrderItem>
            ))}
          </S.OrderList>
        </S.Section>
        
        <S.Section>
          <S.SectionTitle>결제 정보</S.SectionTitle>
          <S.PaymentInfo>
            <S.InfoRow>
              <S.InfoLabel>총 상품 금액</S.InfoLabel>
              <S.InfoValue highlight>{formatPrice(totalPrice)}</S.InfoValue>
            </S.InfoRow>
          </S.PaymentInfo>
        </S.Section>
        
        <S.Section>
          <S.SectionTitle>입금 계좌 정보</S.SectionTitle>
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
          <S.SectionTitle>입금자 정보</S.SectionTitle>
          <S.DepositorInfo>
            <S.InfoInputRow>
              <S.InfoLabel>입금자명</S.InfoLabel>
              <S.DepositorInput 
                value={depositorName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepositorName(e.target.value)}
                placeholder="이름+전화번호 뒷자리 (예: 홍길동1234)"
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
          <S.CancelButton onClick={onCancel}>뒤로가기</S.CancelButton>
          <S.ConfirmButton onClick={() => onConfirm(depositorName)}>예약하기</S.ConfirmButton>
        </S.ButtonGroup>
      </S.Sheet>
      <S.Overlay onClick={onCancel} />
    </S.Container>
  );
} 