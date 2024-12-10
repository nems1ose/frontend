import {createSlice} from "@reduxjs/toolkit";

type T_FilmsSlice = {
    film_name: string
}

const initialState:T_FilmsSlice = {
    film_name: "",
}


const filmsSlice = createSlice({
    name: 'films',
    initialState: initialState,
    reducers: {
        updateFilmName: (state, action) => {
            state.film_name = action.payload
        }
    }
})

export const { updateFilmName} = filmsSlice.actions;

export default filmsSlice.reducer