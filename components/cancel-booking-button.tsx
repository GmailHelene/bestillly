"use client";

import { cancelBookingByAdmin } from "@/lib/actions/bookings";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  return (
    <form
      action={cancelBookingByAdmin}
      onSubmit={(e) => {
        if (
          !confirm("Avbestille denne timen? Kunden får beskjed på e-post.")
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={bookingId} />
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        Avbestill
      </button>
    </form>
  );
}
