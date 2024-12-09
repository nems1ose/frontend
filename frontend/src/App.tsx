import {useState} from "react";
import Header from "components/Header";
import Breadcrumbs from "components/Breadcrumbs";
import FilmPage from "pages/FilmPage";
import FilmsListPage from "pages/FilmsListPage";
import {Route, Routes} from "react-router-dom";
import {T_Film} from "src/modules/types.ts";
import {Container, Row} from "reactstrap";
import HomePage from "pages/HomePage";
import "./styles.css"

function App() {

    const [films, setFilms] = useState<T_Film[]>([])

    const [selectedFilm, setSelectedFilm] = useState<T_Film | null>(null)

    const [isMock, setIsMock] = useState(false);

    const [filmName, setFilmName] = useState<string>("")

    return (
        <div>
            <Header/>
            <Container className="pt-4">
                <Row className="mb-3">
                    <Breadcrumbs selectedFilm={selectedFilm} />
                </Row>
                <Row>
                    <Routes>
						<Route path="/" element={<HomePage />} />
                        <Route path="/films/" element={<FilmsListPage films={films} setFilms={setFilms} isMock={isMock} setIsMock={setIsMock} filmName={filmName} setFilmName={setFilmName}/>} />
                        <Route path="/films/:id" element={<FilmPage selectedFilm={selectedFilm} setSelectedFilm={setSelectedFilm} isMock={isMock} setIsMock={setIsMock}/>} />
                    </Routes>
                </Row>
            </Container>
        </div>
    )
}

export default App
