import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let instance: Db | undefined;

function getDb(): Db {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL er ikke satt. Kopier .env.example til .env.local og fyll inn verdiene.",
      );
    }
    instance = drizzle(neon(url), { schema });
  }
  return instance;
}

// Lazy proxy: tilkoblingen opprettes først ved faktisk bruk, ikke ved import.
// Det lar prosjektet bygge uten at DATABASE_URL er satt.
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
