import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchFilm, removeSelectedFilm} from "store/slices/filmsSlice.ts";

const FilmPage = () => {
    const { id } = useParams<{id: string}>();

    const dispatch = useAppDispatch()

    const {film} = useAppSelector((state) => state.films)

    useEffect(() => {
        dispatch(fetchFilm(id))
        return () => dispatch(removeSelectedFilm())
    }, []);

    if (!film) {
        return (
            <div>

            </div>
        )
    }

    return (
        <Container>
            <Row>
                <Col md="6">
                    <img
                        alt=""
                        src={film.image}
                        className="w-100"
                    />
                </Col>
                <Col md="6">
                    <h1 className="mb-3">{film.name}</h1>
                    <p className="fs-5">Описание: {film.description}</p>
                    <p className="fs-5">Продолжительность: {film.time}мин.</p>
                    <p className="fs-5">Год выпуска: {film.year}</p>
                    <p className="fs-5">Страна: {film.country}</p>
                </Col>
            </Row>
        </Container>
    );
};

export default FilmPage