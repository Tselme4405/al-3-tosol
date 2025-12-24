"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { RefreshCw, Sparkles, FileText } from "lucide-react";

const EXAMPLES = [
  {
    title: "Sushi",
    text: "I made sushi rolls with cooked rice, nori sheets, salmon, cucumber, avocado, soy sauce, and sesame seeds.",
  },
  {
    title: "Pancakes",
    text: "I cooked pancakes using flour, milk, eggs, sugar, baking powder, butter, and vanilla extract.",
  },
  {
    title: "Salad",
    text: "I made a salad with lettuce, tomato, cucumber, feta cheese, olives, olive oil, lemon juice, and salt.",
  },
  {
    title: "Buuz",
    text: "I made buuz using minced beef, onion, garlic, salt, black pepper, and dough made from flour and water.",
  },
];

const DEFAULT_TEXT = EXAMPLES[0].text;

// ✅ Back-end өөрчлөхгүй: data.result (string) -> [{name}] болгох parse
function parseResultToIngredients(result) {
  if (!result || typeof result !== "string") return [];

  let text = result.replace(/```[\s\S]*?```/g, " ").trim();
  text = text.replace(/^\s*ingredients?\s*[:\-]\s*/i, "").trim();

  // JSON маягаар ирвэл барьж авна
  try {
    const maybe = JSON.parse(text);
    if (Array.isArray(maybe)) {
      return maybe
        .map((x) => (typeof x === "string" ? { name: x.trim() } : null))
        .filter(Boolean)
        .filter((x) => x.name);
    }
    if (maybe && Array.isArray(maybe.ingredients)) {
      return maybe.ingredients
        .map((x) => (typeof x === "string" ? { name: x.trim() } : null))
        .filter(Boolean)
        .filter((x) => x.name);
    }
  } catch (_) {}

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let items = [];

  if (lines.length === 1 && lines[0].includes(",")) {
    items = lines[0].split(",").map((x) => x.trim());
  } else {
    items = lines.map((l) =>
      l
        .replace(/^[-*•]\s*/, "")
        .replace(/^\d+[\).\]]\s*/, "")
        .replace(/\s*\(.*?\)\s*$/, "")
        .replace(/\.$/, "")
        .trim()
    );
  }

  const map = new Map();
  for (const it of items) {
    const name = it.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!map.has(key)) map.set(key, { name });
  }

  return Array.from(map.values());
}

export default function Texto() {
  const [activeTab, setActiveTab] = useState("ingredient");
  const [text, setText] = useState(DEFAULT_TEXT);
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState(null); // null | [] | [{name}]
  const [error, setError] = useState("");

  const canGenerate = useMemo(() => text.trim().length > 0, [text]);

  const handleGenerate = async () => {
    if (!canGenerate || loading) return;

    setLoading(true);
    setError("");
    setIngredients(null);

    try {
      // ✅ Шууд backend рүү дуудна
      const { data } = await axios.post(
        "https://al-3-tosol-back-end.onrender.com/ingredient-generator",
        { description: text },
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ backend чинь { result: "..." } гэж буцаана
      const resultText = data?.result || "";
      const parsed = parseResultToIngredients(resultText);

      setIngredients(parsed);
    } catch (err) {
      console.error(err);

      const msg =
        err?.response?.data?.error || err?.message || "Server connection error";

      setError(msg);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText(DEFAULT_TEXT);
    setIngredients(null);
    setError("");
  };

  const TabBtn = ({ value, children }) => (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={[
        "h-8 rounded-full px-4 text-xs transition",
        activeTab === value
          ? "bg-zinc-100 text-zinc-900"
          : "text-zinc-500 hover:bg-zinc-50",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-sm font-medium text-zinc-900">AI tools</h1>
        </div>

        {activeTab === "ingredient" && (
          <div className="mt-10 mx-auto max-w-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-zinc-900" />
                  <h2 className="text-xl font-semibold text-zinc-900">
                    Ingredient recognition
                  </h2>
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  Describe the food, and AI will detect the ingredients.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="h-9 w-9 rounded-md border border-zinc-200 hover:bg-zinc-50 grid place-items-center"
                aria-label="Reset"
                title="Reset"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Examples */}
            <div className="mt-5 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.title}
                  type="button"
                  onClick={() => {
                    setText(ex.text);
                    setIngredients(null);
                    setError("");
                  }}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  {ex.title}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="mt-3 rounded-md border border-zinc-200 bg-white">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[140px] w-full resize-none border-0 bg-transparent p-4 text-sm leading-6 outline-none"
                placeholder="Type a food description..."
              />
            </div>

            {/* Error */}
            {error ? (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {/* Generate */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                className={[
                  "h-9 rounded-md px-5 text-sm font-medium text-white",
                  "bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900",
                ].join(" ")}
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>

            {/* Result */}
            <div className="mt-10">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-900" />
                <h3 className="text-lg font-semibold text-zinc-900">
                  Identified Ingredients
                </h3>
              </div>

              <div className="my-3 h-px bg-zinc-100" />

              {ingredients === null ? (
                <p className="text-sm text-zinc-500">
                  First, enter your text to recognize ingredients.
                </p>
              ) : ingredients.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No ingredients detected.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((it) => (
                    <span
                      key={it.name}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800"
                    >
                      {it.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-6 text-xs text-zinc-400">Using proxy: </p>
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="mt-10 mx-auto max-w-2xl text-sm text-zinc-500">
            Image analysis tab content (дараа нь холбож өгнө).
          </div>
        )}

        {activeTab === "creator" && (
          <div className="mt-10 mx-auto max-w-2xl text-sm text-zinc-500">
            Image creator tab content (дараа нь холбож өгнө).
          </div>
        )}
      </div>
    </div>
  );
}
