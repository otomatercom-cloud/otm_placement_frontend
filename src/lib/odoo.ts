/**
 * Server-only Odoo 19 JSON-2 API client.
 *
 * This file must never be imported from a Client Component — it reads
 * ODOO_API_KEY from the environment and talks to Odoo directly. All
 * browser traffic goes through this app's own /api/* route handlers
 * (the BFF pattern), never straight to Odoo. Same shape as the
 * Car Wash / Fly deployment: POST /json/2/<model>/<method>, kwargs-only
 * body, `Authorization: bearer <key>` + `X-Odoo-Database` headers.
 */

import "server-only";

const ODOO_BASE_URL = process.env.ODOO_BASE_URL;
const ODOO_API_KEY = process.env.ODOO_API_KEY;
const ODOO_DB = process.env.ODOO_DB;

export class OdooError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "OdooError";
    this.status = status;
    this.data = data;
  }
}

function assertConfigured() {
  if (!ODOO_BASE_URL || !ODOO_API_KEY || !ODOO_DB) {
    throw new OdooError(
      "Odoo connection is not configured. Set ODOO_BASE_URL, ODOO_API_KEY and ODOO_DB.",
      500
    );
  }
}

type Kwargs = Record<string, unknown>;

/**
 * Calls POST {ODOO_BASE_URL}/json/2/<model>/<method> with a kwargs-only
 * body (Odoo 19 JSON-2 — no positional args/model/method envelope).
 */
export async function odooCall<T = unknown>(
  model: string,
  method: string,
  kwargs: Kwargs = {}
): Promise<T> {
  assertConfigured();

  const url = `${ODOO_BASE_URL}/json/2/${model}/${method}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${ODOO_API_KEY}`,
        "X-Odoo-Database": ODOO_DB as string,
      },
      body: JSON.stringify(kwargs),
      cache: "no-store",
    });
  } catch (err) {
    throw new OdooError(
      `Could not reach Odoo at ${ODOO_BASE_URL}: ${(err as Error).message}`,
      502
    );
  }

  const text = await res.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const message =
      (payload as { message?: string } | undefined)?.message ||
      `Odoo returned ${res.status} for ${model}.${method}`;
    throw new OdooError(message, res.status, payload);
  }

  return payload as T;
}

export function searchRead<T = Record<string, unknown>>(
  model: string,
  domain: unknown[] = [],
  fields: string[] = [],
  opts: Kwargs = {}
): Promise<T[]> {
  return odooCall<T[]>(model, "search_read", { domain, fields, ...opts });
}

/**
 * Odoo 19 breaking change (see ODOO19_RULES #71): the classic `read_group`
 * RPC method was replaced by `formatted_read_group(domain, groupby,
 * aggregates)`. The old method name is still callable on some builds but
 * returns the pre-19 key shape (no `__count`), so every caller here that
 * reads `row.__count` silently got 0 for every group — the dashboard's
 * breakdown charts rendered with real category labels but zero-height
 * bars, no error anywhere. `fields` is kept in the signature for callers
 * that still pass one, but the aggregate requested is always `__count`.
 */
export function readGroup<T = Record<string, unknown>>(
  model: string,
  domain: unknown[],
  groupby: string[],
  fields: string[] = []
): Promise<T[]> {
  void fields;
  return odooCall<T[]>(model, "formatted_read_group", { domain, groupby, aggregates: ["__count"] });
}

export function callMethod<T = unknown>(
  model: string,
  method: string,
  kwargs: Kwargs = {}
): Promise<T> {
  return odooCall<T>(model, method, kwargs);
}

export function create(model: string, values: Kwargs): Promise<number> {
  return odooCall<number>(model, "create", { vals_list: [values] }).then(
    (res) => (Array.isArray(res) ? (res as number[])[0] : (res as number))
  );
}

export function write(
  model: string,
  ids: number[],
  values: Kwargs
): Promise<boolean> {
  return odooCall<boolean>(model, "write", { ids, vals: values });
}

/**
 * Calls the module's own BFF controller routes (controllers/api_bff.py),
 * e.g. /api/placement/interviews/book. These carry the validated,
 * atomic business logic (double-booking protection, the one-active-
 * interview rule, notifications) that the public website pages already
 * use, so candidate-facing actions go through here rather than being
 * re-implemented against raw JSON-2 model calls. Secured by a shared
 * secret header, not the JSON-2 bearer key.
 */
export async function odooBffCall<T = unknown>(
  path: string,
  options: { method?: "GET" | "POST"; body?: Kwargs; query?: Record<string, string> } = {}
): Promise<T> {
  const secret = process.env.ODOO_BFF_SECRET;
  if (!ODOO_BASE_URL || !secret) {
    throw new OdooError(
      "Odoo BFF connection is not configured. Set ODOO_BASE_URL and ODOO_BFF_SECRET.",
      500
    );
  }
  const method = options.method || "GET";
  const qs = options.query
    ? "?" + new URLSearchParams(options.query).toString()
    : "";
  const url = `${ODOO_BASE_URL}${path}${qs}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Otm-Bff-Secret": secret,
      },
      body: method === "POST" ? JSON.stringify(options.body || {}) : undefined,
      cache: "no-store",
    });
  } catch (err) {
    throw new OdooError(
      `Could not reach Odoo at ${ODOO_BASE_URL}: ${(err as Error).message}`,
      502
    );
  }

  const text = await res.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  const body = payload as { ok?: boolean; error?: string } | undefined;
  if (!res.ok || body?.ok === false) {
    throw new OdooError(body?.error || `Request to ${path} failed.`, res.status || 500, payload);
  }

  return payload as T;
}
