import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Involvement } from '../involvement.type';

type Response =
    | Service.DefaultResponse<Involvement.ListResponse>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records/{recordId}/involvements
 * @http GET
 */
export const listInvolvements = (
    recordId: number,
): Promise<Response> => Request.get(`/records/${recordId}/involvements`);
