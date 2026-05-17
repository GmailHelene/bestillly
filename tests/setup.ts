// Lastes før integrasjonstestene. Henter inn .env.local slik at
// TEST_DATABASE_URL er tilgjengelig.
import { config } from "dotenv";

config({ path: ".env.local" });
