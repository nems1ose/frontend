import requests
from django.contrib.auth import authenticate
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.shortcuts import get_object_or_404

from .serializers import *


def get_draft_history():
    return History.objects.filter(status__eng_key="input").order_by('-id').first()

def get_films(history):
    items = FilmHistory.objects.filter(history=history)
    return [FilmItemSerializer(item.film, context={"value": item.value}).data for item in items]

def get_user():
    return User.objects.filter(is_superuser=False).first()


def get_moderator():
    return User.objects.filter(is_superuser=True).first()


@api_view(["GET"])
def search_films(request):
    film_name = request.GET.get("film_name", "")

    films = Film.objects.filter(status=1)

    if film_name:
        films = films.filter(name__icontains=film_name)

    serializer = FilmSerializer(films, many=True)

    draft_history = get_draft_history()

    resp = {
        "films": serializer.data,
        "films_count": len(get_films(draft_history)),
        "draft_history": draft_history.pk if draft_history else None
    }

    return Response(resp)


@api_view(["GET"])
def get_film_by_id(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response({"detail": "Нет фильма с данным id"}, status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)

    if film.status != 1:
        return Response({"detail": "Фильма с данным id удален"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = FilmSerializer(film, many=False)

    return Response(serializer.data)


@api_view(["PUT"])
def update_film(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response({"detail": "Нет фильма с данным id"}, status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)

    image = request.data.get("image")
    if image is not None:
        film.image = image
        film.save()

    status_value = request.data.get("status")
    if status_value is not None and status_value not in ['1', '2']:
        return Response({"detail": "Введены некорректные данные"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = FilmSerializerUpd(film, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response({"detail": "Фильм обновлен"})


@api_view(["POST"])
def create_film(request):
    serializer = FilmSerializerUpd(data=request.data)

    if serializer.is_valid():
        film = serializer.save()
        return Response({"detail": "Фильм создан"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def delete_film(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response({"detail": "Нет фильма с данным id"}, status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)

    # new_status = get_object_or_404(FilmStatus, id=2)

    film.status = 2
    film.save()

    # films = Film.objects.filter(status__eng_key="activ")
    # serializer = FilmSerializer(films, many=True)

    return Response({"detail": "Фильм удален"})


@api_view(["POST"])
def add_film_to_history(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response({"detail": "Нет фильма с данным id"}, status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)

    draft_history = get_draft_history()

    if draft_history is None:
        draft_history = History.objects.create()
        draft_history.owner = get_user()
        draft_history.status = HistoryStatus.objects.get(eng_key='input')
        draft_history.date_created = timezone.now()
        draft_history.save()

    if FilmHistory.objects.filter(history=draft_history, film=film).exists():
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
    item = FilmHistory.objects.create()
    item.history = draft_history
    item.film = film
    item.save()

    # serializer = HistorySerializer(draft_history)
    return Response({"detail": "Фильм добавлен"})


@api_view(["POST"])
def update_film_image(request, film_id):
    if not Film.objects.filter(pk=film_id).exists():
        return Response({"detail": "Нет фильма с данным id"}, status=status.HTTP_404_NOT_FOUND)

    film = Film.objects.get(pk=film_id)

    image = request.data.get("image")
    if image is not None:
        film.image = image
        film.save()

    # serializer = FilmSerializer(film)

    return Response({"detail": "Фильм обновлен"})


@api_view(["GET"])
def search_historys(request):
    status = request.GET.get("status", "unknown")
    date_formation_start = request.GET.get("date_formation_start")
    date_formation_end = request.GET.get("date_formation_end")

    historys = History.objects.exclude(status__eng_key__in=["input", "delet"])

    if status != "unknown":
        historys = historys.filter(status__name=status)

    if date_formation_start and parse_datetime(date_formation_start):
        historys = historys.filter(date_formation__gte=parse_datetime(date_formation_start))

    if date_formation_end and parse_datetime(date_formation_end):
        historys = historys.filter(date_formation__lt=parse_datetime(date_formation_end))

    serializer = HistorysSerializer(historys, many=True)

    return Response(serializer.data)


@api_view(["GET"])
def get_history_by_id(request, history_id):
    if not History.objects.filter(pk=history_id).exists():
        return Response({"detail": "Нет истории с данным id"}, status=status.HTTP_404_NOT_FOUND)

    history = History.objects.get(pk=history_id)

    if history.status.eng_key == "delet":
        return Response({"detail": "История с данным id удалена"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = HistorySerializer(history, many=False)

    return Response(serializer.data)

@api_view(["GET"])
def search_historys_statuses(request):
    statuses = HistoryStatus.objects

    if not statuses:
        return Response({"detail": "Статусы не найдены"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = HistoryStatusesSerializer(statuses, many=True)

    return Response(serializer.data)


@api_view(["PUT"])
def update_history(request, history_id):
    if not History.objects.filter(pk=history_id).exists():
        return Response({"detail": "Нет истории с данным id"}, status=status.HTTP_404_NOT_FOUND)

    history = History.objects.get(pk=history_id)

    status_value = request.data.get("status")

    if status_value is not None:
        try:
            history_status = HistoryStatus.objects.get(name=status_value)
            request.data['status'] = history_status.id
        except HistoryStatus.DoesNotExist:
            return Response({"detail": "Введены некорректные данные"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = HistorySerializerUpd(history, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    # serializerOutput = HistorySerializer(history, many=False)

    return Response({"detail": "История обновлена"})


@api_view(["PUT"])
def update_status_user(request, history_id):
    if not History.objects.filter(pk=history_id).exists():
        return Response({"detail": "Нет истории с данным id"}, status=status.HTTP_404_NOT_FOUND)

    history = History.objects.get(pk=history_id)

    if history.status.eng_key != "input":
        return Response({"detail": "Вы не можете обновить статус истории с данным id"}, status=status.HTTP_400_BAD_REQUEST)
    
    new_status = get_object_or_404(HistoryStatus, id=2)

    history.status = new_status
    history.date_formation = timezone.now()
    history.save()

    # serializer = HistorySerializer(history, many=False)

    return Response({"detail": "Статус обновлен"})


@api_view(["PUT"])
def update_status_admin(request, history_id):
    if not History.objects.filter(pk=history_id).exists():
        return Response({"detail": "Нет истории с данным id"}, status=status.HTTP_404_NOT_FOUND)

    request_status = request.data["status"]

    if request_status not in ["Завершен", "Отклонен"]:
        return Response({"detail": "Вы не можете установить данный статус для истории с данным id"}, status=status.HTTP_400_BAD_REQUEST)

    history = History.objects.get(pk=history_id)

    if history.status.eng_key != "atwor":
        return Response({"detail": "Вы не можете обновить статус истории с данным id"}, status=status.HTTP_400_BAD_REQUEST)
    
    if request_status == "Завершен":
        new_status = get_object_or_404(HistoryStatus, id=3)
    elif request_status == "Отклонен":
        new_status = get_object_or_404(HistoryStatus, id=4)

    history.date_complete = timezone.now()
    history.status = new_status
    history.moderator = get_moderator()
    history.save()

    # serializer = HistorySerializer(history, many=False)

    return Response({"detail": "Статус обновлен"})


@api_view(["DELETE"])
def delete_history(request, history_id):
    if not History.objects.filter(pk=history_id).exists():
        return Response({"detail": "Нет истории с данным id"}, status=status.HTTP_404_NOT_FOUND)

    history = History.objects.get(pk=history_id)

    if history.status.eng_key != "input":
        return Response({"detail": "Вы не можете обновить статус истории с данным id"}, status=status.HTTP_400_BAD_REQUEST)

    new_status = get_object_or_404(HistoryStatus, id=5)

    history.status = new_status
    history.save()

    # serializer = HistorySerializer(history, many=False)

    return Response({"detail": "История удалена"})


@api_view(["DELETE"])
def delete_film_from_history(request, history_id, film_id):
    if not FilmHistory.objects.filter(history_id=history_id, film_id=film_id).exists():
        return Response({"detail": "Нет истории или фильма с данным id"}, status=status.HTTP_404_NOT_FOUND)

    item = FilmHistory.objects.get(history_id=history_id, film_id=film_id)
    item.delete()

    history = History.objects.get(pk=history_id)

    serializer = HistorySerializer(history, many=False)
    films = serializer.data["films"]

    if len(films) == 0:
        history.delete()
        return Response({"detail": "Фильм удален, история удалена"}, status=status.HTTP_204_NO_CONTENT)

    return Response({"detail": "Фильм удален"})


@api_view(["PUT"])
def update_film_in_history(request, history_id, film_id):
    if not FilmHistory.objects.filter(film_id=film_id, history_id=history_id).exists():
        return Response({"detail": "Нет истории или фильма с данным id"}, status=status.HTTP_404_NOT_FOUND)

    item = FilmHistory.objects.get(film_id=film_id, history_id=history_id)

    serializer = FilmHistorySerializer(item, data=request.data,  partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response({"detail": "Данные обновлены"})


@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({"detail": "Пользователь с данным логином уже существует"}, status=status.HTTP_409_CONFLICT)

    serializer.save()

    # serializer = UserSerializer(user)

    return Response({"detail": "Пользователь создан"}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def login(request):
    serializer = UserLoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({"detail": "Заполните оба поля: username, password"}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(**serializer.data)
    if user is None:
        return Response({"detail": "Логин или пароль введены неверно"}, status=status.HTTP_401_UNAUTHORIZED)

    # serializer = UserSerializer(user)

    return Response({"detail": "Успешно"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def logout(request):
    return Response(status=status.HTTP_200_OK)


@api_view(["PUT"])
def update_user(request, user_id):
    if not User.objects.filter(pk=user_id).exists():
        return Response({"detail": "Пользователя с данным логином не существует"}, status=status.HTTP_404_NOT_FOUND)

    user = User.objects.get(pk=user_id)
    serializer = UserSerializer(user, data=request.data, partial=True)

    if not serializer.is_valid():
        return Response({"detail": "Введены некорректные данные для обновления"}, status=status.HTTP_409_CONFLICT)

    serializer.save()

    return Response({"detail": "Данные пользователя обновлены"})