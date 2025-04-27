import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import Head from 'next/head';
import AdminLayout from '@src/components/AdminLayout';
import { verifyQRCodeAndUpdateStatus } from '@src/lib/api/admin';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function TshirtPickupPage() {
  const [qrData, setQrData] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ 
    success: boolean;
    message: string;
    orderData?: any;
  } | null>(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  // 현재 환경이 보안 컨텍스트인지 확인
  const isSecureContext = typeof window !== 'undefined' && 
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost');
  
  // 스캐너 초기화
  useEffect(() => {
    // 브라우저 환경 & 보안 컨텍스트에서만 실행
    if (typeof window === 'undefined') return;
    
    if (!isSecureContext) {
      setScannerError('카메라 접근은 HTTPS 또는 localhost 환경에서만 지원됩니다');
      console.error('보안 컨텍스트가 아닙니다. HTTPS 또는 localhost 환경이 필요합니다.');
      return;
    }

    try {
      // 기존 스캐너 정리
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("이전 스캐너 정리 중 오류:", error);
        }
      }

      // 스캐너 엘리먼트가 있는지 확인
      const qrContainer = document.getElementById('qr-reader');
      if (!qrContainer) {
        console.error("QR 스캐너 컨테이너를 찾을 수 없습니다");
        return;
      }

      // 스캐너 설정
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1,
        },
        /* verbose= */ false
      );
      
      console.log("스캐너 초기화 시작");
      
      // 스캐너 렌더링
      scannerRef.current.render(
        (decodedText: string) => {
          console.log("QR 코드 스캔 성공:", decodedText);
          handleQRCodeScan(decodedText);
        },
        (errorMessage: string) => {
          console.error("QR 코드 스캔 오류:", errorMessage);
          
          // 카메라 접근 오류 처리
          if (errorMessage.includes('Camera access')) {
            setScannerError('카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
          }
        }
      );
      
      console.log("스캐너 초기화 완료");
      setScannerInitialized(true);
    } catch (error) {
      console.error("QR 스캐너 초기화 오류:", error);
      setScannerError('QR 스캐너 초기화 중 오류가 발생했습니다. 수동 입력을 이용해주세요.');
    }

    // 컴포넌트 언마운트 시 스캐너 정리
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
          console.log("스캐너 정리 완료");
        } catch (error) {
          console.error("QR 스캐너 정리 중 오류:", error);
        }
      }
    };
  }, []); // 의존성 배열 비움 - 마운트 시 한 번만 실행

  // QR 코드 스캔 처리
  const handleQRCodeScan = async (decodedText: string) => {
    if (processing) return;
    
    console.log("QR 코드 데이터 처리 시작:", decodedText);
    
    // 스캐너 일시 중지
    try {
      if (scannerRef.current) {
        scannerRef.current.pause(true);
      }
    } catch (error) {
      console.error("스캐너 일시 중지 중 오류:", error);
    }
    
    setQrData(decodedText);
    await processQRCode(decodedText);
    
    // 5초 후 스캐너 재시작
    setTimeout(() => {
      try {
        if (scannerRef.current) {
          scannerRef.current.resume();
        }
      } catch (error) {
        console.error("스캐너 재시작 중 오류:", error);
      }
    }, 5000);
  };

  // QR 코드 처리 로직
  const processQRCode = async (code: string) => {
    setProcessing(true);
    setResult(null);
    
    try {
      const verificationResult = await verifyQRCodeAndUpdateStatus(code);
      setResult(verificationResult);
    } catch (error) {
      console.error("QR 코드 처리 중 오류:", error);
      setResult({
        success: false,
        message: "처리 중 오류가 발생했습니다."
      });
    } finally {
      setProcessing(false);
    }
  };

  // 수동 입력 처리
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim() || processing) return;
    
    await processQRCode(manualInput);
  };

  // 결과 초기화
  const resetResult = () => {
    setResult(null);
    setManualInput('');
  };

  return (
    <>
      <Head>
        <title>티셔츠 수령 확인 | 허브 커뮤니티</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <AdminLayout title="티셔츠 수령 확인">
        <PageContainer>
          {isSecureContext && !scannerError && (
            <Section>
              <SectionTitle>QR 코드 스캔</SectionTitle>
              <SectionDescription>
                사용자의 QR 코드를 스캔하여 티셔츠 수령을 확인합니다.
                {!scannerInitialized && <div style={{color: 'red'}}>스캐너 초기화 중...</div>}
              </SectionDescription>
              
              <ScannerContainer>
                <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
                {/* 스캐너 상태 표시 */}
                {qrData && (
                  <ScannerStatus>
                    마지막 스캔: {qrData}
                  </ScannerStatus>
                )}
              </ScannerContainer>
            </Section>
          )}
          
          {scannerError && (
            <ErrorSection>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorTitle>QR 스캐너를 사용할 수 없습니다</ErrorTitle>
              <ErrorMessage>{scannerError}</ErrorMessage>
              <ErrorHint>
                아래 수동 입력 방식을 사용하여 QR 코드 데이터를 입력하세요.
              </ErrorHint>
            </ErrorSection>
          )}
          
          <Section>
            <SectionTitle>
              {scannerError ? '수동 입력 (대체 방식)' : '수동 입력'}
            </SectionTitle>
            <SectionDescription>
              QR 코드를 스캔할 수 없는 경우 아래에 직접 입력하세요. (형식: 주문번호-전화번호)
            </SectionDescription>
            
            <ManualForm onSubmit={handleManualSubmit}>
              <ManualInput
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="예: 123-01012345678"
                disabled={processing}
              />
              <ManualButton type="submit" disabled={processing || !manualInput.trim()}>
                {processing ? '처리 중...' : '확인'}
              </ManualButton>
            </ManualForm>
          </Section>
          
          {result && (
            <ResultSection success={result.success}>
              <ResultIcon>{result.success ? '✅' : '❌'}</ResultIcon>
              <ResultMessage>{result.message}</ResultMessage>
              
              {result.success && result.orderData && (
                <OrderDetails>
                  <OrderDetailItem>
                    <Label>주문번호:</Label>
                    <Value>#{result.orderData.order_id}</Value>
                  </OrderDetailItem>
                  <OrderDetailItem>
                    <Label>주문자:</Label>
                    <Value>{result.orderData.name}</Value>
                  </OrderDetailItem>
                  <OrderDetailItem>
                    <Label>연락처:</Label>
                    <Value>{result.orderData.user_phone}</Value>
                  </OrderDetailItem>
                  <OrderDetailItem>
                    <Label>상태:</Label>
                    <StatusBadge>{result.orderData.status}</StatusBadge>
                  </OrderDetailItem>
                </OrderDetails>
              )}
              
              <CloseButton onClick={resetResult}>닫기</CloseButton>
            </ResultSection>
          )}
          
          <Instructions>
            <InstructionsTitle>사용 방법</InstructionsTitle>
            <InstructionsList>
              <InstructionItem>
                1. 사용자에게 MyInfo 페이지의 QR 코드를 보여달라고 요청하세요.
              </InstructionItem>
              <InstructionItem>
                2. {scannerError ? 
                  '사용자의 QR 코드에 적힌 정보를 수동으로 입력하세요.' : 
                  '카메라로 QR 코드를 스캔하거나, QR 코드에 적힌 정보를 수동으로 입력하세요.'}
              </InstructionItem>
              <InstructionItem>
                3. 확인 버튼을 누르면 수령 여부가 자동으로 시스템에 기록됩니다.
              </InstructionItem>
              <InstructionItem>
                4. 확인 완료 메시지가 표시되면 사용자에게 티셔츠를 전달하세요.
              </InstructionItem>
            </InstructionsList>
          </Instructions>
        </PageContainer>
      </AdminLayout>
    </>
  );
}

