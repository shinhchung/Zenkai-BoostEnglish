const ARTICLE_INDEX = "./articles/index.json";
const VERSION_URL = "./version.json";
const APP_VERSION = normalizeVersionValue(window.__BOOST_ENGLISH_VERSION__ || window.__BOOST_ENGLISH_BOOT_VERSION__ || "local-dev");
const UPDATE_CHECK_INTERVAL_MS = 60 * 1000;
const fallbackArticle = {
  id: "2026-05-29-rescue-news",
  date: "2026-05-29",
  level: "B1-",
  nextLevel: "B1（中級）",
  title: "Rescue in a Flooded Cave",
  source: {
    type: "youtube",
    title: "English news listening practice",
    channel: "Daily learning sample",
    url: "https://www.youtube.com/"
  },
  tags: ["英文新聞", "聽力拆解", "詞數：128", "練習時間：8 分鐘"],
  methodSteps: ["盲聽", "看稿", "拆解", "重聽", "跟讀"],
  segments: [
    {
      title: "Main headline",
      audioText: "Rescuers are racing to reach seven villagers trapped for a week in a flooded cave.",
      transcript: "Rescuers are racing to reach seven villagers trapped for a week in a flooded cave.",
      translationZh: "救援人員正趕住接觸七名被困喺水浸洞穴一星期嘅村民。",
      points: [
        { label: "rescuers", explanationZh: "救援人員；新聞常用嚟講消防、搜救隊、志願救援隊。" },
        { label: "are racing to reach", explanationZh: "唔係真係跑步，意思係『正爭分奪秒趕去接觸/抵達』。" },
        { label: "trapped for a week", explanationZh: "被困咗一星期；for + 一段時間，講持續多久。" }
      ]
    },
    {
      title: "Difficult condition",
      audioText: "They are cramming through narrow, flooded corridors with very little room to move.",
      transcript: "They are cramming through narrow, flooded corridors with very little room to move.",
      translationZh: "佢哋要迫入狹窄又水浸嘅通道，幾乎冇乜空間郁動。",
      points: [
        { label: "cramming through", explanationZh: "迫住穿過；有『空間好窄，要硬擠入去』嘅感覺。" },
        { label: "flooded corridors", explanationZh: "被水浸嘅通道；corridor 唔只係大廈走廊，洞穴通道都可以用。" },
        { label: "very little room", explanationZh: "room 呢度唔係房間，係『空間』。" }
      ]
    },
    {
      title: "Why it matters",
      audioText: "Officials say the rescue is dangerous, but every hour is important.",
      transcript: "Officials say the rescue is dangerous, but every hour is important.",
      translationZh: "官員表示救援行動好危險，但每一個鐘都好重要。",
      points: [
        { label: "officials say", explanationZh: "新聞入面常見 opening，用嚟引述官方消息。" },
        { label: "the rescue is dangerous", explanationZh: "rescue 可以係名詞，指成個救援行動。" },
        { label: "every hour is important", explanationZh: "every + 單數名詞；強調每一個都重要。" }
      ]
    }
  ],
  sentences: [
    "Rescuers are racing to reach seven villagers trapped for a week in a flooded cave.",
    "They are cramming through narrow, flooded corridors with very little room to move.",
    "Officials say the rescue is dangerous, but every hour is important."
  ],
  vocabulary: [
    {
      word: "rescuer",
      ipa: "/ˈres.kjuː.ər/",
      partOfSpeech: "n.",
      meaningZh: "救援人員",
      example: "Rescuers worked through the night.",
      translationZh: "救援人員通宵工作。",
      mastery: 3,
      nextReview: "明天"
    },
    {
      word: "cram",
      ipa: "/kræm/",
      partOfSpeech: "v.",
      meaningZh: "擠入；塞入",
      example: "People crammed into the small room.",
      translationZh: "人哋迫入間細房。",
      mastery: 2,
      nextReview: "2 天後"
    },
    {
      word: "corridor",
      ipa: "/ˈkɒr.ɪ.dɔːr/",
      partOfSpeech: "n.",
      meaningZh: "走廊；通道",
      example: "The corridor was full of water.",
      translationZh: "條通道滿晒水。",
      mastery: 4,
      nextReview: "後天"
    }
  ],
  phrases: [
    {
      phrase: "race to reach",
      meaningZh: "爭分奪秒趕去接觸/抵達",
      example: "Teams are racing to reach the trapped workers."
    },
    {
      phrase: "very little room",
      meaningZh: "好少空間；幾乎郁唔到",
      example: "There was very little room inside the tunnel."
    }
  ],
  notes: [
    "今日重點：新聞英文好多時一開頭就放 who + action + problem。",
    "跟讀時先練 chunk：rescuers are racing / to reach seven villagers / trapped for a week。"
  ],
  speakingPractice: [
    {
      type: "shadowing",
      instructionZh: "先聽一次，然後逐 chunk 跟讀。",
      text: "Rescuers are racing to reach seven villagers."
    },
    {
      type: "substitution",
      instructionZh: "用同一句型換一個新聞主題講返。",
      pattern: "Officials say ___ is dangerous, but ___."
    }
  ]
};

const levelSteps = [
  { code: "A1", label: "入門" },
  { code: "A2", label: "初級" },
  { code: "B1-", label: "中低級" },
  { code: "B1", label: "中級" },
  { code: "B2", label: "中高級" },
  { code: "C1", label: "高級" }
];

const state = {
  article: fallbackArticle,
  articleIndex: null,
  articles: [],
  currentArticlePath: "",
  activeSentence: 0,
  activePanel: "words",
  activeStep: 0,
  transcriptVisible: false,
  toastTimer: null,
  currentAudio: null,
  voices: [],
  selectedVoiceURI: localStorage.getItem("blackread.voiceURI") || "",
  completed: new Set(),
  savedWords: new Set(JSON.parse(localStorage.getItem("blackread.savedWords") || "[]")),
  rate: Number(localStorage.getItem("blackread.rate") || "0.9") || 0.9
};

