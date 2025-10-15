// K-Work 레퍼런스 기업 회원가입 옵션
// https://www.k-work.or.kr 기준

// 기업 형태 (entrprsStleCode)
export const COMPANY_TYPES = [
  { value: '1', label: '일반기업' },
  { value: '3', label: '외국계기업' },
  { value: '4', label: '벤처기업' },
  { value: '5', label: '공기업, 공공기관' },
  { value: '8', label: '비영리단체·협회·재단' },
  { value: '9', label: '외국기관·단체' },
  { value: '10', label: '스타트업' },
] as const;

// 기업 규모 (entrprsScaleCode)
export const COMPANY_SCALES = [
  { value: '1', label: '소기업' },
  { value: '2', label: '중기업' },
  { value: '3', label: '대기업' },
  { value: '4', label: '중소기업' },
  { value: '5', label: '중견기업' },
  { value: '6', label: '기타' },
] as const;

// 업태 (bizcndCode) - 21개
export const BUSINESS_CONDITIONS = [
  { value: '01', label: '농업, 임업 및 어업' },
  { value: '02', label: '광업' },
  { value: '03', label: '제조업' },
  { value: '04', label: '전기, 가스, 증기 및 공기 조절 공급업' },
  { value: '05', label: '수도,하수및폐기물 처리, 원료재생업' },
  { value: '06', label: '건설업' },
  { value: '07', label: '도매및소매업' },
  { value: '08', label: '운수및창고업' },
  { value: '09', label: '숙박및음식점업' },
  { value: '10', label: '정보통신업' },
  { value: '11', label: '금융및보험업' },
  { value: '12', label: '부동산업' },
  { value: '13', label: '전문, 과학및기술서비스업' },
  { value: '14', label: '사업시설관리, 사업지원 및 임대서비스업' },
  { value: '15', label: '공공행정, 국방및사회보장행정' },
  { value: '16', label: '교육서비스업' },
  { value: '17', label: '보건업및사회복지서비스업' },
  { value: '18', label: '예술,스포츠및여가관련서비스업' },
  { value: '19', label: '협회및단체,수리및기타개인서비스업' },
  { value: '20', label: '가구내고용활동및달리분류되지않은자가소비생산업' },
  { value: '21', label: '국제및외국기관' },
] as const;

// 업종 1단계 (indutyCode) - 15개
export const INDUSTRY_CATEGORIES = [
  { value: '11', label: '제조업' },
  { value: '12', label: '공공·의료·사회기반사업' },
  { value: '13', label: '금융·보험업' },
  { value: '14', label: '전문·과학기술서비스업' },
  { value: '15', label: '유통·물류·무역업' },
  { value: '16', label: '정보통신업' },
  { value: '17', label: '여행·숙박·음식점업' },
  { value: '18', label: '방송·광고·문화 서비스업' },
  { value: '19', label: '교육서비스업' },
  { value: '20', label: '운수업' },
  { value: '21', label: '건설·토목업' },
  { value: '22', label: '도매소매업' },
  { value: '23', label: '부동산·임대업' },
  { value: '24', label: '개인·가사서비스업' },
  { value: '25', label: '사업시설·사업지원서비스업' },
] as const;

