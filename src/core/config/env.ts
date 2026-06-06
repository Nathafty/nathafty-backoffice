import "server-only";
import { z } from "zod";

/**
 * Validation des variables d'environnement serveur.
 *
 * La validation est PARESSEUSE : elle ne se déclenche qu'au premier accès à une
 * propriété de `env` (donc au runtime d'une requête), jamais au simple import du
 * module. Cela permet à `next build` / l'analyse statique d'importer les routes
 * sans exiger les secrets, tout en échouant tôt et clairement à l'exécution.
 */
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
});

type Env = z.infer<typeof schema>;

let cache: Env | null = null;

function load(): Env {
  if (cache) return cache;

  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(
      `Variables d'environnement invalides ou manquantes : ${missing}. ` +
        `Voir .env.local.example.`,
    );
  }

  cache = {
    ...parsed.data,
    // Les clés privées sont stockées avec des \n échappés dans .env — on les restaure.
    FIREBASE_PRIVATE_KEY: parsed.data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
  return cache;
}

export const env = new Proxy({} as Env, {
  get: (_target, prop: string) => load()[prop as keyof Env],
});
