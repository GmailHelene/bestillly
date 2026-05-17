import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  time,
  date,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import type { OnepageContent } from "@/lib/onepage";

export const bookingStatus = pgEnum("booking_status", ["confirmed", "cancelled"]);
export const exceptionType = pgEnum("exception_type", ["closed", "custom_hours"]);

// Én bedrift = én tenant. slug brukes i offentlig onepage-URL (bestilly.no/[slug]).
export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  description: text("description"),
  template: text("template").notNull().default("default"),
  onepageContent: jsonb("onepage_content").$type<OnepageContent>(),
  // Kontostatus: "active" eller "paused" (ved manglende betaling).
  status: text("status").notNull().default("active"),
  // Dato abonnementet er betalt til (informativt).
  activeUntil: date("active_until"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Bedriftseier som logger inn i admin. Passord-basert (Auth.js Credentials).
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Behandling/tjeneste bedriften tilbyr.
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull(),
  priceNok: integer("price_nok").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Fast ukerytme. weekday: 1 = mandag ... 7 = søndag (ISO-8601).
export const workingHours = pgTable("working_hours", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  weekday: integer("weekday").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

// Avvik fra ukerytmen for en konkret dato (ferie = closed, eller egne tider).
export const availabilityExceptions = pgTable("availability_exceptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  type: exceptionType("type").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
});

// En booking. Ingen kundekonto — kundedata ligger på selve bookingen.
// Avbestilling skjer via cancellationToken-lenke i bekreftelses-e-posten.
// Overlapp/dobbeltbooking forhindres i app-logikk innenfor en DB-transaksjon.
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: bookingStatus("status").notNull().default("confirmed"),
    cancellationToken: uuid("cancellation_token").notNull().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("bookings_business_starts_idx").on(t.businessId, t.startsAt)],
);

export type Business = typeof businesses.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
