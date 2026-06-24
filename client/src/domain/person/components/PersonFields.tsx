import { Fragment } from 'react';

import { DatePicker, Form, Input } from 'antd';

import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import type { Dayjs } from 'dayjs';

export type Values = {
    name: string;
    cpf: string;
    email: string;
    birth_date: Dayjs;
};

export const cpfMask = (value: string | undefined, originalCpfObfuscated?: string) => {
    if (!value) return '';
    if (originalCpfObfuscated && value === originalCpfObfuscated) return value;
    
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
};

export type PersonFieldsProps = {
    originalCpfObfuscated?: string;
};

export function PersonFields({ originalCpfObfuscated }: PersonFieldsProps = {}) {
    return (
        <Fragment>
            <Form.Item<Values>
                name="name"
                label="Nome completo"
                rules={[{ required: true, message: 'Por favor, digite o nome completo.' }]}
            >
                <Input placeholder="Nome completo da pessoa" />
            </Form.Item>

            <Form.Item<Values>
                name="cpf"
                label="CPF"
                normalize={(val) => cpfMask(val, originalCpfObfuscated)}
                rules={[
                    { required: true, message: 'Por favor, digite o CPF.' },
                    {
                        validator: async (_, value) => {
                            if (!value) return;
                            if (originalCpfObfuscated && value === originalCpfObfuscated) return;
                            if (!cpfValidator.isValid(value)) {
                                throw new Error('CPF inválido. Verifique o número informado e tente novamente.');
                            }
                        },
                    },
                ]}
            >
                <Input placeholder="Somente números, sem pontuação" maxLength={14} />
            </Form.Item>

            <Form.Item<Values>
                name="email"
                label="E-mail"
                rules={[
                    { required: true, message: 'Por favor, digite um e-mail.' },
                    { type: 'email', message: 'Por favor, digite um e-mail válido.' },
                ]}
            >
                <Input placeholder="E-mail da pessoa" />
            </Form.Item>

            <Form.Item<Values>
                name="birth_date"
                label="Data de nascimento"
                rules={[{ required: true, message: 'Por favor, selecione a data de nascimento.' }]}
            >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="DD/MM/AAAA" />
            </Form.Item>
        </Fragment>
    );
}
