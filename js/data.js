const PRODUCTS = {
  clothes: [
    { id: 'c1', gender: 'M', brand: 'ARCHIVE', name: '오버사이즈 코튼 반팔 티셔츠', price: 39000, off: 20, color: '#e9e6df', icon: '👕', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'c2', gender: 'M', brand: 'NOWHERE', name: '와이드 후드 집업', price: 89000, off: 30, color: '#cfd4d8', icon: '🧥', sizes: ['M', 'L', 'XL'] },
    { id: 'c3', gender: 'M', brand: 'URBAN LAB', name: '레귤러핏 옥스포드 셔츠', price: 59000, off: 15, color: '#dfe7ef', icon: '👔', sizes: ['S', 'M', 'L'] },
    { id: 'c4', gender: 'W', brand: 'ARCHIVE', name: '헤비웨이트 스웨트셔츠', price: 69000, off: 25, color: '#d9cfc6', icon: '🧶', sizes: ['M', 'L', 'XL'] },
    { id: 'c5', gender: 'M', brand: 'MONO', name: '싱글 코트 울 블렌드', price: 189000, off: 35, color: '#c9c3bb', icon: '🧥', sizes: ['M', 'L'] },
    { id: 'c6', gender: 'M', brand: 'NOWHERE', name: '나일론 바람막이 자켓', price: 79000, off: 10, color: '#cdd8cf', icon: '🧥', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'c7', gender: 'W', brand: 'MONO', name: '카라 니트 가디건', price: 64000, off: 18, color: '#e6dcd0', icon: '🧶', sizes: ['S', 'M', 'L'] },
    { id: 'c8', gender: 'M', brand: 'URBAN LAB', name: '데일리 크루넥 긴팔 티', price: 29000, off: 12, color: '#eceae6', icon: '👕', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'c9', gender: 'W', brand: 'ARCHIVE', name: '크롭 코튼 반팔 티셔츠', price: 33000, off: 15, color: '#ebe8e3', icon: '👚', sizes: ['S', 'M', 'L'] },
    { id: 'c10', gender: 'W', brand: 'URBAN LAB', name: '새틴 셔링 블라우스', price: 59000, off: 20, color: '#e3dede', icon: '👚', sizes: ['S', 'M', 'L'] },
    { id: 'c11', gender: 'W', brand: 'MONO', name: '플레어 롱 원피스', price: 99000, off: 25, color: '#f0d9a8', icon: '👗', sizes: ['S', 'M', 'L'] },
    { id: 'c12', gender: 'W', brand: 'MONO', name: '더블 브레스티드 트렌치 코트', price: 169000, off: 30, color: '#d8cdbf', icon: '🧥', sizes: ['S', 'M', 'L'] },
    { id: 'c13', gender: 'W', brand: 'NOWHERE', name: '오버핏 싱글 블레이저', price: 119000, off: 22, color: '#d4d4d4', icon: '🧥', sizes: ['S', 'M', 'L'] },
    { id: 'c14', gender: 'W', brand: 'ARCHIVE', name: '울 혼방 니트 베스트', price: 49000, off: 18, color: '#d6dccf', icon: '🧶', sizes: ['S', 'M', 'L'] },
    { id: 'c15', gender: 'M', brand: 'NOWHERE', name: '데님 트러커 자켓', price: 99000, off: 20, color: '#bfcbd8', icon: '🧥', sizes: ['M', 'L', 'XL'] },
    { id: 'c16', gender: 'M', brand: 'URBAN LAB', name: '체크 플란넬 셔츠', price: 54000, off: 15, color: '#c9c6c6', icon: '👔', sizes: ['S', 'M', 'L', 'XL'] }
  ],
  shoes: [
    { id: 's1', gender: 'M', brand: 'STRIDE', name: '클래식 레더 스니커즈', price: 98000, off: 20, color: '#ece9e4', icon: '👟', sizes: ['250', '260', '270', '280'] },
    { id: 's2', gender: 'M', brand: 'STRIDE', name: '러닝 메쉬 워커', price: 119000, off: 25, color: '#d8dfe6', icon: '👟', sizes: ['250', '260', '270', '280'] },
    { id: 's3', gender: 'W', brand: 'TREK', name: '미드컷 캔버스 하이탑', price: 62000, off: 10, color: '#e2d8cd', icon: '👟', sizes: ['230', '240', '250'] },
    { id: 's4', gender: 'M', brand: 'TREK', name: '아웃도어 트레킹 부츠', price: 159000, off: 30, color: '#cbbfb0', icon: '🥾', sizes: ['260', '270', '280'] },
    { id: 's5', gender: 'M', brand: 'LOAFER CO', name: '페니 로퍼 가죽', price: 139000, off: 15, color: '#d4c8bf', icon: '👞', sizes: ['250', '260', '270'] },
    { id: 's6', gender: 'W', brand: 'STRIDE', name: '청키 솔 데일리 슬립온', price: 74000, off: 22, color: '#dcdcdc', icon: '👟', sizes: ['230', '240', '250'] },
    { id: 's7', gender: 'W', brand: 'SLIDE', name: '쿠션 슬라이드 샌들', price: 35000, off: 8, color: '#e8e2d6', icon: '🩴', sizes: ['230', '240', '250'] },
    { id: 's8', gender: 'M', brand: 'LOAFER CO', name: '더비 슈즈 블랙', price: 129000, off: 28, color: '#c7c7c9', icon: '👞', sizes: ['250', '260', '270'] },
    { id: 's9', gender: 'W', brand: 'LOAFER CO', name: '체크 메리제인 플랫', price: 89000, off: 18, color: '#e0c7bf', icon: '👞', sizes: ['230', '240', '250'] },
    { id: 's10', gender: 'W', brand: 'TREK', name: '스웨이드 앵클 부츠', price: 129000, off: 25, color: '#cdb9a5', icon: '🥾', sizes: ['230', '240', '250', '260'] },
    { id: 's11', gender: 'W', brand: 'SLIDE', name: '스트랩 샌들 베이지', price: 69000, off: 15, color: '#e9ddcd', icon: '👡', sizes: ['230', '240', '250'] },
    { id: 's12', gender: 'W', brand: 'LOAFER CO', name: '소프트 발레 플랫', price: 65000, off: 12, color: '#e6d6d6', icon: '🥿', sizes: ['230', '240', '250'] },
    { id: 's13', gender: 'W', brand: 'STRIDE', name: '미니멀 화이트 스니커즈', price: 79000, off: 20, color: '#ecebe8', icon: '👟', sizes: ['230', '240', '250', '260'] },
    { id: 's14', gender: 'M', brand: 'LOAFER CO', name: '가죽 첼시 부츠', price: 169000, off: 30, color: '#c8b49f', icon: '🥾', sizes: ['260', '270', '280'] },
    { id: 's15', gender: 'M', brand: 'STRIDE', name: '캔버스 슬립온', price: 49000, off: 10, color: '#e8e6e1', icon: '👟', sizes: ['250', '260', '270', '280'] },
    { id: 's16', gender: 'M', brand: 'TREK', name: '트레일 러닝화', price: 139000, off: 25, color: '#cfd8c9', icon: '👟', sizes: ['260', '270', '280'] }
  ],
  pants: [
    { id: 'p1', gender: 'W', brand: 'DENIMARK', name: '와이드 데님 팬츠', price: 69000, off: 20, color: '#cdd7e3', icon: '👖', sizes: ['28', '30', '32', '34'] },
    { id: 'p2', gender: 'M', brand: 'DENIMARK', name: '스트레이트 생지 진', price: 79000, off: 15, color: '#bfc9d6', icon: '👖', sizes: ['28', '30', '32', '34'] },
    { id: 'p3', gender: 'W', brand: 'MONO', name: '핀턱 와이드 슬랙스', price: 58000, off: 25, color: '#d5d3cf', icon: '👖', sizes: ['28', '30', '32'] },
    { id: 'p4', gender: 'M', brand: 'NOWHERE', name: '카고 팬츠 코튼', price: 72000, off: 18, color: '#d2d3c3', icon: '👖', sizes: ['30', '32', '34', '36'] },
    { id: 'p5', gender: 'W', brand: 'ARCHIVE', name: '스웨트 조거 팬츠', price: 45000, off: 12, color: '#dcd8d2', icon: '👖', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'p6', gender: 'M', brand: 'URBAN LAB', name: '밴딩 치노 팬츠', price: 49000, off: 30, color: '#e0d5c2', icon: '👖', sizes: ['28', '30', '32', '34'] },
    { id: 'p7', gender: 'W', brand: 'NOWHERE', name: '나일론 트랙 팬츠', price: 52000, off: 10, color: '#cfd0d6', icon: '👖', sizes: ['S', 'M', 'L'] },
    { id: 'p8', gender: 'M', brand: 'MONO', name: '코듀로이 와이드 팬츠', price: 63000, off: 22, color: '#d9c9b8', icon: '👖', sizes: ['28', '30', '32', '34'] },
    { id: 'p9', gender: 'W', brand: 'DENIMARK', name: '하이웨스트 스트레이트 진', price: 72000, off: 20, color: '#cbd6e2', icon: '👖', sizes: ['26', '27', '28', '29'] },
    { id: 'p10', gender: 'W', brand: 'MONO', name: '울 블렌드 스트레이트 팬츠', price: 68000, off: 25, color: '#cfc3b4', icon: '👖', sizes: ['S', 'M', 'L'] },
    { id: 'p11', gender: 'W', brand: 'URBAN LAB', name: '린넨 크롭 와이드 팬츠', price: 52000, off: 18, color: '#d7e1dc', icon: '👖', sizes: ['S', 'M', 'L'] },
    { id: 'p12', gender: 'W', brand: 'DENIMARK', name: '워싱 데님 쇼츠', price: 39000, off: 15, color: '#d3dce6', icon: '🩳', sizes: ['26', '27', '28', '29'] },
    { id: 'p13', gender: 'M', brand: 'MONO', name: '테이퍼드 울 슬랙스', price: 74000, off: 20, color: '#cfcfd0', icon: '👖', sizes: ['28', '30', '32', '34'] },
    { id: 'p14', gender: 'M', brand: 'NOWHERE', name: '와이드 카고 쇼츠', price: 47000, off: 12, color: '#d8d2c0', icon: '🩳', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'p15', gender: 'M', brand: 'ARCHIVE', name: '헤비 스웨트 쇼츠', price: 36000, off: 10, color: '#d9d9db', icon: '🩳', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'p16', gender: 'M', brand: 'DENIMARK', name: '블랙 슬림 진', price: 65000, off: 18, color: '#c9c9cc', icon: '👖', sizes: ['28', '30', '32', '34'] }
  ]
};

// 성별 구분 (M=남성, W=여성)
const GENDERS = { M: '남성', W: '여성' };

const CATEGORIES = {
  clothes: { label: '의류', title: '옷', href: 'index.html' },
  shoes: { label: '신발', title: '신발', href: 'shoes.html' },
  pants: { label: '바지', title: '바지', href: 'pants.html' }
};

// 할인율 적용 판매가 (10원 단위 절삭)
function salePrice(p) {
  return Math.floor((p.price * (100 - p.off)) / 100 / 100) * 100;
}
// 상품 이미지 (Unsplash 무료 사진, images/<id>.jpg)
const imgSrc = (p) => `images/${p.id}.jpg`;
const imgTag = (p) => `<img src="${imgSrc(p)}" alt="${p.brand} ${p.name}" loading="lazy" decoding="async">`;
const won = (n) => n.toLocaleString('ko-KR');
