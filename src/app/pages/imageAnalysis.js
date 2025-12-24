"use client";
import { useRef, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function parseToList(raw) {
  if (!raw) return [];

  // raw array байвал шууд буцаана
  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === "string" ? x.trim() : x?.name || ""))
      .filter(Boolean);
  }

  if (typeof raw !== "string") return [];

  let text = raw.replace(/```[\s\S]*?```/g, " ").trim();
  text = text.replace(/^\s*ingredients?\s*[:\-]\s*/i, "").trim();

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
        .replace(/\.$/, "")
        .trim()
    );
  }

  // dedupe
  const map = new Map();
  for (const it of items) {
    const key = it.toLowerCase();
    if (!map.has(key)) map.set(key, it);
  }
  return Array.from(map.values());
}

export default function ImageAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [ingredients, setIngredients] = useState(null); // raw backend data
  const [error, setError] = useState(""); // ✅ нэмлээ

  const inputRef = useRef(null);
  const router = useRouter();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "image/jpeg" || file.type === "image/png") {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIngredients(null);
      setError("");
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setError("");
    setIngredients(null);

    const formData = new FormData();
    formData.append("image", selectedFile); // ✅ upload.single("image")

    try {
      const { data } = await axios.post(
        "https://al-3-tosol-back-end.onrender.com/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setIngredients(data);
    } catch (err) {
      console.error("Upload failed", err);
      const msg = err?.response?.data?.error || err?.message || "Upload failed";
      setError(msg);
      setIngredients(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIngredients(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // ✅ Дэлгэцэнд харуулах list (backend ямар бүтэцтэй байсан ч)
  const ingredientList = useMemo(() => {
    if (!ingredients) return [];

    // 1) reasoning_content (чи одоо харуулж байгаа)
    if (ingredients.reasoning_content)
      return parseToList(ingredients.reasoning_content);

    // 2) result (ingredient-generator чинь ийм буцаадаг)
    if (ingredients.result) return parseToList(ingredients.result);

    // 3) ingredients array (зарим backend ингэж буцааж магадгүй)
    if (ingredients.ingredients) return parseToList(ingredients.ingredients);

    // 4) fallback: бүхэл response-ийг string болгоод харуулахгүй (хоосон)
    return [];
  }, [ingredients]);

  return (
    <div className="bg-white">
      <div className="flex justify-center">
        <div className="flex flex-col">
          <div className="flex w-145 flex-col items-start gap-6 py-6 self-stretch">
            <div className="flex justify-between items-start self-stretch">
              <div className="flex items-center justify-center gap-2">
                <img src="/ArticleIcon.png" alt="" />
                <p className="text-[#09090B] font-semibold text-xl leading-7">
                  Image analysis
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex h-10 items-center justify-center gap-2 px-4 py-2 rounded-md border border-[#E4E4E7] bg-white"
              >
                <img src="/reload.png" alt="" />
              </button>
            </div>

            <label className="text-[#71717A] text-sm">
              Upload a food photo, and AI will detect the ingredients
            </label>

            <div className="flex flex-col items-end gap-2 self-stretch">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="h-10 rounded-md w-145 border border-[#E4E4E7] bg-white px-3 flex justify-start items-center"
                >
                  Choose File
                  <span className="text-[#71717A] text-sm pl-2">JPG , PNG</span>
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!selectedFile || isAnalyzing}
                className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#18181B] px-4 py-2 disabled:opacity-50"
              >
                <p className="text-[#FAFAFA] text-sm font-medium">
                  {isAnalyzing ? "Generating..." : "Generate"}
                </p>
              </button>
            </div>

            {error ? (
              <div className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                className="w-full max-w-105 rounded-lg border"
              />
            )}
          </div>

          <div className="flex w-145 flex-col items-start gap-6 py-6 self-stretch">
            <div className="flex items-center gap-2">
              <img src="/Articl.png" alt="" />
              <p className="text-black font-semibold text-xl leading-6">
                Here is the summary
              </p>
            </div>

            <div className="text-[#71717A] text-sm leading-6 w-full">
              {!ingredients &&
                !error &&
                "First, upload your image to recognize ingredients."}

              {ingredients && ingredientList.length === 0 && (
                <p>No ingredients detected from the response.</p>
              )}

              {ingredientList.length > 0 && (
                <ul className="list-disc pl-5 space-y-1">
                  {ingredientList.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
