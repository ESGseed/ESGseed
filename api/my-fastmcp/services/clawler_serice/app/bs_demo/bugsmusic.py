"""
BugsMusic 차트 정적 크롤링 스크립트
BeautifulSoup4를 사용하여 title, artist, album 정보를 추출하고 JSON 형태로 출력
"""

import requests
from bs4 import BeautifulSoup
import json


def crawl_bugsmusic_chart(url):
    """
    BugsMusic 차트 페이지를 크롤링하여 곡 정보를 추출
    
    Args:
        url (str): BugsMusic 차트 페이지 URL
        
    Returns:
        list: 곡 정보 딕셔너리 리스트
    """
    try:
        # 1. HTML 가져오기
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # 2. HTML 파싱
        soup = BeautifulSoup(response.text, 'lxml')
        
        # 3. 테이블 찾기
        table = soup.find('table', class_='list trackList byChart')
        if not table:
            print("테이블을 찾을 수 없습니다.")
            return []
        
        # 4. 모든 로우 찾기
        rows = table.find_all('tr')
        
        # 5. 데이터 추출 및 구조화
        songs = []
        for row in rows:
            # title 클래스를 가진 요소 찾기
            title_elem = row.find(class_='title')
            # artist 클래스를 가진 요소 찾기
            artist_elem = row.find(class_='artist')
            # album 클래스를 가진 요소 찾기
            album_elem = row.find(class_='album')
            
            # 모든 요소가 존재하는 경우에만 데이터 추가
            if title_elem and artist_elem and album_elem:
                song_data = {
                    "title": title_elem.get_text(strip=True),
                    "artist": artist_elem.get_text(strip=True),
                    "album": album_elem.get_text(strip=True)
                }
                songs.append(song_data)
        
        return songs
        
    except requests.RequestException as e:
        print(f"HTTP 요청 오류: {e}")
        return []
    except Exception as e:
        print(f"크롤링 오류: {e}")
        return []


def main():
    """
    메인 함수: BugsMusic 차트를 크롤링하고 JSON으로 출력
    """
    # BugsMusic 차트 URL (예시)
    url = "https://music.bugs.co.kr/chart"
    
    print("BugsMusic 차트 크롤링 시작...")
    songs = crawl_bugsmusic_chart(url)
    
    if songs:
        # 6. JSON 형태로 출력
        json_output = json.dumps(songs, indent=2, ensure_ascii=False)
        print("\n=== 크롤링 결과 ===")
        print(json_output)
        print(f"\n총 {len(songs)}개의 곡 정보를 추출했습니다.")
    else:
        print("추출된 데이터가 없습니다.")


if __name__ == "__main__":
    main()

