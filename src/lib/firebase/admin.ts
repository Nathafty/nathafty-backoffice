import "server-only";
import { type App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import { env } from "@/core/config/env";

/**
 * Firebase Admin SDK — singleton.
 * Initialisé depuis les credentials du compte de service (env serveur uniquement).
 */
let app: App | null = null;

function getAdminApp(): App {
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
      });
  }
  return app;
}

export function getFcm(): Messaging {
  return getMessaging(getAdminApp());
}
