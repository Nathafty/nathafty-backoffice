import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

/**
 * Barrière UX (pas la barrière de sécurité réelle — voir `core/http/withAdminRoute.ts`,
 * qui revérifie session + rôle côté Server Action pour chaque route d'écriture).
 * Redirige vers /admin/login si pas de session, ou si le rôle n'est pas admin/super_admin.
 */
export async function middleware(request: NextRequest) {
  // La page de connexion elle-même doit rester joignable, sinon boucle de redirection infinie.
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  const redirectToLogin = () => {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  };

  if (!data.user) return redirectToLogin();

  // Lecture du rôle avec le client service-role : ne dépend pas de l'état RLS de user_roles.
  const roleClient = createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
  const { data: roleRow } = await roleClient
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!roleRow || !ADMIN_ROLES.has(roleRow.role as string)) return redirectToLogin();

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