// 업종 2단계 (indutyDetailCode) - 1단계에 따라 동적으로 로드
// K-Work에서는 JavaScript로 동적으로 로드하지만,
// 우리는 1단계만 구현하거나, 주요 카테고리만 하드코딩
export const INDUSTRY_DETAILS: Record<string, Array<{ value: string; label: string }>> = {
  '11': [ // 제조업
    { value: '1101', label: '식품 제조업' },
    { value: '1102', label: '섬유제품 제조업' },
    { value: '1103', label: '화학물질 및 화학제품 제조업' },
    { value: '1104', label: '금속 가공제품 제조업' },
    { value: '1105', label: '전자부품, 컴퓨터, 영상, 음향 및 통신장비 제조업' },
    { value: '1106', label: '의료, 정밀, 광학기기 및 시계 제조업' },
    { value: '1107', label: '전기장비 제조업' },
    { value: '1108', label: '기계 및 장비 제조업' },
    { value: '1109', label: '자동차 및 트레일러 제조업' },
    { value: '1110', label: '기타 제조업' },
  ],
  '12': [ // 공공·의료·사회기반사업
    { value: '1201', label: '공공행정, 국방 및 사회보장 행정' },
    { value: '1202', label: '보건업 및 사회복지 서비스업' },
    { value: '1203', label: '전기, 가스, 증기 및 공기조절 공급업' },
    { value: '1204', label: '수도, 하수 및 폐기물 처리업' },
  ],
  '13': [ // 금융·보험업
    { value: '1301', label: '금융업' },
    { value: '1302', label: '보험 및 연금업' },
    { value: '1303', label: '금융 및 보험 관련 서비스업' },
  ],
  '14': [ // 전문·과학기술서비스업
    { value: '1401', label: '연구개발업' },
    { value: '1402', label: '전문서비스업' },
    { value: '1403', label: '건축기술, 엔지니어링 및 기타 과학기술 서비스업' },
    { value: '1404', label: '기타 전문, 과학 및 기술 서비스업' },
  ],
  '15': [ // 유통·물류·무역업
    { value: '1501', label: '도매 및 상품중개업' },
    { value: '1502', label: '운송업' },
    { value: '1503', label: '창고 및 운송관련 서비스업' },
  ],
  '16': [ // 정보통신업
    { value: '1601', label: '출판업' },
    { value: '1602', label: '영상·오디오 기록물 제작 및 배급업' },
    { value: '1603', label: '방송업' },
    { value: '1604', label: '통신업' },
    { value: '1605', label: '컴퓨터 프로그래밍, 시스템 통합 및 관리업' },
    { value: '1606', label: '정보서비스업' },
  ],
  '17': [ // 여행·숙박·음식점업
    { value: '1701', label: '숙박업' },
    { value: '1702', label: '음식점 및 주점업' },
    { value: '1703', label: '여행사 및 기타 여행보조 서비스업' },
  ],
  '18': [ // 방송·광고·문화 서비스업
    { value: '1801', label: '광고업' },
    { value: '1802', label: '창작, 예술 및 여가관련 서비스업' },
    { value: '1803', label: '스포츠 및 오락관련 서비스업' },
  ],
  '19': [ // 교육서비스업
    { value: '1901', label: '초등 교육기관' },
    { value: '1902', label: '중등 교육기관' },
    { value: '1903', label: '고등 교육기관' },
    { value: '1904', label: '특수학교, 외국인학교 및 대안학교' },
    { value: '1905', label: '일반 교습 학원' },
    { value: '1906', label: '기타 교육기관' },
  ],
  '20': [ // 운수업
    { value: '2001', label: '육상운송 및 파이프라인 운송업' },
    { value: '2002', label: '수상 운송업' },
    { value: '2003', label: '항공 운송업' },
  ],
  '21': [ // 건설·토목업
    { value: '2101', label: '건물건설업' },
    { value: '2102', label: '토목건설업' },
    { value: '2103', label: '전문직별 공사업' },
  ],
  '22': [ // 도매소매업
    { value: '2201', label: '종합 소매업' },
    { value: '2202', label: '음식료품 및 담배 소매업' },
    { value: '2203', label: '정보통신장비 소매업' },
    { value: '2204', label: '기타 상품 전문 소매업' },
  ],
  '23': [ // 부동산·임대업
    { value: '2301', label: '부동산 임대 및 공급업' },
    { value: '2302', label: '부동산 관련 서비스업' },
    { value: '2303', label: '임대업(부동산 제외)' },
  ],
  '24': [ // 개인·가사서비스업
    { value: '2401', label: '수리업' },
    { value: '2402', label: '개인 및 소비용품 수리업' },
    { value: '2403', label: '협회 및 단체' },
    { value: '2404', label: '기타 개인 서비스업' },
  ],
  '25': [ // 사업시설·사업지원서비스업
    { value: '2501', label: '사업시설 유지관리 서비스업' },
    { value: '2502', label: '고용알선 및 인력공급업' },
    { value: '2503', label: '조사 및 보안 서비스업' },
    { value: '2504', label: '사업지원 서비스업' },
  ],
};
