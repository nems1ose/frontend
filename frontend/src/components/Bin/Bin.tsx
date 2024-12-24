import {Link} from "react-router-dom";
import {Badge, Button} from "reactstrap";

type Props = {
    isActive: boolean,
    draft_history_id: string,
    films_count: number
}

const Bin = ({isActive, draft_history_id, films_count}:Props) => {

    if (!isActive) {
        return <Button color={"secondary"} className="bin-wrapper" disabled>Корзина</Button>
    }

    return (
        <Link to={`/historys/${draft_history_id}/`} className="bin-wrapper">
            <Button color={"primary"} className="w-100 bin">
                Корзина
                <Badge>
                    {films_count}
                </Badge>
            </Button>
        </Link>
    )
}

export default Bin