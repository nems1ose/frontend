import random
from datetime import datetime, timedelta
import uuid

from django.contrib.auth import authenticate
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from .permissions import *
from .redis import session_storage
from .serializers import *
from .utils import identity_user, get_session


def get_draft_history(request):
    user = identity_user(request)

    if user is None:
        return None

    history = History.objects.filter(owner=user).filter(status=1).first()

    return history


@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'film_name',
            openapi.IN_QUERY,
            type=openapi.TYPE_STRING
        )
    ]
)
@api_view(["GET"])
def search_films(request):
    film_name = request.GET.get("film_name", "")

    films = Film.objects.filter(status=1)

    if film_name:
        films = films.filter(name__icontains=film_name)

    serializer = FilmsSerializer(films, many=True)

    draft_history = get_draft_history(request)

    resp = {
        "films": serializer.data,
        "films_count": FilmHistory.objects.filter(history=draft_history).count() if draft_history else None,
        "draft_history_id": draft_history.pk if draft_history else None
    }

    return Response(resp)


@api_view(["GET"])
def get_film_by_id(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)
    serializer = FilmSerializer(film)

    return Response(serializer.data)


@swagger_auto_schema(method='put', request_body=FilmSerializer)
@api_view(["PUT"])
@permission_classes([IsModerator])
def update_film(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)

    serializer = FilmSerializer(film, data=request.data)

    if serializer.is_valid(raise_exception=True):
        serializer.save()

    return Response(serializer.data)


@swagger_auto_schema(method='POST', request_body=FilmAddSerializer)
@api_view(["POST"])
@permission_classes([IsModerator])
@parser_classes((MultiPartParser,))
def create_film(request):
    serializer = FilmAddSerializer(data=request.data)

    serializer.is_valid(raise_exception=True)

    Film.objects.create(**serializer.validated_data)

    films = Film.objects.filter(status=1)
    serializer = FilmSerializer(films, many=True)

    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsModerator])
def delete_film(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)
    film.status = 2
    film.save()

    film = Film.objects.filter(status=1)
    serializer = FilmSerializer(film, many=True)

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_film_to_history(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)

    draft_history = get_draft_history(request)

    if draft_history is None:
        draft_history = History.objects.create()
        draft_history.date_created = timezone.now()
        draft_history.owner = identity_user(request)
        draft_history.status = HistoryStatus.objects.get(pk=1)
        draft_history.save()

    if FilmHistory.objects.filter(history=draft_history, film=film).exists():
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    item = FilmHistory.objects.create()
    item.history = draft_history
    item.film = film
    item.save()

    serializer = HistorySerializer(draft_history)
    return Response(serializer.data["films"])


@swagger_auto_schema(
    method='post',
    manual_parameters=[
        openapi.Parameter('image', openapi.IN_FORM, type=openapi.TYPE_FILE),
    ]
)
@api_view(["POST"])
@permission_classes([IsModerator])
@parser_classes((MultiPartParser,))
def update_film_image(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)

    image = request.data.get("image")

    if image is None:
        return Response(status.HTTP_400_BAD_REQUEST)

    film.image = image
    film.save()

    serializer = FilmSerializer(film)

    return Response(serializer.data)


