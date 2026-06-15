"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { SendButton } from "./components/SendButton";
import { InputField } from "./components";
import { useVisualSearch } from "../hooks/useVisualSearch";

type VisualSearchUserMessage = {
  role: "USER";
  content: string;
  imagePreview: string;
};

type VisualSearchProduct = {
  id?: string;
  name?: string;
  price?: string | number;
  image?: string;
  description?: string;
  store_id?: string;
};

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onVisualResult: (
    userMsg: VisualSearchUserMessage,
    products: VisualSearchProduct[],
  ) => void;
  isTyping: boolean;
}

export default function ChatInput({
  onSendMessage,
  onVisualResult,
  isTyping,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [previewImage, setPreviewImage] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { searchByImage, isSearching } = useVisualSearch();

  const combinedLoading = isTyping || isSearching;

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();

    if (previewImage) {
      const { file } = previewImage;
      setPreviewImage(null);
      setInput("");
      try {
        const base64Image = await fileToBase64(file);
        const userMsg = {
          role: "USER",
          content: text || "Зургаар хайж байна...",
          imagePreview: base64Image,
        };
        const result = await searchByImage(file);
        if (result.success && result.products) {
          onVisualResult(userMsg, result.products);
        } else {
          onVisualResult(userMsg, []);
        }
      } catch (error) {
        console.error("Image search error:", error);
      }
      return;
    }

    if (!text || combinedLoading) return;
    setInput("");
    onSendMessage(text);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || combinedLoading) return;
    const url = URL.createObjectURL(file);
    setPreviewImage({ file, url });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = () => {
    if (previewImage) URL.revokeObjectURL(previewImage.url);
    setPreviewImage(null);
  };

  return (
    <footer className="relative z-50 mx-auto w-full max-w-4xl px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:p-4">
      <div
        className="
          flex w-full flex-col overflow-hidden rounded-2xl
          border border-[#d7cbff] bg-white/88 shadow-[0_16px_40px_rgba(127,102,255,0.12)]
          dark:bg-white/5 dark:border-white/10 dark:shadow-2xl dark:backdrop-blur-xl
          focus-within:border-[#9f8cff]/70 dark:focus-within:border-[#c9b7ff]/50
          focus-within:shadow-[0_0_0_4px_rgba(159,140,255,0.12)]
          transition-all duration-200
        "
      >
        {previewImage && (
          <div className="px-4 pt-3 md:px-6">
            <div className="relative inline-block">
              <img
                src={previewImage.url}
                alt="preview"
                className="h-20 w-20 object-cover rounded-xl border border-[#d7cbff] dark:border-white/20"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="relative flex w-full items-center gap-2 border-t border-[#d7cbff] p-2 md:gap-3 dark:border-white/10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={combinedLoading}
            className="
              p-2 rounded-xl transition-all disabled:opacity-30
              text-[#8b7bff] hover:text-[#6f7bff] hover:bg-[#f1ecff]
              dark:text-gray-500 dark:hover:text-white dark:hover:bg-white/10
            "
          >
            {isSearching ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <ImagePlus size={22} />
            )}
          </button>

          <InputField
            value={input}
            onChange={setInput}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && !e.shiftKey && handleSend()
            }
            disabled={combinedLoading}
            placeholder={previewImage ? "Зураг илгээх..." : undefined}
          />

          <SendButton
            onClick={() => handleSend()}
            disabled={combinedLoading || (!input.trim() && !previewImage)}
            isLoading={isTyping || isSearching}
          />
        </div>
      </div>
    </footer>
  );
}
