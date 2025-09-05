"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";
import { toast } from "react-toastify";

function fmt(dt) {
  const d = new Date(dt);
  return isNaN(d)
    ? "-"
    : d.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
}
function hoursBetween(a, b) {
  const A = new Date(a).getTime();
  const B = new Date(b).getTime();
  if (Number.isNaN(A) || Number.isNaN(B)) return "-";
  return Math.round((B - A) / (1000 * 60 * 60));
}

export default function MyBookings() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/bookings");
      setItems(data || []);
      if ((data || []).length === 0) toast.info("No bookings yet");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id) {
    const proceed = confirm("Cancel this booking?");
    if (!proceed) return;
    const tId = toast.loading("Cancelling booking...");
    try {
      await api.delete(`/api/bookings/${id}`);
      setItems((list) => list.filter((x) => x._id !== id));
      toast.update(tId, {
        render: "Booking cancelled",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      toast.update(tId, {
        render: err?.response?.data?.message || "Cancel failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">My Bookings</h2>
        <Link
          href="/search-vehicle"
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Search &amp; Book →
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        {loading ? (
          <ul className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="rounded-xl border p-4">
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200 mb-2" />
                <div className="h-3 w-64 animate-pulse rounded bg-gray-200 mb-1" />
                <div className="h-3 w-56 animate-pulse rounded bg-gray-200" />
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 h-12 w-12 rounded-2xl border flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <p className="text-base font-medium">No bookings yet</p>
            <p className="text-sm text-gray-500">
              Create your first booking to see it here.
            </p>
            <Link
              href="/search-vehicle"
              className="mt-4 rounded-xl bg-black px-4 py-2 text-white"
            >
              Book a vehicle
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((b) => (
              <li
                key={b._id}
                className="rounded-xl border p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-lg">
                        {b.vehicleId?.name ?? "Vehicle"}
                      </div>
                      <span className="rounded-full border px-2 py-0.5 text-xs text-gray-600">
                        {hoursBetween(b.startTime, b.endTime)} hrs
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {b.fromPinCode} <span className="mx-1">→</span>{" "}
                      {b.toPinCode}
                    </p>
                    <p className="text-sm text-gray-500">
                      {fmt(b.startTime)} — {fmt(b.endTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cancelBooking(b._id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
