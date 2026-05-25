import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PermissionModeTabs = ({ mode, onModeChange }) => {
  return (
    <div className="mb-6">
      <Tabs value={mode} onValueChange={onModeChange} className="w-full">
        <TabsList className="w-full max-w-[400px] min-w-[280px] bg-gray-200/50 dark:bg-slate-800/50 rounded-xl h-11">
          <TabsTrigger 
            value="role" 
            className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all text-xs font-bold uppercase tracking-tight"
          >
            Por Rol
          </TabsTrigger>
          <TabsTrigger 
            value="user" 
            className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all text-xs font-bold uppercase tracking-tight"
          >
            Por Usuario
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default PermissionModeTabs;