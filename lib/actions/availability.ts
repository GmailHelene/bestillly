"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import {
  availabilityExceptions,
  bookings,
  businesses,
  services,
  workingHours,
} from "@/db/schema";
import { computeAvailableSlots, dayBounds } from "@/lib/availability";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function getSlots(
  slug: string,
  serviceId: string,
  date: string,
): Promise<string[]> {
  if (!DATE_PATTERN.test(date)) return [];

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
  });
  if (!business) return [];

  const service = await db.query.services.findFirst({
    where: and(
      eq(services.id, serviceId),
      eq(services.businessId, business.id),
      eq(services.active, true),
    ),
  });
  if (!service) return [];

  const wh = await db.query.workingHours.findMany({
    where: eq(workingHours.businessId, business.id),
  });
  const exc = await db.query.availabilityExceptions.findMany({
    where: eq(availabilityExceptions.businessId, business.id),
  });

  const { start, end } = dayBounds(date);
  const dayBookings = await db.query.bookings.findMany({
    where: and(
      eq(bookings.businessId, business.id),
      eq(bookings.status, "confirmed"),
      gte(bookings.startsAt, start),
      lt(bookings.startsAt, end),
    ),
  });

  return computeAvailableSlots({
    date,
    durationMinutes: service.durationMinutes,
    workingHours: wh.map((w) => ({
      weekday: w.weekday,
      startTime: w.startTime,
      endTime: w.endTime,
    })),
    exceptions: exc.map((e) => ({
      date: e.date,
      type: e.type,
      startTime: e.startTime,
      endTime: e.endTime,
    })),
    bookings: dayBookings.map((b) => ({
      startsAt: b.startsAt,
      endsAt: b.endsAt,
    })),
    now: new Date(),
  });
}
