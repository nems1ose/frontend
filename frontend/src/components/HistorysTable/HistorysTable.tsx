import {useNavigate} from "react-router-dom";
import {useMemo} from "react";
import {formatDate} from "src/utils/utils.ts";
import {T_History} from "modules/types.ts";
import CustomTable from "components/CustomTable/CustomTable.tsx";

const HistorysTable = ({historys}:{historys:T_History[]}) => {
    const navigate = useNavigate()

    const handleClick = (history_id) => {
        navigate(`/historys/${history_id}`)
    }

    const columns = useMemo(
        () => [
            {
                Header: '№',
                accessor: 'id',
            },
            {
                Header: 'Статус',
                accessor: 'status',
                Cell: ({ value }) => value
            },
            {
                Header: 'Дата просмотра',
                accessor: 'date',
                Cell: ({ value }) => formatDate(value, true)
            },
            {
                Header: 'Дата создания',
                accessor: 'date_created',
                Cell: ({ value }) => formatDate(value)
            },
            {
                Header: 'Дата формирования',
                accessor: 'date_formation',
                Cell: ({ value }) => formatDate(value)
            },
            {
                Header: 'Дата завершения',
                accessor: 'date_complete',
                Cell: ({ value }) => formatDate(value)
            }
        ],
        []
    )

    return (
        <CustomTable columns={columns} data={historys} onClick={handleClick}/>
    )
};

export default HistorysTable