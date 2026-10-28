const API_BASE = "https://comparaloo.es/api/v1/products";
const ALLOWED_SORTS = new Set(["relevance", "price_asc", "price_desc", "newest"]);
export default async (request) => {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  };
  const respond = (status, body) => new Response(JSON.stringify(body), { status, headers });
  if (request.method !== "GET") return respond(405, { error: { code: "method_not_allowed", message: "Método no permitido." } });
  const key = process.env.COMPARALOO_API_KEY;
  if (!key) return respond(503, { error: { code: "api_not_configured", message: "La API de precios aún no está configurada en el servidor." } });
  const incoming = new URL(request.url);
  const q = (incoming.searchParams.get("q") || "").trim().slice(0, 120);
  if (q.length < 2) return respond(400, { error: { code: "invalid_request", message: "Escribe al menos dos caracteres para buscar." } });
  const sortValue = incoming.searchParams.get("sort") || "price_asc";
  const sort = ALLOWED_SORTS.has(sortValue) ? sortValue : "price_asc";
  const limitRaw = Number.parseInt(incoming.searchParams.get("limit") || "30", 10);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(30, limitRaw)) : 30;
  const target = new URL(API_BASE);
  target.searchParams.set("q", q);
  target.searchParams.set("sort", sort);
  target.searchParams.set("limit", String(limit));
  const maxPriceRaw = incoming.searchParams.get("max_price");
  if (maxPriceRaw !== null && maxPriceRaw.trim() !== "") {
    const maxPrice = Number(maxPriceRaw);
    if (!Number.isFinite(maxPrice) || maxPrice < 0) return respond(400, { error: { code: "invalid_request", message: "El precio máximo no es válido." } });
    target.searchParams.set("max_price", String(maxPrice));
  }
  try {
    const upstream = await fetch(target.toString(), {
      headers: { "Authorization": `Bearer ${key}`, "Accept": "application/json" },
      signal: AbortSignal.timeout(12000)
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      const upstreamCode = data?.error?.code;
      if (upstream.status === 401) return respond(502, { error: { code: "upstream_error", message: "La fuente rechazó la clave. Comprueba la clave configurada." } });
      if (upstream.status === 403 && upstreamCode === "account_pending") return respond(403, { error: { code: "account_pending", message: "La solicitud de acceso a la API está pendiente de aprobación." } });
      if (upstream.status === 403 && upstreamCode === "account_suspended") return respond(403, { error: { code: "account_suspended", message: "El acceso a la API está suspendido o rechazado." } });
      if (upstream.status === 429) return respond(429, { error: { code: "rate_limited", message: "Se ha alcanzado el límite de consultas de la API." } });
      if (upstream.status === 400) return respond(400, { error: { code: "invalid_request", message: "La fuente no acepta alguno de los parámetros enviados." } });
      return respond(502, { error: { code: "upstream_error", message: "La fuente de precios no está disponible temporalmente." } });
    }
    if (!data || !Array.isArray(data.data)) return respond(502, { error: { code: "upstream_error", message: "La fuente devolvió una respuesta no reconocida." } });
    return respond(200, { data: data.data, page: data.page || null, source: "Comparaloo", fetched_at: new Date().toISOString() });
  } catch {
    return respond(504, { error: { code: "upstream_error", message: "La consulta a la fuente de precios ha tardado demasiado. Inténtalo de nuevo." } });
  }
};
