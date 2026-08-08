---
name: keystonewiki-contributor
description: Use this skill whenever the user asks to upload, post, save, organize, merge, or update information into "keystonewiki" (also called "wiki", "keystone wiki", "우리 위키", or a team GitHub knowledge base) — regardless of topic (IP, security, patents, market/competitor research, HR, process docs, or anything else). Trigger on phrases like "이거 wiki에 올려줘", "keystonewiki에 정리해줘", "찾은 정보 위키에 저장해줘", "위키 업데이트해줘", or any request to contribute research/findings to the shared GitHub wiki. This skill reads the existing _data/*.json files in the keystonewiki repo, decides the right category/subcategory (creating a new one if none fits — the wiki is topic-agnostic), merges duplicate entries instead of creating new ones, writes 나무위키 스타일의 정리된 글, and commits directly to the repo via the GitHub API/MCP tool — no manual PR or Issue Form required from the user.
---

# KeystoneWiki Contributor

담당자가 "이거 keystonewiki에 올려줘"라고만 말해도, 대화에서 찾은/정리한 정보를 GitHub 저장소의
`_data/*.json`에 나무위키 스타일로 분류·중복정리해서 커밋하는 스킬입니다.

**이 스킬은 특정 주제(IP 등)에 종속되지 않습니다.** 어떤 대분류/소분류든 데이터를 보고 그때그때 판단하세요.

## 0. 사전 준비 확인

1. GitHub에 쓰기 권한이 있는 도구(GitHub MCP connector 또는 `gh` CLI, API 토큰)가 연결되어 있는지 확인.
   없으면 사용자에게 GitHub 연결을 켜달라고 안내하고 중단하세요. 임의로 로컬 파일만 만들어놓고
   "올렸다"고 말하지 마세요.
2. 저장소 owner/repo, 기본 브랜치(보통 `main`)를 이미 알고 있지 않다면 한 번만 물어보고, 이후 대화에서는
   기억해서 재사용하세요.

## 1. 기존 데이터 파악

1. 저장소의 `_data/` 디렉터리 목록을 조회합니다 (GitHub Contents API 등). 파일명(확장자 제외)이 곧
   **대분류(top-level category)** 입니다. 예: `ip.json` → "IP", `security.json` → "보안".
2. `_data/_meta.json`이 있으면 함께 읽어 카테고리 표시 이름/아이콘/순서를 참고합니다 (없어도 무방 —
   optional 메타데이터일 뿐, 없으면 파일명을 그대로 표시명으로 씁니다).
3. 새로 올릴 정보가 기존 대분류 중 하나에 명확히 속하면 그 파일을 사용합니다.
4. 애매하거나 맞는 대분류가 없으면 **새 대분류를 만들어도 됩니다.** 이 위키는 주제를 미리 제한하지
   않습니다. 이 경우:
   - 새 파일 `_data/<slug>.json`을 스키마(§3)에 맞게 생성
   - `_meta.json`이 존재한다면 거기에도 새 카테고리 항목을 추가 (표시명, 순서)
   - 새 카테고리를 만든다는 사실을 사용자에게 한 줄로 알려주세요 (되돌리기 쉬우니 확인까지 받을 필요는 없음)

## 2. 소분류(subcategory) 판단

대상 JSON 파일의 `subcategories` 키들을 보고:
- 의미상 맞는 기존 소분류가 있으면 그 배열에 추가
- 없으면 새 키를 만들어 추가 (예: IP 파일에 "출원"이 없었다면 새로 생성)

소분류 이름은 사용자가 준 카테고리 힌트(예: "분쟁/매입/출원")를 최대한 존중하되, 없으면 내용에 맞게 판단해서 지으세요.

## 3. 항목(entry) 스키마

```json
{
  "category": "IP",
  "subcategories": {
    "분쟁": [
      {
        "id": "ip-분쟁-2026-08-0001",
        "title": "○○사 특허소송 현황",
        "summary": "한 줄 요약 (검색결과 리스트에 표시됨)",
        "body": "나무위키 스타일 본문. 섹션 나눠도 됨. 마크다운 허용.",
        "tags": ["NPE", "IPR"],
        "sources": ["https://..."],
        "contributors": ["A"],
        "created": "2026-08-08",
        "updated": "2026-08-08"
      }
    ]
  }
}
```

- `id`: `<대분류-slug>-<소분류-slug>-<yyyy-mm>-<4자리 순번>` 형식으로 충돌 없이 생성. 기존 id들을
  확인해서 순번을 이어가세요.
- `body`: 나무위키 톤 — 건조하고 정보밀도 높게, 광고 문구/미사여구 금지, 사실 위주. 출처가 불확실한
  주장은 넣지 않습니다.
- `sources`: 원문 링크. 저작권 규정상 본문에 원문을 그대로 인용하지 말고 반드시 자기 언어로 재서술.

## 4. 중복 판정 및 병합 (핵심)

같은 소분류 안의 기존 항목들과 **의미 기준**으로 비교하세요 (제목 문자열 완전일치가 아님):

- 동일 사안/동일 대상에 대한 정보인가? (예: 같은 소송 건, 같은 후보 물질, 같은 벤더)라면 **새 항목을
  만들지 말고 기존 항목을 갱신**합니다:
  - `body`에 새 정보를 자연스럽게 통합 (덮어쓰지 말고 병합 — 기존 내용 중 여전히 유효한 건 유지)
  - `sources` 배열에 새 출처 추가 (중복 URL 제외)
  - `contributors` 배열에 기여자 추가 (이미 있으면 생략)
  - `updated` 갱신
- 명백히 다른 사안이면 새 항목을 추가합니다.
- 애매하면 최근 것을 우선 신뢰하되, 상충되는 정보라면 body에 "(2026-08 기준 정정: ...)" 식으로
  갱신 이력을 남기세요. 조용히 지우지 마세요.

## 5. 커밋 (PR/Issue 없이 바로 반영)

담당자가 git을 몰라도 되도록, **Issue Form이나 PR을 만들게 하지 않습니다.** 이 스킬을 실행하는 AI가
GitHub API/MCP의 "create or update file" 기능으로 직접 커밋합니다.

1. 대상 JSON 파일을 다시 한 번 최신 상태로 가져와 `sha`(또는 등가의 버전 정보)를 확보합니다 — 방금
   §1에서 읽은 게 오래됐을 수 있으니 커밋 직전 재확인.
2. 파일 내용을 갱신된 JSON으로 교체하여 `main` 브랜치에 직접 커밋합니다.
   - 커밋 메시지 형식: `[wiki] <대분류>/<소분류>: <제목> (신규|갱신)`
3. 만약 커밋이 sha 불일치(동시 편집 충돌)로 실패하면, 최신 내용을 다시 받아 병합을 한 번 더 시도하세요
   (파일이 카테고리별로 나뉘어 있어 충돌은 드뭅니다).
4. 새 카테고리를 만들었다면 `_meta.json`도 같은 커밋 또는 뒤이은 커밋으로 갱신합니다.

## 6. 사용자에게 보고

간결하게 한두 줄로: 무엇을 신규 추가했는지 / 어떤 기존 항목에 병합했는지, 카테고리/소분류 경로,
(가능하면) GitHub Pages 링크. 장황한 설명 불필요.

## 참고: 이 스킬이 하지 않는 것

- PR 생성, Issue Form 작성 — 하지 않습니다 (직접 커밋).
- Jekyll HTML 파일 수정 — 하지 않습니다 (사이드바/카테고리는 `_data`만 보고 자동 생성되므로 JSON만
  건드리면 됩니다).
