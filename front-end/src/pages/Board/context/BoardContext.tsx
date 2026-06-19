import { createContext, useContext } from "react";
import { useBoardData } from "../hooks/useBoardData";

type BoardDataType = ReturnType<typeof useBoardData>;

export const BoardContext = createContext<BoardDataType | undefined>(undefined);

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error("useBoardContext must be used within a BoardProvider");
  }
  return context;
}
