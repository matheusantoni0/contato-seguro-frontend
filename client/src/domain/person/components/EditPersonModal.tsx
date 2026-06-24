import { useState } from 'react';

import dayjs from 'dayjs';

import { App, Divider, Form, Modal } from 'antd';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { updatePerson } from '../api/update-person.service';
import { makePersonErrorMessage, obfuscateCpf } from '../person.helper';
import { usePeopleContext } from '../People.context';
import { PersonFields, type Values } from './PersonFields';

export function EditPersonModal() {
    const [isSending, setIsSending] = useState(false);

    const {
        person,
        setIsEditModalVisible,
        setPersonId,
        fetchPeople,
    } = usePeopleContext();

    if (!person)
        throw new Error('Value of the `person` property is unknown');

    const app = App.useApp();

    const [form] = Form.useForm<Values>();

    const obfuscatedCpf = obfuscateCpf(person.cpf);

    const initialValues = {
        ...person,
        cpf: obfuscatedCpf,
        birth_date: dayjs(person.birth_date),
    };

    const close = () => {
        setIsEditModalVisible(false);
        setPersonId(null);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const rawCpf = values.cpf === obfuscatedCpf
            ? person.cpf
            : cpfValidator.strip(values.cpf);

        const apiValues = {
            ...values,
            cpf: rawCpf,
            birth_date: values.birth_date.format('YYYY-MM-DD'),
        };

        const response = await updatePerson(person.id, apiValues);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, makePersonErrorMessage);

        close();
        fetchPeople();
    };

    return (
        <Modal
            open
            title="Editar pessoa"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Confirmar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="editPerson"
                layout="vertical"
                autoComplete="off"
                initialValues={initialValues}
            >
                <PersonFields originalCpfObfuscated={obfuscatedCpf} />
            </Form>
        </Modal>
    );
}
