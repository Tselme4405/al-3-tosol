"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
export default function ImageAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ingredients, setIngredients] = useState(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === "image/jpeg" || file.type === "image/png") {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIngredients(null);
    }
  };
  const handleGenerate = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    console.log("formData", formData);

    try {
      const res = await fetch("http://localhost:999/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      // TODO: data-с бодит ingredients авах
      setIngredients(data);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIngredients(null);
    if (inputRef.current) inputRef.current.value = "";
  };
  console.log(ingredients, "ingedients");
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
            <div className="text-[#71717A] text-sm leading-6">
              {ingredients?.reasoning_content}
              {/* {ingredients ? (
                <ul className="list-disc pl-5">
                  {ingredients.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : (
                "First, enter your image to recognize ingredients."
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
