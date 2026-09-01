const CACHE_TTL_SECONDS = 300;

function siteBaseUrl({
  org, site, env, ref,
}) {
  const domain = env === 'preview' ? 'aem.page' : 'aem.live';
  return `https://${ref || 'main'}--${site}--${org}.${domain}`;
}

// Edge-cached fetch so repeated tool calls in a chat stay well under the MCP timeout budget.
async function fetchJson(url) {
  const cache = caches.default;
  const cacheKey = new Request(url, { method: 'GET' });
  const cached = await cache.match(cacheKey).catch(() => undefined);
  if (cached) {
    return cached.json();
  }

  const fetched = await fetch(url);
  if (!fetched.ok) {
    throw new Error(`Failed to fetch ${url}: ${fetched.status}`);
  }

  const cacheable = new Response(fetched.body, fetched);
  cacheable.headers.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}`);
  await cache.put(cacheKey, cacheable.clone()).catch(() => {});
  return cacheable.json();
}

export async function fetchBlockConfig({
  org, site, env, ref,
}) {
  if (!org || !site) {
    throw new Error('Both "org" and "site" arguments are required.');
  }

  const base = siteBaseUrl({
    org, site, env, ref,
  });

  const [definitions, models, filters] = await Promise.all([
    fetchJson(`${base}/component-definition.json`),
    fetchJson(`${base}/component-models.json`),
    fetchJson(`${base}/component-filters.json`),
  ]);

  return {
    base, definitions, models, filters,
  };
}
