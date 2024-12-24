import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import {ChangeEvent, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchFilms, updateFilmName} from "store/slices/filmsSlice.ts";
import {Link, useNavigate} from "react-router-dom";
import FilmsTable from "components/FilmsTable/FilmsTable.tsx";

const FilmsTablePage = () => {

    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const {is_authenticated, is_superuser} = useAppSelector((state) => state.user)

    const {films, film_name} = useAppSelector((state) => state.films)

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

    useEffect(() => {
        if (!is_superuser) {
            navigate("/403/")
        }
    }, [is_authenticated, is_superuser]);

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
                <Col className="d-flex flex-row justify-content-end" md="6">
                    <Link to="/films/add">
                        <Button color="primary">Новый фильм</Button>
                    </Link>
                </Col>
            </Row>
            <Row className="mt-5 d-flex">
                {films.length > 0 ? <FilmsTable films={films} fetchFilms={fetchFilms}/> : <h3 className="text-center mt-5">Фильмы не найдены</h3>}
            </Row>
        </Container>
    );
};

export default FilmsTablePage