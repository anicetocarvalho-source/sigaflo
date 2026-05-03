import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PROFILE_GROUPS, getVisibleTabs, findGroupForTab, type FarmerType, type GroupKey } from './profileTabsConfig';

interface ProfileGroupedNavProps {
  farmer: any;
  membersCount: number;
  farmerOrdersCount: number;
  activeTab: string;
  onTabChange: (v: string) => void;
}

export const ProfileGroupedNav = ({ farmer, membersCount, farmerOrdersCount, activeTab, onTabChange }: ProfileGroupedNavProps) => {
  const type = farmer.farmer_type as FarmerType;
  const activeGroupKey: GroupKey = useMemo(() => findGroupForTab(activeTab), [activeTab]);
  const activeGroup = PROFILE_GROUPS.find((g) => g.key === activeGroupKey)!;
  const visibleTabs = getVisibleTabs(activeGroup, type);

  const handleGroupClick = (g: typeof PROFILE_GROUPS[number]) => {
    const first = getVisibleTabs(g, type)[0];
    if (first) onTabChange(first.value);
  };

  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        {/* Level 1 — Groups */}
        <div className="flex flex-wrap gap-1">
          {PROFILE_GROUPS.map((g) => {
            const Icon = g.icon;
            const isActive = g.key === activeGroupKey;
            const tabs = getVisibleTabs(g, type);
            if (tabs.length === 0) return null;
            return (
              <button
                key={g.key}
                onClick={() => handleGroupClick(g)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Level 2 — Sub-tabs */}
        <div className="flex flex-wrap gap-1 border-t pt-2">
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const isActive = t.value === activeTab;
            const badge =
              t.value === 'members' ? membersCount :
              t.value === 'mechanization' ? farmerOrdersCount : undefined;
            return (
              <button
                key={`${t.value}-${t.label}`}
                onClick={() => onTabChange(t.value)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground font-medium'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {badge !== undefined && badge > 0 && (
                  <Badge variant="outline" className="ml-1 text-xs h-5">{badge}</Badge>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
