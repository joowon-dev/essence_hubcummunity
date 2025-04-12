-- FAQ 데이터 추가
INSERT INTO faqs (tag, title, contents, display_order, is_visible) VALUES
('접수', 'Q. 접수 마감기한은 언제까지인가요?', 'A. 접수 마감은 4/29(화) 23:59 입니다! 
그러나 정원 700명이 선착순으로 다 차게 될 경우, 
**조기마감** 될 수 있습니다.', 1, true),

('접수', 'Q. 신청 마감이 되면, 추가 신청은 따로 없나요?', 'A. 
신청이 마감됐을 경우 대기자 폼 작성바랍니다. 
(대기자 폼: https://forms.gle/JS4WyrEYzt4oTeLq6)
취소자 발생 시 대기 폼을 작성하신 순서대로 
신청하실 수 있도록 개별 연락 드릴 예정입니다.', 2, true),

('접수', 'Q. 접수 확인 문자를 받지 못했어요!', 'A.
(i)
''미입금자''라면?
: 미입금자분들에게는 접수 확인 문자가 아닌, 
''미입금 알림 문자''를 드릴 예정입니다. 
미입금 문자를 받고 바로 입금 완료하시면, 
차주 수요일에 접수 확인 문자를 받아보실 수 있습니다!

(ii)
''입금자''라면?
: 입금자인데 접수 확인 문자를 받지 못하셨다면,
휴대폰 데이터를 켜서 문자 수신 여부를 먼저 확인해주세요. 
그럼에도 받지 못하셨다면 서기MC(010-7413-0105)에게 연락바랍니다.

(iii)
''수요일 18시 이후 신청자''라면?
: 수요일 18시 이후 신청자들은 차주 수요일에 
접수 완료 문자를 받아보실 수 있습니다.', 3, true),

('접수', 'Q. 접수를 취소 하고 싶어요!', 'A.
접수 취소를 원하실 경우, 서기MC(010-7413-0105)에게
연락주셔서 ''이름/소속'' 말씀 부탁드립니다.

※ 환불은 5월 7일 (수) 23:59 까지만 가능하며, 
이후 접수 취소하실 경우, 환불은 불가능한채로 
접수만 취소됨을 안내드립니다. ※', 4, true),

('회비', 'Q. 환불 기한은 언제까지 가능한가요?', 'A. 환불은 5월 7일 (수) 23:59 까지 가능합니다. 그 이후에는 어떤 사유로도 환불이 불가능합니다. (독감, 질병 등 당일에 불가피하게 생기는 사유도 환불 불가)', 5, true),

('회비', 'Q. 부분참 회비는 얼마인가요?', 'A. 부분참 회비도 전참 회비와 동일합니다. 
 얼리버드 80,000원 (4/13~27), 일반(4/28~29) 85,000원', 6, true),

('회비', 'Q. 입금자명에 뒷자리 번호를 입력하지 못했는데 어떡하죠?', 'A. 회계MC 서재인 (010-5614-7688)으로 입금하신 시각 & 전화번호 뒷자리 전달 부탁드립니다.', 7, true),

('차량', 'Q.차량 시간 변경 가능할까요?', 'A. 네 가능합니다. 
차량문의 오픈채팅(https://open.kakao.com/o/sFUY4Ooh)으로 연락주세요.
단, 특별한 상황이 아닌 경우 변경 불가합니다.

※변경은 5월9일 23:59까지만 가능하며
이후 변경은 불가능합니다.', 8, true),

('차량', 'Q. 주차 가능한가요?', 'A. 네 가능합니다. 
자차 안내 연락을 못 받으셨다면
국내선교mc 김상훈(010-8936-1892)으로 연락주세요.', 9, true),

('차량', 'Q. 차량 확정 됐는지 알 수 있을까요?', 'A. 5월 3일부터 확정 문자가 발송될 예정입니다.
5월 7일 이후 연락을 못 받으셨다면
국내선교mc 김상훈(010-8936-1892)으로 연락주세요.', 10, true),

('티셔츠', 'Q. 티셔츠 사이즈를 변경하고 싶어요!', 'A. 예약 수량 만큼 제작하여 4/28(월)까지만 변경이 가능하며, 
티셔츠 오픈채팅(https://open.kakao.com/o/scWel1ph)로 문의해주세요.', 11, true),

('티셔츠', 'Q. 티셔츠는 언제, 어디서 받을 수 있나요?', 'A. 5/10(토) OD 후, 5/11(일) 허브 2시예배 전후로 기쁨홀 앞에서 배부합니다.', 12, true); 