const els = {
  todayLabel: document.querySelector("#todayLabel"),
  streakCount: document.querySelector("#streakCount"),
  articleCount: document.querySelector("#articleCount"),
  articleList: document.querySelector("#articleList"),
  libraryToggle: document.querySelector("#libraryToggle"),
  libraryClose: document.querySelector("#libraryClose"),
  drawerScrim: document.querySelector("#drawerScrim"),
  levelTrack: document.querySelector("#levelTrack"),
  articleTitle: document.querySelector("#articleTitle"),
  articleTags: document.querySelector("#articleTags"),
  sourceLine: document.querySelector("#sourceLine"),
  sourceVideo: document.querySelector("#sourceVideo"),
  sentenceList: document.querySelector("#sentenceList"),
  progressCount: document.querySelector("#progressCount"),
  progressFill: document.querySelector("#progressFill"),
  progressPercent: document.querySelector("#progressPercent"),
  wordList: document.querySelector("#wordList"),
  drillSteps: document.querySelector("#drillSteps"),
  segmentLabel: document.querySelector("#segmentLabel"),
  segmentTitle: document.querySelector("#segmentTitle"),
  segmentTranscript: document.querySelector("#segmentTranscript"),
  segmentTranslation: document.querySelector("#segmentTranslation"),
  segmentBreakdown: document.querySelector("#segmentBreakdown"),
  blindListenButton: document.querySelector("#blindListenButton"),
  revealButton: document.querySelector("#revealButton"),
  adjustLevelButton: document.querySelector("#adjustLevelButton"),
  nextLevelLabel: document.querySelector("#nextLevelLabel"),
  rateControl: document.querySelector("#rateControl"),
  voiceControl: document.querySelector("#voiceControl"),
  voiceTestButton: document.querySelector("#voiceTestButton"),
  voiceHint: document.querySelector("#voiceHint"),
  playArticleButton: document.querySelector("#playArticleButton"),
  mobileSegmentLabel: document.querySelector("#mobileSegmentLabel"),
  mobileSegmentTitle: document.querySelector("#mobileSegmentTitle"),
  mobilePlayButton: document.querySelector("#mobilePlayButton"),
  prevSegmentButton: document.querySelector("#prevSegmentButton"),
  nextSegmentButton: document.querySelector("#nextSegmentButton"),
  repeatButton: document.querySelector("#repeatButton"),
  shadowButton: document.querySelector("#shadowButton"),
  saveWordsButton: document.querySelector("#saveWordsButton"),
  exportButton: document.querySelector("#exportButton"),
  increaseButton: document.querySelector("#increaseButton"),
  toast: document.querySelector("#toast")
};

init();

async function init() {
  state.article = await loadArticle();
  applyStoredPreferences();
  restoreProgress();
  render();
  bindControls();
  initVoices();
  startUpdateWatcher();
}

async function loadArticle(articlePath) {
  try {
    if (!state.articleIndex) {
      const indexRes = await fetch(ARTICLE_INDEX, { cache: "no-store" });
      if (!indexRes.ok) throw new Error("Article index not found");
      state.articleIndex = await indexRes.json();
      state.articles = normalizeArticleList(state.articleIndex);
    }

    const targetPath = articlePath || state.articleIndex.current || state.articles[0]?.path;
    if (!targetPath) throw new Error("No article path found");

    const articleRes = await fetch(targetPath, { cache: "no-store" });
    if (!articleRes.ok) throw new Error("Current article not found");
    const article = await articleRes.json();
    state.currentArticlePath = targetPath;
    mergeArticleMetadata(targetPath, article);
    return article;
  } catch (error) {
    console.info("Using bundled fallback article:", error.message);
    state.currentArticlePath = "fallback";
    state.articles = [{
      path: "fallback",
      id: fallbackArticle.id,
      title: fallbackArticle.title,
      date: fallbackArticle.date,
      level: fallbackArticle.level,
      tags: fallbackArticle.tags
    }];
    return fallbackArticle;
  }
}

function normalizeArticleList(index) {
  const items = Array.isArray(index.articles) ? index.articles : [];
  const list = items
    .map((item) => typeof item === "string" ? { path: item } : { ...item })
    .filter((item) => item.path);

  if (index.current && !list.some((item) => item.path === index.current)) {
    list.unshift({ path: index.current });
  }

  return list;
}

function mergeArticleMetadata(path, article) {
  const existing = state.articles.find((item) => item.path === path);
  const meta = {
    path,
    id: article.id,
    title: article.title,
    date: article.date,
    level: article.level,
    tags: article.tags || []
  };

  if (existing) {
    Object.assign(existing, meta);
  } else {
    state.articles.unshift(meta);
  }
}

function restoreProgress() {
  const saved = JSON.parse(localStorage.getItem(progressKey()) || "[]");
  state.completed = new Set(saved);
}

function applyStoredPreferences() {
  const manualLevel = localStorage.getItem("blackread.manualLevel");
  if (levelSteps.some((step) => step.code === manualLevel)) {
    state.article.level = manualLevel;
  }
}

function initVoices() {
  if (!("speechSynthesis" in window)) {
    els.voiceControl.innerHTML = `<option value="">Browser 不支援</option>`;
    els.voiceControl.disabled = true;
    els.voiceTestButton.disabled = true;
    els.voiceHint.textContent = "呢個 browser 未支援 Web Speech API";
    return;
  }

  const loadVoices = () => {
    state.voices = window.speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
      .sort((a, b) => scoreVoice(b) - scoreVoice(a));
    renderVoiceOptions();
  };

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
  window.setTimeout(loadVoices, 500);
}

function renderVoiceOptions() {
  els.voiceControl.innerHTML = "";

  if (!state.voices.length) {
    els.voiceControl.innerHTML = `<option value="">使用 browser 預設聲線</option>`;
    els.voiceHint.textContent = "暫時未偵測到英文 voice，會用 browser 預設";
    return;
  }

  if (!state.voices.some((voice) => voice.voiceURI === state.selectedVoiceURI)) {
    state.selectedVoiceURI = state.voices[0].voiceURI;
  }

  state.voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.voiceURI;
    option.textContent = `${voice.name} · ${voice.lang}${voice.default ? " · default" : ""}`;
    els.voiceControl.append(option);
  });

  els.voiceControl.value = state.selectedVoiceURI;
  const selected = getSelectedVoice();
  els.voiceHint.textContent = selected
    ? `目前使用：${selected.name} (${selected.lang})`
    : "使用 browser 預設聲線";
}

