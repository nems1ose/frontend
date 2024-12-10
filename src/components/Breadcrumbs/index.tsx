import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {T_Film} from "modules/types.ts";

type Props = {
    selectedFilm: T_Film | null
}

const Breadcrumbs = ({selectedFilm}:Props) => {

    const location = useLocation()

    return (
        <Breadcrumb className="fs-5">
			{location.pathname == "/" &&
				<BreadcrumbItem>
					<Link to="/">
						Главная
					</Link>
				</BreadcrumbItem>
			}
			{location.pathname.includes("/films") &&
                <BreadcrumbItem active>
                    <Link to="/films">
						Фильмы
                    </Link>
                </BreadcrumbItem>
			}
            {selectedFilm &&
                <BreadcrumbItem active>
                    <Link to={location.pathname}>
                        { selectedFilm.name }
                    </Link>
                </BreadcrumbItem>
            }
			<BreadcrumbItem />
        </Breadcrumb>
    );
};

export default Breadcrumbs