"use client";

import { useState, type ReactNode } from "react";

export type MarketingTab = {
  id: string;
  label: string;
  intro: string;
  content: ReactNode;
};

export function MarketingTabs({ tabs }: { tabs: MarketingTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={active === tab.id ? "space-y-6" : "hidden"}
        >
          <p className="text-sm text-gray-500">{tab.intro}</p>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
