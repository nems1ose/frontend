import {useAppSelector} from "store/store.ts";
import {Card, Col, Row} from "reactstrap";
import HistoryCard from "components/HistoryCard/HistoryCard.tsx";
import {T_History} from "modules/types.ts";

type Props = {
    historys:T_History[]
}

const HistorysTable = ({historys}:Props) => {

    const {is_superuser} = useAppSelector((state) => state.user)

    return (
        <div className="mb-5">
            <div className="mb-2" style={{fontWeight: "bold"}}>
                <Card style={{padding: "10px"}}>
                    <Row>
                        <Col md={1}>
                            №
                        </Col>
                        <Col md={1}>
                            Статус
                        </Col>
                        <Col md={1}>
                            Оценка
                        </Col>
                        <Col>
                            Дата просмотра
                        </Col>
                        <Col>
                            Дата завершения
                        </Col>
                        {!is_superuser &&
                            <Col>
                                Действие
                            </Col>
                        }
                        {is_superuser &&
                            <>
                                <Col>
                                    Пользователь
                                </Col>
                                <Col>
                                    Действие
                                </Col>
                                <Col>
                                    Действие
                                </Col>
                            </>
                        }
                    </Row>
                </Card>
            </div>
            <div className="d-flex flex-column gap-2">
                {historys.map((history, index) => (
                    <HistoryCard history={history} index={index} key={index}/>
                ))}
            </div>
        </div>
    )
};

export default HistorysTable