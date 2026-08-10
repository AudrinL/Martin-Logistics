"use client";

import { useState } from "react";
import Arrow from "@/components/ui/Arrow";
import { CONTACT } from "@/lib/site";

const FIELDS = [
  { id: "name", label: "Full name", type: "text", required: true, placeholder: "Your name" },
  { id: "email", label: "Email", type: "email", required: true, placeholder: "you@company.com" },
  { id: "phone", label: "Phone", type: "tel", required: false, placeholder: "+250 …" },
  {
    id: "route",
    label: "Route",
    type: "text",
    required: false,
    placeholder: "e.g. Mombasa Port → Kigali",
  },
] as const;

type Key = (typeof FIELDS)[number]["id"] | "message";

/* There is no backend, so the form hands off to the visitor's own mail client
   with everything pre-filled — same behaviour as the static site, just with
   controlled inputs instead of reading values back out of the DOM. */
export default function QuoteForm() {
  const [values, setValues] = useState<Record<Key, string>>({
    name: "",
    email: "",
    phone: "",
    route: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const set = (k: Key) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone}`,
      `Route: ${values.route}`,
      "",
      values.message,
    ].join("\n");

    setSent(true);
    window.location.href =
      `mailto:${CONTACT.email}` +
      `?subject=${encodeURIComponent(`Quote request — ${values.name}`)}` +
      `&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="form" id="quoteForm" style={{ marginTop: "var(--gap-h)" }} onSubmit={onSubmit}>
      {FIELDS.map((f) => (
        <div className="fld" key={f.id}>
          <label htmlFor={f.id}>{f.label}</label>
          <input
            type={f.type}
            id={f.id}
            name={f.id}
            required={f.required}
            placeholder={f.placeholder}
            value={values[f.id]}
            onChange={set(f.id)}
          />
        </div>
      ))}

      <div className="fld">
        <label htmlFor="message">Cargo &amp; message</label>
        <textarea
          id="message"
          name="message"
          required
          placeholder="Cargo type, volume and preferred timeline"
          value={values.message}
          onChange={set("message")}
        />
      </div>

      <button type="submit" className="btn btn--fill">
        <span>Send request</span>
        <Arrow />
      </button>

      <p className="tag" style={{ marginTop: 16, display: sent ? "block" : "none" }} role="status">
        Opening your email client…
      </p>
    </form>
  );
}
