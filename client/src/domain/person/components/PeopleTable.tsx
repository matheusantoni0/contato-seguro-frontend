import { Skeleton, type TableColumnsType } from 'antd';

import { Table } from '@domain/@shared/Table';
import type { Person } from '../person.type';

type Props = {
    people: Person.Model[];
    isLoading: boolean;
};

const COLUMNS: TableColumnsType<Person.Model> = [
    {
        title: 'Nome',
        dataIndex: 'name',
    },
    {
        title: 'CPF',
        dataIndex: 'cpf',
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
    },
    {
        title: 'Data de Nascimento',
        dataIndex: 'birth_date',
    },
];

export function PeopleTable({ people, isLoading }: Props) {
    if (isLoading) {
        return (
            <Table
                columns={COLUMNS.map(col => ({
                    ...col,
                    render: () => <Skeleton.Input active size="small" block />,
                }))}
                dataSource={Array.from({ length: 5 }).map((_, i) => ({ id: i } as any))}
            />
        );
    }

    return (
        <Table
            columns={COLUMNS}
            dataSource={people}
        />
    );
}
