/* SEN AI 중계 서버 주소 (Cloudflare Worker 배포 후 받은 주소를 넣는다)
   예: window.SEN_AI_ENDPOINT = "https://sen-ai-proxy.<계정이름>.workers.dev";
   비워 두면 AI 없이 검색·비식별 기능만 동작한다.
   API 키는 절대 이 파일에 넣지 않는다. 이 파일은 공개 저장소에 그대로 올라간다. */
window.SEN_AI_ENDPOINT = "https://sen-ai-proxy.endu20240108.workers.dev";
