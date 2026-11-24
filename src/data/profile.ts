interface AwardOrActivity {
  name: string;
  prize?: string;
  date: string;
  endDate?: string;
  organization?: string;
}

interface Cve {
  id: `CVE-${number}-${number}`;
  product?: string;
}

interface Position {
  name: string;
  start: string;
  end?: string;
}

interface Certification {
  name: string;
  acquired?: string;
}

export type ProfileEntry = AwardOrActivity | Cve | Position | Certification;

export const awardsAndActivities: AwardOrActivity[] = [
  {
    name: "보안 취약점 신고·조치·공개(CVD/VDP) 시범사업 공공부문",
    prize: "최우수상",
    date: "2026-11-23",
    organization: "국가정보원",
  },
  {
    name: "과학기술정보통신부 2024년 학생 화이트해커 모의침투훈련",
    date: "2024-07",
    endDate: "2024-09",
    organization: "과학기술정보통신부",
  },
  {
    name: "제1회 경상북도 정보보안 창업 아이디어톤",
    prize: "최우수상",
    date: "2023-12-19",
    organization: "포항테크노파크",
  },
  {
    name: "실전형 훈련장 대학생 미니 챌린지 - 스피어피싱 대응 훈련",
    prize: "대상",
    date: "2023-08-13",
    organization: "한국인터넷진흥원",
  },
];

export const cves: Cve[] = [
  { id: "CVE-2026-62440", product: "Apache CloudStack" },
  { id: "CVE-2026-68979", product: "Apache NiFi" },
  { id: "CVE-2026-88809", product: "SUSE Rancher" },
];

export const positions: Position[] = [
  { name: "수산아이앤티", start: "2026-09-07" },
  { name: "에스에스알", start: "2024-07-22", end: "2026-08-24" },
];

export const certifications: Certification[] = [
  { name: "정보보안기사", acquired: "2026-05" },
];
