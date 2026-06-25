import type { Record } from '@domain/record/record.type';

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

        // Map status keys to display labels
        const labels: Record<string, string> = {
            awaiting_investigation: 'Aguardando',
            investigation_in_progress: 'Em Andamento',
            resolved: 'Resolvido',
            archived: 'Arquivado'
        };

        return Object.entries(counts).map(([type, value]) => ({ 
            type: labels[type] || type, 
            value 
        }));
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
