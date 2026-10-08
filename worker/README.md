# SEN AI 중계 서버 (Cloudflare Worker)

GitHub Pages는 정적 파일만 올라가므로 AI API 키를 페이지에 둘 수 없다. 이 Worker가 키를 보관하고 `sen-ai-poc.html`의 질문을 Claude API로 넘긴다.

```
브라우저 (rightsky.github.io/sen-portal/sen-ai-poc.html)
   │  POST /chat  { messages }
   ▼
Cloudflare Worker (sen-ai-proxy) : 키 보관 · 출처 제한 · 길이/횟수 제한
   │
   ▼
Claude API  →  스트리밍 응답 → 화면
```

## 1. 준비 (직접 해야 하는 일)

1. **Anthropic API 키 발급** : console.anthropic.com → API Keys → Create Key
2. **월 사용 한도 설정** : Console → Billing(또는 Limits)에서 월 한도를 정해 둔다. 공개 PoC라면 가장 확실한 비용 안전장치다.
3. **Cloudflare 계정** : dash.cloudflare.com 무료 가입
4. PC에 **Node.js** (18 이상) 설치

## 2. 배포

저장소의 `worker` 폴더에서:

```bash
cd worker
npx wrangler login                          # 브라우저에서 Cloudflare 로그인
npx wrangler secret put ANTHROPIC_API_KEY   # 발급받은 키를 붙여 넣기 (화면에 표시되지 않음)
npx wrangler deploy                         # 배포 → https://sen-ai-proxy.<계정>.workers.dev 주소가 나온다
```

확인: 브라우저에서 `https://sen-ai-proxy.<계정>.workers.dev/health` → `{"ok":true}`

## 3. 페이지에 연결

저장소 루트의 `sen-ai-config.js`에 Worker 주소를 넣고 커밋한다.

```js
window.SEN_AI_ENDPOINT = "https://sen-ai-proxy.<계정>.workers.dev";
```

1~2분 뒤 `sen-ai-poc.html` 상단 배지가 **AI 연결됨 · SEN AI 서버**로 바뀌면 끝.

커밋 전에 먼저 시험해 보려면 주소 뒤에 붙인다 (이 브라우저에만 기억됨, `?ai=` 로 비우면 해제):
`https://rightsky.github.io/sen-portal/sen-ai-poc.html?ai=https://sen-ai-proxy.<계정>.workers.dev`

## 4. 설정값 (`wrangler.toml` → `[vars]`)

| 이름 | 기본값 | 의미 |
|---|---|---|
| ALLOWED_ORIGINS | rightsky.github.io, localhost:8000 | 이 출처에서 온 요청만 받음 |
| MODEL | claude-haiku-5-5 | 품질을 높이려면 claude-sonnet-5-5 |
| MAX_OUTPUT_TOKENS | 1200 | 답변 최대 길이 |
| MAX_INPUT_CHARS | 24000 | 질문+근거 최대 글자 수 |
| RATE_PER_MINUTE | 8 | IP당 분당 요청 수 (인스턴스 단위 간이 제한) |

값을 바꾼 뒤 `npx wrangler deploy` 를 다시 실행한다.

## 5. 보안·운영 메모

- 키는 Worker Secret에만 있다. `sen-ai-config.js`, `wrangler.toml`에는 절대 적지 않는다.
- 출처 제한은 브라우저 기준이라 스크립트로 우회할 수 있다. 공개 시연 기간에는 Cloudflare 대시보드 → Security → WAF → Rate limiting rules 에서 `/chat` 경로에 IP별 제한을 하나 더 걸어 두면 안전하다.
- Worker가 모든 요청 앞에 "진로·진학 관련 질문만 답한다, 합격을 단정하지 않는다" 지침을 붙인다 (`src/index.js`의 `SERVER_SYSTEM`).
- 생기부 어시스턴트는 브라우저에서 비식별 처리한 텍스트만 보낸다. 그래도 시연에는 예시(합성) 데이터만 쓴다.
- 로그 확인: `npx wrangler tail`
