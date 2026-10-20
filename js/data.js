const PRODUCTS = {
  clothes: [
    { id: 'c1', brand: 'ARCHIVE', name: '오버사이즈 코튼 반팔 티셔츠', price: 39000, off: 20, color: '#e9e6df', icon: '👕', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'c2', brand: 'NOWHERE', name: '와이드 후드 집업', price: 89000, off: 30, color: '#cfd4d8', icon: '🧥', sizes: ['M', 'L', 'XL'] },
    { id: 'c3', brand: 'URBAN LAB', name: '레귤러핏 옥스포드 셔츠', price: 59000, off: 15, color: '#dfe7ef', icon: '👔', sizes: ['S', 'M', 'L'] },
    { id: 'c4', brand: 'ARCHIVE', name: '헤비웨이트 스웨트셔츠', price: 69000, off: 25, color: '#d9cfc6', icon: '🧶', sizes: ['M', 'L', 'XL'] },
    { id: 'c5', brand: 'MONO', name: '싱글 코트 울 블렌드', price: 189000, off: 35, color: '#c9c3bb', icon: '🧥', sizes: ['M', 'L'] },
    { id: 'c6', brand: 'NOWHERE', name: '나일론 바람막이 자켓', price: 79000, off: 10, color: '#cdd8cf', icon: '🧥', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'c7', brand: 'MONO', name: '카라 니트 가디건', price: 64000, off: 18, color: '#e6dcd0', icon: '🧶', sizes: ['S', 'M', 'L'] },
    { id: 'c8', brand: 'URBAN LAB', name: '데일리 크루넥 긴팔 티', price: 29000, off: 12, color: '#eceae6', icon: '👕', sizes: ['S', 'M', 'L', 'XL'] }
  ],
  shoes: [
    { id: 's1', brand: 'STRIDE', name: '클래식 레더 스니커즈', price: 98000, off: 20, color: '#ece9e4', icon: '👟', sizes: ['250', '260', '270', '280'] },
    { id: 's2', brand: 'STRIDE', name: '러닝 메쉬 워커', price: 119000, off: 25, color: '#d8dfe6', icon: '👟', sizes: ['250', '260', '270', '280'] },
    { id: 's3', brand: 'TREK', name: '미드컷 캔버스 하이탑', price: 62000, off: 10, color: '#e2d8cd', icon: '👟', sizes: ['240', '250', '260', '270'] },
    { id: 's4', brand: 'TREK', name: '아웃도어 트레킹 부츠', price: 159000, off: 30, color: '#cbbfb0', icon: '🥾', sizes: ['260', '270', '280'] },
    { id: 's5', brand: 'LOAFER CO', name: '페니 로퍼 가죽', price: 139000, off: 15, color: '#d4c8bf', icon: '👞', sizes: ['250', '260', '270'] },
    { id: 's6', brand: 'STRIDE', name: '청키 솔 데일리 슬립온', price: 74000, off: 22, color: '#dcdcdc', icon: '👟', sizes: ['240', '250', '260', '270'] },
    { id: 's7', brand: 'SLIDE', name: '쿠션 슬라이드 샌들', price: 35000, off: 8, color: '#e8e2d6', icon: '🩴', sizes: ['250', '260', '270', '280'] },
    { id: 's8', brand: 'LOAFER CO', name: '더비 슈즈 블랙', price: 129000, off: 28, color: '#c7c7c9', icon: '👞', sizes: ['250', '260', '270'] }
  ],
  pants: [
    { id: 'p1', brand: 'DENIMARK', name: '와이드 데님 팬츠', price: 69000, off: 20, color: '#cdd7e3', icon: '👖', sizes: ['28', '30', '32', '34'] },
    { id: 'p2', brand: 'DENIMARK', name: '스트레이트 생지 진', price: 79000, off: 15, color: '#bfc9d6', icon: '👖', sizes: ['28', '30', '32', '34'] },
    { id: 'p3', brand: 'MONO', name: '핀턱 와이드 슬랙스', price: 58000, off: 25, color: '#d5d3cf', icon: '👖', sizes: ['28', '30', '32'] },
    { id: 'p4', brand: 'NOWHERE', name: '카고 팬츠 코튼', price: 72000, off: 18, color: '#d2d3c3', icon: '👖', sizes: ['30', '32', '34', '36'] },
    { id: 'p5', brand: 'ARCHIVE', name: '스웨트 조거 팬츠', price: 45000, off: 12, color: '#dcd8d2', icon: '👖', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'p6', brand: 'URBAN LAB', name: '밴딩 치노 팬츠', price: 49000, off: 30, color: '#e0d5c2', icon: '👖', sizes: ['28', '30', '32', '34'] },
    { id: 'p7', brand: 'NOWHERE', name: '나일론 트랙 팬츠', price: 52000, off: 10, color: '#cfd0d6', icon: '👖', sizes: ['S', 'M', 'L'] },
    { id: 'p8', brand: 'MONO', name: '코듀로이 와이드 팬츠', price: 63000, off: 22, color: '#d9c9b8', icon: '👖', sizes: ['28', '30', '32', '34'] }
  ]
};

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
