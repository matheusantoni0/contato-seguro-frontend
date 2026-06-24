import { Fragment } from 'react';

import { Button, Row, Typography } from 'antd';

import { PeopleTable } from '@domain/person/components/PeopleTable';
import { PeopleContextProvider } from '@domain/person/People.context';

export function People() {
    return (
        <PeopleContextProvider>
            {({ people, isLoading, setIsCreateModalVisible }) => (
                <Fragment>
                    <main>
                        <Row justify="space-between" align="middle">
                            <Typography.Title level={3}>
                                Gerenciamento de Pessoas
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
                </Fragment>
            )}
        </PeopleContextProvider>
    );
}
