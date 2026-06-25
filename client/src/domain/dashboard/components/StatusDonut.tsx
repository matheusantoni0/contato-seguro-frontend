import { Pie } from '@ant-design/plots';
import { Card } from 'antd';

interface Props {
    data: { type: string; value: number }[];
    loading?: boolean;
}

export function StatusDonut({ data, loading }: Props) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    const config = {
        data,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.65,
        color: ['#faad14', '#13c2c2', '#52c41a', '#bfbfbf'], // Amber, Cyan, Green, Grey
        label: {
            text: 'value',
            style: {
                fontWeight: 'bold',
                fill: '#fff',
            },
        },
        legend: {
            color: {
                position: 'bottom',
                layout: 'horizontal',
                itemMarker: 'circle',
            },
        },
        annotations: [
            {
                type: 'text',
                style: {
                    text: `${total}\nRelatos`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 'bold',
                    fill: '#262626',
                },
            },
        ],
        interaction: {
            elementActive: true,
            tooltip: true,
        },
    };

    return (
        <Card 
            bordered={false} 
            loading={loading}
            style={{ 
                borderRadius: '16px', 
                border: '1px solid #f0f0f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
            styles={{ body: { flex: 1, padding: '24px 24px 48px 24px' } }}
        >
            <Pie {...config} />
        </Card>
    );
}
