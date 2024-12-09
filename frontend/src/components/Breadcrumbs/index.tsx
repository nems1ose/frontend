import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {T_Film} from "modules/types.ts";
import {isHomePage, isFilmPage} from "utils/utils.ts";

interface BreadcrumbsProps {
    selectedFilm: T_Film | null
}

const Breadcrumbs = ({ selectedFilm }: BreadcrumbsProps) => {

    const location = useLocation()

    return (
        <Breadcrumb className="fs-5">
			{isHomePage(location.pathname) &&
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
            {isFilmPage(location.pathname) &&
                <BreadcrumbItem active>
                    <Link to={location.pathname}>
                        { selectedFilm?.name }
                    </Link>
                </BreadcrumbItem>
            }
			<BreadcrumbItem />
        </Breadcrumb>
    );
};

export default Breadcrumbs