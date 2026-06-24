import { useEffect, useState } from 'react';
import { Tag } from 'antd';
import { hasServiceError } from '@domain/@shared/service.helper';
import { listInvolvements } from '../api/list-involvements.service';

type Props = {
    recordId: number;
};

export function IsAnonymousTag({ recordId }: Props) {
    const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchStatus() {
            const response = await listInvolvements(recordId);
            if (!isMounted) return;

            if (!hasServiceError(response)) {
                setIsAnonymous(response.data.is_anonymous);
            }
        }

        fetchStatus();

        return () => {
            isMounted = false;
        };
    }, [recordId]);

    if (isAnonymous === null) return null;

    if (isAnonymous) {
        return <Tag color="red">Anônimo</Tag>;
    }

    return <Tag color="blue">Identificado</Tag>;
}