@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'status',
            openapi.IN_QUERY,
            type=openapi.TYPE_STRING
        ),
        openapi.Parameter(
            'date_formation_start',
            openapi.IN_QUERY,
            type=openapi.TYPE_STRING
        ),
        openapi.Parameter(
            'date_formation_end',
            openapi.IN_QUERY,
            type=openapi.TYPE_STRING
        )
    ]
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_historys(request):
    status_name = request.GET.get("status", "Не указан")
    date_formation_start = request.GET.get("date_formation_start")
    date_formation_end = request.GET.get("date_formation_end")

    historys = History.objects.exclude(status__in=[1, 5])

    user = identity_user(request)
    if not user.is_superuser:
        historys = historys.filter(owner=user)

    if status_name != "Не указан":
        historys = historys.filter(status=HistoryStatus.objects.get(name=status_name))

    if date_formation_start and parse_datetime(date_formation_start):
        historys = historys.filter(date_formation__gte=parse_datetime(date_formation_start))

    if date_formation_end and parse_datetime(date_formation_end):
        historys = historys.filter(date_formation__lt=parse_datetime(date_formation_end))

    serializer = HistorysSerializer(historys, many=True)

    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_history_by_id(request, history_id):
    user = identity_user(request)

    if not History.objects.filter(pk=history_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    history = History.objects.get(pk=history_id)

    if not user.is_superuser and history.owner != user:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = HistorySerializer(history)

    return Response(serializer.data)


@api_view(["GET"])
def search_historys_statuses(request):
    statuses = HistoryStatus.objects

    if not statuses:
        return Response({"detail": "Статусы не найдены"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = HistoryStatusesSerializer(statuses, many=True)

    return Response(serializer.data)


@swagger_auto_schema(method='put', request_body=HistorySerializer)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_history(request, history_id):
    user = identity_user(request)

    if not History.objects.filter(pk=history_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    print(request.data)

    history = History.objects.get(pk=history_id)
    serializer = HistorySerializer(history, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_status_user(request, history_id):
    user = identity_user(request)

    if not History.objects.filter(pk=history_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    history = History.objects.get(pk=history_id)

    if history.status != HistoryStatus.objects.get(pk=1):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    history.status = HistoryStatus.objects.get(pk=2)
    history.date_formation = timezone.now()
    history.save()

    serializer = HistorySerializer(history)

    return Response(serializer.data)


def random_date():
    now = datetime.now(tz=timezone.utc)
    return now + timedelta(random.uniform(-1, 0) * 100)


@swagger_auto_schema(method='put', request_body=UpdateHistoryStatusAdminSerializer)
@api_view(["PUT"])
@permission_classes([IsModerator])
def update_status_admin(request, history_id):
    if not History.objects.filter(pk=history_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    request_status = request.data["status"]

    if request_status not in ["Завершен", "Отклонен"]:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    history = History.objects.get(pk=history_id)

    if history.status.pk != HistoryStatus.objects.get(name="В работе").pk:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    if request_status == "Завершен":
        history.estimation = random.randint(1, 5)

    history.status = HistoryStatus.objects.get(name=request_status)
    history.date_complete = timezone.now()
    history.moderator = identity_user(request)
    history.save()

    serializer = HistorySerializer(history)

    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_history(request, history_id):
    user = identity_user(request)

    if not History.objects.filter(pk=history_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    history = History.objects.get(pk=history_id)

    if history.status != HistoryStatus.objects.get(pk=1):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    history.status = HistoryStatus.objects.get(pk=5)
    history.save()

    return Response(status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_film_from_history(request, history_id, film_id):
    user = identity_user(request)

    if not History.objects.filter(pk=history_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not FilmHistory.objects.filter(history_id=history_id, film_id=film_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    item = FilmHistory.objects.get(history_id=history_id, film_id=film_id)
    item.delete()

    history = History.objects.get(pk=history_id)

    serializer = HistorySerializer(history)
    films = serializer.data["films"]

    return Response(films)


@swagger_auto_schema(method='PUT', request_body=FilmHistorySerializer)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_film_in_history(request, history_id, film_id):
    user = identity_user(request)

    if not History.objects.filter(pk=history_id, owner=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not FilmHistory.objects.filter(film_id=film_id, history_id=history_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    item = FilmHistory.objects.get(film_id=film_id, history_id=history_id)

    serializer = FilmHistorySerializer(item, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@swagger_auto_schema(method='post', request_body=UserLoginSerializer)
@api_view(["POST"])
def login(request):
    serializer = UserLoginSerializer(data=request.data)

    user = identity_user(request)

    if serializer.is_valid():
        user = authenticate(**serializer.data)
        if user is None:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        session_id = str(uuid.uuid4())
        session_storage.set(session_id, user.id)

        serializer = UserSerializer(user)
        response = Response(serializer.data, status=status.HTTP_200_OK)
        response.set_cookie("session_id", session_id, samesite="lax")

        return response

    if user is not None:
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


@swagger_auto_schema(method='post', request_body=UserRegisterSerializer)
@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    user = serializer.save()

    session_id = str(uuid.uuid4())
    session_storage.set(session_id, user.id)

    serializer = UserSerializer(user)
    response = Response(serializer.data, status=status.HTTP_201_CREATED)
    response.set_cookie("session_id", session_id, samesite="lax")

    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    session = get_session(request)
    session_storage.delete(session)

    response = Response(status=status.HTTP_200_OK)
    response.delete_cookie('session_id')

    return response


@swagger_auto_schema(method='PUT', request_body=UserProfileSerializer)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    if not User.objects.filter(pk=user_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = identity_user(request)

    if user.pk != user_id:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    serializer.save()

    password = request.data.get("password", None)
    if password is not None and not user.check_password(password):
        user.set_password(password)
        user.save()

    return Response(serializer.data, status=status.HTTP_200_OK)
