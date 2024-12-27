import {Button, Card, Col, Row} from "reactstrap";
import {E_HistoryStatus, T_History} from "modules/types.ts";
import {formatDate} from "utils/utils.ts";
import {useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {acceptHistory, fetchHistorys, rejectHistory} from "store/slices/historysSlice.ts";

type Props = {
    history: T_History
    index: number
}

const HistoryCard = ({history, index}:Props) => {

    const {is_superuser} = useAppSelector((state) => state.user)

    const dispatch = useAppDispatch()

    const handleAcceptHistory = async (history_id) => {
        await dispatch(acceptHistory(history_id))
        await dispatch(fetchHistorys())
    }

    const handleRejectHistory = async (history_id) => {
        await dispatch(rejectHistory(history_id))
        await dispatch(fetchHistorys())
    }

    const navigate = useNavigate()

    const openHistoryPage = () => {
        navigate(`/historys/${history.id}`)
    }

    return (
        <Card style={{padding: "10px"}}>
            <Row>
                <Col md={1}>
                    {index + 1}
                </Col>
                <Col md={1}>
                    {history.status}
                </Col>
                <Col md={1}>
                    {history.estimation}
                </Col>
                <Col>
                    {formatDate(history.date_created)}
                </Col>
                <Col>
                    {formatDate(history.date_formation)}
                </Col>
                <Col>
                    {formatDate(history.date_complete)}
                </Col>
                {!is_superuser &&
                    <Col>
                        <Button color="primary" onClick={openHistoryPage}>Открыть</Button>
                    </Col>
                }
                {is_superuser &&
                    <>
                        <Col>
                            {history.owner}
                        </Col>
                        <Col>
                            {history.status == E_HistoryStatus.InWork && <Button color="primary" onClick={() => handleAcceptHistory(history.id)}>Принять</Button>}
                        </Col>
                        <Col>
                            {history.status == E_HistoryStatus.InWork && <Button color="danger" onClick={() => handleRejectHistory(history.id)}>Отклонить</Button>}
                        </Col>
                    </>
                }
            </Row>
        </Card>
    )
}

export default HistoryCard