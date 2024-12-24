import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {T_History, T_HistorysFilters, T_Film} from "modules/types.ts";
import {NEXT_WEEK, PREV_WEEK} from "modules/consts.ts";
import {api} from "modules/api.ts";
import {AsyncThunkConfig} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {AxiosResponse} from "axios";

type T_HistorysSlice = {
    draft_history_id: number | null,
    films_count: number | null,
    history: T_History | null,
    historys: T_History[],
    statuses: T_Statuses[],
    filters: T_HistorysFilters,
    save_mm: boolean
}

const initialState:T_HistorysSlice = {
    draft_history_id: null,
    films_count: null,
    history: null,
    historys: [],
    statuses: [],
    filters: {
        status: "Не указан",
        date_formation_start: PREV_WEEK.toISOString().split('T')[0],
        date_formation_end: NEXT_WEEK.toISOString().split('T')[0],
        owner: ""
    },
    save_mm: false
}

export const fetchHistory = createAsyncThunk<T_History, string, AsyncThunkConfig>(
    "historys/history",
    async function(history_id) {
        const response = await api.historys.historysRead(history_id) as AxiosResponse<T_History>
        return response.data
    }
)

export const fetchHistorys = createAsyncThunk<T_History[], object, AsyncThunkConfig>(
    "historys/historys",
    async function(_, thunkAPI) {
        const state = thunkAPI.getState()

        const response = await api.historys.historysList({
            status: state.historys.filters.status,
            date_formation_start: state.historys.filters.date_formation_start,
            date_formation_end: state.historys.filters.date_formation_end
        }) as AxiosResponse<T_History[]>

        return response.data.filter(history => history.owner.includes(state.historys.filters.owner))
    }
)

export const fetchHistoryStatuses = createAsyncThunk<T_Statuses[], object, AsyncThunkConfig>(
    "historys/statuses",
    async function(_, thunkAPI) {
        const response = await api.historys.historysStatuses() as AxiosResponse<T_Statuses[]>;
        return response.data;
    }
)

export const removeFilmFromDraftHistory = createAsyncThunk<T_Film[], string, AsyncThunkConfig>(
    "historys/remove_film",
    async function(film_id, thunkAPI) {
        const state = thunkAPI.getState()
        const response = await api.historys.historysDeleteFilmDelete(state.historys.history.id, film_id) as AxiosResponse<T_Film[]>
        return response.data
    }
)

export const deleteDraftHistory = createAsyncThunk<void, object, AsyncThunkConfig>(
    "historys/delete_draft_history",
    async function(_, {getState}) {
        const state = getState()
        await api.historys.historysDeleteDelete(state.historys.history.id)
    }
)

export const sendDraftHistory = createAsyncThunk<void, object, AsyncThunkConfig>(
    "historys/send_draft_history",
    async function(_, {getState}) {
        const state = getState()
        await api.historys.historysUpdateStatusUserUpdate(state.historys.history.id)
    }
)

export const updateHistory = createAsyncThunk<void, object, AsyncThunkConfig>(
    "historys/update_history",
    async function(data, {getState}) {
        const state = getState()
        await api.historys.historysUpdateUpdate(state.historys.history.id, {
            ...data
        })
    }
)

export const updateFilmValue = createAsyncThunk<void, object, AsyncThunkConfig>(
    "historys/update_mm_value",
    async function({film_id, viewed},thunkAPI) {
        const state = thunkAPI.getState()
        await api.historys.historysUpdateFilmUpdate(state.historys.history.id, film_id, {viewed})
    }
)

export const acceptHistory = createAsyncThunk<void, string, AsyncThunkConfig>(
    "historys/accept_history",
    async function(history_id,{dispatch}) {
        await api.historys.historysUpdateStatusAdminUpdate(history_id, {status: "Завершен"})
        await dispatch(fetchHistorys)
    }
)

export const rejectHistory = createAsyncThunk<void, string, AsyncThunkConfig>(
    "historys/accept_history",
    async function(history_id,{dispatch}) {
        await api.historys.historysUpdateStatusAdminUpdate(history_id, {status: "Отклонен"})
        await dispatch(fetchHistorys)
    }
)

const historysSlice = createSlice({
    name: 'historys',
    initialState: initialState,
    reducers: {
        saveHistory: (state, action) => {
            state.draft_history_id = action.payload.draft_history_id
            state.films_count = action.payload.films_count
        },
        removeHistory: (state) => {
            state.history = null
        },
        triggerUpdateMM: (state) => {
            state.save_mm = !state.save_mm
        },
        updateFilters: (state, action) => {
            state.filters = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchHistory.fulfilled, (state:T_HistorysSlice, action: PayloadAction<T_History>) => {
            state.history = action.payload
        });
        builder.addCase(fetchHistorys.fulfilled, (state:T_HistorysSlice, action: PayloadAction<T_History[]>) => {
            state.historys = action.payload
        });
        builder.addCase(fetchHistoryStatuses.fulfilled, (state:T_HistorysSlice, action: PayloadAction<T_History[]>) => {
            state.statuses = action.payload
        });
        builder.addCase(removeFilmFromDraftHistory.rejected, (state:T_HistorysSlice) => {
            state.history = null
        });
        builder.addCase(removeFilmFromDraftHistory.fulfilled, (state:T_HistorysSlice, action: PayloadAction<T_Film[]>) => {
            if (state.history) {
                state.history.films = action.payload as T_Film[]
            }
        });
        builder.addCase(sendDraftHistory.fulfilled, (state:T_HistorysSlice) => {
            state.history = null
        });
    }
})

export const { saveHistory, removeHistory, triggerUpdateMM, updateFilters } = historysSlice.actions;

export default historysSlice.reducer