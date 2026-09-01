"use client";

import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  FolderOpen,
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

const supportedAudioExtensions = /\.(mp3|m4a|aac|wav|flac|ogg|opus)$/i;

function localTrackId(file: File) {
  const source = `${file.webkitRelativePath || file.name}:${file.size}:${file.lastModified}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `local-${(hash >>> 0).toString(36)}`;
}

const copy: Record<Locale, Record<string, string>> = {
  en: {
    now: "Now playing",
    play: "Play background music",
    pause: "Pause background music",
    previous: "Previous track",
    next: "Next track",
    settings: "Playlist settings",
    mute: "Mute",
    unmute: "Restore volume",
    close: "Close settings",
    title: "Sound settings",
    subtitle: "Music selected by the site manager",
    upload: "Add audio",
    importStore: "Import LAVIE MUSIC STORE",
    volume: "Volume",
    repeat: "Repeat playlist",
    empty: "Import LAVIE MUSIC STORE to begin.",
    emptyDock: "No music",
    custom: "Local audio",
    preview: "Stored only in this browser",
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
    mute: "静音",
    unmute: "恢复音量",
    close: "关闭设置",
    title: "声音后台",
    subtitle: "由网站管理者决定的播放列表",
    upload: "添加音频",
    importStore: "导入 LAVIE MUSIC STORE",
    volume: "音量",
    repeat: "歌单循环",
    empty: "请先导入 LAVIE MUSIC STORE。",
    emptyDock: "暂无音乐",
    custom: "本地音频",
    preview: "音乐仅保存在当前浏览器",
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
    mute: "靜音",
    unmute: "恢復音量",
    close: "關閉設定",
    title: "聲音後台",
    subtitle: "由網站管理者決定的播放清單",
    upload: "加入音訊",
    importStore: "匯入 LAVIE MUSIC STORE",
    volume: "音量",
    repeat: "歌單循環",
    empty: "請先匯入 LAVIE MUSIC STORE。",
    emptyDock: "暫無音樂",
    custom: "本地音訊",
    preview: "音樂僅儲存在目前瀏覽器",
    openSpotify: "在 Spotify 開啟完整歌曲",
    seek: "調整播放進度",
  },
};

const databaseName = "lavie-sound-archive";
const storeName = "tracks";
const settingsKey = "lavie-player-settings";
const settingsVersion = 4;

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
  const folderUploadRef = useRef<HTMLInputElement>(null);
  const seekingRef = useRef(false);
  const autoplayPendingRef = useRef(true);
  const idleTimerRef = useRef<number | null>(null);
  const crossfadeRef = useRef<{ audio: HTMLAudioElement; frame: number } | null>(null);
  const previousVolumeRef = useRef(0.42);
  const mediaControlsRef = useRef({
    next: () => {},
    pause: () => {},
    play: () => {},
    previous: () => {},
    seek: (_value: number) => {},
    toggle: () => {},
  });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [volume, setVolume] = useState(0.42);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekDraft, setSeekDraft] = useState(0);
  const [isDockIdle, setIsDockIdle] = useState(false);

  const currentIndex = tracks.findIndex((track) => track.id === currentId);
  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] : undefined;
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
        const merged = custom;
        const hasCurrentSchema = settings.version === settingsVersion;
        const order = new Map(hasCurrentSchema ? settings.order?.map((id, index) => [id, index]) : undefined);
        const ordered = hasCurrentSchema && settings.order
          ? [...merged].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
          : merged;
        setTracks(ordered);
        const savedCurrent = hasCurrentSchema && settings.currentId && ordered.some((track) => track.id === settings.currentId)
          ? settings.currentId
          : ordered[0]?.id;
        setCurrentId(savedCurrent ?? "");
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
    if (volume > 0) previousVolumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => () => {
    if (!crossfadeRef.current) return;
    window.cancelAnimationFrame(crossfadeRef.current.frame);
    crossfadeRef.current.audio.pause();
  }, []);

  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    audioRef.current.play().catch(() => setIsPlaying(false));
  }, [currentId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!isReady || !currentTrack || !audio || !autoplayPendingRef.current) return;

    const attemptAutoplay = () => {
      audio.play()
        .then(() => {
          autoplayPendingRef.current = false;
          setIsPlaying(true);
        })
        .catch(() => setIsPlaying(false));
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) attemptAutoplay();
    else audio.addEventListener("canplay", attemptAutoplay, { once: true });

    const unlockAutoplay = () => {
      if (!autoplayPendingRef.current) return;
      audio.play()
        .then(() => {
          autoplayPendingRef.current = false;
          setIsPlaying(true);
        })
        .catch(() => setIsPlaying(false));
    };
    window.addEventListener("pointerdown", unlockAutoplay, { once: true });

    return () => {
      audio.removeEventListener("canplay", attemptAutoplay);
      window.removeEventListener("pointerdown", unlockAutoplay);
    };
  }, [currentTrack, isReady]);

  useEffect(() => {
    setCurrentTime(0);
    setSeekDraft(0);
    setIsSeeking(false);
    seekingRef.current = false;
    setMediaDuration(currentTrack?.durationSeconds ?? 0);
  }, [currentId]);

  useEffect(() => {
    idleTimerRef.current = window.setTimeout(() => setIsDockIdle(true), 10_000);
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  const showDock = () => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    setIsDockIdle(false);
  };

  const queueDockFade = () => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => setIsDockIdle(true), 10_000);
  };

  const cancelCrossfade = () => {
    const activeFade = crossfadeRef.current;
    if (!activeFade) return;
    window.cancelAnimationFrame(activeFade.frame);
    activeFade.audio.pause();
    crossfadeRef.current = null;
    if (audioRef.current) audioRef.current.volume = volume;
  };

  const transitionTo = async (nextIndex: number) => {
    const nextTrack = tracks[nextIndex];
    const outgoing = audioRef.current;
    if (!nextTrack || nextTrack.id === currentId) return;

    cancelCrossfade();
    if (!outgoing || !isPlaying) {
      setCurrentId(nextTrack.id);
      return;
    }

    const incoming = new Audio(nextTrack.src);
    incoming.preload = "auto";
    incoming.volume = 0;

    try {
      await incoming.play();
    } catch {
      setCurrentId(nextTrack.id);
      return;
    }

    const startedAt = performance.now();
    const fadeDuration = 1400;
    const animateFade = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / fadeDuration);
      const eased = progress * progress * (3 - 2 * progress);
      outgoing.volume = volume * (1 - eased);
      incoming.volume = volume * eased;

      if (progress < 1) {
        const frame = window.requestAnimationFrame(animateFade);
        crossfadeRef.current = { audio: incoming, frame };
        return;
      }

      const handoffTime = incoming.currentTime;
      outgoing.pause();
      setCurrentId(nextTrack.id);
      window.requestAnimationFrame(() => {
        const activeAudio = audioRef.current;
        if (!activeAudio) return;
        activeAudio.currentTime = handoffTime;
        activeAudio.volume = volume;
        activeAudio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        incoming.pause();
        crossfadeRef.current = null;
      });
    };

    const frame = window.requestAnimationFrame(animateFade);
    crossfadeRef.current = { audio: incoming, frame };
  };

  const goTo = (direction: number) => {
    if (!tracks.length) return;
    const baseIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (baseIndex + direction + tracks.length) % tracks.length;
    void transitionTo(nextIndex);
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) {
      try {
        await audio.play();
        autoplayPendingRef.current = false;
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      autoplayPendingRef.current = false;
      cancelCrossfade();
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
    const files = Array.from(event.target.files ?? []).filter((file) => (
      file.type.startsWith("audio/") || supportedAudioExtensions.test(file.name)
    ));
    const knownIds = new Set(tracks.map((track) => track.id));
    for (const file of files) {
      const id = localTrackId(file);
      if (knownIds.has(id)) continue;
      knownIds.add(id);
      await storeTrack({ id, title: file.name.replace(/\.[^.]+$/, ""), blob: file });
      setTracks((items) => [...items, {
        id,
        title: file.name.replace(/\.[^.]+$/, ""),
        detail: text.custom,
        src: URL.createObjectURL(file),
        custom: true,
      }]);
      setCurrentId((value) => value || id);
    }
    event.target.value = "";
  };

  const removeTrack = async (track: Track) => {
    if (!track.custom) return;
    await deleteStoredTrack(track.id);
    const remaining = tracks.filter((item) => item.id !== track.id);
    setTracks(remaining);
    if (currentId === track.id) {
      setCurrentId(remaining[0]?.id ?? "");
      setIsPlaying(false);
    }
    URL.revokeObjectURL(track.src);
  };

  const progressLabel = `${String(currentIndex >= 0 ? currentIndex + 1 : 0).padStart(2, "0")} / ${String(tracks.length).padStart(2, "0")}`;
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

  mediaControlsRef.current = {
    next: () => goTo(1),
    pause: () => {
      if (audioRef.current && !audioRef.current.paused) void togglePlayback();
    },
    play: () => {
      if (audioRef.current?.paused) void togglePlayback();
    },
    previous: () => goTo(-1),
    seek: seekAudio,
    toggle: () => void togglePlayback(),
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditing = target instanceof HTMLElement && (
        target.isContentEditable
        || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)
      );

      if (
        event.defaultPrevented
        || event.repeat
        || event.metaKey
        || event.ctrlKey
        || event.altKey
        || isEditing
      ) return;

      switch (event.code || event.key) {
        case "KeyF":
        case "MediaPlayPause":
          event.preventDefault();
          mediaControlsRef.current.toggle();
          break;
        case "MediaTrackPrevious":
          event.preventDefault();
          mediaControlsRef.current.previous();
          break;
        case "MediaTrackNext":
          event.preventDefault();
          mediaControlsRef.current.next();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ["play", () => mediaControlsRef.current.play()],
      ["pause", () => mediaControlsRef.current.pause()],
      ["previoustrack", () => mediaControlsRef.current.previous()],
      ["nexttrack", () => mediaControlsRef.current.next()],
      ["seekbackward", (details) => {
        const audio = audioRef.current;
        if (audio) mediaControlsRef.current.seek(Math.max(0, audio.currentTime - (details.seekOffset ?? 10)));
      }],
      ["seekforward", (details) => {
        const audio = audioRef.current;
        if (audio) mediaControlsRef.current.seek(Math.min(audio.duration || Infinity, audio.currentTime + (details.seekOffset ?? 10)));
      }],
      ["seekto", (details) => {
        if (typeof details.seekTime === "number") mediaControlsRef.current.seek(details.seekTime);
      }],
    ];

    handlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Some browsers expose Media Session without supporting every action.
      }
    });

    return () => handlers.forEach(([action]) => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        // Ignore unsupported action cleanup.
      }
    });
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
      navigator.mediaSession.metadata = currentTrack
        ? new MediaMetadata({
            album: currentTrack.album ?? "LAVIE MUSIC STORE",
            artist: currentTrack.artist ?? "LAVIE",
            artwork: currentTrack.artwork ? [{ src: currentTrack.artwork }] : [],
            title: currentTrack.title,
          })
        : null;
    } catch {
      // Metadata is an enhancement and must not interrupt playback.
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !Number.isFinite(effectiveDuration) || effectiveDuration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: effectiveDuration,
        playbackRate: audioRef.current?.playbackRate ?? 1,
        position: Math.max(0, Math.min(displayedTime, effectiveDuration)),
      });
    } catch {
      // Position state can be unavailable before the browser decodes the track.
    }
  }, [displayedTime, effectiveDuration]);

  return (
    <>
      <audio
        onCanPlay={(event) => setMediaDuration(event.currentTarget.duration || currentTrack?.durationSeconds || 0)}
        onDurationChange={(event) => setMediaDuration(event.currentTarget.duration || currentTrack?.durationSeconds || 0)}
        onLoadedMetadata={(event) => setMediaDuration(event.currentTarget.duration || currentTrack?.durationSeconds || 0)}
        onEnded={handleEnded}
        onPause={() => {
          if (!crossfadeRef.current) setIsPlaying(false);
        }}
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
              <button className="sound-track-main" onClick={() => void transitionTo(index)} type="button">
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
          <input
            {...{ directory: "", webkitdirectory: "" }}
            accept="audio/*"
            hidden
            multiple
            onChange={handleUpload}
            ref={folderUploadRef}
            type="file"
          />
          <button onClick={() => folderUploadRef.current?.click()} type="button"><FolderOpen size={15} /> {text.importStore}</button>
          <button onClick={() => uploadRef.current?.click()} type="button"><Upload size={15} /> {text.upload}</button>
        </div>
      </aside>

      <div
        className={`sound-dock ${isOpen ? "is-expanded" : ""} ${isPlaying ? "is-playing" : ""} ${isDockIdle && !isOpen ? "is-idle" : ""}`}
        onBlurCapture={queueDockFade}
        onFocusCapture={showDock}
        onPointerEnter={showDock}
        onPointerLeave={queueDockFade}
      >
        <div className="sound-transport" aria-label="Audio controls">
          <button aria-label={text.previous} onClick={() => goTo(-1)} type="button"><SkipBack size={13} fill="currentColor" /></button>
          <button aria-label={isPlaying ? text.pause : text.play} className="liquid-play" onClick={togglePlayback} type="button">
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          <button aria-label={text.next} onClick={() => goTo(1)} type="button"><SkipForward size={13} fill="currentColor" /></button>
        </div>

        <button className="sound-now" onClick={() => setIsOpen((value) => !value)} type="button">
          <strong>{currentTrack?.title ?? text.emptyDock}</strong>
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
        <div className="sound-volume">
          <button
            aria-label={volume === 0 ? text.unmute : text.mute}
            className="sound-mute"
            onClick={() => setVolume((value) => value === 0 ? previousVolumeRef.current : 0)}
            type="button"
          >
            {volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
          <label>
            <span className="sr-only">{text.volume}</span>
            <input
              aria-label={text.volume}
              aria-valuetext={`${Math.round(volume * 100)}%`}
              max="1"
              min="0"
              onChange={(event) => setVolume(Number(event.target.value))}
              step="0.01"
              style={{ "--sound-volume": `${volume * 100}%` } as CSSProperties}
              type="range"
              value={volume}
            />
          </label>
        </div>
        <button aria-label={text.settings} className="sound-settings-trigger" onClick={() => setIsOpen((value) => !value)} type="button">
          {isOpen ? <ListMusic size={14} /> : <Settings2 size={14} />}
        </button>
        <span className="sound-index">{progressLabel}</span>
      </div>
    </>
  );
}
