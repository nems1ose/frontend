export type T_Film = {
    id: string
    name: string
    description: string
    time: number
    year: number
    country: string
    image: string
    status: number
    viewed?: string
}

export type T_History = {
    id: string | null
    status: E_HistoryStatus
    date_complete: string
    date_created: string
    date_formation: string
    owner: string
    moderator: string
    films: T_Film[]
    estimation: string
    date: string
}

export enum E_HistoryStatus {
    Draft="Введен",
    InWork="В работе",
    Completed="Завершен",
    Rejected="Отклонен",
    Deleted="Удален"
}

export type T_User = {
    id: number
    username: string
    is_authenticated: boolean
    is_superuser: boolean
}

export type T_HistorysFilters = {
    date_formation_start: string
    date_formation_end: string
    status: string
    owner: string
}

export type T_FilmsListResponse = {
    films: T_Film[],
    draft_history_id?: number,
    films_count?: number
}

export type T_LoginCredentials = {
    username: string
    password: string
}

export type T_RegisterCredentials = {
    name: string
    email: string
    password: string
}

export type T_FilmAddData = {
    name: string;
    description: string;
    time: number;
    image?: File | null;
}