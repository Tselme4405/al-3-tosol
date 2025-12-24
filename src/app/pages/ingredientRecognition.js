"use client";
import { useRef, useState } from "react";
import axios from "axios";
export default function IngredientRecognition() {
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text || isAnalyzing) return;

    setIsAnalyzing(true);
    setError("");
    setResultImage(null);

    try {
      const { data } = await axios.post(
        "https://al-3-tosol-back-end.onrender.com/image",
        { prompt: text },
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ backend: { success: true, image: "data:image/png;base64,..." }
      if (!data?.success || !data?.image) {
        setError(data?.error || "Failed to generate");
        return;
      }

      setResultImage(data.image);
    } catch (err) {
      console.error(err);

      const msg =
        err?.response?.data?.error || err?.message || "Server connection error";

      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setResultImage(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="bg-white">
      <div className="flex justify-center">
        <div className="flex flex-col">
          <div className="flex w-145 flex-col items-start gap-6 py-6 self-stretch">
            <div className="flex justify-between items-start self-stretch">
              <div className="flex items-center justify-center gap-2">
                <img src="/ArticleIcon.png" alt="" />
                <p className="text-[#09090B] font-semibold text-xl leading-7">
                  Ingredient recognition
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
              Text бичээд Generate дархад зураг гарна.
            </label>

            <div className="flex flex-col items-end gap-2 self-stretch">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="border border-[#E4E4E7] bg-white flex min-h-31 px-3 py-2 items-start self-stretch rounded-md"
                placeholder="Жишээ: A cute chef cat cooking pasta, cinematic light"
              />

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isAnalyzing}
                className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#18181B] px-4 py-2 disabled:opacity-50"
              >
                <p className="text-[#FAFAFA] text-sm font-medium">
                  {isAnalyzing ? "Generating..." : "Generate"}
                </p>
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {resultImage && (
              <img
                src={resultImage}
                alt="result"
                className="w-full max-w-105 rounded-lg border"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
