import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';

type Props = {
    placeholder?: string;
    onChange: (value: string) => void;
};

export function SearchInput({ placeholder = 'Pesquisar...', onChange }: Props) {
    return (
        <div style={{ marginBottom: 16 }}>
            <Input
                placeholder={placeholder}
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                allowClear
                onChange={e => onChange(e.target.value)}
                size="large"
            />
        </div>
    );
}
