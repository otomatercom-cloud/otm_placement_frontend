import "server-only";
import { odooCall } from "./odoo";

const ODOO_BASE_URL = process.env.ODOO_BASE_URL;
const ODOO_DB = process.env.ODOO_DB;

const PLACEMENT_GROUP_NAMES = [
  "group_placement_user",
  "group_placement_manager",
  "group_placement_administrator",
];

/**
 * Verifies a login/password pair against Odoo's own session authentication
 * endpoint (the same one the Odoo web client uses) and, on success, checks
 * the authenticated user belongs to one of the Placement groups. Returns
 * {uid, name} on success, or null if the credentials are wrong or the user
 * isn't placement staff.
 *
 * This never stores the Odoo session cookie: once we know who the person
 * is, all subsequent data access goes through the service JSON-2 API key
 * (lib/odoo.ts), not the staff member's own Odoo session.
 */
export async function authenticateStaff(
  login: string,
  password: string
): Promise<{ uid: number; name: string } | null> {
  if (!ODOO_BASE_URL || !ODOO_DB) {
    throw new Error("ODOO_BASE_URL / ODOO_DB are not configured.");
  }

  const res = await fetch(`${ODOO_BASE_URL}/web/session/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { db: ODOO_DB, login, password },
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    result?: { uid?: number | false; name?: string; username?: string };
    error?: unknown;
  };
  const uid = data.result?.uid;
  if (!uid) return null;

  // Confirm this user is actually placement staff, not just any Odoo login.
  const groupRows = await odooCall<{ res_id: number }[]>("ir.model.data", "search_read", {
    domain: [
      ["module", "=", "otm_placement_management"],
      ["model", "=", "res.groups"],
      ["name", "in", PLACEMENT_GROUP_NAMES],
    ],
    fields: ["res_id"],
  });
  const placementGroupIds = groupRows.map((r) => r.res_id);
  if (placementGroupIds.length === 0) return null;

  const [userRow] = await odooCall<{ id: number; name: string; group_ids: number[] }[]>(
    "res.users",
    "search_read",
    {
      domain: [["id", "=", uid]],
      fields: ["name", "group_ids"],
    }
  );
  if (!userRow) return null;

  const isPlacementStaff = userRow.group_ids.some((gid) => placementGroupIds.includes(gid));
  if (!isPlacementStaff) return null;

  return { uid, name: userRow.name };
}
