import { Fragment } from 'react';

import { DatePicker, Form, Input } from 'antd';

import type { Dayjs } from 'dayjs';

export type Values = {
    name: string;
    cpf: string;
    email: string;
    birth_date: Dayjs;
};

export function PersonFields() {
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
                rules={[
                    { required: true, message: 'Por favor, digite o CPF.' },
                    { len: 11, message: 'O CPF deve ter exatamente 11 dígitos.' },
                    { pattern: /^\d{11}$/, message: 'O CPF deve conter apenas números.' },
                ]}
            >
                <Input placeholder="Somente números, sem pontuação" maxLength={11} />
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
