import { useMemo } from 'react';

import { Col, Row, Skeleton, Space, Typography } from 'antd';
import {
    DashboardOutlined,
    FileSearchOutlined,
    CheckCircleOutlined, UserOutlined,
    BankOutlined
} from '@ant-design/icons';

import { CompaniesContextProvider } from '@domain/company/Companies.context';
import { DashboardHelper } from '@domain/dashboard/Dashboard.helper';
import { MetricCard } from '@domain/dashboard/components/MetricCard';
import { StatusDonut } from '@domain/dashboard/components/StatusDonut';
import { CompanyRankingBar } from '@domain/dashboard/components/CompanyRankingBar';
import { CriticalReportsTable } from '@domain/dashboard/components/CriticalReportsTable';
import { PeopleContextProvider } from '@domain/person/People.context';
import { RecordsContextProvider } from '@domain/record/Records.context';
import { EditRecordModal } from '@domain/record/components/EditRecordModal';
import { Show } from '@domain/@shared/Show';

export function Dashboard() {
    return (
        <CompaniesContextProvider>
            {({ companies, isLoading: isCompaniesLoading }) => (
                <PeopleContextProvider>
                    {({ people, isLoading: isPeopleLoading }) => (
                        <RecordsContextProvider>
                            {({ records, isLoading: isRecordsLoading, isEditModalVisible }) => (
                                <>
                                    <DashboardView
                                        records={records}
                                        companies={companies}
                                        peopleCount={people.length}
                                        isLoading={isRecordsLoading || isCompaniesLoading || isPeopleLoading}
                                    />
                                    <Show when={isEditModalVisible}>
                                        <EditRecordModal />
                                    </Show>
                                </>
                            )}
                        </RecordsContextProvider>
                    )}
                </PeopleContextProvider>
            )}
        </CompaniesContextProvider>
    );
}

interface DashboardViewProps {
    records: any[];
    companies: any[];
    peopleCount: number;
    isLoading: boolean;
}

function DashboardView({ records, companies, peopleCount, isLoading }: DashboardViewProps) {
    const kpis = useMemo(() => DashboardHelper.calculateKPIs(records), [records]);
    const statusData = useMemo(() => DashboardHelper.getStatusData(records), [records]);
    const companyRanking = useMemo(() => DashboardHelper.getCompanyRanking(records, companies), [records, companies]);

    if (isLoading) {
        return (
            <div style={{ padding: '24px' }}>
                <Skeleton active paragraph={{ rows: 12 }} />
            </div>
        );
    }

    return (
        <Space direction="vertical" size={32} style={{ width: '100%', display: 'flex' }}>
            <header style={{ marginBottom: 8 }}>
                <Typography.Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                    Painel de Controle
                </Typography.Title>
                <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                    Visão geral da saúde operacional do sistema
                </Typography.Text>
            </header>

            <section>
                <Typography.Title level={5} style={{ marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, color: '#8c8c8c' }}>
                    Indicadores de Performance
                </Typography.Title>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} lg={6}>
                        <MetricCard
                            title="Total de Relatos"
                            value={kpis.total}
                            prefix={<DashboardOutlined />}
                            color="#2f54eb"
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <MetricCard
                            title="Aguardando"
                            value={kpis.awaiting}
                            prefix={<FileSearchOutlined />}
                            color="#faad14"
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <MetricCard
                            title="Em Investigação"
                            value={kpis.inProgress}
                            prefix={<FileSearchOutlined />}
                            color="#13c2c2"
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <MetricCard
                            title="Taxa de Resolução"
                            value={kpis.resolutionRate.toFixed(1)}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            color="#52c41a"
                        />
                    </Col>
                </Row>
            </section>

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={10}>
                    <section style={{ height: '100%' }}>
                        <Typography.Title level={5} style={{ marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, color: '#8c8c8c' }}>
                            Status do Ecossistema
                        </Typography.Title>
                        <StatusDonut data={statusData} />
                    </section>
                </Col>
                <Col xs={24} lg={14}>
                    <section style={{ height: '100%' }}>
                        <Typography.Title level={5} style={{ marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, color: '#8c8c8c' }}>
                            Concentração de Pendências
                        </Typography.Title>
                        <CompanyRankingBar data={companyRanking} />
                    </section>
                </Col>
            </Row>

            <section>
                <Typography.Title level={5} style={{ paddingTop: 16, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, color: '#8c8c8c' }}>
                    Casos que Necessitam Atenção
                </Typography.Title>
                <CriticalReportsTable records={records} />
            </section>

            <section style={{ borderTop: '1px solid #f0f0f0', paddingTop: 32 }}>
                <Typography.Title level={5} style={{ marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, color: '#8c8c8c' }}>
                    Ativos da Plataforma
                </Typography.Title>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} lg={6}>
                        <MetricCard
                            title="Empresas Ativas"
                            value={companies.length}
                            prefix={<BankOutlined />}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <MetricCard
                            title="Pessoas"
                            value={peopleCount}
                            prefix={<UserOutlined />}
                        />
                    </Col>
                </Row>
            </section>
        </Space>
    );
}
