import { Fragment, useMemo, useState } from 'react';

import { Button, Row, Typography } from 'antd';

import { Show } from '@domain/@shared/Show';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
import { EditPersonModal } from '@domain/person/components/EditPersonModal';
import { PeopleTable } from '@domain/person/components/PeopleTable';
import { PeopleContextProvider } from '@domain/person/People.context';
import { SearchInput } from '@domain/@shared/SearchInput';
import { useDebounce } from '@domain/@shared/useDebounce';
import { matchesSearch } from '@domain/@shared/string.helper';

export function People() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    return (
        <PeopleContextProvider>
            {({
                people,
                isLoading,
                setIsCreateModalVisible,
                isCreateModalVisible,
                isEditModalVisible,
            }) => {
                const filteredPeople = useMemo(() => {
                    return people.filter(person =>
                        matchesSearch(person as unknown as Record<string, unknown>, debouncedSearchTerm, ['name', 'cpf', 'email']),
                    );
                }, [people, debouncedSearchTerm]);

                return (
                    <Fragment>
                        <main>
                            <Row justify="space-between" align="middle">
                                <Typography.Title level={3}>
                                    Pessoas
                                </Typography.Title>

                                <Button
                                    type="primary"
                                    onClick={() => setIsCreateModalVisible(true)}
                                >
                                    Cadastrar
                                </Button>
                            </Row>

                            <SearchInput
                                placeholder="Pesquisar por nome, CPF ou e-mail..."
                                onChange={setSearchTerm}
                            />

                            <PeopleTable
                                people={filteredPeople}
                                isLoading={isLoading}
                            />
                        </main>

                        <Show when={isCreateModalVisible}>
                            <CreatePersonModal />
                        </Show>

                        <Show when={isEditModalVisible}>
                            <EditPersonModal />
                        </Show>
                    </Fragment>
                );
            }}
        </PeopleContextProvider>
    );
}
