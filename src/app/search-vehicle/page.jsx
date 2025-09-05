"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import api from "../lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  FiCalendar,
  FiClock,
  FiSearch,
  FiTruck,
  FiMapPin,
} from "react-icons/fi";

function DateTimeDropdown({
  value,
  onChange,
  placeholder = "Start Date & Time",
}) {
  const [open, setOpen] = useState(false);
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("");
  const ref = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
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

  const openDatePicker = () => {
    if (dateRef.current?.showPicker) dateRef.current.showPicker();
    else dateRef.current?.focus();
  };
  const openTimePicker = () => {
    if (timeRef.current?.showPicker) timeRef.current.showPicker();
    else timeRef.current?.focus();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left border rounded p-2 bg-white hover:bg-gray-50 flex items-center gap-2"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <FiCalendar className="shrink-0" />
        {label || <span className="text-gray-400">{placeholder}</span>}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Pick start date and time"
          className="absolute z-50 mt-2 w-[18rem] rounded-xl border bg-white shadow-lg p-3"
        >
          <div className="grid grid-cols-1 gap-3">
            <div
              className="flex items-center gap-2 border rounded p-2 cursor-pointer"
              onClick={openDatePicker}
            >
              <FiCalendar />
              <input
                ref={dateRef}
                type="date"
                className="w-full outline-none"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
              />
            </div>
            <div
              className="flex items-center gap-2 border rounded p-2 cursor-pointer"
              onClick={openTimePicker}
            >
              <FiClock />
              <input
                ref={timeRef}
                type="time"
                className="w-full outline-none"
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
  const [isAuthed, setIsAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/auth/get");
        if (!mounted) return;
        setIsAuthed(!!data?.user);
      } catch {
        if (!mounted) return;
        setIsAuthed(false);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
    if (!isAuthed) {
      router.push("/auth/login");
      return;
    }
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
          <div className="relative">
            <input
              className="w-full border rounded p-2 pl-10"
              name="capacityRequired"
              type="number"
              placeholder="Capacity Required (KG)"
              value={q.capacityRequired}
              onChange={onChange}
            />
            <FiTruck className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <input
              className="w-full border rounded p-2 pl-10"
              name="fromPinCode"
              placeholder="From Pincode"
              value={q.fromPinCode}
              onChange={onChange}
            />
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <input
              className="w-full border rounded p-2 pl-10"
              name="toPinCode"
              placeholder="To Pincode"
              value={q.toPinCode}
              onChange={onChange}
            />
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <DateTimeDropdown
            value={q.startTime}
            onChange={setStartTime}
            placeholder="Start Date & Time"
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white flex items-center gap-2"
        >
          <FiSearch />
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
                {authChecked && (
                  <button
                    onClick={() => book(v._id)}
                    className="mt-3 px-3 py-2 rounded bg-blue-600 text-white"
                  >
                    Book Now
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
