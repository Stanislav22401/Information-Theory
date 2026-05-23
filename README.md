# Information-Theory

## Трошин Станислав Александрович
## 451002

## Запуск сайта

Сервер нужно поднимать из **корня** репозитория:

```bash
cd Information-Theory
python3 -m http.server 8080
```

Откройте http://localhost:8080/ — главная страница со ссылками на лабораторные 1–4.

## Nginx (it.troshin.by)

Конфигурация: [`deploy/nginx/it.troshin.by.conf`](deploy/nginx/it.troshin.by.conf) (только HTTP, порт 80).

Скопируйте файлы сайта в `/var/www/information-theory`, подключите конфиг и перезагрузите nginx (см. комментарии в файле).