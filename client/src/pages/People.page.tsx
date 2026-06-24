import { Fragment } from 'react';

import { Button, Row, Typography } from 'antd';

import { Show } from '@domain/@shared/Show';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
import { EditPersonModal } from '@domain/person/components/EditPersonModal';
import { PeopleTable } from '@domain/person/components/PeopleTable';
import { PeopleContextProvider } from '@domain/person/People.context';

export function People() {
    return (
        <PeopleContextProvider>
            {({
                people,
                isLoading,
                setIsCreateModalVisible,
                isCreateModalVisible,
                isEditModalVisible,
            }) => (
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

                        <PeopleTable
                            people={people}
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
            )}
        </PeopleContextProvider>
    );
}
