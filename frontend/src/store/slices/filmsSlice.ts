import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {T_Film, T_FilmsListResponse} from "modules/types.ts";
import {AsyncThunkConfig} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {api} from "modules/api.ts";
import {AxiosResponse} from "axios";
import {saveHistory} from "store/slices/historysSlice.ts";

type T_FilmsSlice = {
    film_name: string
    film: null | T_Film
    films: T_Film[]
}

const initialState:T_FilmsSlice = {
    film_name: "",
    film: null,
    films: []
}

export const fetchFilm = createAsyncThunk<T_Film, string, AsyncThunkConfig>(
    "fetch_film",
    async function(id) {
        const response = await api.films.filmsRead(id) as AxiosResponse<T_Film>
        return response.data
    }
)

export const fetchFilms = createAsyncThunk<T_Film[], object, AsyncThunkConfig>(
    "fetch_films",
    async function(_, thunkAPI) {
        const state = thunkAPI.getState();
        const response = await api.films.filmsList({
            film_name: state.films.film_name
        }) as AxiosResponse<T_FilmsListResponse>

        thunkAPI.dispatch(saveHistory({
            draft_history_id: response.data.draft_history_id,
            films_count: response.data.films_count
        }))

        return response.data.films
    }
)

export const addFilmToHistory = createAsyncThunk<void, string, AsyncThunkConfig>(
    "films/add_film_to_history",
    async function(film_id) {
        await api.films.filmsAddToHistoryCreate(film_id)
    }
)

const filmsSlice = createSlice({
    name: 'films',
    initialState: initialState,
    reducers: {
        updateFilmName: (state, action) => {
            state.film_name = action.payload
        },
        removeSelectedFilm: (state) => {
            state.film = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchFilms.fulfilled, (state:T_FilmsSlice, action: PayloadAction<T_Film[]>) => {
            state.films = action.payload
        });
        builder.addCase(fetchFilm.fulfilled, (state:T_FilmsSlice, action: PayloadAction<T_Film>) => {
            state.film = action.payload
        });
    }
})

export const { updateFilmName, removeSelectedFilm} = filmsSlice.actions;

export default filmsSlice.reducer