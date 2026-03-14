# Bio Site + Music Player

Адаптивный био-сайт (ПК + телефоны) с видео-фоном, соцссылками и mp3-плеером.

## Структура файлов
- `background.mp4` — видео на фоне (в корне проекта)
- `icons/` — все иконки интерфейса
- `mp/` — все mp3-файлы и `playlist.json` (если нужно)

Пример `mp/playlist.json`:
```json
["track1.mp3", "track2.mp3"]
```

## Запуск
```bash
python3 -m http.server 8080
```

Откройте `http://localhost:8080`.
