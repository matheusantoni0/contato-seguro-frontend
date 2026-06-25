import { Fragment, useMemo, useState } from 'react';

import { Button, Row, type TableColumnsType, Typography } from 'antd';

import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CompaniesContextProvider } from '@domain/company/Companies.context';
import type { Company } from '@domain/company/company.type';
import { CompaniesActionsCell } from '@domain/company/components/CompaniesActionsCell';
import { CreateCompanyModal } from '@domain/company/components/CreateCompanyModal';
import { EditCompanyModal } from '@domain/company/components/EditCompanyModal';
import { SearchInput } from '@domain/@shared/SearchInput';
import { useDebounce } from '@domain/@shared/useDebounce';
import { matchesSearch } from '@domain/@shared/string.helper';

const COLUMNS: TableColumnsType<Company.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`,
    },
    {
        title: 'Nome',
        dataIndex: 'name',
    },
    {
        title: 'CNPJ',
        dataIndex: 'cnpj',
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
    },
    {
        render: (_, record) => <CompaniesActionsCell company={record} />,
    },
];

export function Companies() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    return (
        <CompaniesContextProvider>
            {({
                isLoading,
                companies,
                setIsCreateModalVisible,
                isCreateModalVisible,
                isEditModalVisible,
            }) => {
                const filteredCompanies = useMemo(() => {
                    return companies.filter(company =>
                        matchesSearch(company as unknown as Record<string, unknown>, debouncedSearchTerm, ['name', 'cnpj', 'email']),
                    );
                }, [companies, debouncedSearchTerm]);

                return (
                    <Fragment>
                        <main>
                            <Row justify="space-between" align="middle">
                                <Typography.Title level={3}>
                                    Empresas
                                </Typography.Title>

                                <Button
                                    type="primary"
                                    onClick={() => setIsCreateModalVisible(true)}
                                >
                                    Cadastrar
                                </Button>
                            </Row>

                            <SearchInput
                                placeholder="Pesquisar por nome, CNPJ ou e-mail..."
                                onChange={setSearchTerm}
                            />

                            <Table
                                columns={COLUMNS}
                                dataSource={filteredCompanies}
                                loading={isLoading}
                            />
                        </main>

                        <Show when={isCreateModalVisible}>
                            <CreateCompanyModal />
                        </Show>

                        <Show when={isEditModalVisible}>
                            <EditCompanyModal />
                        </Show>
                    </Fragment>
                );
            }}
        </CompaniesContextProvider>
    );
}
