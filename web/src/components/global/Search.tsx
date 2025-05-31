import type React from "react";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { DialogBox } from "./DialogBox";

export const Search = (): React.ReactElement => {

  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <div className="bg-[#202127] px-4 py-1 rounded-lg w-[20vw] mx-auto" onClick={() => setOpen(true)} >
        <div className="flex items-center justify-between gap-4 sm:gap-6">
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

