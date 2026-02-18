'use client';

import { ReactNode, useEffect, useState } from 'react';

export interface Stage {
  id: string;
  title: string;
  content?: ReactNode | null;
}

export default function StageWindows({ stages }: { stages: Stage[] }) {
  const visible = stages.filter((s) => !!s.content) as Stage[];
  const [activeId, setActiveId] = useState<string | null>(visible[0]?.id ?? null);

  // Keep activeId in sync when `visible` changes
  useEffect(() => {
    if (!visible.find((v) => v.id === activeId)) {
      setActiveId(visible[0]?.id ?? null);
    }
  }, [visible, activeId]);

  if (visible.length === 0) return null;

  const activeStage = visible.find((s) => s.id === activeId) ?? visible[0];

  return (
    <div>
      {/* Tabs menu (only when more than one stage available) */}
      {visible.length > 1 && (
        <nav role="tablist" aria-label="Profile sections" className="mb-6 flex flex-wrap gap-2 justify-center lg:justify-start">
          {visible.map((s) => {
            const selected = s.id === activeStage.id;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={selected}
                aria-controls={`stage-${s.id}`}
                id={`tab-${s.id}`}
                onClick={() => setActiveId(s.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300
                  ${selected ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
              >
                {s.title}
              </button>
            );
          })}
        </nav>
      )}

      {/* Active stage content */}
      <div id={`stage-${activeStage.id}`} role="tabpanel" aria-labelledby={`tab-${activeStage.id}`}>
        {activeStage.content}
      </div>
    </div>
  );
}

