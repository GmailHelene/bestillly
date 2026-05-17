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
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { OnepageContent } from "@/lib/onepage";
import type { MarketingProfile } from "@/lib/marketing";

export const bookingStatus = pgEnum("booking_status", ["confirmed", "cancelled"]);
export const exceptionType = pgEnum("exception_type", ["closed", "custom_hours"]);
export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "cancelled",
]);

// Et varelinje-øyeblikksbilde lagret på ordren (jsonb).
export type OrderItem = { name: string; priceNok: number; qty: number };

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
  // Nettbutikk: Vipps-nummer og fraktinnstillinger.
  vippsNumber: text("vipps_number"),
  shippingFree: boolean("shipping_free").notNull().default(true),
  shippingFee: integer("shipping_fee").notNull().default(99),
  shippingLabel: text("shipping_label"),
  // Markedsføringsprofil (Fase 3).
  marketingProfile: jsonb("marketing_profile").$type<MarketingProfile>(),
  // AI-kreditter (Fase 3) — månedlig pott, nullstilles ved månedsskifte.
  aiPeriod: text("ai_period"),
  aiTextUsed: integer("ai_text_used").notNull().default(0),
  aiImagesUsed: integer("ai_images_used").notNull().default(0),
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
// Et partielt unikt indeks (bookings_no_double_idx) hindrer at to bekreftede
// bookinger havner på samme starttidspunkt — sikrer mot dobbeltbooking-race.
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
  (t) => [
    index("bookings_business_starts_idx").on(t.businessId, t.startsAt),
    uniqueIndex("bookings_no_double_idx")
      .on(t.businessId, t.startsAt)
      .where(sql`status = 'confirmed'`),
  ],
);

// Varer bedriften selger i nettbutikken sin (Fase 2).
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  priceNok: integer("price_nok").notNull(),
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Bestillinger fra nettbutikken (Fase 2).
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: serial("order_number").notNull(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotalNok: integer("subtotal_nok").notNull(),
  shippingNok: integer("shipping_nok").notNull(),
  totalNok: integer("total_nok").notNull(),
  status: orderStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Blogginnlegg / artikler (Fase 2). Hvert innlegg har egen URL.
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("posts_business_slug_idx").on(t.businessId, t.slug)],
);

// Nyhetsbrev-abonnenter (Fase 2).
export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    unsubscribeToken: uuid("unsubscribe_token").notNull().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("subscribers_business_idx").on(t.businessId)],
);

// Sendte nyhetsbrev — historikk.
export const newsletters = pgTable("newsletters", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  recipientCount: integer("recipient_count").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Business = typeof businesses.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Newsletter = typeof newsletters.$inferSelect;
