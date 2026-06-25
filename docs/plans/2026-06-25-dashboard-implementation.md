# Dashboard Executivo Operacional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a data-driven dashboard using Ant Design and Ant Design Plots to provide operational insights.

**Architecture:** The dashboard will act as a "pure consumer" of the existing React Contexts (`RecordsContext`, `CompaniesContext`, `PeopleContext`), performing client-side data transformations via memoized helpers for high performance.

**Tech Stack:** React 19, Ant Design v5, `@ant-design/plots` (v2).

## Global Constraints
- React 19 + Ant Design 5
- Use `@ant-design/plots` for all charts
- No new API endpoints
- Adhere to the project's Domain-Driven architecture

---

### Task 1: Setup & Data Logic
**Files:**
- Modify: `client/package.json`
- Create: `client/src/domain/dashboard/Dashboard.helper.ts`
- Create: `client/src/domain/dashboard/Dashboard.helper.test.ts`

- [ ] **Step 1: Install dependencies**
Run: `npm install @ant-design/plots` (within `client` directory)
- [ ] **Step 2: Create metrics calculation helper**
```typescript
import { Record } from '@domain/record/record.type';

export const DashboardHelper = {
    calculateKPIs: (records: Record.Model[]) => {
        const total = records.length;
        const awaiting = records.filter(r => r.status === 'awaiting_investigation').length;
        const inProgress = records.filter(r => r.status === 'investigation_in_progress').length;
        const resolved = records.filter(r => r.status === 'resolved' || r.status === 'archived').length;
        const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

        return { total, awaiting, inProgress, resolutionRate };
    },
    
    getStatusData: (records: Record.Model[]) => {
        const counts = records.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([type, value]) => ({ type, value }));
    },

    getCompanyRanking: (records: Record.Model[], companies: { id: number, name: string }[]) => {
        const pendingStatuses = ['awaiting_investigation', 'investigation_in_progress'];
        const unresolved = records.filter(r => pendingStatuses.includes(r.status));
        
        const counts = unresolved.reduce((acc, r) => {
            acc[r.company_id] = (acc[r.company_id] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        return Object.entries(counts)
            .map(([id, count]) => ({
                name: companies.find(c => c.id === Number(id))?.name || `Empresa ${id}`,
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
};
```
- [ ] **Step 3: Add unit tests for helper**
Verify calculations with mock data.
- [ ] **Step 4: Commit Task 1**

### Task 2: KPI Dashboard & Layout
**Files:**
- Create: `client/src/domain/dashboard/components/MetricCard.tsx`
- Modify: `client/src/pages/Dashboard.page.tsx`

- [ ] **Step 1: Create reusable MetricCard**
```tsx
import { Card, Statistic } from 'antd';

interface Props {
    title: string;
    value: number | string;
    suffix?: string;
    color?: string;
    prefix?: React.ReactNode;
}

export function MetricCard({ title, value, suffix, color, prefix }: Props) {
    return (
        <Card bordered={false} hoverable>
            <Statistic
                title={title}
                value={value}
                suffix={suffix}
                valueStyle={{ color }}
                prefix={prefix}
            />
        </Card>
    );
}
```
- [ ] **Step 2: Update Dashboard Page to consume Contexts and show KPIs**
Connect `useRecordsContext`, `useCompaniesContext`, and `usePeopleContext`.
- [ ] **Step 3: Commit Task 2**

### Task 3: Visual Analytics (Charts)
**Files:**
- Create: `client/src/domain/dashboard/components/StatusDonut.tsx`
- Create: `client/src/domain/dashboard/components/CompanyRankingBar.tsx`
- Modify: `client/src/pages/Dashboard.page.tsx`

- [ ] **Step 1: Implement StatusDonut**
Using `Pie` from `@ant-design/plots`.
- [ ] **Step 2: Implement CompanyRankingBar**
Using `Bar` from `@ant-design/plots`.
- [ ] **Step 3: Integrate charts into Dashboard**
- [ ] **Step 4: Commit Task 3**

### Task 4: Critical Action Table & Final Polish
**Files:**
- Create: `client/src/domain/dashboard/components/CriticalReportsTable.tsx`
- Modify: `client/src/pages/Dashboard.page.tsx`

- [ ] **Step 1: Implement CriticalReportsTable**
- [ ] **Step 2: Add responsive spacing and loading states**
- [ ] **Step 3: Commit Task 4**
