"use client";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";

export default function AuthForm({
  title,
  fields,
  onSubmit,
  submitText,
  extras,
}) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""]))
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleShow = (name) =>
    setShowPassword((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      toast.success("Success ");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-2xl shadow max-w-md"
      >
        <h1 className="text-2xl font-semibold">{title}</h1>

        {fields.map((f) => (
          <div key={f.name} className="grid gap-1">
            <label className="text-sm text-gray-600">{f.label}</label>
            <div className="relative">
              <input
                type={
                  f.type === "password" && !showPassword[f.name]
                    ? "password"
                    : "text"
                }
                name={f.name}
                value={form[f.name] || ""}
                onChange={change}
                className="border rounded-lg px-3 py-2 pr-10 outline-none focus:ring w-full"
                placeholder={f.placeholder}
                required={f.required !== false}
                minLength={f.minLength}
              />
              {f.type === "password" && (
                <button
                  type="button"
                  onClick={() => toggleShow(f.name)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword[f.name] ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          disabled={loading}
          className="w-full rounded-lg px-3 py-2 bg-black text-white"
        >
          {loading ? "Please wait..." : submitText}
        </button>

        {extras}
      </form>
    </div>
  );
}
