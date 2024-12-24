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
import AccessDeniedPage from "pages/AccessDeniedPage/AccessDeniedPage.tsx";
import NotFoundPage from "pages/NotFoundPage/NotFoundPage.tsx";
import Header from "components/Header/Header.tsx";
import Breadcrumbs from "components/Breadcrumbs/Breadcrumbs.tsx";
import FilmsTablePage from "pages/FilmsTablePage/FilmsTablePage.tsx";
import FilmEditPage from "pages/FilmEditPage/FilmEditPage.tsx";
import FilmAddPage from "pages/FilmAddPage/FilmAddPage.tsx";

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
                        <Route path="/films-table/" element={<FilmsTablePage />} />
                        <Route path="/films/:id/" element={<FilmPage />} />
                        <Route path="/films/:id/edit" element={<FilmEditPage />} />
                        <Route path="/films/add" element={<FilmAddPage />} />
                        <Route path="/historys/" element={<HistorysPage />} />
                        <Route path="/historys/:id/" element={<HistoryPage />} />
                        <Route path="/profile/" element={<ProfilePage />} />
                        <Route path="/403/" element={<AccessDeniedPage />} />
                        <Route path="/404/" element={<NotFoundPage />} />
                        <Route path='*' element={<NotFoundPage />} />
                    </Routes>
                </Row>
            </Container>
        </div>
    )
}

export default App
