"use client";

import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ListMusic,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipBack,
  SkipForward,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ChangeEvent, CSSProperties, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";
import { withBasePath } from "@/lib/site-path";

type Track = {
  id: string;
  title: string;
  detail: string;
  src: string;
  album?: string;
  artist?: string;
  artwork?: string;
  duration?: string;
  online?: boolean;
  spotifyUrl?: string;
  custom?: boolean;
  durationSeconds?: number;
};

type StoredTrack = {
  id: string;
  title: string;
  blob: Blob;
};

const originalTracks = [
  ["Chrome Afterglow", 68],
  ["Soft Current", 72],
  ["Mercury Veil", 65],
  ["Pearl Static", 70],
  ["Slow Mirror", 66],
  ["Warm Alloy", 64],
  ["Night Surface", 73],
  ["Afterlight", 67],
  ["Quiet Orbit", 74],
  ["Satin Weather", 69],
  ["Still Moving", 63],
  ["Pale Gravity", 72],
  ["Fluid Memory", 68],
  ["Glass Hours", 71],
  ["Formless Dawn", 75],
] as const;

const defaultTracks: Track[] = originalTracks.map(([title, durationSeconds], index) => {
  const slug = title.toLowerCase().replaceAll(" ", "-");
  return {
    id: slug,
    title,
    durationSeconds,
    detail: `LAVIE original · Study ${String(index + 1).padStart(2, "0")}`,
    src: withBasePath(`/audio/concepts/${String(index + 1).padStart(2, "0")}-${slug}.mp3`),
  };
});

const copy: Record<Locale, Record<string, string>> = {
  en: {
    now: "Now playing",
    play: "Play background music",
    pause: "Pause background music",
    previous: "Previous track",
    next: "Next track",
    settings: "Playlist settings",
    close: "Close settings",
    title: "Sound settings",
    subtitle: "15 original fluid studies",
    upload: "Add audio",
    volume: "Volume",
    repeat: "Repeat playlist",
    reset: "Reset order",
    empty: "Add a track to begin.",
    custom: "Local audio",
    preview: "Original music composed for LAVIE",
    openSpotify: "Open full track on Spotify",
    seek: "Seek audio",
  },
  "zh-CN": {
    now: "正在播放",
    play: "播放背景音乐",
    pause: "暂停背景音乐",
    previous: "上一首",
    next: "下一首",
    settings: "歌单设置",
    close: "关闭设置",
    title: "声音后台",
    subtitle: "15 首原创液态音乐",
    upload: "添加音频",
    volume: "音量",
    repeat: "歌单循环",
    reset: "恢复默认顺序",
    empty: "添加一首音乐后即可播放。",
    custom: "本地音频",
    preview: "为 LAVIE 创作的原创背景音乐",
    openSpotify: "在 Spotify 打开完整歌曲",
    seek: "调整播放进度",
  },
  "zh-TW": {
    now: "正在播放",
    play: "播放背景音樂",
    pause: "暫停背景音樂",
    previous: "上一首",
    next: "下一首",
    settings: "歌單設定",
    close: "關閉設定",
    title: "聲音後台",
    subtitle: "15 首原創液態音樂",
    upload: "加入音訊",
    volume: "音量",
    repeat: "歌單循環",
    reset: "恢復預設順序",
    empty: "加入一首音樂後即可播放。",
    custom: "本地音訊",
    preview: "為 LAVIE 創作的原創背景音樂",
    openSpotify: "在 Spotify 開啟完整歌曲",
    seek: "調整播放進度",
  },
};

const databaseName = "lavie-sound-archive";
const storeName = "tracks";
const settingsKey = "lavie-player-settings";
const settingsVersion = 3;

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readStoredTracks() {
  if (typeof indexedDB === "undefined") return [];
  const database = await openDatabase();
  return new Promise<StoredTrack[]>((resolve, reject) => {
    const request = database.transaction(storeName).objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as StoredTrack[]);
    request.onerror = () => reject(request.error);
  });
}

