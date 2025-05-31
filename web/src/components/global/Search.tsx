import type React from "react";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { DialogBox } from "./DialogBox";

export const Search = (): React.ReactElement => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[20vw]">
      <div
        className="bg-[#202127] px-4 py-1 rounded-lg cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <SearchIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Search Markets</span>
          </div>

          <div className="ml-auto text-xs sm:text-sm px-2 py-1 rounded-md border border-neutral-600 text-neutral-400">
            Ctrl + K
          </div>
        </div>
      </div>

      <DialogBox
        keyboardShortcut="k"
        component={<div>search here</div>}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};

