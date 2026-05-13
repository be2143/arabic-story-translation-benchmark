import { useState } from "react";
import { useApp } from "../context/AppContext";

const label = "text-sm font-medium text-neutral-600";
const input =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";

export default function SignupScreen() {
  const { setUser, setPhase } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setUser({ name: name.trim(), email: email.trim() });
    setPhase("intro");
  };

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        {/* <div className="mb-10 flex flex-col items-center justify-center gap-8 sm:flex-row sm:flex-wrap sm:gap-10">
          <img
            src="/images/lab_logo.png"
            alt="SMART Lab"
            className="h-24 w-auto max-w-[220px] object-contain"
          />
          <img
            src="/images/nyu_logo.png"
            alt="NYU Abu Dhabi"
            className="h-16 w-auto max-w-[min(100%,280px)] object-contain sm:h-[4.5rem]"
          />
        </div> */}

        <p className="mb-2 text-sm text-neutral-500">Participant registration</p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome, you have been invited to complete the translation task.
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-neutral-600">
          Enter your details to begin the task. Your responses will be used for
          research purposes only.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="name" className={label}>
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${input} mt-1.5`}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className={label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${input} mt-1.5`}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
