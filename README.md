# KeystoneWiki

담당자들이 각자 쓰는 AI 툴(Claude 등)에게 "keystonewiki에 올려줘"라고만 말하면,
`_data/*.json`에 나무위키 스타일로 자동 분류·중복정리되어 쌓이고, Jekyll이 이를
좌측 카테고리 트리 / 우측 상세 뷰로 보여주는 사내 위키입니다.

## 빠른 시작

### 1. GitHub Pages 활성화
Settings → Pages → Source를 `main` 브랜치로 설정하면 자동으로 사이트가 빌드됩니다.

### 2. 담당자별 세팅 (git 지식 불필요)
각 담당자는 자신의 Claude(또는 다른 AI 툴)에 **GitHub 커넥터/MCP를 연결**하고,
`.claude/skills/keystonewiki-contributor/SKILL.md`를 자신의 스킬로 추가하면 끝입니다.
이후로는 대화 중에 "찾은 정보 keystonewiki에 올려줘"라고 말하기만 하면 AI가:

1. `_data/`를 읽어 기존 카테고리·중복 여부 확인
2. 새 카테고리가 필요하면 자동 생성 (특정 주제에 한정되지 않음 — IP든 보안이든 뭐든 가능)
3. 나무위키 톤으로 정리
4. **PR/Issue Form 없이** GitHub API로 `main`에 직접 커밋

### 3. 안전장치
`_data/**.json`이 push될 때마다 `.github/workflows/validate-data.yml`이 스키마를 검증합니다.
문제가 있으면 자동으로 GitHub Issue가 생성되어, 사람이 나중에 확인하거나 AI에게 재작업을
요청할 수 있습니다. 즉 리뷰는 "사전 승인형(PR)"이 아니라 "사후 감사형(post-hoc audit)"으로
설계되어 있어 담당자의 git 진입장벽이 없습니다.

## 구조

```
_data/*.json        대분류 하나 = 파일 하나 (자동으로 사이드바 카테고리가 됨)
_data/_meta.json    선택사항: 카테고리 표시 순서/아이콘
_layouts/wiki.html  좌/우 2단 레이아웃, site.data 전체를 JSON으로 임베드
assets/js/wiki.js   클릭 시 클라이언트에서 필터링/렌더링 (빌드타임 페이지 폭증 없음)
scripts/validate_data.py + .github/workflows/validate-data.yml   데이터 검증 안전망
.claude/skills/keystonewiki-contributor/SKILL.md   담당자 AI 툴이 따르는 기여 절차
```

## 새 카테고리를 추가하려면?
그냥 `_data/새주제.json`을 스키마에 맞게 추가하면 됩니다. 레이아웃/JS 코드 수정 불필요 —
사이드바가 `_data` 폴더를 순회하며 자동 생성됩니다. (AI 스킬이 이 과정도 자동으로 처리합니다.)
