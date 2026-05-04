import React from 'react';
import { Label } from "@/components/ui/label";

const FormField = ({ label, children }) => (
  <div className="space-y-1">
    <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">
      {label}
    </Label>
    {children}
  </div>
);

export default FormField;