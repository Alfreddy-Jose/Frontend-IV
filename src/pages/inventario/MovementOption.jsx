import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

const MovementOption = ({ id, label, icon: Icon }) => {
  return (
    <div className="relative">
      <RadioGroupItem value={id} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className="flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 
                bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500
                peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/30 dark:peer-data-[state=checked]:bg-blue-900/20 
                peer-data-[state=checked]:text-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800 group"
      >
        <Icon className="w-8 h-8 mb-2 transition-colors group-hover:text-gray-700 peer-data-[state=checked]:text-blue-600" />
        <span className="text-sm font-semibold tracking-tight">{label}</span>
      </Label>
    </div>
  );
};

export default MovementOption;
