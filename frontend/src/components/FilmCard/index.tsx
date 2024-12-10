import {Button, Card, CardBody, CardImg, CardText, CardTitle} from "reactstrap";
import mockImage from "assets/mock.png";
import {Link} from "react-router-dom";
import {T_Film} from "modules/types.ts";

interface FilmCardProps {
    film: T_Film,
    isMock: boolean
}

const FilmCard = ({film, isMock}: FilmCardProps) => {
    return (
        <Card key={film.id} style={{width: '18rem', margin: "0 auto 50px" }}>
            <CardImg
                src={isMock ? mockImage as string : film.image}
                style={{"height": "200px"}}
            />
            <CardBody>
                <CardTitle tag="h5">
                    {film.name}
                </CardTitle>
                <CardText>
                    Продолжительность: {film.time} мин.
                </CardText>
                <Link to={`/films/${film.id}`}>
                    <Button color="primary">
                        Открыть
                    </Button>
                </Link>
            </CardBody>
        </Card>
    );
};

export default FilmCard