import { useEffect, useState, useCallback } from 'react';
import { App, Button, Divider, Form, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';
import { normalizeString } from '@domain/@shared/string.helper';
import { listPeople } from '@domain/person/api/list-people.service';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
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
    const [isCreatePersonModalVisible, setIsCreatePersonModalVisible] = useState(false);

    const [form] = Form.useForm<Involvement.Create>();
    const app = App.useApp();

    const fetchInitialData = useCallback(async (app: any, isMounted: { current: boolean }) => {
        setIsLoading(true);
        const response = await listPeople();
        if (!isMounted.current) return;
        
        if (hasServiceError(response)) {
            handleServiceError(app, response);
        } else {
            setPeople(response.data.people);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        
        const isMounted = { current: true };
        fetchInitialData(app, isMounted);
        
        return () => { isMounted.current = false; };
    }, [isVisible, app, fetchInitialData]);

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
        <>
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
                        filterOption={(input, option) =>
                            normalizeString(String(option?.label ?? '')).includes(normalizeString(input))
                        }
                        options={people.map((p: Person.Model) => ({ label: `${p.name} - ${p.cpf}`, value: p.id }))}
                        dropdownRender={(menu) => (
                            <>
                                {menu}
                                <Divider style={{ margin: '8px 0' }} />
                                <Button
                                    type="link"
                                    block
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsCreatePersonModalVisible(true)}
                                    style={{ textAlign: 'left', padding: '4px 12px' }}
                                >
                                    Cadastrar nova pessoa
                                </Button>
                            </>
                        )}
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

        {isCreatePersonModalVisible && (
            <CreatePersonModal
                onClose={() => setIsCreatePersonModalVisible(false)}
                onSuccess={() => {
                    setIsCreatePersonModalVisible(false);
                    app.message.success('Pessoa cadastrada com sucesso');
                    fetchInitialData(app, { current: true });
                }}
            />
        )}
        </>
    );
}
