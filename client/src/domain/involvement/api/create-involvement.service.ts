import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Involvement } from '../involvement.type';

type Data = { involvement: Involvement.Model };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records/{recordId}/involvements
 * @http POST
 */
export const createInvolvement = (
    recordId: number,
    body: Involvement.Create,
): Promise<Response> => Request.post(`/records/${recordId}/involvements`, body);