function scoreVoice(voice) {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (voice.default) score += 2;
  if (voice.lang.toLowerCase() === "en-us") score += 7;
  if (voice.lang.toLowerCase().startsWith("en-")) score += 4;
  if (name.includes("natural") || name.includes("neural") || name.includes("online")) score += 20;
  if (name.includes("google")) score += 14;
  if (name.includes("microsoft")) score += 12;
  if (name.includes("aria") || name.includes("jenny") || name.includes("ava") || name.includes("emma")) score += 10;
  if (name.includes("zira") || name.includes("mark")) score += 9;
  if (name.includes("samantha") || name.includes("daniel") || name.includes("brian")) score += 6;
  if (name.includes("david")) score -= 6;
  if (name.includes("compact") || name.includes("legacy")) score -= 8;
  return score;
}

function getSelectedVoice() {
  return state.voices.find((voice) => voice.voiceURI === state.selectedVoiceURI) || state.voices[0] || null;
}

function render() {
  renderTopMeta();
  renderArticleLibrary();
  renderLevels();
  renderDrill();
  renderArticle();
  renderStudyPanel();
  renderPlaybackControls();
  updateProgress();
}

function renderPlaybackControls() {
  els.rateControl.value = String(state.rate);
}

function renderTopMeta() {
  const date = new Date(`${state.article.date}T12:00:00`);
  els.todayLabel.textContent = new Intl.DateTimeFormat("zh-Hant-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
  els.streakCount.textContent = String(getStreak());
}

function renderArticleLibrary() {
  const total = state.articles.length;
  els.articleCount.textContent = `${total} 篇英文`;
  els.articleList.innerHTML = "";

  state.articles.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `article-item${item.path === state.currentArticlePath ? " active" : ""}`;
    button.innerHTML = `
      <span class="article-item-title">${escapeHtml(item.title || getFilenameTitle(item.path))}</span>
      <span class="article-item-meta">
        <span>${escapeHtml(formatArticleDate(item.date) || `Article ${index + 1}`)}</span>
        <span>${escapeHtml(item.level || "")}</span>
      </span>
    `;
    button.addEventListener("click", () => switchArticle(item.path));
    els.articleList.append(button);
  });
}

function renderLevels() {
  els.levelTrack.innerHTML = "";
  levelSteps.forEach((step) => {
    const item = document.createElement("div");
    item.className = `level-step${step.code === state.article.level ? " active" : ""}`;
    item.innerHTML = `<div>${step.label}</div><strong>${step.code}</strong><span class="level-dot"></span>`;
    els.levelTrack.append(item);
  });
}

function renderArticle() {
  els.articleTitle.textContent = state.article.title;
  els.nextLevelLabel.textContent = state.article.nextLevel || "B1（中級）";
  renderSource();
  els.articleTags.innerHTML = "";
  (state.article.tags || []).forEach((tag) => {
    const el = document.createElement("span");
    el.textContent = tag;
    els.articleTags.append(el);
  });

  els.sentenceList.innerHTML = "";
  const template = document.querySelector("#sentenceTemplate");
  getSegments().forEach((segment, index) => {
    const sentence = segment.transcript || segment.audioText || state.article.sentences[index];
    const row = template.content.firstElementChild.cloneNode(true);
    row.dataset.index = String(index);
    row.classList.toggle("active", index === state.activeSentence);
    row.querySelector(".sentence-number").textContent = `S${index + 1}`;
    row.querySelector(".sentence-text").textContent = sentence;
    const startTime = getSegmentStartSeconds(segment);
    if (startTime !== null) {
      const time = document.createElement("span");
      time.className = "sentence-time";
      time.textContent = formatTimecode(startTime);
      row.append(time);
    }
    row.addEventListener("click", () => {
      state.activeSentence = index;
      state.transcriptVisible = true;
      renderDrill();
      renderArticle();
      const playback = playSourceVideoFromSegment(segment);
      if (playback) {
        markCompleted(index);
        showSourcePlaybackToast(playback);
      } else {
        speakSegment(segment, () => markCompleted(index), "播放目前 segment");
      }
    });
    els.sentenceList.append(row);
  });
}

function renderSource() {
  const source = state.article.source;
  if (!source || !source.url) {
    els.sourceLine.classList.add("hidden");
    els.sourceLine.innerHTML = "";
    els.sourceVideo.classList.add("hidden");
    els.sourceVideo.innerHTML = "";
    return;
  }

  els.sourceLine.classList.remove("hidden");
  const sourceProvider = getSourceProviderLabel(source);
  els.sourceLine.innerHTML = `
    <span>Source: ${escapeHtml(source.channel || sourceProvider)} · ${escapeHtml(source.title || "News clip")}</span>
    <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Open ${escapeHtml(sourceProvider)}</a>
  `;

  const embed = getSourceEmbed(source, getEmbedTiming(getActiveSegment()));
  if (!embed?.url) {
    els.sourceVideo.classList.add("hidden");
    els.sourceVideo.innerHTML = "";
    return;
  }

  els.sourceVideo.classList.remove("hidden");
  const currentIframe = els.sourceVideo.querySelector("iframe");
  if (currentIframe?.dataset.provider === embed.provider && currentIframe?.dataset.mediaId === embed.mediaId) return;

  els.sourceVideo.innerHTML = `
    <iframe
      src="${escapeHtml(embed.url)}"
      data-provider="${escapeHtml(embed.provider)}"
      data-media-id="${escapeHtml(embed.mediaId)}"
      title="${escapeHtml(source.title || `${sourceProvider} video`)}"
      loading="lazy"
      allow="${escapeHtml(embed.allow)}"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen>
    </iframe>
  `;
}

