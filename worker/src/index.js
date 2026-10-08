/**
 * SEN AI 중계 서버 (Cloudflare Worker)
 *
 * GitHub Pages(정적) → 이 Worker → Claude API
 * - API 키는 Worker Secret(ANTHROPIC_API_KEY)에만 보관한다. 브라우저에는 절대 노출되지 않는다.
 * - 허용한 출처(ALLOWED_ORIGINS)에서 온 요청만 받는다.
 * - 입력 길이·출력 토큰·IP별 요청 횟수를 제한해 비용 폭주를 막는다.
 * - 응답은 SSE 스트림으로 그대로 흘려 보내 화면에 글자가 순서대로 찍히게 한다.
 *
 * 요청 형식 (POST /chat)
 *   { "messages": [ { "role": "user" | "assistant", "content": "..." }, ... ] }
 * 응답: text/event-stream (Anthropic Messages API 스트림 그대로)
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// 서버에서 항상 앞에 붙이는 공통 지침. 페이지가 보낸 프롬프트보다 우선한다.
const SERVER_SYSTEM = [
  "당신은 서울 진로진학 통합플랫폼(PoC)의 안내 AI입니다.",
  "진로·진학·대입·학교생활기록부와 관련된 질문에만 답하고, 그 밖의 요청은 정중히 거절하세요.",
  "합격 여부나 합격 확률을 단정하지 마세요. 판단이 필요한 내용은 선생님 상담으로 확인하도록 안내하세요.",
  "개인 식별 정보를 추측하거나 만들어 내지 마세요.",
].join("\n");

// 같은 Worker 인스턴스 안에서만 유지되는 간이 횟수 제한 (정밀한 제한은 README의 WAF 규칙 참고)
const hits = new Map();

function rateLimited(ip, perMinute) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (list.length >= perMinute) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(origin ? corsHeaders(origin) : {}) },
  });
}

function validMessages(messages, maxChars) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) return "messages_invalid";
  let total = 0;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return "messages_invalid";
    if (!m.content.trim()) return "messages_invalid";
    total += m.content.length;
  }
  if (messages[0].role !== "user" || messages[messages.length - 1].role !== "user") return "messages_invalid";
  if (total > maxChars) return "too_long";
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const okOrigin = allowed.includes(origin);

    if (request.method === "OPTIONS") {
      return okOrigin ? new Response(null, { status: 204, headers: corsHeaders(origin) }) : new Response(null, { status: 403 });
    }

    if (url.pathname === "/health") return json(200, { ok: true }, okOrigin ? origin : null);

    if (url.pathname !== "/chat" || request.method !== "POST") return json(404, { error: "not_found" }, okOrigin ? origin : null);
    if (!okOrigin) return json(403, { error: "origin_not_allowed" });
    if (!env.ANTHROPIC_API_KEY) return json(500, { error: "server_not_configured" }, origin);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (rateLimited(ip, Number(env.RATE_PER_MINUTE || 8))) return json(429, { error: "rate_limited" }, origin);

    let body;
    try {
      body = await request.json();
    } catch {
      return json(400, { error: "bad_json" }, origin);
    }

    const problem = validMessages(body.messages, Number(env.MAX_INPUT_CHARS || 24000));
    if (problem) return json(400, { error: problem }, origin);

    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.MODEL || "claude-haiku-5-5",
        max_tokens: Number(env.MAX_OUTPUT_TOKENS || 1200),
        system: SERVER_SYSTEM,
        messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const code = upstream.status === 429 ? "rate_limited" : upstream.status === 401 ? "server_not_configured" : "upstream_" + upstream.status;
      // 원인 파악용: Claude API가 돌려준 오류 종류와 문구 (키 값은 들어 있지 않다)
      let detail = "";
      try {
        const e = (await upstream.json()).error || {};
        detail = [e.type, e.message].filter(Boolean).join(" : ").slice(0, 300);
      } catch {}
      return json(upstream.status === 429 ? 429 : 502, { error: code, detail }, origin);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store",
        ...corsHeaders(origin),
      },
    });
  },
};
