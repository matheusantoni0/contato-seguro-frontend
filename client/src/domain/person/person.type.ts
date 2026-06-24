export namespace Person {
    export interface Model {
        id: number;
        name: string;
        cpf: string;
        email: string;
        birth_date: string;
        created_at: string;
        updated_at: string | null;
        deleted_at: string | null;
    }

    export type Create = Pick<Model, 'name' | 'cpf' | 'email' | 'birth_date'>;
    export type Update = Create;
}
