import { useState } from 'react';

import { App, Divider, Form, Modal, Tabs } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';
import { useCompaniesContext } from '@domain/company/Companies.context';

import { createRecord } from '../api/create-record.service';
import { useRecordsContext } from '../Records.context';
import { RecordFields, type Values } from './RecordFields';
import { PendingInvolvementTab } from '@domain/involvement/components/PendingInvolvementTab';
import type { Involvement } from '@domain/involvement/involvement.type';
import { createInvolvement } from '@domain/involvement/api/create-involvement.service';
import { PeopleContextProvider } from '@domain/person/People.context';

export function CreateRecordModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchRecords } = useRecordsContext();
    const { companies } = useCompaniesContext();

    const [form] = Form.useForm<Values>();

    const [pendingInvolvements, setPendingInvolvements] = useState<Involvement.Create[]>([]);

    const app = App.useApp();

    const close = () => {
        setIsCreateModalVisible(false);
        setPendingInvolvements([]);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await createRecord(values);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        const newRecordId = response.data.record.id;

        if (pendingInvolvements.length > 0) {
            try {
                await Promise.all(
                    pendingInvolvements.map(inv => createInvolvement(newRecordId, inv))
                );
            } catch (err) {
                console.error("Erro ao rascunhar envolvidos", err);
                app.notification.warning({
                    message: 'Aviso',
                    description: 'O relato foi criado com sucesso, mas houve uma falha ao tentar vincular alguns envolvidos. Verifique após a criação.'
                });
            }
        }

        close();
        fetchRecords();
    };

    return (
        <Modal
            open
            title="Cadastrar relato"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Cadastrar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <PeopleContextProvider>
                {() => (
                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                key: '1',
                                label: 'Dados do Relato',
                                children: (
                                    <Form
                                        form={form}
                                        onFinish={onFinish}
                                        name="createRecord"
                                        layout="vertical"
                                        autoComplete="off"
                                    >
                                        <RecordFields companies={companies} />
                                    </Form>
                                ),
                            },
                            {
                                key: '2',
                                label: 'Envolvidos',
                                children: (
                                    <PendingInvolvementTab
                                        pendingInvolvements={pendingInvolvements}
                                        onChange={setPendingInvolvements}
                                    />
                                ),
                            },
                        ]}
                    />
                )}
            </PeopleContextProvider>
        </Modal>
    );
}
