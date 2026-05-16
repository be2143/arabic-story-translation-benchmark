import { useState } from "react";
import { useEvaluation } from "@/context/EvaluationContext";
import { STORY_RULES, TRANSLATION_CHECKLIST } from "@/data/socialStoryGuidelines";

const RULES_STEP = 2;
const EXAMPLES_STEP = 3;
const TOTAL_STEPS = 5;

export default function EvalEducationScreen() {
  const { setPhase } = useEvaluation();
  const [step, setStep] = useState(0);

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const isFirst = step === 0;
  const isLast = step === TOTAL_STEPS - 1;

  let body: React.ReactNode;
  let stepTitle: string;

  if (step === 0) {
    stepTitle = "What is a social story?";
    body = (
      <>
        <p className="text-sm leading-relaxed text-neutral-700">
          A Social Story is a short, simple story written to help autistic children understand
          a specific social situation or daily activity. Created by Carol Gray, Social Stories
          follow special rules so the experience stays positive and reassuring.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-neutral-700">
          Unlike a list of commands, a Social Story describes a situation (for example, going
          to the doctor, saying hello, waiting in line) in small, clear steps. It explains:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-700">
          <li>What is happening and why</li>
          <li>What others might think or feel</li>
          <li>What the child can try</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-neutral-700">
          For many autistic children, social rules are confusing. A Social Story explains and
          reassures the child about expectations in a situation. It can reduce anxiety, support
          memory, and help the child feel prepared.
        </p>
      </>
    );
  } else if (step === 1) {
    stepTitle = "Social story structure";
    body = (
      <p className="text-sm leading-relaxed text-neutral-700">
        Social Stories follow a logical sequence, providing information in a positive, simple and clear manner.
        <br /> <br />
        The <b>title</b> describes what the story is about. A good title should be positive, simple and engaging. It should focus on what the child can do or what they are trying to do, rather than what they cannot do. Examples of titles include: ‘Getting my hair cut’; ‘Smelling fresh is great’; ‘Why do people feel angry?’
        <br /> <br />
        The story itself has three parts: a beginning (introduction), middle (main body) and end (conclusion).
        <br /> <br />
        The <b>introduction</b> identifies the topic in a positive way. For example ‘Every day I wash my body. This is how I keep my body smelling fresh.’
        <br /> <br />
        The <b>main body</b> adds the detail, describing the issue or situation that has been identified as the focus of the story. For example ‘Adults and children all wash to keep clean and smell fresh. I like to smell fresh all the time. After I have washed and dried my body I use a roll-on or spray under my arms. It smells fantastic.’
        <br /> <br />
        The <b>conclusion</b> summarizes the main message and tries to end on a positive note. For example ‘I love to smell fresh and so do my friends and family.’
      </p>
    );
  } else if (step === RULES_STEP) {
    stepTitle = "Rules for good social stories";
    body = (
      <>
        <p className="text-sm leading-relaxed text-neutral-700">
          Social stories should follow the rules below to support efficiency and safety for
          autistic children. Use the same standards when you translate.
        </p>
        <div className="mt-6 space-y-4">
          {STORY_RULES.map((row, index) => (
            <article
              key={row.rule}
              className="rounded-md border border-neutral-200 bg-neutral-50/50 p-4 sm:p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Rule {index + 1}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-neutral-900">{row.rule}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{row.meaning}</p>
              <div className="mt-4 grid gap-3 border-t border-neutral-200/80 pt-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-green-800">
                    Good example
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-green-950">{row.correct}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-red-800">
                    Bad example
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-red-950/90">{row.incorrect}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  } else if (step === EXAMPLES_STEP) {
    stepTitle = "Compare: Good vs Bad Examples";
    body = (
      <>
        <p className="mb-4 text-sm text-neutral-600">
          Same kind of situation (a dentist visit), different tone. Read both stories to see what makes a good social story and what makes a weaker one.
        </p>
        <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-5">
          <div className="rounded-md border border-green-200 bg-green-50/40 p-4">
            <h3 className="text-sm font-semibold text-green-950">Good example</h3>
            <p className="mt-1 text-xs text-green-900/80">Going to the dentist</p>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-800">
              <p>
                Sometimes I go to the dentist. The dentist is a doctor who helps keep my
                teeth healthy.
              </p>
              <p>
                When I arrive, I will sit in a special chair. The chair moves back so the
                dentist can see my teeth.
              </p>
              <p>
                The dentist will look in my mouth with a small mirror. I can ask the dentist
                to take a break if I need one.
              </p>
              <p>Going to the dentist helps me keep my teeth strong and healthy.</p>
            </div>
            <p className="mt-4 border-t border-green-200/80 pt-3 text-xs leading-relaxed text-green-900/90">
              <span className="font-semibold text-green-950">Why it works:</span> Mostly
              descriptive sentences, first person, calm tone. The story explains what happens without
              demanding compliance.
            </p>
          </div>

          <div className="rounded-md border border-red-200 bg-red-50/40 p-4">
            <h3 className="text-sm font-semibold text-red-950">Bad example</h3>
            <p className="mt-1 text-xs text-red-900/80">Being a good boy</p>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-800">
              <p>I have to go to the dentist. I must not cry or make a fuss.</p>
              <p>I have to sit still and be brave. If I scream, everyone will be angry.</p>
              <p>
                I must let the dentist do whatever they want. Good boys don&apos;t complain.
              </p>
              <p>I must behave or I won&apos;t get a treat afterward.</p>
            </div>
            <p className="mt-4 border-t border-red-200/80 pt-3 text-xs leading-relaxed text-red-900/90">
              <span className="font-semibold text-red-950">Why it is weaker:</span> Uses
              commands and threats; focuses on obedience instead of understanding.
            </p>
          </div>
        </div>
      </>
    );
  } else {
    stepTitle = "Translation checklist";
    body = (
      <>
        <p className="text-sm leading-relaxed text-neutral-600">
          When you review the translated versions of the stories, please check if the translation follows the checklist below:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-800">
          {TRANSLATION_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Education module (evaluation)
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-900">
            Step {step + 1} of {TOTAL_STEPS}
          </h1>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900 transition-[width] duration-200"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col px-4 py-8 pb-28">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-neutral-900">{stepTitle}</h2>
          <div className="mt-4">{body}</div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={() => setPhase("quiz")}
              className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 sm:min-w-[11rem]"
            >
              Continue to assessment
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 sm:min-w-[7rem]"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
