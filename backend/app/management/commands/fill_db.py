from django.conf import settings
from django.core.management.base import BaseCommand
from minio import Minio

from .utils import *
from app.models import *


def add_users():
    User.objects.create_user("user", "user@user.com", "1234", first_name="user", last_name="user")
    User.objects.create_superuser("root", "root@root.com", "1234", first_name="root", last_name="root")

    for i in range(1, 10):
        User.objects.create_user(f"user{i}", f"user{i}@user.com", "1234", first_name=f"user{i}", last_name=f"user{i}")
        User.objects.create_superuser(f"root{i}", f"root{i}@root.com", "1234", first_name=f"user{i}", last_name=f"user{i}")


def add_history_status():
    HistoryStatus.objects.create(
        name="Введен"
    )

    HistoryStatus.objects.create(
        name="В работе"
    )

    HistoryStatus.objects.create(
        name="Завершен"
    )

    HistoryStatus.objects.create(
        name="Отклонен"
    )

    HistoryStatus.objects.create(
        name="Удален"
    )

    print("Статусы историй добавлены")


def add_films():
    Film.objects.create(
        name="Большая игра",
        description="Молли Блум называли Принцессой покера. Она построила самое дорогое подпольное казино в Голливуде. Каждую минуту здесь шли ва-банк кинозвезды, шейхи, миллиардеры. Большие деньги пахнут кровью. Как выжить, когда за тобой охотится мафия и ФБР?",
        time=134,
        year=2017,
        country="США",
        image="1.png"
    )

    Film.objects.create(
        name="Опасная игра Слоун",
        description="Элизабет Слоун – самый востребованный и рисковый лоббист и самая сексуальная акула политического бизнеса США. Ловко ведя психологические игры и используя искусство манипуляции, она сражает оппонентов своей непредсказуемостью и никогда не проигрывает. Но когда она берется за самое сложное в своей карьере дело, она понимает, что цена победы может быть слишком высокой.",
        time=127,
        year=2016,
        country="США",
        image="2.png"
    )

    Film.objects.create(
        name="Гнев человеческий",
        description="Эйч — загадочный и холодный на вид джентльмен, но внутри него пылает жажда справедливости. Преследуя свои мотивы, он внедряется в инкассаторскую компанию, чтобы выйти на соучастников серии многомиллионных ограблений, потрясших Лос-Анджелес. В этой запутанной игре у каждого своя роль, но под подозрением оказываются все. Виновных же обязательно постигнет гнев человеческий...",
        time=113,
        year=2021,
        country="Великобритания",
        image="3.png"
    )

    Film.objects.create(
        name="Выстрел в лоб",
        description="Роковая случайность, смертельная трагедия, и вся его жизнь летит под откос… Оказавшись за решеткой, он должен научиться жить по новым законам. Ты должен стать борцом, авторитетом или окажешься жертвой. Какую цену придется заплатить, чтобы выжить в этом аду, из которого нет дороги назад?",
        time=120,
        year=2015,
        country="США",
        image="4.png"
    )

    Film.objects.create(
        name="Последнее слово",
        description="Хэриетт — успешная и педантичная бизнесвумен. Она настолько привыкла держать всё и всех под жёстким контролем, что ещё при жизни решает подготовить собственный идеальный некролог. Для «правильного» описания своего жизненного пути Хэриетт нанимает молодую журналистку Энн. Однако та, принявшись за дело, обнаруживает, что в жизни Хэриетт нет ни одного человека, который мог бы сказать о ней хотя бы о…",
        time=107,
        year=2017,
        country="США",
        image="5.png"
    )

    Film.objects.create(
        name="Батя",
        description="История о путешествии взрослого героя к своему Бате, суровому русскому мужику, который стал отцом на заре девяностых и воспитывал своего сына так, как это делали все советские люди.",
        time=76,
        year=2020,
        country="Россия",
        image="6.png"
    )

    client = Minio(settings.MINIO_ENDPOINT,
                   settings.MINIO_ACCESS_KEY,
                   settings.MINIO_SECRET_KEY,
                   secure=settings.MINIO_USE_HTTPS)

    for i in range(1, 7):
        client.fput_object(settings.MINIO_MEDIA_FILES_BUCKET, f'{i}.png', f"app/static/images/{i}.png")

    client.fput_object(settings.MINIO_MEDIA_FILES_BUCKET, 'default.png', "app/static/images/default.png")


def add_historys():
    users = User.objects.filter(is_staff=False)
    moderators = User.objects.filter(is_staff=True)
    films = Film.objects.all()

    for _ in range(30):
        status = random.randint(2, 5)
        owner = random.choice(users)
        add_history(status, films, owner, moderators)

    add_history(1, films, users[0], moderators)
    add_history(2, films, users[0], moderators)
    add_history(3, films, users[0], moderators)
    add_history(4, films, users[0], moderators)
    add_history(5, films, users[0], moderators)


def add_history(status, films, owner, moderators):
    history = History.objects.create()
    history.status = HistoryStatus.objects.get(pk=status)

    if status in [3, 4]:
        history.moderator = random.choice(moderators)
        history.date_complete = random_date()
        history.date_formation = history.date_complete - random_timedelta()
        history.date_created = history.date_formation - random_timedelta()
    else:
        history.date_formation = random_date()
        history.date_created = history.date_formation - random_timedelta()

    if status == 3:
        history.date = random_date()

    history.estimation = random.randint(1, 5)

    history.owner = owner

    for film in random.sample(list(films), 3):
        item = FilmHistory(
            history=history,
            film=film,
            viewed=random.randint(1, film.time)
        )
        item.save()

    print(4)

    history.save()
    print(5)


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        add_users()
        add_films()
        add_history_status()
        add_historys()
