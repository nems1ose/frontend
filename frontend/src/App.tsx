import {Route, Routes} from "react-router-dom";
import {Container, Row} from "reactstrap";
import "./styles.css"
import HomePage from "pages/HomePage/HomePage.tsx";
import LoginPage from "pages/LoginPage/LoginPage.tsx";
import RegisterPage from "pages/RegisterPage/RegisterPage.tsx";
import FilmsListPage from "pages/FilmsListPage/FilmsListPage.tsx";
import FilmPage from "pages/FilmPage/FilmPage.tsx";
import HistorysPage from "pages/HistorysPage/HistorysPage.tsx";
import HistoryPage from "pages/HistoryPage/HistoryPage.tsx";
import ProfilePage from "pages/ProfilePage/ProfilePage.tsx";
import Header from "components/Header/Header.tsx";
import Breadcrumbs from "components/Breadcrumbs/Breadcrumbs.tsx";

function App() {
    return (
        <div>
            <Header />
            <Container className="pt-4">
                <Row className="mb-3">
                    <Breadcrumbs />
                </Row>
                <Row>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login/" element={<LoginPage />} />
                        <Route path="/register/" element={<RegisterPage />} />
                        <Route path="/films/" element={<FilmsListPage />} />
                        <Route path="/films/:id/" element={<FilmPage />} />
                        <Route path="/historys/" element={<HistorysPage />} />
                        <Route path="/historys/:id/" element={<HistoryPage />} />
                        <Route path="/profile/" element={<ProfilePage />} />
                    </Routes>
                </Row>
            </Container>
        </div>
    )
}

export default App
