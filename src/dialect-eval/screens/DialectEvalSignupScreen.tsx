import { useState } from "react";
import { useDialectEval } from "@/context/DialectEvalContext";

export default function DialectEvalSignupScreen() {
  const { setUser, setPhase } = useDialectEval();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
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
    setPhase("dialect");
  };

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <p className="mb-2 text-sm text-neutral-500">Dialect evaluation study</p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Participant registration
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-neutral-600">
          You will rate Arabic social stories for your assigned dialect using four metrics:
          descriptive orientation (DO), structural clarity (SC), situational safety (SS), and
          dialect fluency (DF).
        </p>

        <form
          className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
        >
          <div>
            <label htmlFor="de-name" className="text-sm font-medium text-neutral-600">
              Full name
            </label>
            <input
              id="de-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="de-email" className="text-sm font-medium text-neutral-600">
              Email
            </label>
            <input
              id="de-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
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
