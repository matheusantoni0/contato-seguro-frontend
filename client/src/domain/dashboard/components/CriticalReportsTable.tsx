import { Button, Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Record } from '@domain/record/record.type';
import { useRecordsContext } from '@domain/record/Records.context';
import { ArrowRightOutlined } from '@ant-design/icons';

interface Props {
    records: Record.Model[];
    loading?: boolean;
}

export function CriticalReportsTable({ records, loading }: Props) {
    const { setRecordId, setIsEditModalVisible } = useRecordsContext();

    const criticalRecords = records
        .filter(r => r.status === 'awaiting_investigation')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    const handleEdit = (record: Record.Model) => {
        setRecordId(record.id);
        setIsEditModalVisible(true);
    };

    const columns: ColumnsType<Record.Model> = [
        {
            title: 'RELATO',
            key: 'id',
            render: (_, record) => (
                <div>
                    <Typography.Text strong style={{ display: 'block', color: '#262626' }}>
                        {record.title}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        #{record.id} • {new Date(record.created_at).toLocaleDateString('pt-BR')}
                    </Typography.Text>
                </div>
            )
        },
        {
            title: 'STATUS',
            key: 'status',
            render: () => (
                <Tag color="orange" style={{ border: 'none', borderRadius: '4px', fontWeight: 500 }}>
                    Aguardando
                </Tag>
            )
        },
        {
            title: 'AÇÃO',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Button 
                    type="link" 
                    icon={<ArrowRightOutlined />} 
                    onClick={() => handleEdit(record)}
                    style={{ fontWeight: 500, padding: 0 }}
                >
                    Acessar
                </Button>
            )
        }
    ];

    return (
        <Card 
            bordered={false}
            style={{ 
                borderRadius: '16px', 
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)' 
            }}
            styles={{ body: { padding: 0 } }}
        >
            <Table 
                columns={columns} 
                dataSource={criticalRecords} 
                rowKey="id" 
                pagination={false} 
                loading={loading}
                size="middle"
                style={{ borderRadius: '16px', overflow: 'hidden' }}
            />
        </Card>
    );
}
