import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {T_Film} from "src/modules/types.ts";
import {Col, Container, Row} from "reactstrap";
import {FilmMocks} from "src/modules/mocks.ts";
import mockImage from "assets/mock.png";

type FilmPageProps = {
    selectedFilm: T_Film | null,
    setSelectedFilm: React.Dispatch<React.SetStateAction<T_Film | null>>,
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const FilmPage = ({selectedFilm, setSelectedFilm, isMock, setIsMock}: FilmPageProps) => {
    const { id } = useParams<{id: string}>();

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/films/${id}`,{ signal: AbortSignal.timeout(1000) })
            const data = await response.json()
            setSelectedFilm(data)
        } catch {
            createMock()
        }
    }

    const createMock = () => {
        setIsMock(true)
        setSelectedFilm(FilmMocks.find(film => film?.id == parseInt(id as string)) as T_Film)
    }

    useEffect(() => {
        if (!isMock) {
            fetchData()
        } else {
            createMock()
        }

        return () => setSelectedFilm(null)
    }, []);

    if (!selectedFilm) {
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
                        src={isMock ? mockImage as string : selectedFilm.image}
                        className="w-100"
                    />
                </Col>
                <Col md="6">
                    <h1 className="mb-3">{selectedFilm.name}</h1>
                    <p className="fs-5">Описание: {selectedFilm.description}</p>
                    <p className="fs-5">Продолжительность: {selectedFilm.time}мин.</p>
                    <p className="fs-5">Год выпуска: {selectedFilm.year}</p>
                    <p className="fs-5">Страна: {selectedFilm.country}</p>
                </Col>
            </Row>
        </Container>
    );
};

export default FilmPage