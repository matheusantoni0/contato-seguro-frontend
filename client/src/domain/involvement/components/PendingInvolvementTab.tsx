import { useState, Fragment } from 'react';
import { Row, Button, Typography, Popconfirm, App } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Table } from '@domain/@shared/Table';
import type { Involvement } from '../involvement.type';
import { LinkInvolvementModal } from './LinkInvolvementModal';
import { obfuscateCpf } from '@domain/person/person.helper';
import { usePeopleContext } from '@domain/person/People.context';

type Props = {
    pendingInvolvements: Involvement.Create[];
    onChange: (involvements: Involvement.Create[]) => void;
};

const INVOLVEMENT_TYPE_LABELS = {
    whistleblower: 'Denunciante / Relator',
    witness: 'Testemunha',
    victim: 'Vítima',
    denounced: 'Denunciado',
};

export function PendingInvolvementTab({ pendingInvolvements, onChange }: Props) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    const { people } = usePeopleContext(); // Usa o contexto de pessoas para buscar os dados completos pelo person_id

    const app = App.useApp();

    const handleDelete = (personId: number) => {
        onChange(pendingInvolvements.filter(inv => inv.person_id !== personId));
        app.message.success('Vínculo temporário removido');
    };

    const handleAdd = (values: Involvement.Create) => {
        const isAlreadyPending = pendingInvolvements.some(inv => inv.person_id === values.person_id);
        if (isAlreadyPending) {
            app.notification.error({ message: 'Algo deu errado!', description: 'Esta pessoa já está vinculada neste relato temporariamente.' });
            return false;
        }

        onChange([...pendingInvolvements, values]);
        app.message.success('Pessoa vinculada temporariamente');
        setIsModalVisible(false);
        return true;
    };

    const columns = [
        {
            title: 'Pessoa',
            render: (_: any, record: Involvement.Create) => {
                const person = people.find(p => p.id === record.person_id);
                return person?.name || `ID: ${record.person_id}`;
            }
        },
        {
            title: 'CPF',
            render: (_: any, record: Involvement.Create) => {
                const person = people.find(p => p.id === record.person_id);
                return person ? obfuscateCpf(person.cpf) : '-';
            }
        },
        {
            title: 'Papel',
            dataIndex: 'type',
            render: (type: string) => INVOLVEMENT_TYPE_LABELS[type as keyof typeof INVOLVEMENT_TYPE_LABELS] || type,
        },
        {
            render: (_: any, record: Involvement.Create) => (
                <Popconfirm
                    title="Remover vínculo?"
                    description="Tem certeza que deseja remover esta pessoa do relato?"
                    onConfirm={() => handleDelete(record.person_id)}
                    okText="Sim"
                    cancelText="Não"
                >
                    <Button danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
            width: 80,
        },
    ];

    const dataWithKeys = pendingInvolvements.map(inv => ({
        ...inv,
        id: inv.person_id, // Table precisa de propriedade `id`
    }));

    return (
        <Fragment>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                    Pessoas Envolvidas (Rascunho)
                </Typography.Title>
                <Button type="dashed" onClick={() => setIsModalVisible(true)}>
                    Vincular Pessoa
                </Button>
            </Row>

            <Table
                dataSource={dataWithKeys}
                columns={columns}
                loading={false}
            />

            <LinkInvolvementModal
                recordId={0} // Irrelevante aqui, pois interceptaremos o onFinish no CreateRecordModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {/* handled by onFinish intercept if we adapt LinkModal, or we pass a custom bypass */}}
                customSubmit={handleAdd}
            />
        </Fragment>
    );
}