function renderDrill() {
  const segment = getActiveSegment();
  const steps = state.article.methodSteps || ["盲聽", "看稿", "拆解", "重聽", "跟讀"];

  els.drillSteps.innerHTML = "";
  steps.forEach((step, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `step-chip${index === state.activeStep ? " active" : ""}`;
    button.textContent = `${index + 1}. ${step}`;
    button.addEventListener("click", () => applyStep(index));
    els.drillSteps.append(button);
  });

  els.segmentLabel.textContent = `Segment ${state.activeSentence + 1} / ${getSegments().length}`;
  els.segmentTitle.textContent = segment.title || "Listening segment";
  if (els.mobileSegmentLabel) {
    els.mobileSegmentLabel.textContent = `S${state.activeSentence + 1} / ${getSegments().length}`;
  }
  if (els.mobileSegmentTitle) {
    els.mobileSegmentTitle.textContent = segment.title || segment.transcript || "Listening segment";
  }
  els.segmentTranscript.textContent = segment.transcript || segment.audioText || "";
  els.segmentTranslation.textContent = segment.translationZh || "";
  els.segmentTranscript.classList.toggle("hidden", !state.transcriptVisible);
  els.segmentTranslation.classList.toggle("hidden", !state.transcriptVisible);

  const showBreakdown = state.transcriptVisible && state.activeStep >= 2;
  els.segmentBreakdown.classList.toggle("hidden", !showBreakdown);
  els.segmentBreakdown.innerHTML = "";
  (segment.points || []).forEach((point) => {
    const item = document.createElement("div");
    item.className = "breakdown-item";
    item.innerHTML = `<strong>${escapeHtml(point.label)}</strong><span>${escapeHtml(point.explanationZh)}</span>`;
    els.segmentBreakdown.append(item);
  });

  els.revealButton.textContent = state.transcriptVisible ? "隱藏稿" : "顯示稿";
}

function renderStudyPanel() {
  document.querySelectorAll(".panel-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === state.activePanel);
  });

  if (state.activePanel === "saved") {
    renderSavedVocabulary();
    return;
  }

  if (state.activePanel === "phrases") {
    renderPhrases();
    return;
  }

  if (state.activePanel === "notes") {
    renderNotes();
    return;
  }

  if (state.activePanel === "speaking") {
    renderSpeaking();
    return;
  }

  if (state.activePanel === "dailyLife") {
    renderDailyLifePractice();
    return;
  }

  renderVocabulary();
}

function renderVocabulary() {
  els.wordList.innerHTML = "";
  const vocabulary = getArticleVocabulary();
  if (!vocabulary.length) {
    els.wordList.innerHTML = `<p class="notice">今日文章暫時未有生詞。</p>`;
    els.saveWordsButton.classList.remove("saved");
    return;
  }

  vocabulary.forEach((item) => {
    els.wordList.append(createVocabularyCard(item));
  });

  els.saveWordsButton.classList.toggle("saved", vocabulary.every((item) => state.savedWords.has(item.word)));
}

function renderSavedVocabulary() {
  els.wordList.innerHTML = "";

  if (!state.savedWords.size) {
    els.wordList.innerHTML = `<p class="notice">未有已儲存生詞。先喺文章生詞按書籤，或者用下面「加入生詞本」。</p>`;
    els.saveWordsButton.classList.remove("saved");
    return;
  }

  const summary = document.createElement("div");
  summary.className = "saved-book-summary";
  summary.innerHTML = `
    <strong>${state.savedWords.size} 個已儲存生詞</strong>
    <span>呢度集中你儲存過嘅字；按書籤可以即時移除。</span>
  `;
  els.wordList.append(summary);

  getSavedVocabularyEntries().forEach((item) => {
    els.wordList.append(createVocabularyCard(item));
  });

  const vocabulary = getArticleVocabulary();
  els.saveWordsButton.classList.toggle("saved", vocabulary.length > 0 && vocabulary.every((item) => state.savedWords.has(item.word)));
}

function createVocabularyCard(item) {
  const template = document.querySelector("#wordTemplate");
  const card = template.content.firstElementChild.cloneNode(true);
  const word = item.word || "";
  const mastery = clampMastery(item.mastery);
  const saved = state.savedWords.has(word);

  card.querySelector("h2").textContent = word;
  card.querySelector(".ipa").textContent = item.ipa || "";
  card.querySelector(".meaning").innerHTML = `${escapeHtml(item.partOfSpeech || "")} <strong>${escapeHtml(item.meaningZh || "已儲存生詞")}</strong>`;
  card.querySelector(".example").textContent = item.example || "之後文章再出現呢個字，生詞本會保留記錄。";
  card.querySelector(".translation").textContent = item.translationZh || "";
  card.querySelector(".mastery").textContent = `熟悉度 ${"★".repeat(mastery)}${"☆".repeat(5 - mastery)} · 下次復習 ${item.nextReview || "下次復習"}`;

  card.querySelector(".word-audio").addEventListener("click", () => speak(word));
  const saveButton = card.querySelector(".save-word");
  saveButton.classList.toggle("saved", saved);
  saveButton.title = saved ? "移出生詞本" : "加入生詞本";
  saveButton.setAttribute("aria-label", saved ? `移除 ${word}` : `儲存 ${word}`);
  saveButton.addEventListener("click", () => toggleSavedWord(word));
  return card;
}

function renderPhrases() {
  els.wordList.innerHTML = "";
  const phrases = state.article.phrases || [];
  if (!phrases.length) {
    els.wordList.innerHTML = `<p class="notice">今日文章暫時未有片語。</p>`;
    return;
  }

  phrases.forEach((item) => {
    const card = document.createElement("article");
    card.className = "word-card phrase-card";
    card.innerHTML = `
      <div class="word-main">
        <button class="word-audio" type="button" aria-label="播放片語讀音">
          <span class="speaker-icon" aria-hidden="true"></span>
        </button>
        <div>
          <h2>${escapeHtml(item.phrase)}</h2>
          <p class="meaning"><strong>${escapeHtml(item.meaningZh)}</strong></p>
        </div>
      </div>
      <p class="example">${escapeHtml(item.example)}</p>
    `;
    card.querySelector(".word-audio").addEventListener("click", () => speak(item.phrase));
    els.wordList.append(card);
  });
}

