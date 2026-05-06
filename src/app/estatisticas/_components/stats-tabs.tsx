'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type TabId = 'visao' | 'fracos';

const VALID: TabId[] = ['visao', 'fracos'];

function parseTab(value: string | null): TabId {
  if (value === 'fracos') return 'fracos';
  return 'visao';
}

interface Props {
  initialTab: TabId;
  visaoSlot: ReactNode;
  fracosSlot: ReactNode;
  weakBadgeCount?: number;
}

export function StatsTabs({
  initialTab,
  visaoSlot,
  fracosSlot,
  weakBadgeCount,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabId>(initialTab);

  useEffect(() => {
    const fromUrl = parseTab(searchParams.get('tab'));
    if (fromUrl !== tab) setTab(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function onTabChange(next: string) {
    if (!VALID.includes(next as TabId)) return;
    const nextTab = next as TabId;
    setTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === 'visao') {
      params.delete('tab');
    } else {
      params.set('tab', nextTab);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <Tabs value={tab} onValueChange={onTabChange} className="flex flex-col gap-4">
      <TabsList className="self-start">
        <TabsTrigger value="visao">Visão geral</TabsTrigger>
        <TabsTrigger value="fracos" className="gap-2">
          <span>Meus pontos fracos</span>
          {weakBadgeCount && weakBadgeCount > 0 ? (
            <span
              className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500/15 px-1.5 text-[10px] font-semibold tabular-nums text-rose-500"
              aria-label={`${weakBadgeCount} pontos fracos identificados`}
            >
              {weakBadgeCount}
            </span>
          ) : null}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="visao" className="m-0">
        {visaoSlot}
      </TabsContent>
      <TabsContent value="fracos" className="m-0">
        {fracosSlot}
      </TabsContent>
    </Tabs>
  );
}
