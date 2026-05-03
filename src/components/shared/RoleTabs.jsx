import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, UserCog } from "lucide-react";

const RoleTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      <Tabs 
        value={activeTab} 
        onValueChange={onTabChange} 
        className="bg-gray-100/50 dark:bg-slate-800/50 p-1 rounded-xl border border-gray-200/50 dark:border-slate-700/50"
      >
        <TabsList className="bg-transparent gap-1">
          <TabsTrigger 
            value="role" 
            className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-xs uppercase tracking-wider">Por Rol</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="user" 
            className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            <UserCog className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-xs uppercase tracking-wider">Por Usuario</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default RoleTabs;