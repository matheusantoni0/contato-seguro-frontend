import { describe, expect, it } from 'vitest';
import { DashboardHelper } from './Dashboard.helper';
import type { Record as RecordType } from '@domain/record/record.type';

describe('DashboardHelper', () => {
    const mockRecords: RecordType.Model[] = [
        { id: 1, title: 'R1', description: 'D1', status: 'awaiting_investigation', company_id: 1, created_at: '', updated_at: '', deleted_at: null },
        { id: 2, title: 'R2', description: 'D2', status: 'investigation_in_progress', company_id: 1, created_at: '', updated_at: '', deleted_at: null },
        { id: 3, title: 'R3', description: 'D3', status: 'resolved', company_id: 2, created_at: '', updated_at: '', deleted_at: null },
        { id: 4, title: 'R4', description: 'D4', status: 'archived', company_id: 2, created_at: '', updated_at: '', deleted_at: null },
        { id: 5, title: 'R5', description: 'D5', status: 'awaiting_investigation', company_id: 3, created_at: '', updated_at: '', deleted_at: null },
    ];

    const mockCompanies = [
        { id: 1, name: 'Empresa A' },
        { id: 2, name: 'Empresa B' },
        { id: 3, name: 'Empresa C' },
    ];

    describe('calculateKPIs', () => {
        it('calculates metrics correctly', () => {
            const result = DashboardHelper.calculateKPIs(mockRecords);
            expect(result.total).toBe(5);
            expect(result.awaiting).toBe(2);
            expect(result.inProgress).toBe(1);
            expect(result.resolutionRate).toBe(40); // 2 out of 5 are resolved/archived
        });

        it('handles empty records', () => {
            const result = DashboardHelper.calculateKPIs([]);
            expect(result.total).toBe(0);
            expect(result.resolutionRate).toBe(0);
        });
    });

    describe('getStatusData', () => {
        it('transforms status to chart data with labels', () => {
            const result = DashboardHelper.getStatusData(mockRecords);
            expect(result).toContainEqual({ type: 'Aguardando', value: 2 });
            expect(result).toContainEqual({ type: 'Em Andamento', value: 1 });
            expect(result).toContainEqual({ type: 'Resolvido', value: 1 });
            expect(result).toContainEqual({ type: 'Arquivado', value: 1 });
        });
    });

    describe('getCompanyRanking', () => {
        it('ranks companies by unresolved reports', () => {
            const result = DashboardHelper.getCompanyRanking(mockRecords, mockCompanies);
            // Empresa A has 2 unresolved (R1, R2)
            // Empresa C has 1 unresolved (R5)
            // Empresa B has 0 unresolved
            expect(result[0].name).toBe('Empresa A');
            expect(result[0].count).toBe(2);
            expect(result[1].name).toBe('Empresa C');
            expect(result[1].count).toBe(1);
            expect(result.length).toBe(2);
        });
    });
});
