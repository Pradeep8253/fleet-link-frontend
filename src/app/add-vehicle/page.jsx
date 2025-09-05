"use client";
import { useState } from "react";
import api from "../lib/api";
import { toast } from "react-toastify";

export default function AddVehicle() {
  const [form, setForm] = useState({ name: "", capacityKg: "", tyres: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        capacityKg: Number(form.capacityKg),
        tyres: Number(form.tyres),
      };
      const { data } = await api.post("/api/vehicles", payload);
      toast.success(`Created vehicle: ${data.name}`);
      setForm({ name: "", capacityKg: "", tyres: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h2 className="text-2xl font-semibold mb-4">Add Vehicle</h2>
      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white p-4 rounded-xl border"
      >
        <input
          className="w-full border rounded p-2"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={onChange}
          required
        />
        <input
          className="w-full border rounded p-2"
          name="capacityKg"
          placeholder="Capacity (KG)"
          type="number"
          value={form.capacityKg}
          onChange={onChange}
          required
        />
        <input
          className="w-full border rounded p-2"
          name="tyres"
          placeholder="Tyres"
          type="number"
          value={form.tyres}
          onChange={onChange}
          required
        />
        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white"
        >
          {loading ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
