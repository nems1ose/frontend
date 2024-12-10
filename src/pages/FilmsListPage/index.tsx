import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import FilmCard from "components/FilmCard";
import {ChangeEvent, FormEvent, useEffect} from "react";
import * as React from "react";
import {useAppSelector} from "src/store/store.ts";
import {updateFilmName} from "src/store/slices/filmsSlice.ts";
import {T_Film} from "modules/types.ts";
import {FilmMocks} from "modules/mocks.ts";
import {useDispatch} from "react-redux";

type Props = {
    films: T_Film[],
    setFilms: React.Dispatch<React.SetStateAction<T_Film[]>>
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const FilmsListPage = ({films, setFilms, isMock, setIsMock}:Props) => {

    const dispatch = useDispatch()

    const {film_name} = useAppSelector((state) => state.films)

    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        dispatch(updateFilmName(e.target.value))
    }

    const createMocks = () => {
        setIsMock(true)
        setFilms(FilmMocks.filter(film => film.name.toLowerCase().includes(film_name.toLowerCase())))
    }

    const handleSubmit = async (e:FormEvent) => {
        e.preventDefault()
        await fetchFilms()
    }

    const fetchFilms = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/films/?film_name=${film_name.toLowerCase()}`)
            const data = await response.json()
            setFilms(data.films)
            setIsMock(false)
        } catch {
            createMocks()
        }
    }

    useEffect(() => {
        fetchFilms()
    }, []);

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
            </Row>
            <Row>
                {films?.map(film => (
                    <Col key={film.id} sm="12" md="6" lg="4">
                        <FilmCard film={film} isMock={isMock} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default FilmsListPage