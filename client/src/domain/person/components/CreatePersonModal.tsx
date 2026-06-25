import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { createPerson } from '../api/create-person.service';
import { makePersonErrorMessage } from '../person.helper';
import { usePeopleContext } from '../People.context';
import { PersonFields, type Values } from './PersonFields';

type Props = {
    onClose?: () => void;
    onSuccess?: () => void;
};

export function CreatePersonModal({ onClose, onSuccess }: Props) {
    const [isSending, setIsSending] = useState(false);

    let context: any = {};
    try {
        context = usePeopleContext();
    } catch {
        // Silently ignore context error as it might be used in standalone mode
    }

    const { setIsCreateModalVisible, fetchPeople } = context;

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const close = () => {
        if (onClose) return onClose();
        if (setIsCreateModalVisible) setIsCreateModalVisible(false);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const apiValues = {
            ...values,
            cpf: cpfValidator.strip(values.cpf),
            birth_date: values.birth_date.format('YYYY-MM-DD'),
        };

        const response = await createPerson(apiValues);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, makePersonErrorMessage);

        close();
        app.message.success('Pessoa cadastrada com sucesso');
        if (onSuccess) onSuccess();
        if (fetchPeople) fetchPeople();
    };

    return (
        <Modal
            open
            title="Cadastrar pessoa"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Cadastrar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="createPerson"
                layout="vertical"
                autoComplete="off"
            >
                <PersonFields />
            </Form>
        </Modal>
    );
}
