"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import api from "../lib/api";
import { toast } from "react-toastify";

function DateTimeDropdown({
  value,
  onChange,
  placeholder = "Start Date & Time",
}) {
  const [open, setOpen] = useState(false);
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("");
  const ref = useRef(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (open) {
      if (value) {
        const [d, t] = value.split("T");
        setDateVal(d || "");
        setTimeVal((t || "").slice(0, 5));
      } else {
        setDateVal("");
        setTimeVal("");
      }
    }
  }, [open, value]);
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const lastEmittedRef = useRef("");
  useEffect(() => {
    if (dateVal && timeVal) {
      const combined = `${dateVal}T${timeVal}`;
      if (combined !== lastEmittedRef.current) {
        lastEmittedRef.current = combined;
        onChangeRef.current(combined);
      }
      setOpen(false);
    }
  }, [dateVal, timeVal]);
  const label =
    value && value.includes("T")
      ? new Date(value).toLocaleString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left border rounded p-2 bg-white hover:bg-gray-50"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label || <span className="text-gray-400">{placeholder}</span>}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Pick start date and time"
          className="absolute z-50 mt-2 w-[18rem] rounded-xl border bg-white shadow-lg p-3"
        >
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Date</label>
              <input
                type="date"
                className="border rounded p-2"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Time</label>
              <input
                type="time"
                className="border rounded p-2"
                value={timeVal}
                onChange={(e) => setTimeVal(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchVehicle() {
  const [q, setQ] = useState({
    capacityRequired: "",
    fromPinCode: "",
    toPinCode: "",
    startTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (e) =>
    setQ((s) => ({ ...s, [e.target.name]: e.target.value }));

  const setStartTime = useCallback(
    (val) => setQ((s) => ({ ...s, startTime: val })),
    []
  );

  async function search() {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.get("/api/vehicles/available", { params: q });
      setResult(data);
      toast.success("Search completed successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function book(vehicleId) {
    try {
      const payload = {
        vehicleId,
        fromPinCode: q.fromPinCode,
        toPinCode: q.toPinCode,
        startTime: q.startTime,
      };
      const { data } = await api.post("/api/bookings", payload);
      toast.success(`Booked! Booking ID: ${data._id}`);
      await search();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Booking failed");
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="text-2xl font-semibold mb-4">Search &amp; Book</h2>
      <div className="bg-white p-4 rounded-xl border space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border rounded p-2"
            name="capacityRequired"
            type="number"
            placeholder="Capacity Required (KG)"
            value={q.capacityRequired}
            onChange={onChange}
          />
          <input
            className="border rounded p-2"
            name="fromPinCode"
            placeholder="From Pincode"
            value={q.fromPinCode}
            onChange={onChange}
          />
          <input
            className="border rounded p-2"
            name="toPinCode"
            placeholder="To Pincode"
            value={q.toPinCode}
            onChange={onChange}
          />
          <DateTimeDropdown
            value={q.startTime}
            onChange={setStartTime}
            placeholder="Start Date & Time"
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white"
        >
          {loading ? "Searching..." : "Search Availability"}
        </button>
      </div>
      {result && (
        <section className="mt-6">
          <p className="text-sm text-gray-600">
            Estimated ride duration (hrs):{" "}
            <b>{result.estimatedRideDurationHours}</b>
          </p>
          <ul className="mt-3 grid md:grid-cols-2 gap-3">
            {result.items.length === 0 && <li>No vehicles available.</li>}
            {result.items.map((v) => (
              <li key={v._id} className="border rounded-xl p-4 bg-white">
                <div className="font-semibold text-lg">{v.name}</div>
                <div className="text-sm text-gray-700">
                  Capacity: {v.capacityKg} kg
                </div>
                <div className="text-sm text-gray-700">Tyres: {v.tyres}</div>
                <button
                  onClick={() => book(v._id)}
                  className="mt-3 px-3 py-2 rounded bg-blue-600 text-white"
                >
                  Book Now
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