function renderNotes() {
  els.wordList.innerHTML = "";
  const notes = state.article.notes || [];
  if (!notes.length) {
    els.wordList.innerHTML = `<p class="notice">今日未有筆記。</p>`;
    return;
  }

  notes.forEach((note, index) => {
    const card = document.createElement("article");
    card.className = "word-card note-card";
    card.innerHTML = `<h2>Note ${index + 1}</h2><p class="example">${escapeHtml(note)}</p>`;
    els.wordList.append(card);
  });
}

function renderSpeaking() {
  els.wordList.innerHTML = "";
  getSpeakingPractice().forEach((item, index) => {
    const text = item.text || item.pattern || getActiveSegment().transcript || "";
    const card = document.createElement("article");
    card.className = "word-card speaking-card";
    card.innerHTML = `
      <div class="word-main">
        <button class="word-audio" type="button" aria-label="播放跟讀句">
          <span class="speaker-icon" aria-hidden="true"></span>
        </button>
        <div>
          <h2>${index + 1}. ${escapeHtml(getPracticeTypeLabel(item.type))}</h2>
          <p class="translation">${escapeHtml(item.instructionZh || "聽一次，再跟讀一次。")}</p>
        </div>
      </div>
      <p class="example">${escapeHtml(text)}</p>
      <button class="tool-button practice-action" type="button">開始呢個練習</button>
    `;
    card.querySelector(".word-audio").addEventListener("click", () => speak(text, null, "播放跟讀句"));
    card.querySelector(".practice-action").addEventListener("click", () => {
      state.activeStep = 4;
      state.transcriptVisible = true;
      renderDrill();
      speak(text, null, "跟住呢句講一次");
      showToast("跟讀模式已開：聽完即刻跟住講。");
    });
    els.wordList.append(card);
  });
}

function bindControls() {
  els.libraryToggle?.addEventListener("click", openArticleDrawer);
  els.libraryClose?.addEventListener("click", closeArticleDrawer);
  els.drawerScrim?.addEventListener("click", closeArticleDrawer);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeArticleDrawer();
  });

  els.mobilePlayButton?.addEventListener("click", () => playActiveSegment("播放目前 segment"));
  els.prevSegmentButton?.addEventListener("click", () => moveSegment(-1));
  els.nextSegmentButton?.addEventListener("click", () => moveSegment(1));

  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      if (button.dataset.view === "vocab") {
        state.activePanel = "saved";
        renderStudyPanel();
        document.querySelector(".study-panel").scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("已打開生詞本。");
      }
      if (button.dataset.view === "review") {
        state.activeStep = 3;
        state.transcriptVisible = true;
        renderDrill();
        document.querySelector(".reader-panel").scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("已切到重聽復習。");
      }
      if (button.dataset.view === "daily") {
        document.querySelector(".reader-panel").scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("已返回今日新聞聽力。");
      }
    });
  });

  document.querySelectorAll(".panel-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePanel = button.dataset.panel;
      renderStudyPanel();
      showToast(`已切換到${button.textContent.trim()}。`);
    });
  });

  els.adjustLevelButton.addEventListener("click", () => {
    const currentIndex = Math.max(0, levelSteps.findIndex((step) => step.code === state.article.level));
    const next = levelSteps[(currentIndex + 1) % levelSteps.length];
    state.article.level = next.code;
    localStorage.setItem("blackread.manualLevel", next.code);
    renderLevels();
    showToast(`今日難度已調整到 ${next.label} ${next.code}。`);
  });

  els.blindListenButton.addEventListener("click", () => {
    state.transcriptVisible = false;
    state.activeStep = 0;
    renderDrill();
    const segment = getActiveSegment();
    const playback = playSourceVideoFromSegment(segment);
    if (playback) {
      markCompleted(state.activeSentence);
      showSourcePlaybackToast(playback, "盲聽");
    } else {
      speakSegment(segment, () => markCompleted(state.activeSentence), "盲聽播放中");
    }
  });

  els.revealButton.addEventListener("click", () => {
    state.transcriptVisible = !state.transcriptVisible;
    if (state.transcriptVisible && state.activeStep < 1) state.activeStep = 1;
    renderDrill();
    showToast(state.transcriptVisible ? "已顯示 transcript 同解釋。" : "已隱藏 transcript，回到盲聽。");
  });

  els.rateControl.addEventListener("change", (event) => {
    state.rate = Number(event.target.value);
    localStorage.setItem("blackread.rate", String(state.rate));
    showToast(`播放速度已改為 ${state.rate}x。`);
  });

  els.voiceControl.addEventListener("change", (event) => {
    state.selectedVoiceURI = event.target.value;
    localStorage.setItem("blackread.voiceURI", state.selectedVoiceURI);
    renderVoiceOptions();
    showToast("聲線已更新。");
  });

  els.voiceTestButton.addEventListener("click", () => {
    speak("This is the voice for your English listening practice.", null, "試聲播放中");
  });

  els.playArticleButton.addEventListener("click", playAll);
  els.repeatButton.addEventListener("click", () => {
    const segment = getActiveSegment();
    const playback = playSourceVideoFromSegment(segment);
    if (playback) {
      markCompleted(state.activeSentence);
      showSourcePlaybackToast(playback, "重聽");
    } else {
      speakSegment(segment, () => markCompleted(state.activeSentence), "重聽目前 segment");
    }
  });

  els.shadowButton.addEventListener("click", () => {
    state.activePanel = "speaking";
    state.activeStep = 4;
    state.transcriptVisible = true;
    renderStudyPanel();
    renderDrill();
    document.querySelector(".study-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("已打開講/跟讀練習。");
  });

  els.saveWordsButton.addEventListener("click", () => {
    const vocabulary = getArticleVocabulary();
    vocabulary.forEach((item) => state.savedWords.add(item.word));
    persistSavedWords();
    state.activePanel = "saved";
    renderStudyPanel();
    showToast(`已加入 ${vocabulary.length} 個生詞。`);
  });

  els.exportButton.addEventListener("click", exportArticle);
  els.increaseButton.addEventListener("click", () => {
    els.increaseButton.textContent = "已設定明日加深";
    localStorage.setItem("blackread.nextLevelRequested", state.article.date);
    showToast("已記低：明日難度加深少少。");
  });
}

