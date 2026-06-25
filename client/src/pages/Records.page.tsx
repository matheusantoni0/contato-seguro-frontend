import { Fragment, useMemo, useState } from 'react';

import { Button, Row, type TableColumnsType, Typography } from 'antd';

import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CompaniesContextProvider } from '@domain/company/Companies.context';
import { CreateRecordModal } from '@domain/record/components/CreateRecordModal';
import { EditRecordModal } from '@domain/record/components/EditRecordModal';
import { RecordsActionsCell } from '@domain/record/components/RecordsActionsCell';
import { IsAnonymousTag } from '@domain/involvement/components/IsAnonymousTag';
import type { Record } from '@domain/record/record.type';
import { RecordsContextProvider } from '@domain/record/Records.context';
import { SearchInput } from '@domain/@shared/SearchInput';
import { useDebounce } from '@domain/@shared/useDebounce';
import { matchesSearch } from '@domain/@shared/string.helper';

const STATUS_LABELS: Record<Record.Status, string> = {
    awaiting_investigation: 'Aguardando investigação',
    investigation_in_progress: 'Investigação em andamento',
    resolved: 'Resolvido',
    archived: 'Arquivado',
};

const COLUMNS: TableColumnsType<Record.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`,
    },
    {
        title: 'Título',
        dataIndex: 'title',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        render: value => STATUS_LABELS[value as Record.Status] ?? value,
    },
    {
        title: 'Anonimato',
        render: (_, record) => <IsAnonymousTag recordId={record.id} />,
    },
    {
        render: (_, record) => <RecordsActionsCell record={record} />,
    },
];

export function Records() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    return (
        <CompaniesContextProvider>
            {() => (
                <RecordsContextProvider>
                    {({
                        isLoading,
                        records,
                        setIsCreateModalVisible,
                        isCreateModalVisible,
                        isEditModalVisible,
                    }) => {
                        const filteredRecords = useMemo(() => {
                            return records.filter(record =>
                                matchesSearch(record as unknown as Record<string, unknown>, debouncedSearchTerm, ['id', 'title', 'status']),
                            );
                        }, [records, debouncedSearchTerm]);

                        return (
                            <Fragment>
                                <main>
                                    <Row justify="space-between" align="middle">
                                        <Typography.Title level={3}>
                                            Relatos
                                        </Typography.Title>

                                        <Button
                                            type="primary"
                                            onClick={() => setIsCreateModalVisible(true)}
                                        >
                                            Cadastrar
                                        </Button>
                                    </Row>

                                    <SearchInput
                                        placeholder="Pesquisar por título, ID ou status..."
                                        onChange={setSearchTerm}
                                    />

                                    <Table
                                        columns={COLUMNS}
                                        dataSource={filteredRecords}
                                        loading={isLoading}
                                    />
                                </main>

                                <Show when={isCreateModalVisible}>
                                    <CreateRecordModal />
                                </Show>

                                <Show when={isEditModalVisible}>
                                    <EditRecordModal />
                                </Show>
                            </Fragment>
                        );
                    }}
                </RecordsContextProvider>
            )}
        </CompaniesContextProvider>
    );
}
