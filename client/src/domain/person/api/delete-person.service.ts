import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

type Response =
    | Service.DefaultResponse<unknown>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /people/:id
 * @http DELETE
 */
export const deletePerson = (
    id: number,
): Promise<Response> => Request.delete(`/people/${id}`);