// 스타일 컴포넌트
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 767px) {
    padding: 0;
  }
`;

const Section = styled.section`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  
  @media (max-width: 767px) {
    padding: 16px;
    border-radius: 4px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
`;

const ScannerContainer = styled.div`
  margin-top: 16px;
  
  @media (max-width: 767px) {
    margin-top: 12px;
  }
  
  /* HTML5 QR 스캐너 스타일 커스터마이징 */
  #qr-reader {
    border: none !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    
    @media (max-width: 767px) {
      border-radius: 4px;
    }
  }
  
  #qr-reader__status_span {
    background-color: #f3f4f6;
    color: #374151;
    font-size: 14px;
    padding: 8px;
  }
  
  #qr-reader__dashboard_section_csr button {
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    margin: 8px;
  }
`;

const ManualForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const ManualInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;

const ManualButton = styled.button`
  padding: 0 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const ResultSection = styled.div<{ success: boolean }>`
  background-color: ${props => props.success ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.success ? '#10b981' : '#ef4444'};
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 767px) {
    padding: 16px;
  }
`;

const ResultIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ResultMessage = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
`;

const OrderDetails = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  max-width: 400px;
  margin-bottom: 16px;
`;

const OrderDetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const Value = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background-color: #3b82f6;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  padding: 8px 16px;
  background-color: #4b5563;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #374151;
  }
`;

const Instructions = styled.div`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  
  @media (max-width: 767px) {
    padding: 12px;
  }
`;

const InstructionsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
`;

const InstructionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InstructionItem = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
`;

const ScannerStatus = styled.div`
  margin-top: 10px;
  padding: 8px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  font-size: 14px;
  color: #0369a1;
  text-align: center;
`;

// 스타일 컴포넌트 추가
const ErrorSection = styled.div`
  background-color: #fff4e5;
  border: 1px solid #ffcc80;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 767px) {
    padding: 16px;
  }
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #d97706;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: #92400e;
  margin: 0 0 16px 0;
`;

const ErrorHint = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #78350f;
  margin: 0;
`; 