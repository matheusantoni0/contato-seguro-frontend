import { Bar } from '@ant-design/plots';
import { Card } from 'antd';

interface Props {
    data: { name: string; count: number }[];
    loading?: boolean;
}

export function CompanyRankingBar({ data, loading }: Props) {
    const config = {
        data,
        xField: 'name',
        yField: 'count',
        colorField: 'name',
        color: '#2f54eb', // Use a single professional blue
        legend: false,
        axis: {
            x: {
                grid: false,
            },
        },
        style: {
            radius: 4,
        },
    };

    return (
        <Card 
            bordered={false} 
            loading={loading}
            style={{ 
                borderRadius: '16px', 
                border: '1px solid #f0f0f0',
                height: '100%'
            }}
            styles={{ body: { padding: '24px' } }}
        >
            <Bar {...config} />
        </Card>
    );
}
