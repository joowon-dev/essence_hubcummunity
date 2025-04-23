import { useState, useRef, useEffect } from 'react';
import * as S from './style';
import axios from 'axios';

// 배경화면 이미지 목록
const wallpapers = [
  {
    id: 1,
    title: "Essence",
    subtitle: "",
    verse: "복음은, 우리 주 예수 그리스도이십니다. (롬 1:2-4)",
    thumbnail: "/images/wallpapers/thumbnail/essence.jpg",
    mobile: "/images/wallpapers/essence.jpeg",
  },
  {
    id: 2,
    title: "The Five Solas",
    subtitle: "",
    verse: "오직 그리스도, 오직 믿음, 오직 은혜, 오직 성경, 오직 하나님께만 영광",
    thumbnail: "/images/wallpapers/thumbnail/02.jpg",
    mobile: "/images/wallpapers/The Five Solas.jpeg",
  },
  {
    id: 3,
    title: "Five Solas",
    subtitle: "",
    verse: "본질로 무장하라",
    thumbnail: "/images/wallpapers/thumbnail/03.jpg",
    mobile: "/images/wallpapers/Five Solas.jpeg",
  },
  {
    id: 4,
    title: "Solus Christus",
    subtitle: "오직 그리스도",
    verse: "[행4:12] 예수 외에 다른 어느 누구에게서도 구원을 받을 수 없습니다. 하나님께서는 하늘 아래 우리가 구원받을 만한 다른 이름을 우리에게 주신 일이 없기 때문입니다.",
    thumbnail: "/images/wallpapers/thumbnail/04.jpg",
    mobile: "/images/wallpapers/Solus Christus.jpeg",
  },
  {
    id: 5,
    title: "Sola Scriptura",
    subtitle: "오직 성경",
    verse: "[딤후3:16] 모든 성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니",
    thumbnail: "/images/wallpapers/thumbnail/05.jpg",
    mobile: "/images/wallpapers/Sola Scriptura.jpeg",
  },
  {
    id: 6,
    title: "Sola Fide",
    subtitle: "오직 믿음",
    verse: "[롬1:17] 복음에는 하나님의 의가 나타나서 믿음으로 믿음에 이르게 하나니 기록된 바 오직 의인은 믿음으로 말미암아 살리라",
    thumbnail: "/images/wallpapers/thumbnail/06.jpg",
    mobile: "/images/wallpapers/Sola Fide.jpeg",
  },
  {
    id: 7,
    title: "Sola Gratia",
    subtitle: "오직 은혜",
    verse: "[엡2:8] 너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니 이것은 너희에게서 난 것이 아니요 하나님의 선물이라",
    thumbnail: "/images/wallpapers/thumbnail/07.jpg",
    mobile: "/images/wallpapers/Sola Gratia.jpeg",
  },
  {
    id: 8,
    title: "Soli Deo Gloria",
    subtitle: "오직 하나님께만 영광",
    verse: "[롬11:36] 이는 만물이 주에게서 나오고 주로 말미암고 주에게로 돌아감이라 그에게 영광이 세세에 있을지어다 아멘",
    thumbnail: "/images/wallpapers/thumbnail/08.jpg",
    mobile: "/images/wallpapers/Soli Deo Gloria.jpeg",
  }
];

export default function WallpaperDownload() {
  const [selectedWallpaper, setSelectedWallpaper] = useState<number | null>(null);
  const [showVerse, setShowVerse] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [remainingDownloads, setRemainingDownloads] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // 남은 다운로드 횟수 조회
  useEffect(() => {
    const fetchRemainingDownloads = async () => {
      try {
        const response = await axios.get('/api/downloads/count');
        setRemainingDownloads(response.data.remainingCount);
      } catch (error) {
        console.error('다운로드 횟수 조회 오류:', error);
        setDownloadError('다운로드 횟수를 조회할 수 없습니다.');
      }
    };

    fetchRemainingDownloads();
  }, []);

  const handleDownload = async () => {
    if (selectedWallpaper === null || isDownloading || remainingDownloads === 0) return;
    
    setIsDownloading(true);
    setDownloadError(null);
    
    try {
      // 다운로드 카운트 감소 API 호출
      const response = await axios.post('/api/downloads/count');
      setRemainingDownloads(response.data.remainingCount);
      
      const wallpaper = wallpapers.find(w => w.id === selectedWallpaper);
      if (!wallpaper) {
        setIsDownloading(false);
        return;
      }
      
      // 이미지 다운로드를 위한 객체 생성
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = wallpaper.mobile;
      
      image.onload = () => {
        const link = document.createElement('a');
        link.href = wallpaper.mobile;
        link.download = `Essence_${wallpaper.title}.jpeg`;
        link.click();
        
        // 다운로드 작업이 시작된 후 약간의 지연시간을 두고 로딩 상태 해제
        setTimeout(() => {
          setIsDownloading(false);
        }, 1000);
      };
      
      image.onerror = () => {
        // 이미지 로드 오류 시 로딩 상태 해제
        setIsDownloading(false);
        setDownloadError('이미지 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
      };
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
      setIsDownloading(false);
      
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setRemainingDownloads(0);
        setDownloadError('현재 다운로드를 처리할 수 없습니다. 나중에 다시 시도해주세요.');
      } else {
        setDownloadError('다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  // 터치 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  // 마우스 이동
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조정
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // 터치 이동
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조정
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // 마우스/터치 종료
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <S.Container>
      <S.ContentWrapper>
        <S.Content>
          <S.TitleSection>
            <S.EssenceTag>Essence</S.EssenceTag>
            <S.Title>배경화면 다운로드</S.Title>
            <S.Subtitle>복음은, 우리 주 예수 그리스도이십니다. (롬 1:2-4)</S.Subtitle>
            <S.SolasIntro>
              The Five Solas
            </S.SolasIntro>

          </S.TitleSection>
          
          <S.WallpaperGrid
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={isDragging ? handleMouseMove : undefined}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
          >
            {wallpapers.map(wallpaper => (
              <S.WallpaperItem 
                key={wallpaper.id}
                $isSelected={selectedWallpaper === wallpaper.id}
                onClick={() => {
                  if (!isDragging) { // 드래그 중이 아닐 때만 선택 가능
                    setSelectedWallpaper(wallpaper.id);
                    setShowVerse(true);
                  }
                }}
              >
                <S.WallpaperImage src={wallpaper.thumbnail} alt={wallpaper.title} />
                <S.WallpaperTitle>{wallpaper.title}</S.WallpaperTitle>
                <S.WallpaperSubtitle>{wallpaper.subtitle}</S.WallpaperSubtitle>
              </S.WallpaperItem>
            ))}
          </S.WallpaperGrid>
          
          {selectedWallpaper !== null && showVerse && (
            <S.VerseContainer>
              <S.Verse>
                {wallpapers.find(w => w.id === selectedWallpaper)?.verse}
              </S.Verse>
            </S.VerseContainer>
          )}
          
          <S.DownloadSection>
            <S.DownloadButton 
              onClick={handleDownload}
              disabled={selectedWallpaper === null || isDownloading || remainingDownloads === 0}
            >
              <S.ButtonText $isDisabled={selectedWallpaper === null || isDownloading || remainingDownloads === 0}>
                {isDownloading ? '다운로드 중...' : '배경화면 다운로드'}
              </S.ButtonText>
            </S.DownloadButton>
            
            {downloadError && (
              <S.ErrorMessage>
                {downloadError}
              </S.ErrorMessage>
            )}
          </S.DownloadSection>
        </S.Content>
      </S.ContentWrapper>
    </S.Container>
  );
} 