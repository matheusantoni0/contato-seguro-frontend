import { Outlet } from 'react-router';

import { Layout as AntdLayout } from 'antd';

import dayjs from 'dayjs';

export function Content() {
    const currentYear = dayjs().year();

    return (
        <AntdLayout style={{ 
            height: '100%', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            flex: 'auto',
            minWidth: 0,
            background: '#fafafa'
        }}>
            <AntdLayout.Content style={{ 
                padding: '24px 32px', 
                margin: 0, 
                flex: '1 0 auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Outlet />
            </AntdLayout.Content>

            <AntdLayout.Footer style={{ textAlign: 'center', background: '#fafafa' }}>
                Contato Seguro Slim @{currentYear}
            </AntdLayout.Footer>
        </AntdLayout>
    );
}
