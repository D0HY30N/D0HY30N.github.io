---
title: Fuwari 확장 문법
---

# Fuwari 확장 문법

현재 블로그에 연결된 확장 문법 모음입니다. 각 예제의 **코드가 작성 방법**, 그 아래가 **실제 결과**입니다. CMS 미리보기와 블로그는 같은 문법 처리 코드와 코드 블록 설정을 사용합니다.

본문 편집기는 **마크다운 원문**으로 고정되어 있습니다. 아래 예제를 그대로 입력하고 오른쪽 미리보기에서 결과를 확인하세요.

## 안내 박스

`note`, `tip`, `important`, `warning`, `caution` 다섯 가지를 사용할 수 있습니다. `:::`로 시작하고 끝냅니다.

```markdown
:::note
참고할 내용을 적습니다.
:::

:::tip
알아두면 편리한 방법을 적습니다.
:::

:::important
꼭 확인해야 할 내용을 적습니다.
:::

:::warning
주의할 내용을 적습니다.
:::

:::caution
실행 전에 알아야 할 영향을 적습니다.
:::
```

:::note
참고할 내용을 적습니다.
:::

:::tip
알아두면 편리한 방법을 적습니다.
:::

:::important
꼭 확인해야 할 내용을 적습니다.
:::

:::warning
주의할 내용을 적습니다.
:::

:::caution
실행 전에 알아야 할 영향을 적습니다.
:::

### 제목 바꾸기

```markdown
:::tip[분석할 때 확인할 것]
**메서드**, 경로, 헤더, 본문 순서로 살펴봅니다.

- 요청의 목적
- 서버의 응답
:::
```

:::tip[분석할 때 확인할 것]
**메서드**, 경로, 헤더, 본문 순서로 살펴봅니다.

- 요청의 목적
- 서버의 응답
:::

### GitHub 방식

대문자 `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`도 지원합니다.

```markdown
> [!TIP]
> 이 방식도 같은 안내 박스로 표시됩니다.
```

> [!TIP]
> 이 방식도 같은 안내 박스로 표시됩니다.

## 스포일러

마우스를 올리면 숨겨진 내용을 볼 수 있습니다. 안쪽에서도 굵게 같은 마크다운을 사용할 수 있습니다.

```markdown
결과: :spoiler[숨겨진 **정답**입니다.]
```

결과: :spoiler[숨겨진 **정답**입니다.]

## GitHub 저장소 카드

`owner/repository` 형식의 저장소 이름을 적습니다.

```markdown
::github{repo="saicaca/fuwari"}
```

::github{repo="saicaca/fuwari"}

설명·언어·별 수 등은 GitHub API에서 불러옵니다. 비공개 저장소, 네트워크 오류 또는 API 제한이 있을 때는 불러오기 실패 표시가 나올 수 있습니다.

## 수식

문장 안에서는 `$...$`, 별도 줄에서는 `$$...$$`를 사용합니다. 수식은 KaTeX로 표시됩니다.

```markdown
시간 복잡도는 $O(n \log n)$입니다.

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

시간 복잡도는 $O(n \log n)$입니다.

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 코드에 파일명 표시

언어 뒤에 `title="파일명"`을 붙입니다.

````markdown
```js title="request.js"
const response = await fetch('/api/posts');
const posts = await response.json();
```
````

```js title="request.js"
const response = await fetch('/api/posts');
const posts = await response.json();
```

## 코드 줄 강조

`{2}`는 2번째 줄, `{2-4}`는 2~4번째 줄입니다. `ins`는 추가된 줄, `del`은 삭제된 줄을 표시합니다. 번호는 코드 블록 안의 첫 줄부터 셉니다.

````markdown
```js title="변경 전후" del={1} ins={2} {3}
const timeout = 1000;
const timeout = 3000;
console.log(timeout);
```
````

```js title="변경 전후" del={1} ins={2} {3}
const timeout = 1000;
const timeout = 3000;
console.log(timeout);
```

특정 문자열만 강조할 수도 있습니다.

````markdown
```js "response.status"
if (response.status === 200) {
  console.log('ok');
}
```
````

```js "response.status"
if (response.status === 200) {
  console.log('ok');
}
```

## 코드 접기

`collapse={2-4}`처럼 접을 줄 범위를 지정합니다. 미리보기에서도 눌러 펼칠 수 있습니다.

````markdown
```js collapse={2-4}
function request() {
  const method = 'GET';
  const path = '/api/posts';
  console.log(method, path);
  return true;
}
```
````

```js collapse={2-4}
function request() {
  const method = 'GET';
  const path = '/api/posts';
  console.log(method, path);
  return true;
}
```

## 줄 번호와 긴 줄

| 옵션 | 동작 |
| --- | --- |
| `showLineNumbers=false` | 줄 번호 숨기기 |
| `showLineNumbers startLineNumber=10` | 줄 번호를 10부터 표시 |
| `wrap=false` | 긴 줄을 줄바꿈하지 않고 가로 스크롤 |
| `wrap=true` | 긴 줄을 자동 줄바꿈; 현재 기본값 |
| `frame="none"` | 편집기·터미널 프레임 생략 |
| `frame="terminal"` | 터미널 프레임으로 표시 |

````markdown
```python showLineNumbers startLineNumber=10
name = "blog"
print(name)
```
````

```python showLineNumbers startLineNumber=10
name = "blog"
print(name)
```

## 동영상 넣기

서비스에서 제공하는 **공유 → 퍼가기** 코드를 마크다운 본문에 붙여 넣습니다. CMS 미리보기는 YouTube·Vimeo·Bilibili의 영상 플레이어 주소를 지원합니다.

```html
<iframe width="100%" height="468"
  src="https://www.youtube.com/embed/영상ID"
  title="영상 제목" allowfullscreen></iframe>
```

CMS 미리보기에서는 직접 작성한 `<script>`나 `<style>`을 실행하지 않습니다. 안내 박스·수식·GitHub 카드·코드 강조는 블로그의 전용 렌더러로 처리합니다.

## 문법이 그대로 보이면

1. `:::note`의 닫는 `:::`와 코드 블록의 닫는 백틱을 확인합니다.
2. 예제를 보여주려는 것이 아니라면 확장 문법을 코드 블록 밖에 작성합니다.
3. GitHub 카드는 `::github`, 안내 박스는 `:::note`처럼 콜론 개수가 다릅니다.
4. 변경 직후에는 미리보기가 준비될 때까지 잠깐 기다립니다.
