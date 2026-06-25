import { describe, expect, it } from 'vitest';

import { normalizeString, matchesSearch } from './string.helper';

describe('string.helper', () => {
    describe('normalizeString', () => {
        it('should convert to lowercase', () => {
            expect(normalizeString('JOSE')).toBe('jose');
        });

        it('should remove accents', () => {
            expect(normalizeString('José')).toBe('jose');
            expect(normalizeString('Maranhão')).toBe('maranhao');
            expect(normalizeString('Conceição')).toBe('conceicao');
        });

        it('should handle special characters', () => {
            expect(normalizeString('Olá, Mundo!')).toBe('ola, mundo!');
        });
    });

    describe('matchesSearch', () => {
        const item = { name: 'José Silva', email: 'jose@example.com', id: 123 };
        const keys = ['name', 'email', 'id'];

        it('should return true when searchTerm is empty', () => {
            expect(matchesSearch(item, '', keys)).toBe(true);
        });

        it('should match partial search', () => {
            expect(matchesSearch(item, 'silva', keys)).toBe(true);
        });

        it('should match regardless of accents', () => {
            expect(matchesSearch(item, 'josé', keys)).toBe(true);
            expect(matchesSearch(item, 'jose', keys)).toBe(true);
        });

        it('should return false when no match found', () => {
            expect(matchesSearch(item, 'pedro', keys)).toBe(false);
        });

        it('should match numbers by converting them to string', () => {
            expect(matchesSearch(item, '123', keys)).toBe(true);
        });
    });
});
