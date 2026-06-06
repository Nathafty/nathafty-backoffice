// Bootstrap de données de test pour les endpoints Flutter.
// Idempotent : peut être relancé sans dupliquer.
// Utilise l'API REST Supabase (Auth admin + PostgREST) via fetch — aucune dépendance.
// Usage : node scripts/setup-test-data.mjs
import { readFileSync } from "node:fs";

// --- Chargement minimal de .env.local ---
function loadEnv(path) {
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}
loadEnv(".env.local");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = {
  apikey: SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

async function api(path, init = {}) {
  const res = await fetch(`${URL}${path}`, { ...init, headers: { ...H, ...init.headers } });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${res.status} ${path} :: ${text}`);
  return body;
}

const CLIENT_HOUSEHOLD = "EURPXVFS89";
const CLIENT_PASSWORD = "Test1234!";
const DRIVER_EMAIL = "collecteur.test@nathafty.mr";
const DRIVER_PASSWORD = "Test1234!";
const TODAY = new Date().toISOString().slice(0, 10);

async function main() {
  // 1) CLIENT : pose un mot de passe sur le user du ménage.
  const [hh] = await api(
    `/rest/v1/households?id=eq.${CLIENT_HOUSEHOLD}&select=id,user_id,name`,
  );
  if (!hh) throw new Error(`Ménage ${CLIENT_HOUSEHOLD} introuvable`);
  const clientUser = await api(`/auth/v1/admin/users/${hh.user_id}`);
  await api(`/auth/v1/admin/users/${hh.user_id}`, {
    method: "PUT",
    body: JSON.stringify({ password: CLIENT_PASSWORD, email_confirm: true }),
  });

  // 2) DRIVER : compte auth (créé ou mot de passe réinitialisé).
  const list = await api(`/auth/v1/admin/users?page=1&per_page=200`);
  let driverUser = (list.users ?? []).find((u) => u.email === DRIVER_EMAIL);
  if (!driverUser) {
    driverUser = await api(`/auth/v1/admin/users`, {
      method: "POST",
      body: JSON.stringify({
        email: DRIVER_EMAIL,
        password: DRIVER_PASSWORD,
        email_confirm: true,
      }),
    });
  } else {
    await api(`/auth/v1/admin/users/${driverUser.id}`, {
      method: "PUT",
      body: JSON.stringify({ password: DRIVER_PASSWORD }),
    });
  }

  // 3) Ligne drivers liée au user.
  let [driverRow] = await api(
    `/rest/v1/drivers?user_id=eq.${driverUser.id}&select=id`,
  );
  if (!driverRow) {
    [driverRow] = await api(`/rest/v1/drivers`, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: driverUser.id,
        name: "Moussa Test",
        phone: "+22240000000",
      }),
    });
  }

  // 4) Rôle 'driver' (upsert sur user_id).
  await api(`/rest/v1/user_roles?on_conflict=user_id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ user_id: driverUser.id, role: "driver" }),
  });

  // 5) Affecte les collectes au collecteur ; collecte 1 = aujourd'hui, maison 1 = pending.
  await api(`/rest/v1/collections?id=in.(1,2)`, {
    method: "PATCH",
    body: JSON.stringify({ driver_id: driverRow.id }),
  });
  await api(`/rest/v1/collections?id=eq.1`, {
    method: "PATCH",
    body: JSON.stringify({ scheduled_date: TODAY }),
  });
  await api(`/rest/v1/houses_to_collect?id=eq.1`, {
    method: "PATCH",
    body: JSON.stringify({ status: "pending" }),
  });

  console.log(JSON.stringify(
    {
      client: { email: clientUser.email, password: CLIENT_PASSWORD, household_id: hh.id },
      driver: { email: DRIVER_EMAIL, password: DRIVER_PASSWORD, driver_id: driverRow.id },
      today_collection_id: 1,
      house_ids: { pending_for_complete: 1, for_skip: 2 },
    },
    null,
    2,
  ));
}

main().catch((e) => {
  console.error("ECHEC:", e.message ?? e);
  process.exit(1);
});
