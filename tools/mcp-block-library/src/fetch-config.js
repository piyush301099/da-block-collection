const CACHE_TTL_SECONDS = 300;

// Allowlist for any value interpolated into a fetch URL (org/site/ref/blockName) — prevents
// path traversal or host-confusion via unexpected characters.
const SAFE_SEGMENT = /^[a-z0-9][a-z0-9-]*$/i;

function assertSafeSegment(label, value) {
  if (!SAFE_SEGMENT.test(value)) {
    throw new Error(`Invalid "${label}": must contain only letters, numbers, and hyphens.`);
  }
}

function siteBaseUrl({
  org, site, env, ref,
}) {
  const domain = env === 'preview' ? 'aem.page' : 'aem.live';
  const safeRef = ref || 'main';
  assertSafeSegment('org', org);
  assertSafeSegment('site', site);
  assertSafeSegment('ref', safeRef);
  return `https://${safeRef}--${site}--${org}.${domain}`;
}

// Edge-cached fetch so repeated tool calls in a chat stay well under the MCP timeout budget.
async function fetchCached(url) {
  const cache = caches.default;
  const cacheKey = new Request(url, { method: 'GET' });
  const cached = await cache.match(cacheKey).catch(() => undefined);
  if (cached) {
    return cached;
  }

  const fetched = await fetch(url);
  if (!fetched.ok) {
    throw new Error(`Failed to fetch ${url}: ${fetched.status}`);
  }

  const cacheable = new Response(fetched.body, fetched);
  cacheable.headers.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}`);
  await cache.put(cacheKey, cacheable.clone()).catch(() => {});
  return cacheable;
}

async function fetchJson(url) {
  const response = await fetchCached(url);
  return response.json();
}

async function fetchText(url) {
  const response = await fetchCached(url);
  return response.text();
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

export async function fetchBlockSource({
  org, site, env, ref, blockName,
}) {
  if (!org || !site || !blockName) {
    throw new Error('"org", "site", and "blockName" arguments are required.');
  }
  assertSafeSegment('blockName', blockName);

  const base = siteBaseUrl({
    org, site, env, ref,
  });

  const [js, css] = await Promise.all([
    fetchText(`${base}/blocks/${blockName}/${blockName}.js`).catch(() => null),
    fetchText(`${base}/blocks/${blockName}/${blockName}.css`).catch(() => null),
  ]);

  if (js === null && css === null) {
    throw new Error(`No source found for block "${blockName}" at ${base}/blocks/${blockName}/.`);
  }

  return {
    base, js, css,
  };
}