async function storeTrack(track: StoredTrack) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(storeName, "readwrite").objectStore(storeName).put(track);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteStoredTrack(id: string) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(storeName, "readwrite").objectStore(storeName).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function MusicPlayer() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const audioRef = useRef<HTMLAudioElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const seekingRef = useRef(false);
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);
  const [currentId, setCurrentId] = useState(defaultTracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [volume, setVolume] = useState(0.42);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekDraft, setSeekDraft] = useState(0);

  const currentIndex = Math.max(0, tracks.findIndex((track) => track.id === currentId));
  const currentTrack = tracks[currentIndex];
  const effectiveDuration = mediaDuration || currentTrack?.durationSeconds || 0;
  const displayedTime = isSeeking ? seekDraft : currentTime;

  useEffect(() => {
    let active = true;
    if (window.location.hash === "#sound-settings") setIsOpen(true);
    readStoredTracks()
      .then((stored) => {
        if (!active) return;
        const custom = stored.map((track) => ({
          id: track.id,
          title: track.title,
          detail: copy[locale].custom,
          src: URL.createObjectURL(track.blob),
          custom: true,
        }));
        const saved = window.localStorage.getItem(settingsKey);
        const settings = saved ? JSON.parse(saved) as { version?: number; order?: string[]; currentId?: string; repeat?: boolean; volume?: number } : {};
        const merged = [...defaultTracks, ...custom];
        const hasCurrentSchema = settings.version === settingsVersion;
        const order = new Map(hasCurrentSchema ? settings.order?.map((id, index) => [id, index]) : undefined);
        const ordered = hasCurrentSchema && settings.order
          ? [...merged].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
          : merged;
        setTracks(ordered);
        if (hasCurrentSchema && settings.currentId && ordered.some((track) => track.id === settings.currentId)) setCurrentId(settings.currentId);
        if (typeof settings.repeat === "boolean") setRepeat(settings.repeat);
        if (typeof settings.volume === "number") setVolume(settings.volume);
        setIsReady(true);
      })
      .catch(() => setIsReady(true));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(settingsKey, JSON.stringify({
      version: settingsVersion,
      currentId,
      order: tracks.map((track) => track.id),
      repeat,
      volume,
    }));
  }, [currentId, isReady, repeat, tracks, volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    audioRef.current.play().catch(() => setIsPlaying(false));
  }, [currentId]);

  useEffect(() => {
    setCurrentTime(0);
    setSeekDraft(0);
    setIsSeeking(false);
    seekingRef.current = false;
    setMediaDuration(currentTrack?.durationSeconds ?? 0);
  }, [currentId]);

  const goTo = (direction: number) => {
    if (!tracks.length) return;
    const nextIndex = (currentIndex + direction + tracks.length) % tracks.length;
    setCurrentId(tracks[nextIndex].id);
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    if (currentIndex < tracks.length - 1 || repeat) {
      goTo(1);
    } else {
      setIsPlaying(false);
    }
  };

  const moveTrack = (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= tracks.length) return;
    setTracks((items) => {
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("audio/"));
    for (const file of files) {
      const id = `local-${crypto.randomUUID()}`;
      await storeTrack({ id, title: file.name.replace(/\.[^.]+$/, ""), blob: file });
      setTracks((items) => [...items, {
        id,
        title: file.name.replace(/\.[^.]+$/, ""),
        detail: text.custom,
        src: URL.createObjectURL(file),
        custom: true,
      }]);
    }
    event.target.value = "";
  };

  const removeTrack = async (track: Track) => {
    if (!track.custom) return;
    await deleteStoredTrack(track.id);
    setTracks((items) => items.filter((item) => item.id !== track.id));
    if (currentId === track.id) {
      setCurrentId(defaultTracks[0].id);
      setIsPlaying(false);
    }
    URL.revokeObjectURL(track.src);
  };

  const resetPlaylist = () => {
    setTracks((items) => [
      ...defaultTracks,
      ...items.filter((item) => item.custom),
    ]);
    setCurrentId(defaultTracks[0].id);
  };

  const progressLabel = `${String(currentIndex + 1).padStart(2, "0")} / ${String(tracks.length).padStart(2, "0")}`;
  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  };

  const seekAudio = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const previewSeek = (value: number) => {
    const bounded = Math.max(0, Math.min(value, effectiveDuration));
    setSeekDraft(bounded);
    if (audioRef.current) audioRef.current.currentTime = bounded;
    if (!seekingRef.current) setCurrentTime(bounded);
  };

  const finishSeek = (value: number) => {
    seekingRef.current = false;
    seekAudio(value);
    setSeekDraft(value);
    setIsSeeking(false);
  };

  const pointerSeekValue = (event: ReactPointerEvent<HTMLInputElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(rect.width, 1)));
    return ratio * effectiveDuration;
  };

  const beginPointerSeek = (event: ReactPointerEvent<HTMLInputElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekingRef.current = true;
    setIsSeeking(true);
    previewSeek(pointerSeekValue(event));
  };

  const movePointerSeek = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (!seekingRef.current) return;
    previewSeek(pointerSeekValue(event));
  };

  const endPointerSeek = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishSeek(pointerSeekValue(event));
  };

  return (
    <>
      <audio
        onCanPlay={(event) => setMediaDuration(event.currentTarget.duration || currentTrack?.durationSeconds || 0)}
        onDurationChange={(event) => setMediaDuration(event.currentTarget.duration || currentTrack?.durationSeconds || 0)}
        onLoadedMetadata={(event) => setMediaDuration(event.currentTarget.duration || currentTrack?.durationSeconds || 0)}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        ref={audioRef}
        src={currentTrack?.src}
      />

      <aside aria-hidden={!isOpen} className={`sound-panel ${isOpen ? "is-open" : ""}`} inert={!isOpen}>
        <div className="sound-panel-head">
          <div>
            <p>{text.subtitle}</p>
            <h2>{text.title}</h2>
          </div>
          <button aria-label={text.close} className="sound-icon-button" onClick={() => setIsOpen(false)} type="button">
            <X size={18} strokeWidth={1.7} />
          </button>
        </div>

        <div className="sound-controls">
          <label>
            <span><Volume2 size={15} /> {text.volume}</span>
            <input aria-label={text.volume} max="1" min="0" onChange={(event) => setVolume(Number(event.target.value))} step="0.01" type="range" value={volume} />
          </label>
          <label className="sound-toggle-row">
            <span><RotateCcw size={15} /> {text.repeat}</span>
            <input checked={repeat} onChange={(event) => setRepeat(event.target.checked)} type="checkbox" />
          </label>
        </div>

        <div className="sound-playlist" role="list">
          {tracks.length ? tracks.map((track, index) => (
            <div className={`sound-track ${track.id === currentId ? "is-current" : ""}`} key={track.id} role="listitem">
              <button className="sound-track-main" onClick={() => setCurrentId(track.id)} type="button">
                <span>{String(index + 1).padStart(2, "0")}</span>
                {track.artwork ? <img alt="" height="42" src={track.artwork} width="42" /> : <span className="sound-track-placeholder" />}
                <span>
                  <strong>{track.title}</strong>
                  <small>{track.custom ? text.custom : track.detail}</small>
                </span>
              </button>
              <div className="sound-track-actions">
                {track.spotifyUrl ? (
                  <a aria-label={text.openSpotify} href={track.spotifyUrl} rel="noreferrer" target="_blank">
                    <ExternalLink size={14} />
                  </a>
                ) : null}
                <button aria-label="Move track up" disabled={index === 0} onClick={() => moveTrack(index, -1)} type="button"><ArrowUp size={14} /></button>
                <button aria-label="Move track down" disabled={index === tracks.length - 1} onClick={() => moveTrack(index, 1)} type="button"><ArrowDown size={14} /></button>
                {track.custom ? <button aria-label="Delete track" onClick={() => removeTrack(track)} type="button"><Trash2 size={14} /></button> : null}
              </div>
            </div>
          )) : <p className="sound-empty">{text.empty}</p>}
        </div>

        <p className="sound-source-note">{text.preview}</p>

        <div className="sound-panel-foot">
          <input accept="audio/*" hidden multiple onChange={handleUpload} ref={uploadRef} type="file" />
          <button onClick={() => uploadRef.current?.click()} type="button"><Upload size={15} /> {text.upload}</button>
          <button onClick={resetPlaylist} type="button"><RotateCcw size={15} /> {text.reset}</button>
        </div>
      </aside>

      <div className={`sound-dock ${isOpen ? "is-expanded" : ""} ${isPlaying ? "is-playing" : ""}`}>
        <div className="sound-transport" aria-label="Audio controls">
          <button aria-label={text.previous} onClick={() => goTo(-1)} type="button"><SkipBack size={13} fill="currentColor" /></button>
          <button aria-label={isPlaying ? text.pause : text.play} className="liquid-play" onClick={togglePlayback} type="button">
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          <button aria-label={text.next} onClick={() => goTo(1)} type="button"><SkipForward size={13} fill="currentColor" /></button>
        </div>

        <button className="sound-now" onClick={() => setIsOpen((value) => !value)} type="button">
          <strong>{currentTrack?.title ?? text.empty}</strong>
          <small>{currentTrack?.artist ?? currentTrack?.detail ?? "LAVIE"}</small>
        </button>

        <div aria-hidden="true" className="sound-spectrum">
          {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
        </div>

        <label className="sound-progress">
          <span className="sr-only">{text.seek}</span>
          <input
            aria-label={text.seek}
            max={effectiveDuration}
            min="0"
            onChange={(event) => previewSeek(Number(event.target.value))}
            onInput={(event) => previewSeek(Number(event.currentTarget.value))}
            onPointerCancel={endPointerSeek}
            onPointerDown={beginPointerSeek}
            onPointerMove={movePointerSeek}
            onPointerUp={endPointerSeek}
            step="0.1"
            style={{ "--sound-progress": `${effectiveDuration ? (displayedTime / effectiveDuration) * 100 : 0}%` } as CSSProperties}
            type="range"
            value={Math.min(displayedTime, effectiveDuration)}
          />
        </label>

        <span className="sound-time">{formatTime(displayedTime)} / {formatTime(effectiveDuration)}</span>
        <button
          aria-label={volume === 0 ? text.volume : `${text.volume}: 0`}
          className="sound-mute"
          onClick={() => setVolume((value) => value === 0 ? 0.42 : 0)}
          type="button"
        >
          {volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <button aria-label={text.settings} className="sound-settings-trigger" onClick={() => setIsOpen((value) => !value)} type="button">
          {isOpen ? <ListMusic size={14} /> : <Settings2 size={14} />}
        </button>
        <span className="sound-index">{progressLabel}</span>
      </div>
    </>
  );
}
