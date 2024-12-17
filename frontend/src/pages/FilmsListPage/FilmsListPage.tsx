import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import {ChangeEvent, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchFilms, updateFilmName} from "store/slices/filmsSlice.ts";
import FilmCard from "components/FilmCard/FilmCard.tsx";
import Bin from "components/Bin/Bin.tsx";

const FilmsListPage = () => {

    const dispatch = useAppDispatch()

    const {films, film_name} = useAppSelector((state) => state.films)

    const {is_authenticated} = useAppSelector((state) => state.user)

    const {draft_history_id, films_count} = useAppSelector((state) => state.historys)

    const hasDraft = draft_history_id != null

    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        dispatch(updateFilmName(e.target.value))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(fetchFilms())
    }

    useEffect(() => {
        dispatch(fetchFilms())
    }, [])

    return (
        <Container>
            <Row className="mb-5">
                <Col md="6">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col xs="8">
                                <Input value={film_name} onChange={handleChange} placeholder="Поиск..."></Input>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-100 search-btn">Поиск</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
                {is_authenticated &&
                    <Col className="d-flex flex-row justify-content-end" md="6">
                        <Bin isActive={hasDraft} draft_history_id={draft_history_id} films_count={films_count} />
                    </Col>
                }
            </Row>
            <Row className="mt-5 d-flex">
                {films?.map(film => (
                    <Col key={film.id} className="mb-5 d-flex justify-content-center" sm="12" md="6" lg="4">
                        <FilmCard film={film} showAddBtn={is_authenticated} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default FilmsListPage