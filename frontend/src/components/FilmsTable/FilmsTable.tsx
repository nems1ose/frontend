import {useNavigate} from "react-router-dom";
import {useMemo} from "react";
import {Button} from "reactstrap";
import {T_Film} from "modules/types.ts";
import CustomTable from "components/CustomTable/CustomTable.tsx";
import {deleteFilm} from "store/slices/filmsSlice.ts";
import {useAppDispatch} from "store/store.ts";

type Props = {
    films:T_Film[]
}

const FilmsTable = ({films}:Props) => {

    const navigate = useNavigate()

    const dispatch = useAppDispatch()

    const handleClick = (film_id) => {
        navigate(`/films/${film_id}`)
    }

    const openpRroductEditPage = (film_id) => {
        navigate(`/films/${film_id}/edit`)
    }

    const handleDeleteFilm = async (film_id) => {
        dispatch(deleteFilm(film_id))
    }

    const columns = useMemo(
        () => [ 
            {
                Header: '№',
                accessor: 'id',
            },
            { 
                Header: 'Картинка', 
                accessor: 'image', 
                Cell: ({ value }) => (
                    <img 
                        alt="" 
                        src={value} 
                        style={{ width: '50px', height: 'auto' }} 
                    />
                ) 
            },   
            {
                Header: 'Название',
                accessor: 'name',
                Cell: ({ value }) => value
            },
            {
                Header: 'Продолжительность',
                accessor: 'time',
                Cell: ({ value }) => value
            },
            {
                Header: "Действие",
                accessor: "edit_button",
                Cell: ({ cell }) => (
                    <Button color="primary" onClick={() => openpRroductEditPage(cell.row.values.id)}>Редактировать</Button>
                )
            },
            {
                Header: "Удалить",
                accessor: "delete_button",
                Cell: ({ cell }) => (
                    <Button color="danger" onClick={() => handleDeleteFilm(cell.row.values.id)}>Удалить</Button>
                )
            }
        ],
        []
    )

    if (!films.length) {
        return (
            <></>
        )
    }

    return (
        <CustomTable columns={columns} data={films} onClick={handleClick} />
    )
};

export default FilmsTable