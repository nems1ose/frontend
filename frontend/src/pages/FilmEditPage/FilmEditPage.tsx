import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {
    deleteFilm,
    fetchFilm,
    removeSelectedFilm,
    updateFilm,
    updateFilmImage
} from "store/slices/filmsSlice.ts";
import UploadButton from "components/UploadButton/UploadButton.tsx";
import CustomInput from "components/CustomInput/CustomInput.tsx";
import CustomTextarea from "components/CustomTextarea/CustomTextarea.tsx";

const FilmEditPage = () => {
    const { id } = useParams<{id: string}>();

    const dispatch = useAppDispatch()

    const {film} = useAppSelector((state) => state.films)

    const {is_superuser} = useAppSelector((state) => state.user)

    const [name, setName] = useState<string>(film?.name)

    const [description, setDescription] = useState<string>(film?.description)

    const [time, setTime] = useState<number>(film?.time)

    const [year, setYear] = useState<number>(film?.year)

    const [country, setCountry] = useState<string>(film?.county)

    useEffect(() => {
        if (!is_superuser) {
            navigate("/403/")
        }
    }, [is_superuser]);

    const navigate = useNavigate()

    const [imgFile, setImgFile] = useState<File>()
    const [imgURL, setImgURL] = useState<string>(film?.image)

    const handleFileChange = (e) => {
        if (e.target.files) {
            const file = e.target?.files[0]
            setImgFile(file)
            setImgURL(URL.createObjectURL(file))
        }
    }

    const saveFilm = async() => {
        if (imgFile) {
            const form_data = new FormData()
            form_data.append('image', imgFile, imgFile.name)
            await dispatch(updateFilmImage({
                film_id: film.id,
                data: form_data
            }))
        }

        const data = {
            name,
            description,
            time,
            year,
            country
        }

        await dispatch(updateFilm({
            film_id: film.id,
            data
        }))

        navigate("/films-table/")
    }

    useEffect(() => {
        dispatch(fetchFilm(id))
        return () => dispatch(removeSelectedFilm())
    }, []);

    useEffect(() => {
        setName(film?.name)
        setDescription(film?.description)
        setTime(film?.time)
        setYear(film?.year)
        setCountry(film?.country)
        setImgURL(film?.image)
    }, [film]);

    const handleDeleteFilm = async () => {
        await dispatch(deleteFilm(id))
        navigate("/films-table/")
    }

    if (!film) {
        return (
            <div>

            </div>
        )
    }

    return (
        <Container>
            <Row>
                <Col md={6}>
                    <img src={imgURL} alt="" className="w-100"/>
                    <Container className="mt-3 d-flex justify-content-center">
                        <UploadButton handleFileChange={handleFileChange} />
                    </Container>
                </Col>
                <Col md={6}>
                    <CustomInput label="Название" placeholder="Введите название" value={name} setValue={setName}/>
                    <CustomTextarea label="Описание" placeholder="Введите описание" value={description} setValue={setDescription}/>
                    <CustomInput label="Продолжительность" placeholder="Введите продолжительность" value={time} setValue={setTime} type="number"/>
                    <CustomInput label="Год" placeholder="Введите год" value={year} setValue={setYear} type="number"/>
                    <CustomInput label="Страна" placeholder="Введите страну" value={country} setValue={setCountry}/>
                    <Col className="d-flex justify-content-center gap-5 mt-5">
                        <Button color="success" className="fs-4" onClick={saveFilm}>Сохранить</Button>
                        <Button color="danger" className="fs-4" onClick={handleDeleteFilm}>Удалить</Button>
                    </Col>
                </Col>
            </Row>
        </Container>
    );
};

export default FilmEditPage