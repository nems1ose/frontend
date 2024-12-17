import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {
    deleteDraftHistory,
    fetchHistory,
    removeHistory, sendDraftHistory,
    triggerUpdateMM,
    updateHistory
} from "store/slices/historysSlice.ts";
import {Button, Col, Form, Row} from "reactstrap";
import {E_HistoryStatus, T_Film} from "modules/types.ts";
import FilmCard from "components/FilmCard/FilmCard.tsx";
import CustomInput from "components/CustomInput/CustomInput.tsx";
import {formatDate} from "utils/utils.ts";

const HistoryPage = () => {
    const { id } = useParams<{id: string}>();

    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const {is_authenticated} = useAppSelector((state) => state.user)

    const history = useAppSelector((state) => state.historys.history)

    const [estimation, setEstimation] = useState<string>(history?.estimation)

    const [date, setDate] = useState<string>(history?.date)

    useEffect(() => {
        if (!is_authenticated) {
            navigate("/")
        }
    }, [is_authenticated]);

    useEffect(() => {
        is_authenticated && dispatch(fetchHistory(id))
        return () => dispatch(removeHistory())
    }, []);

    useEffect(() => {
        setEstimation(history?.estimation)
        setDate(history?.date)
    }, [history]);

    const sendHistory = async (e) => {
        e.preventDefault()

        await saveHistory()

        await dispatch(sendDraftHistory())

        navigate("/historys")
    }

    const saveHistory = async (e?) => {
        e?.preventDefault()

        const data = {
            estimation
        }

        await dispatch(updateHistory(data))
        await dispatch(triggerUpdateMM())
        await dispatch(triggerUpdateMM())
    }

    const deleteHistory = async () => {
        await dispatch(deleteDraftHistory())
        navigate("/films")
    }

    if (!history) {
        return (
            <div>

            </div>
        )
    }

    const isDraft = history.status == E_HistoryStatus.Draft
    const isCompleted = history.status == E_HistoryStatus.Completed

    return (
        <Form onSubmit={sendHistory} className="pb-5">
            <h2 className="mb-5">{isDraft ? "Черновая история" : `История №${id}` }</h2>
            <Row className="mb-5 fs-5 w-25">
                <CustomInput label="Оценка" placeholder="Введите оценку" value={estimation} setValue={setEstimation} disabled={!isDraft} type={"number"}/>
                {isCompleted && <CustomInput label="Дата просмотра" value={formatDate(date, true)} disabled={true}/>}
            </Row>
            <Row>
                {history.films.length > 0 ? history.films.map((film:T_Film) => (
                    <Row key={film.id} className="d-flex justify-content-center mb-5">
                        <FilmCard film={film} showRemoveBtn={isDraft} editMM={isDraft} />
                    </Row>
                )) :
                    <h3 className="text-center">Фильмы не добавлены</h3>
                }
            </Row>
            {isDraft &&
                <Row className="mt-5">
                    <Col className="d-flex gap-5 justify-content-center">
                        <Button color="success" className="fs-4" onClick={saveHistory}>Сохранить</Button>
                        <Button color="primary" className="fs-4" type="submit">Отправить</Button>
                        <Button color="danger" className="fs-4" onClick={deleteHistory}>Удалить</Button>
                    </Col>
                </Row>
            }
        </Form>
    );
};

export default HistoryPage