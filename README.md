# 黑讀 English

Static daily English news-listening app for a Cantonese / Traditional Chinese learner.

Run locally:

```powershell
python -m http.server 4173
```

Open `http://localhost:4173`.

Daily upload flow:

1. Create a new article JSON under `articles/`.
2. Update `articles/index.json` so `current` points to the new file.
3. Add the new article metadata to `articles/index.json` `articles` so the left menu can show the article count and history.
4. Keep the same schema as `articles/2026-05-29-rocket-test.json`.
5. Do not edit `version.json` for GitHub Pages. The deploy workflow rewrites it with the latest commit SHA.
6. Use `daily-agent-prompt.md` for the morning agent prompt. It generates the news lesson plus `dailyLifePractice` for the UI's 美式 tab.

Article index format:

```json
{
  "current": "./articles/2026-05-30-topic.json",
  "articles": [
    {
      "path": "./articles/2026-05-30-topic.json",
      "id": "2026-05-30-topic",
      "date": "2026-05-30",
      "level": "B1-",
      "title": "Article title"
    }
  ]
}
```

Article fields. `segments` drives the Shorts-style workflow: blind listen, reveal transcript, explain key chunks, replay, then shadow.

```json
{
  "id": "2026-05-30-topic",
  "date": "2026-05-30",
  "level": "B1-",
  "nextLevel": "B1（中級）",
  "title": "Article title",
  "source": {
    "type": "youtube",
    "title": "Original YouTube video title",
    "channel": "Channel name",
    "url": "https://www.youtube.com/watch?v=..."
  },
  "tags": ["英文新聞", "詞數：120", "練習時間：8 分鐘"],
  "methodSteps": ["盲聽", "看稿", "拆解", "重聽", "跟讀"],
  "segments": [
    {
      "title": "Main headline",
      "startTime": "0:42",
      "endTime": "0:56",
      "audioUrl": "./audio/YYYY-MM-DD-topic/segment-1.mp3",
      "audioText": "Rescuers are racing to reach seven villagers trapped for a week in a flooded cave.",
      "transcript": "Rescuers are racing to reach seven villagers trapped for a week in a flooded cave.",
      "translationZh": "救援人員正趕住接觸七名被困喺水浸洞穴一星期嘅村民。",
      "points": [
        {
          "label": "are racing to reach",
          "explanationZh": "唔係真係跑步，意思係正爭分奪秒趕去接觸/抵達。"
        }
      ]
    }
  ],
  "sentences": ["One sentence per item."],
  "vocabulary": [
    {
      "word": "habit",
      "ipa": "/ˈhæbɪt/",
      "partOfSpeech": "n.",
      "meaningZh": "習慣",
      "example": "It takes time to build a good habit.",
      "translationZh": "建立一個好習慣需要時間。",
      "mastery": 3,
      "nextReview": "明天"
    }
  ],
  "phrases": [
    {
      "phrase": "add up over time",
      "meaningZh": "慢慢累積成明顯結果",
      "example": "Small efforts add up over time."
    }
  ],
  "speakingPractice": [
    {
      "type": "shadowing",
      "instructionZh": "先聽一次，然後逐 chunk 跟讀。",
      "text": "Rescuers raced to reach the trapped people."
    }
  ],
  "notes": ["今日聽力重點：先捉主詞 + 動作 + 問題。"]
}
```

The app uses the browser Web Speech API for pronunciation playback, so no backend is required.
If an article segment includes `audioUrl`, the app plays that file first and only falls back to Web Speech when the file cannot load.
If `source.url` is a YouTube URL, the original video is embedded in the main reader area.
If a segment includes `startTime` and optional `endTime`, clicking that segment starts the embedded YouTube video at that timestamp. Time can be seconds (`83`) or a timecode (`"1:23"` / `"01:23"`).
PBS clips are also supported when `source.type` is `"pbs"` and `source.embedUrl` points to a `https://player.pbs.org/viralplayer/<id>/` URL. PBS does not expose the same YouTube seek API, so segment clicks show the embedded player and the timestamp cue.

Update behavior:

- `index.html` fetches `version.json` with `cache: "no-store"` before loading `styles.css` and `app.js`.
- CSS and JavaScript are loaded with a `?v=` version query, so a new deploy does not keep using stale cached assets.
- `app.js` checks `version.json` while the page is open and reloads automatically when the deployed version changes.