function renderDailyLifePractice() {
  els.wordList.innerHTML = "";
  const practices = getDailyLifePractice();

  if (!practices.length) {
    els.wordList.innerHTML = `<p class="notice">今日未有美國道地練習。請用 daily-agent-prompt.md 生成 article JSON。</p>`;
    return;
  }

  practices.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "word-card daily-life-card";
    const lines = Array.isArray(item.lines) ? item.lines : [];
    const drills = Array.isArray(item.drills) ? item.drills : [];
    const audioText = item.audioText || lines.map((line) => line.en).filter(Boolean).join(" ");

    card.innerHTML = `
      <div class="word-main">
        <button class="word-audio" type="button" aria-label="播放美式練習">
          <span class="speaker-icon" aria-hidden="true"></span>
        </button>
        <div>
          <h2>${index + 1}. ${escapeHtml(item.title || "American everyday English")}</h2>
          <p class="translation">${escapeHtml(item.contextZh || "")}</p>
        </div>
      </div>
      <div class="dialogue-lines">
        ${lines.map((line) => `
          <div class="dialogue-line">
            <strong>${escapeHtml(line.speaker || "")}</strong>
            <span>${escapeHtml(line.en || "")}</span>
            <small>${escapeHtml(line.zh || "")}</small>
          </div>
        `).join("")}
      </div>
      ${item.nativeNoteZh ? `<p class="native-note">${escapeHtml(item.nativeNoteZh)}</p>` : ""}
      <div class="mini-drills">
        ${drills.map((drill) => `
          <div class="mini-drill">
            <strong>${escapeHtml(drill.label || "Drill")}</strong>
            <span>${escapeHtml(drill.prompt || "")}</span>
            ${drill.example ? `<small>${escapeHtml(drill.example)}</small>` : ""}
          </div>
        `).join("")}
      </div>
      <button class="tool-button practice-action" type="button">開始場景練習</button>
    `;

    card.querySelector(".word-audio").addEventListener("click", () => speak(audioText, null, "播放美式場景"));
    card.querySelector(".practice-action").addEventListener("click", () => {
      speak(audioText, null, "聽完即刻照場景答一次");
      showToast("美式場景練習已開始。");
    });
    els.wordList.append(card);
  });
}

function openArticleDrawer() {
  document.body.classList.add("drawer-open");
  els.drawerScrim?.classList.remove("hidden");
  els.libraryToggle?.setAttribute("aria-expanded", "true");
}

function closeArticleDrawer() {
  document.body.classList.remove("drawer-open");
  els.drawerScrim?.classList.add("hidden");
  els.libraryToggle?.setAttribute("aria-expanded", "false");
}

function moveSegment(direction) {
  const segments = getSegments();
  if (!segments.length) return;
  state.activeSentence = Math.min(Math.max(state.activeSentence + direction, 0), segments.length - 1);
  renderArticle();
  renderDrill();
  document.querySelector(".reader-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function playActiveSegment(statusText = "重聽目前 segment") {
  const segment = getActiveSegment();
  state.activeStep = Math.max(state.activeStep, 3);
  renderArticle();
  renderDrill();
  const playback = playSourceVideoFromSegment(segment);
  if (playback) {
    markCompleted(state.activeSentence);
    showSourcePlaybackToast(playback);
    return;
  }
  speakSegment(segment, () => markCompleted(state.activeSentence), statusText);
}

async function switchArticle(path) {
  if (!path || path === state.currentArticlePath) return;

  try {
    closeArticleDrawer();
    stopCurrentPlayback();
    state.article = await loadArticle(path);
    applyStoredPreferences();
    state.activeSentence = 0;
    state.activeStep = 0;
    state.activePanel = "words";
    state.transcriptVisible = false;
    restoreProgress();
    render();
    document.querySelector(".reader-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`已載入：${state.article.title}`);
  } catch (error) {
    showToast("文章載入失敗，請檢查 articles/index.json。");
    console.error(error);
  }
}

function renderShadowButton() {
  els.shadowButton.innerHTML = `<span class="mic-icon" aria-hidden="true"></span>跟讀錄音`;
}

function playAll() {
  let index = state.activeSentence;
  const playNext = () => {
    if (index >= getSegments().length) {
      showToast("原聲連播完成。");
      return;
    }
    state.activeSentence = index;
    state.activeStep = 3;
    renderArticle();
    renderDrill();
    const segment = getSegments()[index];
    const playback = playSourceVideoFromSegment(segment);
    if (playback) {
      markCompleted(index);
      showSourcePlaybackToast(playback, "原片");
      return;
    }
    speakSegment(segment, () => {
      markCompleted(index);
      index += 1;
      playNext();
    });
  };
  playNext();
}

function applyStep(index) {
  state.activeStep = index;
  if (index >= 1) state.transcriptVisible = true;
  if (index === 0) state.transcriptVisible = false;
  renderDrill();

  const segment = getActiveSegment();
  if (index === 0 || index === 3) {
    const playback = playSourceVideoFromSegment(segment);
    if (playback) {
      markCompleted(state.activeSentence);
      showSourcePlaybackToast(playback, index === 0 ? "盲聽" : "重聽");
    } else {
      speakSegment(segment, () => markCompleted(state.activeSentence), index === 0 ? "盲聽播放中" : "重聽播放中");
    }
  }
  if (index === 4) {
    state.activePanel = "speaking";
    renderStudyPanel();
    speakSegment(segment, null, "跟讀播放中");
  }
  if (index === 1) showToast("已顯示英文稿同中文解釋。");
  if (index === 2) showToast("已顯示 chunk 拆解。");
}

function speakSegment(segment, onEnd, statusText = "播放中") {
  if (segment.audioUrl) {
    playAudio(segment.audioUrl, onEnd, statusText, segment.audioText || segment.transcript || "");
    return;
  }
  speak(segment.audioText || segment.transcript || "", onEnd, statusText);
}

function playAudio(audioUrl, onEnd, statusText = "播放中", fallbackText = "") {
  stopCurrentPlayback();
  const audio = new Audio(audioUrl);
  state.currentAudio = audio;
  audio.playbackRate = state.rate;
  document.body.classList.add("is-playing");
  showToast(statusText);
  audio.addEventListener("ended", () => {
    document.body.classList.remove("is-playing");
    state.currentAudio = null;
    onEnd?.();
  });
  audio.addEventListener("error", () => {
    document.body.classList.remove("is-playing");
    state.currentAudio = null;
    showToast("Audio file 播唔到，已改用 browser 聲線。");
    speak(fallbackText, onEnd, statusText);
  });
  audio.play().catch(() => {
    document.body.classList.remove("is-playing");
    state.currentAudio = null;
    showToast("Audio file 播唔到，已改用 browser 聲線。");
    speak(fallbackText, onEnd, statusText);
  });
}

function speak(text, onEnd, statusText = "播放中") {
  if (!("speechSynthesis" in window)) {
    alert("呢個 browser 未支援 Web Speech API。");
    onEnd?.();
    return;
  }

  stopCurrentPlayback();
  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = getSelectedVoice();
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  utterance.lang = "en-US";
  utterance.rate = state.rate;
  utterance.pitch = 0.96;
  utterance.volume = 1;
  document.body.classList.add("is-playing");
  showToast(statusText);
  utterance.onend = () => {
    document.body.classList.remove("is-playing");
    onEnd?.();
  };
  utterance.onerror = () => {
    document.body.classList.remove("is-playing");
    showToast("播放未能完成，請再按一次。");
  };
  window.speechSynthesis.speak(utterance);
}

function stopCurrentPlayback() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio.currentTime = 0;
    state.currentAudio = null;
  }
  document.body.classList.remove("is-playing");
}

