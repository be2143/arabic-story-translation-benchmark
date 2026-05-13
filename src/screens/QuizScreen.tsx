import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  educationQuizQuestions,
  type QuizQuestion,
} from "../data/quiz";

/** Need at least this many correct (out of 5) to continue to translation. */
const MIN_CORRECT_TO_PASS = 4;

type AnswerRecord = {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
};

function QuizQuestionStep({
  question,
  currentQ,
  totalQuestions,
  score,
  quizComplete,
  passedQuiz,
  onAnswer,
  onNext,
}: {
  question: QuizQuestion;
  currentQ: number;
  totalQuestions: number;
  score: number;
  quizComplete: boolean;
  passedQuiz: boolean;
  onAnswer: (record: AnswerRecord) => void;
  onNext: () => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === question.correctAnswer;
    onAnswer({
      questionId: question.id,
      selectedAnswer: answerIndex,
      isCorrect,
    });
  };

  return (
    <>
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <p className="text-sm text-neutral-500">
          Question {currentQ + 1} of {totalQuestions}
        </p>
        {showResult ? (
          <p
            className={`text-sm font-medium ${
              selectedAnswer === question.correctAnswer
                ? "text-green-800"
                : "text-red-800"
            }`}
          >
            {selectedAnswer === question.correctAnswer ? "Correct" : "Incorrect"}
          </p>
        ) : null}
      </div>

      <h2 className="mb-8 text-xl font-semibold leading-snug text-neutral-900 md:text-2xl">
        {question.question}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          let ring = "border-neutral-300 bg-white hover:border-neutral-400";
          if (showResult) {
            if (i === question.correctAnswer) {
              ring = "border-green-700 bg-green-50";
            } else if (i === selectedAnswer && i !== question.correctAnswer) {
              ring = "border-red-600 bg-red-50";
            } else {
              ring = "border-neutral-200 bg-neutral-50 text-neutral-500";
            }
          } else if (i === selectedAnswer) {
            ring = "border-neutral-900 bg-neutral-50";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(i)}
              disabled={selectedAnswer !== null}
              className={`w-full rounded-md border px-4 py-3 text-left text-sm leading-relaxed text-neutral-800 transition-colors disabled:cursor-default ${ring}`}
            >
              <span className="mr-2 font-medium text-neutral-500">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {showResult ? (
        <>
          <div className="mt-8 rounded-md border border-neutral-200 bg-white p-4 text-sm leading-relaxed text-neutral-700">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Explanation
            </p>
            <p>{question.explanation}</p>
          </div>

          {quizComplete && !passedQuiz ? (
            <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              You need at least {MIN_CORRECT_TO_PASS} correct answers to continue. Please review
              the education module and take the quiz again.
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-neutral-600">
              Score: {score} / {totalQuestions}
            </p>
            <button
              type="button"
              onClick={onNext}
              className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              {currentQ < totalQuestions - 1
                ? "Next question"
                : passedQuiz
                  ? "Continue"
                  : "Return to education module"}
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}

export default function QuizScreen() {
  const { setPhase, setQuizResults } = useApp();
  const [currentQ, setCurrentQ] = useState(0);
  const [results, setResults] = useState<AnswerRecord[]>([]);

  const question = educationQuizQuestions[currentQ];
  const totalQuestions = educationQuizQuestions.length;
  const score = results.filter((r) => r.isCorrect).length;
  const passedQuiz = score >= MIN_CORRECT_TO_PASS;
  const quizComplete =
    currentQ === totalQuestions - 1 && results.length === totalQuestions;

  const handleRecordAnswer = (record: AnswerRecord) => {
    setResults((prev) => [...prev, record]);
  };

  const handleNext = () => {
    if (currentQ < educationQuizQuestions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      const correctCount = results.filter((r) => r.isCorrect).length;
      if (correctCount < MIN_CORRECT_TO_PASS) {
        setQuizResults([]);
        setPhase("education");
      } else {
        setQuizResults(results);
        setPhase("dialect");
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="h-1 bg-neutral-200">
        <div
          className="h-full bg-neutral-900 transition-[width] duration-200"
          style={{
            width: `${((currentQ + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <QuizQuestionStep
          key={currentQ}
          question={question}
          currentQ={currentQ}
          totalQuestions={totalQuestions}
          score={score}
          quizComplete={quizComplete}
          passedQuiz={passedQuiz}
          onAnswer={handleRecordAnswer}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
