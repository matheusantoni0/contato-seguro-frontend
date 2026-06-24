import { useEffect, useState, useCallback, Fragment } from 'react';
import { Row, Button, Typography, Popconfirm, App, Skeleton, type TableColumnsType } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Table } from '@domain/@shared/Table';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { listInvolvements } from '../api/list-involvements.service';
import { deleteInvolvement } from '../api/delete-involvement.service';
import type { Involvement } from '../involvement.type';
import { LinkInvolvementModal } from './LinkInvolvementModal';
import { obfuscateCpf } from '@domain/person/person.helper';

type Props = {
    recordId: number;
};

const INVOLVEMENT_TYPE_LABELS: Record<string, string> = {
    whistleblower: 'Denunciante / Relator',
    witness: 'Testemunha',
    victim: 'Vítima',
    denounced: 'Denunciado',
};

const SKELETON_DATA = Array.from({ length: 3 }).map((_, i) => ({ id: i }));

export function InvolvementTab({ recordId }: Props) {
    const [involvements, setInvolvements] = useState<Involvement.Model[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    const app = App.useApp();

    const fetchInvolvements = useCallback(async () => {
        setIsLoading(true);
        const response = await listInvolvements(recordId);
        if (hasServiceError(response)) {
            handleServiceError(app, response);
        } else {
            setInvolvements(response.data.involvements);
        }
        setIsLoading(false);
    }, [recordId, app]);

    useEffect(() => {
        fetchInvolvements();
    }, [fetchInvolvements]);

    const handleDelete = async (involvementId: number) => {
        const response = await deleteInvolvement(recordId, involvementId);
        if (hasServiceError(response)) {
            handleServiceError(app, response);
        } else {
            app.message.success('Vínculo removido com sucesso');
            fetchInvolvements();
        }
    };

    const columns = [
        {
            title: 'Pessoa',
            dataIndex: ['person', 'name'],
        },
        {
            title: 'CPF',
            dataIndex: ['person', 'cpf'],
            render: (cpf: string) => obfuscateCpf(cpf),
        },
        {
            title: 'Papel',
            dataIndex: 'type',
            render: (type: string) => INVOLVEMENT_TYPE_LABELS[type as keyof typeof INVOLVEMENT_TYPE_LABELS] || type,
        },
        {
            render: (_: any, record: Involvement.Model) => (
                <Popconfirm
                    title="Remover vínculo?"
                    description="Tem certeza que deseja remover esta pessoa do relato?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Sim"
                    cancelText="Não"
                >
                    <Button danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
            width: 80,
        },
    ];

    const skeletonColumns: TableColumnsType<{ id: number }> = columns.map(col => ({
        ...col,
        render: () => <Skeleton.Input active size="small" block />,
    })) as TableColumnsType<{ id: number }>;

    return (
        <Fragment>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                    Pessoas Envolvidas
                </Typography.Title>
                <Button type="dashed" onClick={() => setIsModalVisible(true)}>
                    Vincular Pessoa
                </Button>
            </Row>

            {isLoading ? (
                <Table
                    columns={skeletonColumns}
                    dataSource={SKELETON_DATA}
                />
            ) : (
                <Table
                    dataSource={involvements}
                    columns={columns}
                    loading={false}
                />
            )}

            <LinkInvolvementModal
                recordId={recordId}
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    app.message.success('Pessoa vinculada com sucesso');
                    fetchInvolvements();
                }}
            />
        </Fragment>
    );
}
