// "use client";

// import { useState, useRef } from "react";
// import { ImagePlus, Loader2, X } from "lucide-react";
// import { SendButton } from "./components/SendButton";
// import { InputField } from "./components";
// import { useVisualSearch } from "../hooks/useVisualSearch";

// interface ChatInputProps {
//   onSendMessage: (text: string) => void;
//   onVisualResult: (userMsg: any, products: any[]) => void;
//   history: { role: string; content: string }[];
//   isTyping: boolean;
// }

// export default function ChatInput({
//   onSendMessage,
//   onVisualResult,
//   history,
//   isTyping,
// }: ChatInputProps) {
//   const [input, setInput] = useState("");
//   const [previewImage, setPreviewImage] = useState<{
//     file: File;
//     url: string;
//   } | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { searchByImage, isSearching } = useVisualSearch();

//   const combinedLoading = isTyping || isSearching;
//   const fileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   const handleSend = async (textToSend?: string) => {
//     const text = (textToSend ?? input).trim();

//     if (previewImage) {
//       const { file } = previewImage;

//       setPreviewImage(null);
//       setInput("");

//       try {
//         const base64Image = await fileToBase64(file);

//         const userMsg = {
//           role: "USER",
//           content: text || "Зургаар хайж байна...",
//           imagePreview: base64Image,
//         };

//         const result = await searchByImage(file);

//         if (result.success && result.products) {
//           onVisualResult(userMsg, result.products);
//         } else {
//           onVisualResult(userMsg, []);
//         }
//       } catch (error) {
//         console.error("Image search error:", error);
//       }
//       return;
//     }

//     if (!text || combinedLoading) return;
//     setInput("");
//     onSendMessage(text);
//   };

//   const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || combinedLoading) return;
//     const url = URL.createObjectURL(file);
//     setPreviewImage({ file, url });
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const handleRemoveImage = () => {
//     if (previewImage) URL.revokeObjectURL(previewImage.url);
//     setPreviewImage(null);
//   };

//   return (
//     <footer className="w-full max-w-4xl mx-auto p-4 relative z-50">
//       <div className="flex flex-col w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
//         {previewImage && (
//           <div className="px-3 pt-3">
//             <div className="relative inline-block">
//               <img
//                 src={previewImage.url}
//                 alt="preview"
//                 className="h-20 w-20 object-cover rounded-xl border border-white/20 "
//               />
//               <button
//                 onClick={handleRemoveImage}
//                 className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
//               >
//                 <X size={14} />
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="relative flex items-center w-full gap-3 p-2">
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleImageSelect}
//             accept="image/*"
//             className="hidden "
//           />

//           <button
//             type="button"
//             onClick={() => fileInputRef.current?.click()}
//             disabled={combinedLoading}
//             className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white   hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 "
//           >
//             {isSearching ? (
//               <Loader2 className="animate-spin" size={22} />
//             ) : (
//               <ImagePlus size={22} />
//             )}
//           </button>

//           <InputField
//             value={input}
//             onChange={setInput}
//             onKeyDown={(e: any) =>
//               e.key === "Enter" && !e.shiftKey && handleSend()
//             }
//             disabled={combinedLoading}
//             placeholder={previewImage ? "Зураг илгээх..." : undefined}
//           />

//           <SendButton
//             onClick={() => handleSend()}
//             disabled={combinedLoading || (!input.trim() && !previewImage)}
//             isLoading={isTyping || isSearching}
//           />
//         </div>
//       </div>
//     </footer>
//   );
// }
"use client";

import { useState, useRef } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { SendButton } from "./components/SendButton";
import { InputField } from "./components";
import { useVisualSearch } from "../hooks/useVisualSearch";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onVisualResult: (userMsg: any, products: any[]) => void;
  history: { role: string; content: string }[];
  isTyping: boolean;
}

export default function ChatInput({
  onSendMessage,
  onVisualResult,
  history,
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
    <footer className="w-full max-w-4xl mx-auto p-4 relative z-50">
      <div
        className="
          flex flex-col w-full rounded-2xl overflow-hidden
          bg-white border border-slate-200 shadow-sm
          dark:bg-white/5 dark:border-white/10 dark:shadow-2xl dark:backdrop-blur-xl
          focus-within:border-[#077eef]/60 dark:focus-within:border-[#077eef]/50
          focus-within:shadow-[0_0_0_4px_rgba(7,126,239,0.08)]
          transition-all duration-200
        "
      >
        {previewImage && (
          <div className="px-3 pt-3">
            <div className="relative inline-block">
              <img
                src={previewImage.url}
                alt="preview"
                className="h-20 w-20 object-cover rounded-xl border border-slate-200 dark:border-white/20"
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

        <div className="relative flex items-center w-full gap-3 p-2">
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
              text-slate-400 hover:text-slate-700 hover:bg-slate-100
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
            onKeyDown={(e: any) =>
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
