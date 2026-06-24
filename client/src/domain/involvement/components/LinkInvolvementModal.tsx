import { useEffect, useState } from 'react';
import { App, Divider, Form, Modal, Select } from 'antd';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';
import { listPeople } from '@domain/person/api/list-people.service';
import type { Person } from '@domain/person/person.type';
import { createInvolvement } from '../api/create-involvement.service';
import type { Involvement } from '../involvement.type';

type Props = {
    recordId: number;
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customSubmit?: (values: Involvement.Create) => boolean;
};

export function LinkInvolvementModal({ recordId, isVisible, onClose, onSuccess, customSubmit }: Props) {
    const [isSending, setIsSending] = useState(false);
    const [people, setPeople] = useState<Person.Model[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [form] = Form.useForm<Involvement.Create>();
    const app = App.useApp();

    useEffect(() => {
        if (!isVisible) return;
        
        let isMounted = true;
        
        async function fetchInitialData() {
            setIsLoading(true);
            const response = await listPeople();
            if (!isMounted) return;
            
            if (hasServiceError(response)) {
                handleServiceError(app, response);
            } else {
                setPeople(response.data.people);
            }
            setIsLoading(false);
        }

        fetchInitialData();
        return () => { isMounted = false; };
    }, [isVisible, app]);

    const onFinish = async (values: Involvement.Create) => {
        if (customSubmit) {
            const success = customSubmit(values);
            if (success) {
                form.resetFields();
            }
            return;
        }

        setIsSending(true);

        const response = await createInvolvement(recordId, values);

        await sleep(1000);
        setIsSending(false);

        if (hasServiceError(response)) {
            if ('statusCode' in response && response.statusCode === 409) {
                return app.notification.error({ message: 'Algo deu errado!', description: 'Esta pessoa já está vinculada neste relato.' });
            }
            return handleServiceError(app, response);
        }

        form.resetFields();
        onSuccess();
    };

    return (
        <Modal
            open={isVisible}
            title="Vincular Pessoa"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Vincular"
            onCancel={onClose}
            cancelText="Cancelar"
            destroyOnClose
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="createInvolvement"
                layout="vertical"
                autoComplete="off"
                preserve={false}
            >
                <Form.Item
                    name="person_id"
                    label="Pessoa"
                    rules={[{ required: true, message: 'Selecione uma pessoa' }]}
                >
                    <Select 
                        loading={isLoading}
                        showSearch
                        placeholder="Buscar pessoa..."
                        optionFilterProp="children"
                        options={people.map(p => ({ label: `${p.name} - ${p.cpf}`, value: p.id }))}
                    />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Tipo de Envolvimento"
                    rules={[{ required: true, message: 'Selecione o tipo de envolvimento' }]}
                >
                    <Select placeholder="Selecione o tipo">
                        <Select.Option value="whistleblower">Denunciante / Relator</Select.Option>
                        <Select.Option value="witness">Testemunha</Select.Option>
                        <Select.Option value="victim">Vítima</Select.Option>
                        <Select.Option value="denounced">Denunciado</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
