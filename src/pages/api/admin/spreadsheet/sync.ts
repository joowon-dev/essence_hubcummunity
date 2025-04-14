import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@src/lib/supabase';
import { google } from 'googleapis';

// 환경 변수에서 설정 가져오기
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

// Google Sheets API 접근을 위한 설정
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "";
const SHEET_NAME = process.env.SHEET_NAME || "웹데이터이관용셀";

// Google API 인증 정보
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : "";
const PROJECT_ID = process.env.PROJECT_ID || "";

// 사용자 인터페이스 정의
interface UserData {
  [key: string]: any;
  phone_number: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '허용되지 않는 메서드입니다.' });
  }

  try {
    // 환경 변수 확인
    if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !PROJECT_ID) {
      return res.status(500).json({ 
        message: '환경 변수가 올바르게 설정되지 않았습니다.',
        missingVars: {
          spreadsheetId: !SPREADSHEET_ID,
          serviceAccountEmail: !SERVICE_ACCOUNT_EMAIL,
          privateKey: !PRIVATE_KEY,
          projectId: !PROJECT_ID
        }
      });
    }

    // Google Sheets API 접근을 위한 인증
    const auth = new google.auth.JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      projectId: PROJECT_ID
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // 스프레드시트 데이터 가져오기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:Z1000`, // 필요한 범위 조정
    });
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '스프레드시트에서 데이터를 찾을 수 없습니다.' });
    }
    
    // 헤더(첫 번째 행)는 컬럼명으로 사용
    const headers = rows[0] as string[];
    const usersMap = new Map<string, UserData>(); // 중복된 전화번호를 처리하기 위한 맵
    
    // phone_number 필드의 인덱스 찾기
    const phoneNumberIndex = headers.indexOf('phone_number');
    
    if (phoneNumberIndex === -1) {
      return res.status(400).json({ message: 'phone_number 필드를 찾을 수 없습니다.' });
    }
    
    // 각 행을 객체로 변환 (phone_number가 비어있지 않은 경우만)
    for (let i = 1; i < rows.length; i++) {
      const phoneNumber = rows[i][phoneNumberIndex];
      
      if (phoneNumber && phoneNumber.toString().trim() !== '') {
        const user: UserData = { phone_number: phoneNumber.toString().trim() };
        let hasError = false;
        
        for (let j = 0; j < headers.length; j++) {
          // #VALUE! 오류 확인
          if (rows[i][j] && rows[i][j].toString().includes('#VALUE!')) {
            hasError = true;
            break;
          }
          
          // 헤더 이름과 값 매핑
          const headerName = headers[j];
          
          // boolean 타입 필드인 경우 적절히 변환
          if (typeof rows[i][j] === 'string' && (rows[i][j] === 'true' || rows[i][j] === 'false')) {
            user[headerName] = rows[i][j] === 'true';
          } else if (!rows[i][j] || rows[i][j] === '') {
            // 빈 문자열은 null로 처리
            user[headerName] = null;
          } else {
            user[headerName] = rows[i][j];
          }
        }
        
        if (!hasError) {
          // 중복된 phone_number가 있는 경우, 이전 데이터를 덮어씁니다 (가장 마지막 행 우선)
          usersMap.set(user.phone_number, user);
        }
      }
    }
    
    // Map에서 최종 사용자 배열 생성
    const users = Array.from(usersMap.values());
    
    // 동기화 결과 저장
    let successCount = 0;
    let failCount = 0;
    
    // 처리할 사용자가 없는 경우
    if (users.length === 0) {
      return res.status(200).json({
        totalProcessed: 0,
        successCount: 0,
        failCount: 0,
        lastSyncTime: new Date().toISOString(),
        message: 'phone_number 필드가 있는 행이 없습니다.'
      });
    }
    
    // Supabase에 데이터 전송
    for (const user of users) {
      try {
        // Supabase에 사용자 추가 또는 업데이트
        const { error } = await supabase
          .from('users')
          .upsert([user], {
            onConflict: 'phone_number', // phone_number를 기준으로 충돌 처리
            ignoreDuplicates: false // 중복 무시하지 않고 업데이트
          });
        
        if (error) {
          console.error('사용자 업데이트 오류:', error);
          failCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error('사용자 처리 중 예외 발생:', error);
        failCount++;
      }
    }
    
    // 결과 반환
    return res.status(200).json({
      totalProcessed: users.length,
      successCount,
      failCount,
      lastSyncTime: new Date().toISOString(),
      // 원본 데이터를 클라이언트로 보냄
      users: users
    });
  } catch (error: any) {
    console.error('동기화 중 오류 발생:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// 테스트용 모의 데이터 생성 함수
function simulateSpreadsheetData() {
  // 모의 사용자 데이터 (테스트 및 데모용)
  const users = Array.from({ length: 15 }, (_, i) => ({
    phone_number: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
    name: `테스트사용자${i + 1}`,
    password: `password${i + 1}`,
    group_name: ['A조', 'B조', 'C조'][Math.floor(Math.random() * 3)],
    departure_time: ['09:00', '10:00', '11:00'][Math.floor(Math.random() * 3)],
    return_time: ['17:00', '18:00', '19:00'][Math.floor(Math.random() * 3)],
    is_admin: i === 0 // 첫 번째 사용자는 관리자로 설정
  }));
  
  return { users };
} 