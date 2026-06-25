import { Card, Space, Statistic, Typography } from 'antd';

interface Props {
    title: string;
    value: number | string;
    suffix?: string;
    color?: string;
    prefix?: React.ReactNode;
}

export function MetricCard({ title, value, suffix, color, prefix }: Props) {
    const iconStyle: React.CSSProperties = {
        fontSize: '24px',
        color: color || '#8c8c8c',
        backgroundColor: color ? `${color}15` : '#f5f5f5', // 15 is approx 8% opacity in hex-ish
        padding: '12px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <Card 
            bordered={false} 
            styles={{ body: { padding: '24px' } }}
            style={{ 
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
            }}
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div style={iconStyle}>
                    {prefix}
                </div>
                <Statistic
                    value={value}
                    suffix={suffix}
                    valueStyle={{ 
                        fontSize: '32px', 
                        fontWeight: 700, 
                        color: '#262626',
                        letterSpacing: '-0.02em'
                    }}
                />
                <Typography.Text style={{ color: '#8c8c8c', fontSize: '14px', fontWeight: 500 }}>
                    {title}
                </Typography.Text>
            </Space>
        </Card>
    );
}
