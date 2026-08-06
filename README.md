# D0HY30N's Blog

공부하면서 알게 된 내용과 프로젝트 경험을 미래의 나를 위해 기록하는 개인 기술 블로그입니다.

- Blog: [https://d0hy30n.github.io](https://d0hy30n.github.io)
- Repository: [https://github.com/D0HY30N/D0HY30N.github.io](https://github.com/D0HY30N/D0HY30N.github.io)

## 기술 스택

- [Astro](https://astro.build/)
- [Fuwari](https://github.com/saicaca/fuwari)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pagefind](https://pagefind.app/)
- [giscus](https://giscus.app/) / GitHub Discussions
- GitHub Pages

## 주요 커스터마이징

- D0HY30N 전용 프로필, 배너 및 라이트·다크 파비콘
- 눈의 피로를 줄인 라이트·다크 테마 색상
- 대분류와 하위 카테고리를 지원하는 2단계 카테고리 구조
- 카테고리와 태그별 게시글 카드 및 페이지네이션
- GitHub Discussions 기반 게시글 댓글
- 반응형 레이아웃, 검색, 목차 및 RSS

## 로컬 실행

Node.js 20 이상과 pnpm 9 이상을 권장합니다.

```sh
pnpm install
pnpm dev
```

프로덕션 빌드:

```sh
pnpm build
```

새 글은 `src/content/posts/`에 작성합니다. 카테고리는 최대 2단계까지 사용할 수 있습니다.

```yaml
---
title: 게시글 제목
published: 2026-08-05
tags: [Astro, Blogging]
category: [정보보안, Web]
draft: false
---
```

대분류가 필요하지 않은 글은 `category: Notice`처럼 작성할 수 있습니다.

## Credits

이 블로그는 [saicaca](https://github.com/saicaca)가 만든 오픈 소스 Astro 테마
[Fuwari](https://github.com/saicaca/fuwari)를 기반으로 제작하고 개인적인 용도에 맞게 수정했습니다.

좋은 테마를 공개해 주신 원작자와 Fuwari 기여자분들께 감사드립니다.

- Original repository: [saicaca/fuwari](https://github.com/saicaca/fuwari)
- Original demo: [fuwari.vercel.app](https://fuwari.vercel.app/)
- Framework: [Astro](https://astro.build/)

## License

- Fuwari 원본 코드와 이를 기반으로 한 테마 코드는 원작자의 [MIT License](./LICENSE)를 따릅니다. 원본 저작권 고지와 라이선스 전문을 저장소에 그대로 보존합니다.
- 블로그 게시글은 각 페이지에 표시된 라이선스를 따르며, 현재 기본 설정은 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)입니다.
- 프로필 사진, 직접 제작한 이미지와 별도 표기가 없는 개인 미디어의 저작권은 D0HY30N에게 있으며 무단 사용을 허용하지 않습니다.

© 2026 D0HY30N. All Rights Reserved.
