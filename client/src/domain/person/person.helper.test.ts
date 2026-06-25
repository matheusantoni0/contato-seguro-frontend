import { describe, expect, it } from 'vitest';
import { makePersonErrorMessage, obfuscateCpf } from './person.helper';
import type { Service } from '@domain/@shared/service.type';

const makeException = (
    statusCode: number,
    description: string,
): Service.ServerException => ({
    statusCode,
    error: { type: 'ERROR', description },
});

// ─── makePersonErrorMessage ──────────────────────────────────────────────────

describe('makePersonErrorMessage', () => {
    describe('422 — validação de campos', () => {
        it('retorna mensagem de data inválida quando descrição contém "birth date"', () => {
            const result = makePersonErrorMessage(
                makeException(422, 'Invalid birth date format'),
            );
            expect(result).toBe(
                'A data de nascimento informada é inválida. Verifique o valor e tente novamente.',
            );
        });

        it('retorna mensagem de CPF inválido quando descrição contém "CPF"', () => {
            const result = makePersonErrorMessage(
                makeException(422, 'Invalid CPF format. Must be 11 digits'),
            );
            expect(result).toBe('O CPF informado é inválido. Verifique o valor e tente novamente.');
        });

        it('retorna mensagem de e-mail inválido quando descrição contém "email"', () => {
            const result = makePersonErrorMessage(
                makeException(422, 'Invalid email format'),
            );
            expect(result).toBe('O formato do e-mail informado é inválido.');
        });

        it('retorna mensagem genérica de validação para campo desconhecido', () => {
            const result = makePersonErrorMessage(
                makeException(422, 'Name is required'),
            );
            expect(result).toBe('Os dados informados são inválidos. Verifique os campos e tente novamente.');
        });
    });

    describe('409 — conflito / duplicidade', () => {
        it('retorna mensagem de CPF duplicado quando descrição contém "CPF"', () => {
            const result = makePersonErrorMessage(
                makeException(409, 'CPF already registered'),
            );
            expect(result).toBe('Já existe uma pessoa cadastrada com este CPF.');
        });

        it('retorna mensagem de e-mail duplicado quando descrição contém "email"', () => {
            const result = makePersonErrorMessage(
                makeException(409, 'email already in use'),
            );
            expect(result).toBe('Este e-mail já está em uso por outra pessoa.');
        });

        it('retorna mensagem genérica de conflito para campo desconhecido', () => {
            const result = makePersonErrorMessage(
                makeException(409, 'Conflito desconhecido'),
            );
            expect(result).toBe('Já existe um cadastro com estas informações.');
        });
    });

    describe('500 — erro de servidor / constraint SQL', () => {
        it('retorna mensagem de CPF duplicado quando descrição contém "1062 Duplicate entry"', () => {
            const result = makePersonErrorMessage(
                makeException(500, "1062 Duplicate entry '12345678901' for key 'people.cpf'"),
            );
            expect(result).toBe('Já existe uma pessoa cadastrada com este CPF.');
        });

        it('retorna mensagem genérica para erro 500 sem constraint conhecida', () => {
            const result = makePersonErrorMessage(
                makeException(500, 'Internal server error'),
            );
            expect(result).toBe('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.');
        });
    });

    describe('outros status — fallback', () => {
        it('retorna mensagem genérica para status não mapeado (ex: 503)', () => {
            const result = makePersonErrorMessage(makeException(503, 'Service Unavailable'));
            expect(result).toBe('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.');
        });
    });
});

// ─── obfuscateCpf ────────────────────────────────────────────────────────────

describe('obfuscateCpf', () => {
    it('ofusca CPF com 11 dígitos mantendo os 3 primeiros', () => {
        expect(obfuscateCpf('12345678901')).toBe('123.***.***-**');
    });

    it('aceita CPF já formatado com máscara (pontuação) e ofusca corretamente', () => {
        expect(obfuscateCpf('123.456.789-01')).toBe('123.***.***-**');
    });

    it('retorna "-" quando cpf é uma string vazia', () => {
        expect(obfuscateCpf('')).toBe('-');
    });

    it('retorna o valor original quando CPF tem número de dígitos diferente de 11', () => {
        expect(obfuscateCpf('123')).toBe('123');
    });
});
