import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import {T_Film} from "src/modules/types.ts";
import FilmCard from "components/FilmCard";
import {FilmMocks} from "src/modules/mocks.ts";
import {FormEvent, useEffect} from "react";
import * as React from "react";

type FilmsListPageProps = {
    films: T_Film[],
    setFilms: React.Dispatch<React.SetStateAction<T_Film[]>>
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
    filmName: string,
    setFilmName: React.Dispatch<React.SetStateAction<string>>
}

const FilmsListPage = ({films, setFilms, isMock, setIsMock, filmName, setFilmName}:FilmsListPageProps) => {

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/films/?film_name=${filmName.toLowerCase()}`,{ signal: AbortSignal.timeout(1000) })
            const data = await response.json()
            setFilms(data.films)
            setIsMock(false)
        } catch {
            createMocks()
        }
    }

    const createMocks = () => {
        setIsMock(true)
        setFilms(FilmMocks.filter(film => film.name.toLowerCase().includes(filmName.toLowerCase())))
    }

    const handleSubmit = async (e:FormEvent) => {
        e.preventDefault()
        if (isMock) {
            createMocks()
        } else {
            await fetchData()
        }
    }

    useEffect(() => {
        fetchData()
    }, []);

    return (
        <Container>
            <Row className="mb-5">
                <Col md="6">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md="8">
                                <Input value={filmName} onChange={(e) => setFilmName(e.target.value)} placeholder="Поиск..."></Input>
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
                    <Col key={film.id} xs="4">
                        <FilmCard film={film} isMock={isMock} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default FilmsListPage