# 카테고리 설정

`src/config.ts`의 `categoryConfig`에서 대분류와 소분류를 설정합니다.

```ts
export const categoryConfig: CategoryConfig = {
  groups: [
    { name: "보안", categories: ["WEB", "시스템", "네트워크"] },
    { name: "개발", categories: ["Astro"] },
    { name: "블로그", categories: ["Examples", "Guides"] },
  ],
};
```

- `name`은 클릭되지 않는 대분류 제목입니다.
- `categories`는 클릭해서 글 목록을 여는 소분류입니다. 배열 순서대로 표시됩니다.
- 대분류 이름과 소분류 이름은 각각 전체 설정에서 중복되지 않아야 합니다. 앞뒤 공백은 제거됩니다.
- 글이 없는 소분류도 `0`으로 표시되며, 클릭하면 빈 목록 안내가 나옵니다.
- 설정에 등록하지 않은 소분류는 자동으로 `기타` 아래에 표시됩니다.
- 소분류 이름을 바꾸면 해당 글의 `category`도 같이 바꿔 주세요. 대분류 이름만 바꿀 때는 글을 수정할 필요가 없습니다.

## 글에 소분류 지정하기

`src/content/posts/` 안에 마크다운 파일을 만들고, 맨 위의 `category`에 **소분류 이름 하나**를 입력합니다. 대소문자까지 설정과 같아야 합니다.

```markdown
---
title: 새 학습 기록
published: 2026-09-11
description: 오늘 확인한 내용을 정리합니다.
category: WEB
tags: [HTTP, 학습]
lang: ko
draft: false
---

## 오늘 배운 내용

여기에 본문을 작성합니다.
```

`WEB`으로 설정한 글은 `보안 → WEB`에 표시됩니다. 파일을 대분류 폴더에 넣을 필요는 없습니다.

ALL에서는 전체 글을 볼 수 있고, 소분류 목록에서 연 글의 이전·다음 이동은 해당 소분류 안에서만 이어집니다. 초안(`draft: true`)은 개발 화면에만 나타나고 배포용 빌드에서는 제외됩니다.

## 추가한 예시 글

- `http-request-notes.md` — WEB
- `browser-storage-notes.md` — WEB
- `linux-permissions-notes.md` — 시스템
- `astro-writing-notes.md` — Astro

제목에 `[예시]`를 붙여 구분했습니다. 내용을 바꾸거나 파일을 삭제해도 카테고리 설정은 유지됩니다.
