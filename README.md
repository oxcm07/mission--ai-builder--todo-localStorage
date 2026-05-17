# Next.js Todo localStorage App

Next.js App Router, React, TypeScript, Tailwind CSS, localStorage로 구현한 할일 리스트 웹앱입니다. 별도 백엔드, DB, 인증 없이 브라우저 저장소만 사용합니다.

## 주요 기능

- 할일 추가, 완료 토글, 인라인 수정, 삭제
- 전체 / 진행 중 / 완료 필터
- 텍스트 검색
- 완료 항목 전체 삭제
- 전체, 완료, 진행 중, 완료율 통계
- localStorage 기반 데이터 유지
- localStorage 기반 라이트 / 다크 모드 유지
- 반응형 카드형 UI와 접근성 라벨

## 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

프로덕션 빌드는 아래 명령으로 확인할 수 있습니다.

```bash
npm run build
```

ESLint 검사는 아래 명령으로 실행합니다.

```bash
npm run lint
```

## GitHub 업로드 방법

```bash
git init
git add .
git commit -m "Initial todo app"
git branch -M main
git remote add origin <GitHub Repository URL>
git push -u origin main
```

이미 원격 저장소가 설정되어 있다면 `git remote add origin ...` 대신 현재 원격 주소를 확인한 뒤 push하면 됩니다.

```bash
git remote -v
git push -u origin main
```

## Vercel 자동 배포 연결 방법

1. Vercel에 로그인합니다.
2. `Add New Project`를 선택합니다.
3. GitHub repository를 import합니다.
4. `Framework Preset`은 `Next.js`를 선택합니다.
5. `Build Command`는 기본값을 사용합니다.
6. `Output Directory`도 기본값을 사용합니다.
7. `Deploy`를 클릭합니다.
8. 이후 GitHub `main` 브랜치에 push하면 Vercel이 자동으로 재배포합니다.

## 주의사항

- Vercel 자동 배포는 코드로 직접 구현하는 기능이 아닙니다. Vercel과 GitHub 저장소를 연결하면 Vercel이 push 이벤트를 감지해 자동으로 빌드 및 배포합니다.
- 이 앱은 localStorage 기반 앱이므로 할일과 테마 데이터는 브라우저/기기별로 따로 저장됩니다.
- localStorage는 클라이언트에서만 접근하도록 구현해 SSR/CSR hydration 문제를 피합니다.

## localStorage Keys

- 할일 목록: `next-todo-app-items`
- 테마: `next-todo-app-theme`
