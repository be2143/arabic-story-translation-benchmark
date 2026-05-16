import { useState } from "react";
import { useEvaluation } from "@/context/EvaluationContext";

const label = "text-sm font-medium text-neutral-600";
const input =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";

export default function EvalSignupScreen() {
  const { setUser, setPhase } = useEvaluation();
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
    const user = { name: name.trim(), email: email.trim() };
    setUser(user);
    setPhase("intro");
  };

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <p className="mb-2 text-sm text-neutral-500">Participant registration</p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-neutral-900">
        Welcome, you have been invited to complete the translation evaluation task.
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-neutral-600">
        Enter your details to begin the task. Your responses will be used for research purposes only.

        </p>

        <form
          className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
        >
          <div>
            <label htmlFor="eval-name" className={label}>
              Full name
            </label>
            <input
              id="eval-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${input} mt-1.5`}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="eval-email" className={label}>
              Email
            </label>
            <input
              id="eval-email"
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
            type="button"
            onClick={handleContinue}
            className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