function markCompleted(index) {
  state.completed.add(index);
  localStorage.setItem(progressKey(), JSON.stringify([...state.completed]));
  updateProgress();
}

function updateProgress() {
  const total = getSegments().length;
  const done = state.completed.size;
  const percent = total ? Math.round((done / total) * 100) : 0;
  els.progressCount.textContent = `${done} / ${total}`;
  els.progressFill.style.width = `${percent}%`;
  els.progressPercent.textContent = `${percent}%`;
}

function getSegments() {
  if (Array.isArray(state.article.segments) && state.article.segments.length) {
    return state.article.segments;
  }
  return state.article.sentences.map((sentence, index) => ({
    title: `Sentence ${index + 1}`,
    audioText: sentence,
    transcript: sentence,
    translationZh: "",
    points: []
  }));
}

function getActiveSegment() {
  return getSegments()[state.activeSentence] || getSegments()[0] || {};
}

function startUpdateWatcher() {
  if (window.location.protocol === "file:" || APP_VERSION === "local-dev") return;

  let isChecking = false;
  const check = async () => {
    if (isChecking) return;
    isChecking = true;

    try {
      const latestVersion = await fetchLatestVersion();
      if (latestVersion && latestVersion !== APP_VERSION) {
        showToast("網站有新版本，正在更新。");
        window.setTimeout(() => window.location.reload(), 900);
      }
    } catch (error) {
      console.info("Version check skipped:", error.message);
    } finally {
      isChecking = false;
    }
  };

  window.setInterval(check, UPDATE_CHECK_INTERVAL_MS);
  window.addEventListener("focus", check);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) check();
  });
}

async function fetchLatestVersion() {
  const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return "";
  const data = await response.json();
  return normalizeVersionValue(data.version || data.sha);
}

function normalizeVersionValue(value) {
  return String(value || "").trim();
}

function getArticleVocabulary() {
  return Array.isArray(state.article.vocabulary) ? state.article.vocabulary : [];
}

function getSavedVocabularyEntries() {
  const vocabulary = getArticleVocabulary();
  return [...state.savedWords]
    .sort((a, b) => a.localeCompare(b))
    .map((word) => vocabulary.find((item) => item.word === word) || {
      word,
      ipa: "",
      partOfSpeech: "",
      meaningZh: "已儲存",
      example: "之後文章再出現呢個字，生詞本會保留記錄。",
      translationZh: "",
      mastery: 1,
      nextReview: "下次復習"
    });
}

function clampMastery(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(5, Math.round(number)));
}

function toggleSavedWord(word) {
  if (!word) return;
  if (state.savedWords.has(word)) {
    state.savedWords.delete(word);
    showToast(`已移除 ${word}。`);
  } else {
    state.savedWords.add(word);
    showToast(`已儲存 ${word}。`);
  }
  persistSavedWords();
  renderStudyPanel();
}

function persistSavedWords() {
  localStorage.setItem("blackread.savedWords", JSON.stringify([...state.savedWords]));
}

function progressKey() {
  return `blackread.progress.${state.article.id}`;
}

function getStreak() {
  const stored = Number(localStorage.getItem("blackread.streak") || "1");
  return Math.max(1, stored);
}

function formatArticleDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat("zh-Hant-HK", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function getFilenameTitle(path) {
  return String(path)
    .split("/")
    .pop()
    .replace(/\.json$/i, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/-/g, " ");
}

function playSourceVideoFromSegment(segment) {
  const source = state.article.source;
  const timing = getEmbedTiming(segment);
  const start = timing.start;
  if (!source?.url || start === null) return false;
  const embed = getSourceEmbed(source, timing);
  if (!embed?.url || els.sourceVideo.classList.contains("hidden")) return false;

  let iframe = els.sourceVideo.querySelector("iframe");
  if (!iframe) return false;
  stopCurrentPlayback();

  if (iframe.dataset.provider !== embed.provider || iframe.dataset.mediaId !== embed.mediaId) {
    iframe.src = embed.url;
    iframe.dataset.provider = embed.provider;
    iframe.dataset.mediaId = embed.mediaId;
  }

  iframe.dataset.lastStart = String(start);
  iframe.dataset.lastEnd = timing.end === null ? "" : String(timing.end);
  if (embed.provider === "youtube") {
    playYouTubeIframe(iframe, start);
    return { provider: embed.provider, start, message: `YouTube 已跳到 ${formatTimecode(start)}` };
  }

  iframe.scrollIntoView({ behavior: "smooth", block: "center" });
  return { provider: embed.provider, start, message: `${embed.label} clip 已顯示，請用播放器跳到 ${formatTimecode(start)}` };
}

function showSourcePlaybackToast(playback, prefix = "") {
  if (!playback?.message) return;
  showToast(prefix ? `${prefix}：${playback.message}` : playback.message);
}

function playYouTubeIframe(iframe, start) {
  const sendCommands = () => {
    postYouTubeCommand(iframe, "seekTo", [start, true]);
    postYouTubeCommand(iframe, "playVideo");
  };

  sendCommands();
  window.setTimeout(sendCommands, 160);
  window.setTimeout(sendCommands, 520);
}

function postYouTubeCommand(iframe, func, args = []) {
  if (!iframe?.contentWindow) return false;
  iframe.contentWindow.postMessage(JSON.stringify({
    event: "command",
    func,
    args
  }), "https://www.youtube.com");
  return true;
}

function getEmbedTiming(segment) {
  const start = getSegmentStartSeconds(segment);
  const end = getSegmentEndSeconds(segment);
  return {
    start,
    end: end !== null && start !== null && end > start ? end : null
  };
}

function getSegmentStartSeconds(segment) {
  return parseTimeToSeconds(segment?.startTime ?? segment?.start ?? segment?.time ?? segment?.timestamp ?? segment?.youtubeStart);
}

function getSegmentEndSeconds(segment) {
  return parseTimeToSeconds(segment?.endTime ?? segment?.end ?? segment?.youtubeEnd);
}

function parseTimeToSeconds(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));

  const raw = String(value).trim();
  if (/^\d+$/.test(raw)) return Number(raw);

  const parts = raw.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 2) return Math.max(0, Math.floor(parts[0] * 60 + parts[1]));
  if (parts.length === 3) return Math.max(0, Math.floor(parts[0] * 3600 + parts[1] * 60 + parts[2]));
  return null;
}

function formatTimecode(seconds) {
  if (seconds === null) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getSourceEmbed(source, timing = {}) {
  if (!source?.url) return null;

  const youtubeId = getYouTubeVideoId(source.url);
  if (youtubeId) {
    return {
      provider: "youtube",
      label: "YouTube",
      mediaId: youtubeId,
      url: getYouTubeEmbedUrl(source.url, timing),
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    };
  }

  const pbsEmbedUrl = getPBSEmbedUrl(source);
  if (pbsEmbedUrl) {
    return {
      provider: "pbs",
      label: "PBS",
      mediaId: getPBSPlayerId(pbsEmbedUrl) || pbsEmbedUrl,
      url: pbsEmbedUrl,
      allow: "encrypted-media; picture-in-picture; web-share"
    };
  }

  return null;
}

function getSourceProviderLabel(source) {
  if (!source?.url) return "Source";
  if (getYouTubeVideoId(source.url)) return "YouTube";
  if (getPBSEmbedUrl(source) || isPBSUrl(source.url)) return "PBS";
  return source.type ? String(source.type).toUpperCase() : "Source";
}

function getPBSEmbedUrl(source) {
  const explicitUrl = normalizePBSPlayerUrl(source.embedUrl || source.playerUrl || source.pbsEmbedUrl);
  if (explicitUrl) return explicitUrl;

  const mediaId = source.pbsMediaId || source.videoTPMediaId || source.tpMediaId;
  if (mediaId && /^\d+$/.test(String(mediaId))) return `https://player.pbs.org/viralplayer/${mediaId}/`;

  return normalizePBSPlayerUrl(source.url);
}

function normalizePBSPlayerUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "player.pbs.org") return "";
    const playerId = getPBSPlayerId(parsed.href);
    if (!playerId) return "";
    return `https://player.pbs.org/viralplayer/${playerId}/`;
  } catch (error) {
    const playerId = getPBSPlayerId(url);
    return playerId ? `https://player.pbs.org/viralplayer/${playerId}/` : "";
  }
}

function getPBSPlayerId(url) {
  const match = String(url || "").match(/player\.pbs\.org\/viralplayer\/(\d+)/i);
  return match?.[1] || "";
}

function isPBSUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    return host === "pbs.org" || host.endsWith(".pbs.org");
  } catch (error) {
    return /(^|\/\/)(?:www\.)?pbs\.org\//i.test(String(url || ""));
  }
}

function getYouTubeEmbedUrl(url, timing = {}) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return "";
  const params = new URLSearchParams({
    enablejsapi: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1"
  });
  if (window.location.origin && window.location.origin !== "null") params.set("origin", window.location.origin);
  if (timing.start !== null && timing.start !== undefined) params.set("start", String(timing.start));
  if (timing.end !== null && timing.end !== undefined) params.set("end", String(timing.end));
  if (timing.autoplay) params.set("autoplay", "1");
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function getYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (!host.endsWith("youtube.com")) return "";
    if (parsed.pathname === "/watch") return parsed.searchParams.get("v") || "";
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (["shorts", "embed", "live"].includes(parts[0])) return parts[1] || "";
  } catch (error) {
    const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/))([A-Za-z0-9_-]{6,})/);
    return match?.[1] || "";
  }
  return "";
}

function exportArticle() {
  const data = JSON.stringify(state.article, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.article.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("已下載今日文章 JSON。");
}

function getSpeakingPractice() {
  if (Array.isArray(state.article.speakingPractice) && state.article.speakingPractice.length) {
    return state.article.speakingPractice;
  }
  const segment = getActiveSegment();
  return [
    {
      type: "shadowing",
      instructionZh: "先聽一次，然後跟住讀。",
      text: segment.transcript || segment.audioText || ""
    },
    {
      type: "retell",
      instructionZh: "用自己英文講返呢句新聞重點。",
      text: "The main point is that..."
    }
  ];
}

function getDailyLifePractice() {
  return Array.isArray(state.article.dailyLifePractice) ? state.article.dailyLifePractice : [];
}

function getPracticeTypeLabel(type) {
  const labels = {
    shadowing: "Shadowing",
    substitution: "Substitution",
    retell: "Retell"
  };
  return labels[type] || "Speaking";
}

function showToast(message) {
  if (!els.toast) return;
  window.clearTimeout(state.toastTimer);
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  state.toastTimer = window.setTimeout(() => {
    els.toast.classList.add("hidden");
  }, 2200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
