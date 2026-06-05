import { useEffect, RefObject } from "react";

export const useScrollEffect = (
  ref: RefObject<HTMLDivElement | null>, 
  dependency: any[]
) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [dependency]);
};