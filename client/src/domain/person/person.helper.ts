import type { MakeMessage } from '@domain/@shared/service.helper';
import type { Service } from '@domain/@shared/service.type';

/**
 * Converte erros de conflito (409) e erros de integridade de banco (500)
 * em mensagens amigáveis para o usuário final.
 *
 * O backend utiliza SoftDeletes: ao excluir uma pessoa, o registro permanece
 * no banco com `deleted_at` preenchido. O índice UNIQUE de CPF não é removido,
 * então tentar cadastrar o mesmo CPF resulta em um erro 500 de SQL.
 * Como o backend não pode ser modificado, tratamos esse cenário no frontend.
 */
export const makePersonErrorMessage: MakeMessage = (
    response: Service.ServerException,
): string | null => {
    const description = response.error?.description || String(response);

    // 1. Erros de validação (422 Unprocessable Entity)
    if (response.statusCode === 422) {
        if (description.includes('birth date') || description.includes('Birth date')) {
            return 'A data de nascimento informada é inválida. Verifique o valor e tente novamente.';
        }
        if (description.includes('CPF') || description.includes('cpf')) {
            return 'O CPF informado é inválido. Verifique o valor e tente novamente.';
        }
        if (description.includes('email') || description.includes('Email')) {
            return 'O formato do e-mail informado é inválido.';
        }
        return 'Os dados informados são inválidos. Verifique os campos e tente novamente.';
    }

    // 2. Erros de conflito (409 Conflict)
    if (response.statusCode === 409) {
        if (description.includes('CPF') || description.includes('cpf')) {
            return 'Já existe uma pessoa cadastrada com este CPF.';
        }
        if (description.includes('email') || description.includes('Email')) {
            return 'Este e-mail já está em uso por outra pessoa.';
        }
        return 'Já existe um cadastro com estas informações.';
    }

    // 3. Erros de Servidor (500) e Constraints do Banco
    if (response.statusCode === 500) {
        if (description.includes('1062 Duplicate entry')) {
            return 'Já existe uma pessoa cadastrada com este CPF.';
        }
        return 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.';
    }

    // 4. Fallback genérico (evita vazar stacktrace de banco)
    return 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.';
};

/**
 * Aplica máscara de ofuscação compatível com a LGPD.
 * Retorna os 3 primeiros dígitos e esconde o restante (123.***.***-**).
 */
export const obfuscateCpf = (cpf: string): string => {
    if (!cpf) return '-';
    
    const clean = cpf.replace(/\D/g, '');
    
    if (clean.length !== 11) return cpf;
    
    const prefix = clean.substring(0, 3);
    return `${prefix}.***.***-**`;
};
