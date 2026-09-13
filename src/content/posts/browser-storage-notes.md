---
title: "[예시] 브라우저 저장소 비교하기"
published: 2026-09-09
description: "localStorage와 sessionStorage의 수명을 비교하고 간단한 값을 저장해 보는 WEB 카테고리 예시 글입니다."
tags: ["JavaScript", "WEB", "예시"]
parentCategory: 보안
category: WEB
lang: ko
draft: false
---

> 블로그의 카테고리와 본문 모양을 확인하기 위한 예시 글입니다.

브라우저에서 간단한 설정을 기억할 때 Web Storage를 사용할 수 있습니다. `localStorage`와 `sessionStorage`는 사용법이 비슷하지만 데이터가 유지되는 범위가 다릅니다.

## 저장 기간부터 정하기

| 저장소 | 기본적인 유지 범위 | 연습할 데이터 |
| --- | --- | --- |
| `localStorage` | 같은 출처에서 브라우저를 다시 열어도 유지 | 화면 표시 설정 |
| `sessionStorage` | 출처와 탭의 페이지 세션 단위로 유지 | 해당 탭에서 선택한 임시 필터 |

두 저장소 모두 사용자가 지우거나 브라우저 설정에 따라 사용할 수 없게 될 수 있습니다. 오래 유지되는 저장소라도 영구 보관을 보장하는 용도로 생각하지 않습니다.

## 문자열로 저장하기

Web Storage에는 문자열을 저장합니다. 객체를 저장하고 싶다면 JSON 문자열로 변환할 수 있습니다.

```js
const preferences = { fontSize: "medium" };

localStorage.setItem("reading-preferences", JSON.stringify(preferences));

const saved = localStorage.getItem("reading-preferences");
if (saved !== null) {
  console.log(JSON.parse(saved));
}
```

이 코드는 정상적인 값을 읽고 쓰는 흐름만 보여주는 연습용 예제입니다. 실제 코드에서는 저장소 접근 실패나 잘못된 JSON처럼 실패할 수 있는 경우도 처리합니다.

## 직접 비교해 보기

1. 두 저장소에 서로 다른 연습 값을 넣습니다.
2. 새로고침 후 값이 유지되는지 확인합니다.
3. 탭을 닫고 다시 열었을 때 어떤 차이가 있는지 살펴봅니다.

확인한 조건과 결과를 함께 기록하면 저장 기간을 선택할 때 참고하기 좋습니다.
