import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {CardImg, Col, Container, Row} from "reactstrap";
import mockImage from "assets/mock.png";
import {T_Film} from "modules/types.ts";
import {FilmMocks} from "modules/mocks.ts";

type Props = {
    selectedFilm: T_Film | null,
    setSelectedFilm: React.Dispatch<React.SetStateAction<T_Film | null>>,
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const FilmPage = ({selectedFilm, setSelectedFilm, isMock, setIsMock}: Props) => {
    const { id } = useParams<{id: string}>();

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/films/${id}`)
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
                    <CardImg src={isMock ? mockImage as string : selectedFilm.image} className="mb-3" />
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