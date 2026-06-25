import { describe, expect, it } from 'vitest';
import { cpfMask } from './PersonFields';

describe('cpfMask', () => {
    it('retorna string vazia quando value é undefined', () => {
        expect(cpfMask(undefined)).toBe('');
    });

    it('retorna string vazia quando value é string vazia', () => {
        expect(cpfMask('')).toBe('');
    });

    it('formata 3 dígitos com ponto', () => {
        expect(cpfMask('123')).toBe('123');
    });

    it('formata 6 dígitos com dois pontos', () => {
        expect(cpfMask('123456')).toBe('123.456');
    });

    it('formata 9 dígitos com dois pontos e traço', () => {
        expect(cpfMask('123456789')).toBe('123.456.789');
    });

    it('formata 11 dígitos no padrão completo 999.999.999-99', () => {
        expect(cpfMask('12345678901')).toBe('123.456.789-01');
    });

    it('ignora dígitos além de 11', () => {
        expect(cpfMask('123456789012345')).toBe('123.456.789-01');
    });

    it('remove caracteres não numéricos antes de mascarar', () => {
        expect(cpfMask('abc12345')).toBe('123.45');
    });

    it('retorna o valor original quando ele é igual ao originalCpfObfuscated', () => {
        const obfuscated = '123.***.***-**';
        expect(cpfMask(obfuscated, obfuscated)).toBe(obfuscated);
    });

    it('normaliza normalmente quando valor difere do originalCpfObfuscated', () => {
        expect(cpfMask('98765432100', '123.***.***-**')).toBe('987.654.321-00');
    });
});
