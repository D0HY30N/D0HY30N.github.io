interface AwardOrActivity {
  name: string;
  prize?: string;
  date: string;
  endDate?: string;
  organization?: string;
}

interface Cve {
  id: `CVE-${number}-${number}`;
  /** Date the CVE record was published (cve.org "Published"), YYYY-MM-DD. */
  published: string;
  product?: string;
  /** Vulnerability class shown under the product, e.g. "인증 우회". */
  type?: string;
  /** CVSS base score as published on the CVE record (3.1 or 4.0), e.g. 9.8. */
  cvss?: number;
}

interface Position {
  name: string;
  /** Job title or team shown under the company name, e.g. "보안 컨설턴트 · 모의해킹팀". */
  role?: string;
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
    name: "경상북도 정보보안 창업 아이디어톤",
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
  // CVSS 3.1 from the CISA ADP entry; the CNA rated it "important" without a score.
  { id: "CVE-2026-62440", published: "2026-08-21", product: "Apache CloudStack", type: "접근 제어 우회", cvss: 9.1 },
  // CVSS 4.0 from the CNA.
  { id: "CVE-2026-68979", published: "2026-08-03", product: "Apache NiFi", type: "권한 검사 누락", cvss: 5.9 },
  // CVSS 3.1 from the CNA.
  { id: "CVE-2026-88809", published: "2026-11-02", product: "SUSE Rancher", type: "SSRF", cvss: 7.6 },
];

export const positions: Position[] = [
  { name: "수산아이앤티", role: "모의해킹 컨설턴트", start: "2026-09-07" },
  { name: "에스에스알", role: "모의해킹 컨설턴트", start: "2024-07-22", end: "2026-08-24" },
];

export const certifications: Certification[] = [
  { name: "정보보안기사", acquired: "2026-05" },
];
