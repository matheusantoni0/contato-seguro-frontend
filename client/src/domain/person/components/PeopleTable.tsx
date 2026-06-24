import { Skeleton, type TableColumnsType } from 'antd';
import dayjs from 'dayjs';

import { Table } from '@domain/@shared/Table';
import type { Person } from '../person.type';
import { PeopleActionsCell } from './PeopleActionsCell';

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
        render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
        render: (_, person) => <PeopleActionsCell person={person} />,
    },
];

const SKELETON_COLUMNS: TableColumnsType<{ id: number }> = COLUMNS.map(col => ({
    ...col,
    render: () => <Skeleton.Input active size="small" block />,
})) as TableColumnsType<{ id: number }>;

const SKELETON_DATA = Array.from({ length: 5 }).map((_, i) => ({ id: i }));

export function PeopleTable({ people, isLoading }: Props) {
    if (isLoading) {
        return (
            <Table
                columns={SKELETON_COLUMNS}
                dataSource={SKELETON_DATA}
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
