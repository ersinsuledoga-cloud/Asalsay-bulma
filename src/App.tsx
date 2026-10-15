import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  Zap,
  HelpCircle,
  Download,
  Award,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

// --- DATA & CONSTANTS ---
const ALL_NUMBERS = Array.from({ length: 100 }, (_, i) => i + 1);

// 25 Primes up to 100
const PRIMES_SET = new Set([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97
]);

// Prime factors calculation
function getPrimeFactors(n: number): number[] {
  if (n <= 1) return [];
  const factors: number[] = [];
  let d = 2;
  let temp = n;
  while (temp >= d * d) {
    if (temp % d === 0) {
      factors.push(d);
      temp = Math.floor(temp / d);
    } else {
      d++;
    }
  }
  factors.push(temp);
  return factors;
}

// Factors formatted text
function getFactorsDetails(n: number): { factors: number[]; explanation: string; lgsTip?: string } {
  if (n === 1) {
    return {
      factors: [1],
      explanation: "1'in sadece 1 pozitif böleni vardır. Asal olabilmek için tam 2 farklı pozitif bölen (1 ve kendisi) gerekir.",
      lgsTip: "LGS'de en sık yapılan hatalardan biridir! 1 ASAL SAYI DEĞİLDİR!"
    };
  }
  
  const allDivisors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) allDivisors.push(i);
  }

  const isPrime = PRIMES_SET.has(n);
  const primeFactors = getPrimeFactors(n);

  let lgsTip: string | undefined = undefined;
  if (n === 91) {
    lgsTip = "🔥 LGS'NİN 1 NUMARALI TUZAĞI! 91 ilk bakışta asal gibi görünür ama 7 × 13 = 91'dir. ASAL DEĞİLDİR!";
  } else if (n === 51) {
    lgsTip = "⚠️ Dikkat! 51 sayısı asal değildir. Rakamları toplamı 5+1=6 (3'ün katı), 3 × 17 = 51'dir.";
  } else if (n === 57) {
    lgsTip = "⚠️ 57 sayısı asal zannedilir fakat 3 × 19 = 57'dir (5+7=12, 3'ün katı).";
  } else if (n === 87) {
    lgsTip = "⚠️ 87 sayısı asal değildir. 3 × 29 = 87'dir (8+7=15, 3'ün katı).";
  } else if (n === 2) {
    lgsTip = "⭐ Çok önemli kural: 2 en küçük asal sayıdır ve ÇİFT OLAN TEK ASAL SAYIDIR!";
  }

  return {
    factors: allDivisors,
    explanation: isPrime
      ? `${n} sadece 1'e ve ${n}'e tam bölünür. Tam 2 pozitif böleni olduğu için ASALDIR!`
      : `${n} sayısının bölenleri: ${allDivisors.join(', ')}. Asal çarpanları: ${primeFactors.join(' × ')} = ${n}. Bu yüzden BİLEŞİK sayıdır.`,
    lgsTip
  };
}

// Sieve Steps definitions
interface SieveStep {
  stepIndex: number;
  title: string;
  prime: number | null;
  targetMultiplier: number | null;
  description: string;
  subtext: string;
  activeColor: string;
}

const SIEVE_STEPS: SieveStep[] = [
  {
    stepIndex: 0,
    title: "Başlangıç: Kalburu Hazırlıyoruz",
    prime: null,
    targetMultiplier: null,
    description: "1'den 100'e kadar olan sayılar ızgarada hazır. Eratosthenes M.Ö. 3. yüzyılda asal sayıları bulmak için katları eleme yöntemini geliştirdi.",
    subtext: "Hazırsan 'Sonraki Adım' butonuna tıkla veya 'Otomatik Oynat'ı başlat!",
    activeColor: "slate"
  },
  {
    stepIndex: 1,
    title: "Adım 1: 1 Asal Sayı Değildir!",
    prime: null,
    targetMultiplier: 1,
    description: "Asal sayı tanımı gereği bir sayının 1'den büyük olması ve sadece iki böleni (1 ve kendisi) bulunması gerekir. 1'in tek böleni olduğu için asal değildir.",
    subtext: "1 sayısını eliyoruz (üstü çizilir).",
    activeColor: "red"
  },
  {
    stepIndex: 2,
    title: "Adım 2: En Küçük Asal 2 ve Çift Katları",
    prime: 2,
    targetMultiplier: 2,
    description: "2 en küçük asal sayıdır ve TEK ÇİFT ASAL sayıdır! 2'yi asal olarak işaretliyoruz ve kendisinden büyük tüm katlarını (4, 6, 8, ... 100) eliyoruz.",
    subtext: "2'nin katı olan 49 çift sayı elendi! Geriye kalan çift sayılar artık asal olamaz.",
    activeColor: "sky"
  },
  {
    stepIndex: 3,
    title: "Adım 3: Sıradaki Asal 3 ve 3'ün Katları",
    prime: 3,
    targetMultiplier: 3,
    description: "Sırada elenmemiş ilk sayı 3'tür. 3 bir asal sayıdır! Şimdi 3'ün kendisi hariç katlarını eliyoruz (9, 15, 21, 27, 33, ... 99).",
    subtext: "Çift olan katları (6, 12, 18...) zaten 2'de elenmişti. 51 ve 87 gibi kritik LGS tuzakları burada elenir!",
    activeColor: "emerald"
  },
  {
    stepIndex: 4,
    title: "Adım 4: Sıradaki Asal 5 ve 5'in Katları",
    prime: 5,
    targetMultiplier: 5,
    description: "Sırada elenmemiş sayı 5'tir. 5 asaldır! 5'in kendisi hariç katlarını eliyoruz (25, 35, 55, 65, 85, 95).",
    subtext: "Sonu 0 ile bitenler 2'de elenmişti. Sonu 5 ile bitenler bu adımda elenir.",
    activeColor: "amber"
  },
  {
    stepIndex: 5,
    title: "Adım 5: Sıradaki Asal 7 ve 7'nin Katları (Kritik Adım!)",
    prime: 7,
    targetMultiplier: 7,
    description: "Sırada elenmemiş sayı 7'dir. 7 asaldır! 7'nin katlarını eliyoruz: 49 (7×7), 77 (7×11) ve EN ÜNLÜ LGS TUZAĞI 91 (7×13)!",
    subtext: "91 sayısı 7 ve 13'e bölünür, ASAL DEĞİLDİR! LGS'de soru yazarlarının en sevdiği sayıdır.",
    activeColor: "purple"
  },
  {
    stepIndex: 6,
    title: "Adım 6: Kalbur Tamamlandı! 25 Asal Sayı Keşfedildi",
    prime: null,
    targetMultiplier: null,
    description: "Harika! √100 = 10 olduğu için, 10'dan küçük asal sayıları (2, 3, 5, 7) test etmek 100'e kadar yeterlidir! 11'in yeni katı 11×11=121 > 100'dür.",
    subtext: "Izgarada elenmeden kalan 25 sayının TAMAMI ASALDIR! Tebrikler!",
    activeColor: "yellow"
  }
];

// Cell state for the sieve grid
interface CellState {
  num: number;
  isEliminated: boolean;
  eliminatedBy: number | null;
  isPrimeConfirmed: boolean;
  isCurrentPrime: boolean;
  isJustEliminated: boolean;
}

function computeGridState(stepIndex: number): Record<number, CellState> {
  const state: Record<number, CellState> = {};
  
  for (let n = 1; n <= 100; n++) {
    state[n] = {
      num: n,
      isEliminated: false,
      eliminatedBy: null,
      isPrimeConfirmed: false,
      isCurrentPrime: false,
      isJustEliminated: false
    };
  }

  if (stepIndex >= 1) {
    state[1].isEliminated = true;
    state[1].eliminatedBy = 1;
    if (stepIndex === 1) state[1].isJustEliminated = true;
  }

  if (stepIndex >= 2) {
    state[2].isPrimeConfirmed = true;
    if (stepIndex === 2) state[2].isCurrentPrime = true;
    for (let n = 4; n <= 100; n += 2) {
      state[n].isEliminated = true;
      state[n].eliminatedBy = 2;
      if (stepIndex === 2) state[n].isJustEliminated = true;
    }
  }

  if (stepIndex >= 3) {
    state[3].isPrimeConfirmed = true;
    if (stepIndex === 3) state[3].isCurrentPrime = true;
    for (let n = 6; n <= 100; n += 3) {
      if (!state[n].isEliminated) {
        state[n].isEliminated = true;
        state[n].eliminatedBy = 3;
        if (stepIndex === 3) state[n].isJustEliminated = true;
      }
    }
  }

  if (stepIndex >= 4) {
    state[5].isPrimeConfirmed = true;
    if (stepIndex === 4) state[5].isCurrentPrime = true;
    for (let n = 10; n <= 100; n += 5) {
      if (!state[n].isEliminated) {
        state[n].isEliminated = true;
        state[n].eliminatedBy = 5;
        if (stepIndex === 4) state[n].isJustEliminated = true;
      }
    }
  }

  if (stepIndex >= 5) {
    state[7].isPrimeConfirmed = true;
    if (stepIndex === 5) state[7].isCurrentPrime = true;
    for (let n = 14; n <= 100; n += 7) {
      if (!state[n].isEliminated) {
        state[n].isEliminated = true;
        state[n].eliminatedBy = 7;
        if (stepIndex === 5) state[n].isJustEliminated = true;
      }
    }
  }

  if (stepIndex >= 6) {
    for (let n = 2; n <= 100; n++) {
      if (!state[n].isEliminated) {
        state[n].isPrimeConfirmed = true;
      }
    }
  }

  return state;
}

// Sound Synthesizer via Web Audio API (Zero External Asset Dependencies)
class SoundFx {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(830.61, now + 0.08);
      osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.16);

      osc2.frequency.setValueAtTime(329.63, now);
      osc2.frequency.exponentialRampToValueAtTime(493.88, now + 0.16);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // Audio fallback silent
    }
  }

  playWrong() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback silent
    }
  }

  playStep() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.09);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // silent
    }
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const start = (this.ctx?.currentTime || 0) + idx * 0.1;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // silent
    }
  }
}

const sounds = new SoundFx();

export default function App() {
  const [activeTab, setActiveTab] = useState<'sieve' | 'speed' | 'lgs'>('sieve');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sieve simulation state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [autoSpeedMs] = useState<number>(1800);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  // Sync sound settings
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Compute Grid State
  const gridState = useMemo(() => computeGridState(currentStep), [currentStep]);

  // Auto-play timer for sieve
  useEffect(() => {
    if (!isPlayingAuto) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < SIEVE_STEPS.length - 1) {
          sounds.playStep();
          return prev + 1;
        } else {
          setIsPlayingAuto(false);
          sounds.playVictory();
          return prev;
        }
      });
    }, autoSpeedMs);

    return () => clearInterval(interval);
  }, [isPlayingAuto, autoSpeedMs]);

  // Play victory chime when reaching final step manually
  useEffect(() => {
    if (currentStep === 6) {
      sounds.playVictory();
    }
  }, [currentStep]);

  // Speed Challenge Game State
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(17);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lgs_primes_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [lastFeedbackNote, setLastFeedbackNote] = useState<string>('');
  const [mistakesList, setMistakesList] = useState<
    Array<{ num: number; chosen: 'ASAL' | 'ASAL DEĞİL'; correct: boolean; tip: string }>
  >([]);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // End game logic
  const endGame = useCallback(() => {
    setGameActive(false);
    setGameOver(true);
    sounds.playVictory();
    setScore((prev) => {
      if (prev > highScore) {
        setHighScore(prev);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lgs_primes_highscore', prev.toString());
        }
      }
      return prev;
    });
  }, [highScore]);

  // Timer for Speed Challenge
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, timeLeft, endGame]);

  // Pick random number weighted to include tricky LGS cases (91, 51, 57, 87, 1, 2, primes)
  const getRandomNumber = useCallback((): number => {
    const trickyPool = [91, 51, 57, 87, 1, 2, 49, 77, 39, 69, 93, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    if (Math.random() < 0.38) {
      return trickyPool[Math.floor(Math.random() * trickyPool.length)];
    }
    return Math.floor(Math.random() * 99) + 2;
  }, []);

  const startGame = () => {
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(60);
    setMistakesList([]);
    setGameOver(false);
    setFeedbackState('idle');
    setLastFeedbackNote('');
    setCurrentQuestionNumber(getRandomNumber());
    setGameActive(true);
    sounds.playStep();
  };

  const handleAnswer = (userChoicePrime: boolean) => {
    if (!gameActive || feedbackState !== 'idle') return;

    const actualIsPrime = PRIMES_SET.has(currentQuestionNumber);
    const isCorrect = userChoicePrime === actualIsPrime;
    const factorInfo = getFactorsDetails(currentQuestionNumber);

    if (isCorrect) {
      sounds.playCorrect();
      setFeedbackState('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      const bonus = newStreak >= 5 ? 5 : 0;
      setScore((s) => s + 10 + bonus);
      setCorrectCount((c) => c + 1);
      setLastFeedbackNote(
        actualIsPrime
          ? `Tebrikler! ${currentQuestionNumber} sadece 1'e ve kendine bölünür (+10 Puan)`
          : `Doğru! ${currentQuestionNumber} asal değildir (+10 Puan)`
      );
    } else {
      sounds.playWrong();
      setFeedbackState('wrong');
      setStreak(0);
      setScore((s) => Math.max(0, s - 5));
      setWrongCount((w) => w + 1);

      const note = actualIsPrime
        ? `HATA! ${currentQuestionNumber} bir ASAL sayıdır!`
        : `HATA! ${currentQuestionNumber} asal DEĞİLDİR! (${factorInfo.factors.join(', ')})`;
      setLastFeedbackNote(factorInfo.lgsTip || note);

      setMistakesList((prev) => [
        ...prev,
        {
          num: currentQuestionNumber,
          chosen: userChoicePrime ? 'ASAL' : 'ASAL DEĞİL',
          correct: actualIsPrime,
          tip: factorInfo.lgsTip || factorInfo.explanation
        }
      ]);
    }

    setTimeout(() => {
      setFeedbackState('idle');
      let nextNum = getRandomNumber();
      while (nextNum === currentQuestionNumber) {
        nextNum = getRandomNumber();
      }
      setCurrentQuestionNumber(nextNum);
    }, isCorrect ? 400 : 900);
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive || activeTab !== 'speed') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleAnswer(true);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleAnswer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, activeTab, currentQuestionNumber, feedbackState]);

  const selectedDetails = useMemo(() => {
    if (selectedNumber === null) return null;
    return getFactorsDetails(selectedNumber);
  }, [selectedNumber]);

  // Standalone Single HTML generator for teachers to download/share
  const handleDownloadSingleHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eratosthenes Kalburu & Asal Sayı Oyunu | LGS 8. Sınıf</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    @keyframes primeGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.45); }
      50% { box-shadow: 0 0 25px rgba(234, 179, 8, 0.75); }
    }
    .prime-glow { animation: primeGlow 2.5s infinite ease-in-out; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-3 sm:p-6 flex flex-col items-center">
  <div class="max-w-5xl w-full">
    <!-- Header -->
    <header class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-amber-400">Eratosthenes Kalburu & Asal Sayılar</h1>
        <p class="text-xs text-slate-400">8. Sınıf LGS Hazırlık · Çevrimdışı & Akıllı Tahta Sürümü</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchTab('sieve')" id="tabBtnSieve" class="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-400 text-slate-950">Kalbur Öğren</button>
        <button onclick="switchTab('speed')" id="tabBtnSpeed" class="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-slate-300">Zamana Karşı Yarış</button>
      </div>
    </header>

    <!-- TAB 1: Sieve Simulation -->
    <div id="viewSieve" class="space-y-4">
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span id="stepBadge" class="text-xs font-bold text-amber-400 mono">ADIM 0 / 6</span>
          <h2 id="stepTitle" class="text-lg font-bold text-white mt-1">Başlangıç: Kalburu Hazırlıyoruz</h2>
          <p id="stepDesc" class="text-xs text-slate-300 mt-1 max-w-xl">1'den 100'e kadar olan sayılar ızgarada hazır. Eratosthenes katları eleme yöntemini keşfetmek için Sonraki Adım'a tıklayın.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="prevStep()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200">Geri</button>
          <button onclick="toggleAuto()" id="autoBtn" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200">Otomatik Oynat</button>
          <button onclick="nextStep()" class="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-xs font-bold rounded-xl text-slate-950">Sonraki Adım</button>
          <button onclick="resetSieve()" class="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl">↺</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-8 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div class="flex justify-between text-xs text-slate-400 mb-3">
            <span>10x10 Sayı Tablosu</span>
            <span class="mono">Bulunan Asallar: <strong id="primeCountText" class="text-amber-400">0</strong> / 25</span>
          </div>
          <div id="grid100" class="grid grid-cols-10 gap-1 sm:gap-1.5 mono"></div>
        </div>

        <div class="lg:col-span-4 space-y-4">
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <h3 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Sayı Müfettişi</h3>
            <div id="inspectorContent" class="text-xs text-slate-400 py-4 text-center">
              Herhangi bir sayıya tıklayarak asal çarpanlarını ve LGS ipuçlarını görün.
            </div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs space-y-2">
            <h4 class="font-bold text-emerald-400">Neden Sadece 7'ye Kadar?</h4>
            <p class="text-slate-300 leading-relaxed">√100 = 10 olduğu için 10'dan küçük asalların (2, 3, 5, 7) katlarını elemek yeterlidir. 11'in katı 121 > 100 olduğundan 100 sınırında test edilmez!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Speed Quiz -->
    <div id="viewSpeed" class="space-y-6 hidden max-w-2xl mx-auto">
      <div class="grid grid-cols-4 gap-2 text-center mono">
        <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl"><span class="text-[10px] text-slate-400 block">SÜRE</span><span id="quizTime" class="text-xl font-black text-amber-400">60s</span></div>
        <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl"><span class="text-[10px] text-slate-400 block">PUAN</span><span id="quizScore" class="text-xl font-black text-white">0</span></div>
        <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl"><span class="text-[10px] text-slate-400 block">DOĞRU</span><span id="quizCorrect" class="text-xl font-black text-emerald-400">0</span></div>
        <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl"><span class="text-[10px] text-slate-400 block">KOMBO</span><span id="quizStreak" class="text-xl font-black text-orange-400">0x</span></div>
      </div>

      <div id="quizBox" class="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-6">
        <div id="quizStartScreen">
          <h2 class="text-2xl font-extrabold text-white mb-2">60 Saniye Zamana Karşı Yarış</h2>
          <p class="text-xs text-slate-300 mb-6 max-w-md mx-auto">1'den 100'e kadar gelen sayıların asal olup olmadığını anında tahmin edin. Doğru +10 puan, yanlış -5 puan!</p>
          <button onclick="startSpeedGame()" class="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg">Yarışmayı Başlat</button>
        </div>

        <div id="quizPlayScreen" class="hidden space-y-6">
          <div id="quizFeedback" class="text-xs font-bold py-1 px-3 rounded-full inline-block text-slate-400">Sayı Asal mı?</div>
          <div id="quizBigNumber" class="text-8xl font-black mono text-white">17</div>
          <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button onclick="submitAnswer(true)" class="py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-extrabold text-lg rounded-xl shadow-lg">ASAL</button>
            <button onclick="submitAnswer(false)" class="py-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-lg rounded-xl shadow-lg">ASAL DEĞİL</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const PRIMES = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]);
    const STEPS = [
      { step: 0, title: "Başlangıç: Kalburu Hazırlıyoruz", desc: "1'den 100'e kadar olan sayılar ızgarada hazır. Sonraki Adım'a tıklayın." },
      { step: 1, title: "Adım 1: 1 Asal Sayı Değildir!", desc: "Asal sayı olmak için tam 2 pozitif bölen gerekir. 1'in tek böleni vardır, elenir!" },
      { step: 2, title: "Adım 2: En Küçük Asal 2 ve Çift Katları", desc: "2 en küçük ve TEK ÇİFT asal sayıdır. 2'nin katları (4, 6, 8... 100) elenir." },
      { step: 3, title: "Adım 3: Sıradaki Asal 3 ve Katları", desc: "3 asaldır. 3'ün katları (9, 15, 21, 27, 33... 99) elenir. 51 ve 87 gibi tuzaklar burada elenir!" },
      { step: 4, title: "Adım 4: Sıradaki Asal 5 ve Katları", desc: "5 asaldır. 5'in katları (25, 35, 55, 65, 85, 95) elenir." },
      { step: 5, title: "Adım 5: Sıradaki Asal 7 ve Katları (Kritik Adım!)", desc: "7 asaldır. 49, 77 ve LGS'nin en büyük tuzağı 91 (7x13) elenir!" },
      { step: 6, title: "Adım 6: Kalbur Tamamlandı! 25 Asal Sayı Bulundu", desc: "√100 = 10 olduğu için elenmeyen TÜM 25 SAYI ASALDIR! Tebrikler!" }
    ];

    let currentStep = 0;
    let autoInterval = null;

    function renderGrid() {
      const container = document.getElementById('grid100');
      container.innerHTML = '';
      let confirmedPrimes = 0;

      for (let n = 1; n <= 100; n++) {
        let isEliminated = false;
        let isPrime = false;

        if (currentStep >= 1 && n === 1) isEliminated = true;
        if (currentStep >= 2) {
          if (n === 2) isPrime = true;
          if (n > 2 && n % 2 === 0) isEliminated = true;
        }
        if (currentStep >= 3) {
          if (n === 3) isPrime = true;
          if (n > 3 && n % 3 === 0) isEliminated = true;
        }
        if (currentStep >= 4) {
          if (n === 5) isPrime = true;
          if (n > 5 && n % 5 === 0) isEliminated = true;
        }
        if (currentStep >= 5) {
          if (n === 7) isPrime = true;
          if (n > 7 && n % 7 === 0) isEliminated = true;
        }
        if (currentStep >= 6) {
          if (PRIMES.has(n)) isPrime = true;
        }

        if (isPrime) confirmedPrimes++;

        const btn = document.createElement('button');
        btn.textContent = n;
        btn.onclick = () => inspectNumber(n);
        let cls = 'aspect-square rounded-lg border text-xs sm:text-sm font-bold flex items-center justify-center transition-all ';

        if (isPrime) {
          cls += 'bg-amber-400 text-slate-950 border-amber-300 shadow-md prime-glow';
        } else if (isEliminated) {
          cls += 'bg-slate-950/70 text-slate-600 border-slate-800 line-through opacity-50';
        } else {
          cls += 'bg-slate-800 text-slate-200 border-slate-700/60 hover:bg-slate-700';
        }
        btn.className = cls;
        container.appendChild(btn);
      }
      document.getElementById('primeCountText').textContent = confirmedPrimes;
    }

    function updateStepUI() {
      document.getElementById('stepBadge').textContent = 'ADIM ' + currentStep + ' / 6';
      document.getElementById('stepTitle').textContent = STEPS[currentStep].title;
      document.getElementById('stepDesc').textContent = STEPS[currentStep].desc;
      renderGrid();
    }

    function nextStep() {
      if (currentStep < 6) {
        currentStep++;
        updateStepUI();
      }
    }

    function prevStep() {
      if (currentStep > 0) {
        currentStep--;
        updateStepUI();
      }
    }

    function resetSieve() {
      currentStep = 0;
      clearInterval(autoInterval);
      autoInterval = null;
      document.getElementById('autoBtn').textContent = 'Otomatik Oynat';
      updateStepUI();
    }

    function toggleAuto() {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        document.getElementById('autoBtn').textContent = 'Otomatik Oynat';
      } else {
        document.getElementById('autoBtn').textContent = 'Durdur';
        autoInterval = setInterval(() => {
          if (currentStep < 6) {
            currentStep++;
            updateStepUI();
          } else {
            clearInterval(autoInterval);
            autoInterval = null;
            document.getElementById('autoBtn').textContent = 'Otomatik Oynat';
          }
        }, 1800);
      }
    }

    function inspectNumber(n) {
      const isP = PRIMES.has(n);
      let tip = '';
      if (n === 91) tip = '<div class="mt-2 text-amber-300 bg-amber-950/40 p-2 rounded">⚠️ LGS TUZAĞI: 91 = 7 x 13 (Asal Değildir!)</div>';
      else if (n === 51) tip = '<div class="mt-2 text-amber-300 bg-amber-950/40 p-2 rounded">⚠️ 51 = 3 x 17 (Rakamları toplamı 6, 3\\'ün katı!)</div>';
      else if (n === 2) tip = '<div class="mt-2 text-sky-300 bg-sky-950/40 p-2 rounded">⭐ 2 en küçük ve TEK ÇİFT asal sayıdır!</div>';
      else if (n === 1) tip = '<div class="mt-2 text-red-300 bg-red-950/40 p-2 rounded">⚠️ 1 Asal değildir!</div>';

      document.getElementById('inspectorContent').innerHTML = \`
        <div class="text-left space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-2xl font-extrabold text-white mono">\${n}</span>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold \${isP ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}">
              \${isP ? 'ASAL SAYI' : (n === 1 ? '1' : 'BİLEŞİK SAYI')}
            </span>
          </div>
          <p class="text-slate-300 text-xs">\${isP ? n + ' sadece 1 ve kendisine bölünür.' : n + ' asal değildir.'}</p>
          \${tip}
        </div>
      \`;
    }

    // SPEED GAME LOGIC
    let speedTimer = null;
    let speedTime = 60;
    let speedScore = 0;
    let speedStreak = 0;
    let speedCorrect = 0;
    let currentQuizNum = 17;

    function switchTab(tab) {
      if (tab === 'sieve') {
        document.getElementById('viewSieve').classList.remove('hidden');
        document.getElementById('viewSpeed').classList.add('hidden');
        document.getElementById('tabBtnSieve').className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-400 text-slate-950';
        document.getElementById('tabBtnSpeed').className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-slate-300';
      } else {
        document.getElementById('viewSieve').classList.add('hidden');
        document.getElementById('viewSpeed').classList.remove('hidden');
        document.getElementById('tabBtnSpeed').className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-400 text-slate-950';
        document.getElementById('tabBtnSieve').className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-slate-300';
      }
    }

    function startSpeedGame() {
      speedTime = 60;
      speedScore = 0;
      speedStreak = 0;
      speedCorrect = 0;
      document.getElementById('quizTime').textContent = speedTime + 's';
      document.getElementById('quizScore').textContent = '0';
      document.getElementById('quizStreak').textContent = '0x';
      document.getElementById('quizCorrect').textContent = '0';
      document.getElementById('quizStartScreen').classList.add('hidden');
      document.getElementById('quizPlayScreen').classList.remove('hidden');

      pickNextQuizNumber();
      clearInterval(speedTimer);
      speedTimer = setInterval(() => {
        speedTime--;
        document.getElementById('quizTime').textContent = speedTime + 's';
        if (speedTime <= 0) {
          clearInterval(speedTimer);
          alert('Süre doldu! Toplam Skorunuz: ' + speedScore);
          document.getElementById('quizStartScreen').classList.remove('hidden');
          document.getElementById('quizPlayScreen').classList.add('hidden');
        }
      }, 1000);
    }

    function pickNextQuizNumber() {
      const traps = [91, 51, 57, 87, 1, 2, 49, 77, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
      if (Math.random() < 0.4) {
        currentQuizNum = traps[Math.floor(Math.random() * traps.length)];
      } else {
        currentQuizNum = Math.floor(Math.random() * 99) + 2;
      }
      document.getElementById('quizBigNumber').textContent = currentQuizNum;
      document.getElementById('quizFeedback').textContent = 'Bu sayı asal mı?';
      document.getElementById('quizFeedback').className = 'text-xs font-bold py-1 px-3 rounded-full inline-block text-slate-400';
    }

    function submitAnswer(isUserPrime) {
      const actualIsPrime = PRIMES.has(currentQuizNum);
      const isCorrect = isUserPrime === actualIsPrime;

      if (isCorrect) {
        speedScore += 10;
        speedStreak++;
        speedCorrect++;
        document.getElementById('quizFeedback').textContent = '✔ Doğru! (+10 Puan)';
        document.getElementById('quizFeedback').className = 'text-xs font-bold py-1 px-3 rounded-full inline-block bg-emerald-500/20 text-emerald-300';
      } else {
        speedScore = Math.max(0, speedScore - 5);
        speedStreak = 0;
        let tip = actualIsPrime ? 'Hata! Asaldır!' : 'Hata! Asal değildir!';
        if (currentQuizNum === 91) tip = 'Hata! 91 = 7 x 13 (Asal Değildir!)';
        if (currentQuizNum === 51) tip = 'Hata! 51 = 3 x 17 (Asal Değildir!)';
        document.getElementById('quizFeedback').textContent = '✕ ' + tip + ' (-5 Puan)';
        document.getElementById('quizFeedback').className = 'text-xs font-bold py-1 px-3 rounded-full inline-block bg-rose-500/20 text-rose-300';
      }

      document.getElementById('quizScore').textContent = speedScore;
      document.getElementById('quizStreak').textContent = speedStreak + 'x';
      document.getElementById('quizCorrect').textContent = speedCorrect;

      setTimeout(pickNextQuizNumber, isCorrect ? 300 : 800);
    }

    // Init
    updateStepUI();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LGS_8_Sinif_Asal_Sayilar_Eratosthenes_Kalburu.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-400 selection:text-slate-950">
      {/* --- TOP BAR: [Brand Wordmark] - [3 Nav Links/Tabs] - [Action CTA] --- */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Zone 1: Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base md:text-lg tracking-tight text-white block leading-none">
                Asal Sayılar <span className="text-amber-400">Kalburu</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">8. Sınıf LGS Matematik</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('sieve');
                sounds.playStep();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'sieve'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kalburu Öğren</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('speed');
                sounds.playStep();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'speed'
                  ? 'bg-emerald-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-current" />
              <span>Zamana Karşı Yarış</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('lgs');
                sounds.playStep();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'lgs'
                  ? 'bg-sky-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>LGS Tuzakları & 25 Asal</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Sound Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
              className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={handleDownloadSingleHtml}
              title="Akıllı tahta ve çevrimdışı kullanım için Tek Dosya HTML İndir"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tek Dosya HTML</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 md:py-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: ERATOSTHENES KALBURU SIMULATION                                   */}
        {/* ========================================================================= */}
        {activeTab === 'sieve' && (
          <div className="space-y-6">
            {/* Step Banner / Pedagogical Guide Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono-numbers">
                      ADIM {currentStep} / {SIEVE_STEPS.length - 1}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">Eratosthenes Sieve Yöntemi</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {SIEVE_STEPS[currentStep].title}
                  </h2>
                  <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {SIEVE_STEPS[currentStep].description}
                  </p>
                  <p className="text-xs text-amber-300/90 font-medium pt-1">
                    💡 {SIEVE_STEPS[currentStep].subtext}
                  </p>
                </div>

                {/* Progress Indicators & Step Navigation */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <div className="flex items-center justify-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => {
                        if (currentStep > 0) {
                          setCurrentStep(currentStep - 1);
                          sounds.playStep();
                        }
                      }}
                      disabled={currentStep === 0}
                      className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Önceki Adım"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setIsPlayingAuto(!isPlayingAuto);
                        sounds.playStep();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        isPlayingAuto
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isPlayingAuto ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlayingAuto ? 'Durdur' : 'Otomatik Oynat'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (currentStep < SIEVE_STEPS.length - 1) {
                          setCurrentStep(currentStep + 1);
                          sounds.playStep();
                        }
                      }}
                      disabled={currentStep === SIEVE_STEPS.length - 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-30 disabled:hover:bg-amber-400 transition-colors shadow-sm"
                      title="Sonraki Adım"
                    >
                      <span>Sonraki Adım</span>
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setCurrentStep(0);
                        setIsPlayingAuto(false);
                        setSelectedNumber(null);
                        sounds.playStep();
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Başa Dön"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step Dots indicator */}
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800/80">
                {SIEVE_STEPS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentStep(idx);
                      sounds.playStep();
                    }}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      idx === currentStep
                        ? 'bg-amber-400 ring-2 ring-amber-400/30'
                        : idx < currentStep
                        ? 'bg-emerald-500'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    title={s.title}
                  />
                ))}
              </div>
            </div>

            {/* Split View: 10x10 Grid on Left/Top, Interactive Inspector on Right/Bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* 10x10 Grid (Span 8 on desktop) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800/80 rounded-2xl p-3 sm:p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">10x10 Sayı Tablosu</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-amber-400">Herhangi bir sayıya tıkla ve incele</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono-numbers">
                    Asal Sayılar: <span className="text-amber-400 font-bold">{Object.values(gridState).filter(c => c.isPrimeConfirmed).length}</span> / 25
                  </div>
                </div>

                {/* 10x10 Grid Box */}
                <div className="grid grid-cols-10 gap-1 sm:gap-1.5 md:gap-2">
                  {ALL_NUMBERS.map((n) => {
                    const cell = gridState[n];
                    const isSelected = selectedNumber === n;

                    let bgClasses = 'bg-slate-800/70 text-slate-200 hover:bg-slate-700/80 border-slate-700/50';

                    if (cell.num === 1 && cell.isEliminated) {
                      bgClasses = 'bg-slate-950/80 text-slate-600 border-red-900/30 line-through opacity-40';
                    } else if (cell.isPrimeConfirmed) {
                      bgClasses = 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-500/20 prime-glow scale-[1.02]';
                    } else if (cell.isEliminated) {
                      bgClasses = 'bg-slate-950/60 text-slate-500 border-slate-800 line-through opacity-50';
                    }

                    const selectedRing = isSelected ? 'ring-2 ring-white scale-105 z-10' : '';

                    return (
                      <button
                        key={n}
                        onClick={() => {
                          setSelectedNumber(n);
                          sounds.playStep();
                        }}
                        className={`aspect-square rounded-lg sm:rounded-xl border flex flex-col items-center justify-center text-xs sm:text-sm md:text-base font-semibold font-mono-numbers transition-all duration-200 select-none relative ${bgClasses} ${selectedRing}`}
                        title={`${n}: ${cell.isPrimeConfirmed ? 'Asal Sayı' : cell.isEliminated ? 'Elenmiş Sayı' : 'Beklemede'}`}
                      >
                        <span>{n}</span>
                        {cell.isPrimeConfirmed && (
                          <span className="hidden sm:block text-[8px] tracking-tighter uppercase font-bold leading-none mt-0.5 opacity-90">
                            ASAL
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sieve Color Legend */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block shadow-sm shadow-amber-400/50" />
                      <span className="text-slate-200 font-medium">Asal Sayı (25 Adet)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-700 line-through text-slate-500 inline-flex items-center justify-center text-[10px]">✕</span>
                      <span>Elenen Bileşik Sayı</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700 inline-block" />
                      <span>Henüz Elenmemiş</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Akıllı Tahta & Dokunmatik Uyumlu
                  </div>
                </div>
              </div>

              {/* Inspector & Mathematical Note Panel (Span 4 on desktop) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Sayı Müfettişi
                      </h3>
                    </div>
                    {selectedNumber && (
                      <button
                        onClick={() => setSelectedNumber(null)}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        Temizle
                      </button>
                    )}
                  </div>

                  {selectedNumber !== null && selectedDetails ? (
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-3xl font-extrabold text-white font-mono-numbers">
                          {selectedNumber}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                            PRIMES_SET.has(selectedNumber)
                              ? 'bg-amber-400 text-slate-950'
                              : selectedNumber === 1
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-800 text-red-300'
                          }`}
                        >
                          {PRIMES_SET.has(selectedNumber)
                            ? '⭐ ASAL SAYI'
                            : selectedNumber === 1
                            ? '1 (Asal Değil)'
                            : 'BİLEŞİK SAYI'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-400 block mb-1 font-semibold">Açıklama:</span>
                        {selectedDetails.explanation}
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-400 block mb-1 font-semibold">Pozitif Bölenleri:</span>
                        <div className="font-mono-numbers text-amber-300 font-bold">
                          {selectedDetails.factors.join(', ')}
                        </div>
                      </div>

                      {selectedDetails.lgsTip && (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200 leading-relaxed">
                          <span className="font-bold text-amber-300 block mb-0.5">🎯 LGS İPUCU:</span>
                          {selectedDetails.lgsTip}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <HelpCircle className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs leading-relaxed max-w-xs mx-auto">
                        Soldaki 10x10 tablodan herhangi bir sayıya (örn: <span className="text-amber-300 font-bold">91</span>, <span className="text-amber-300 font-bold">51</span>, <span className="text-amber-300 font-bold">2</span>, <span className="text-amber-300 font-bold">1</span>) tıklayarak asal çarpanlarını ve LGS püf noktalarını görün!
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-xs space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Neden Sadece 7'ye Kadar Eleriz?</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    1'den 100'e kadar olan asal sayıları bulurken sadece <strong className="text-emerald-300">2, 3, 5 ve 7</strong>'nin katlarını elemek yeterlidir.
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono-numbers text-amber-300 text-center">
                    √100 = 10 &nbsp;→&nbsp; 10'dan küçük asallar: 2, 3, 5, 7
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Sıradaki asal olan 11'in daha önce elenmemiş en küçük katı <span className="text-slate-200 font-bold">11 × 11 = 121</span>'dir. 121 sayısı 100'den büyük olduğu için 100 sınırında 11'in katlarını kontrol etmeye gerek kalmaz!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ZAMANA KARŞI YARIŞ (SPEED TEST & MEMORIZATION GAME)                */}
        {/* ========================================================================= */}
        {activeTab === 'speed' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-center">
                <span className="text-slate-400 text-xs block">Kalan Süre</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Clock className={`w-4 h-4 ${timeLeft <= 10 && gameActive ? 'text-red-400 animate-spin' : 'text-amber-400'}`} />
                  <span className={`text-xl font-black font-mono-numbers ${timeLeft <= 10 && gameActive ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-center">
                <span className="text-slate-400 text-xs block">Puan</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xl font-black text-amber-300 font-mono-numbers">
                    {score}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-center">
                <span className="text-slate-400 text-xs block">Kombo Seri</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Flame className={`w-4 h-4 ${streak >= 3 ? 'text-orange-500 animate-bounce' : 'text-slate-500'}`} />
                  <span className="text-xl font-black text-orange-400 font-mono-numbers">
                    {streak}x
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-center">
                <span className="text-slate-400 text-xs block">En Yüksek Skor</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-xl font-black text-purple-300 font-mono-numbers">
                    {highScore}
                  </span>
                </div>
              </div>
            </div>

            {!gameActive && !gameOver && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 text-center shadow-xl space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Zamana Karşı Asal Sayı Hız Testi
                  </h2>
                  <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                    Ekrana 1'den 100'e kadar rastgele sayılar gelecek. 60 saniye içinde sayının <strong>ASAL</strong> mı yoksa <strong>ASAL DEĞİL</strong> mi olduğunu en hızlı şekilde tahmin et!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-xs text-slate-300 text-left">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-1">✔ Doğru Cevap:</span>
                    +10 Puan & Kombo artışı
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-red-400 font-bold block mb-1">✕ Yanlış Cevap:</span>
                    -5 Puan & Kombo sıfırlanır
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-bold block mb-1">⌨️ Kısayollar:</span>
                    [A / Sol Ok] Asal <br /> [D / Sağ Ok] Asal Değil
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-base rounded-xl shadow-lg shadow-amber-400/20 transition-all transform hover:scale-105 active:scale-95"
                >
                  🚀 Yarışmayı Başlat (60 Saniye)
                </button>
              </div>
            )}

            {gameActive && (
              <div
                className={`bg-slate-900 border rounded-2xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden transition-all duration-200 ${
                  feedbackState === 'correct'
                    ? 'border-emerald-500/70 bg-emerald-950/20 bounce-correct'
                    : feedbackState === 'wrong'
                    ? 'border-red-500/70 bg-red-950/20 shake-wrong'
                    : 'border-slate-800'
                }`}
              >
                {lastFeedbackNote && (
                  <div
                    className={`text-xs font-bold py-1.5 px-3 rounded-full inline-block mb-4 transition-all ${
                      feedbackState === 'correct'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : feedbackState === 'wrong'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'text-transparent'
                    }`}
                  >
                    {lastFeedbackNote}
                  </div>
                )}

                <div className="my-4">
                  <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold mb-2">
                    Bu sayı asal mı?
                  </span>
                  <div className="text-7xl sm:text-8xl md:text-9xl font-black text-white font-mono-numbers tracking-tight select-none drop-shadow-md">
                    {currentQuestionNumber}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="py-5 px-4 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-95 text-white font-extrabold text-lg sm:text-xl rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex flex-col items-center justify-center gap-1 select-none"
                  >
                    <CheckCircle2 className="w-7 h-7" />
                    <span>ASAL</span>
                    <span className="text-[11px] font-normal opacity-80">[A / Sol Ok]</span>
                  </button>

                  <button
                    onClick={() => handleAnswer(false)}
                    className="py-5 px-4 bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white font-extrabold text-lg sm:text-xl rounded-2xl shadow-lg shadow-rose-700/30 transition-all flex flex-col items-center justify-center gap-1 select-none"
                  >
                    <XCircle className="w-7 h-7" />
                    <span>ASAL DEĞİL</span>
                    <span className="text-[11px] font-normal opacity-80">[D / Sağ Ok]</span>
                  </button>
                </div>
              </div>
            )}

            {gameOver && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Süre Doldu! Skor Kartınız
                  </h3>
                  <p className="text-xs text-slate-400">
                    60 saniyelik LGS asal sayı maratonu tamamlandı.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center font-mono-numbers">
                  <div>
                    <span className="text-slate-400 text-xs block">Toplam Skor</span>
                    <span className="text-2xl font-black text-amber-400">{score}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Doğru Cevap</span>
                    <span className="text-2xl font-black text-emerald-400">{correctCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Yanlış Cevap</span>
                    <span className="text-2xl font-black text-rose-400">{wrongCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">En Uzun Seri</span>
                    <span className="text-2xl font-black text-orange-400">{maxStreak}x</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>LGS Hata & Tuzak Analizi ({mistakesList.length} Hata)</span>
                  </div>

                  {mistakesList.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {mistakesList.map((m, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 p-3 rounded-xl border border-red-900/30 flex items-start justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base font-extrabold text-white font-mono-numbers">
                                {m.num}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Senin seçimin: <span className="text-rose-400 font-bold">{m.chosen}</span>
                              </span>
                              <span className="text-slate-600">·</span>
                              <span className="text-[11px] text-emerald-400 font-bold">
                                Doğrusu: {m.correct ? 'ASAL' : 'ASAL DEĞİL'}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{m.tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl text-center text-xs text-emerald-300">
                      🎉 Tebrikler! Hiçbir soruda yanılmadınız. 1-100 arası asal sayıları mükemmel biliyorsunuz!
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    🔄 Tekrar Yarış (Yeni 60s)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LGS TUZAKLARI & 25 ASAL SAYI REHBERİ                                */}
        {/* ========================================================================= */}
        {activeTab === 'lgs' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>1-100 Arası 25 Asal Sayı ve Sınav Taktikleri</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                LGS Matematik çarpanlar ve katlar konusunda asal sayılar soru köklerinin temelini oluşturur. İşte sınavda en çok sorulan ve karıştırılan 25 asal sayının tam listesi ve dikkat edilmesi gereken tuzaklar:
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  25 Asal Sayı (Onluk Aralıklarına Göre)
                </span>
                <span className="text-xs text-slate-400">Ezberlemesi en kolay gruplama</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">1 - 10 Arası (4 adet):</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">2, 3, 5, 7</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">11 - 20 Arası (4 adet):</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">11, 13, 17, 19</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">21 - 30 Arası (2 adet):</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">23, 29</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">31 - 40 Arası (2 adet):</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">31, 37</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">41 - 50 Arası (3 adet):</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">41, 43, 47</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">51 - 60 Arası (2 adet):</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">53, 59</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">61 - 70 Arası (2 adet):</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">61, 67</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">71 - 80 Arası (3 adet):</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">71, 73, 79</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">81 - 90 Arası (2 adet):</span>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">83, 89</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1 font-semibold">91 - 100 Arası (1 adet):</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono-numbers">97 (Tek Asal!)</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>1. En Büyük LGS Tuzağı: 91 Sayısı</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Öğrencilerin %70'i 91'i asal zanneder. Çünkü 2, 3 ve 5'e bölünmez. Fakat <strong className="text-amber-300 font-mono-numbers">7 × 13 = 91</strong>'dir! 91 bileşik bir sayıdır. Asla unutma!
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>2. Rakamları Toplamı 3'ün Katı Olanlar: 51, 57, 87</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tek sayı oldukları için asal gibi görünürler:
                  <br />• 51 → 5+1 = 6 (3'ün katı, 3 × 17 = 51)
                  <br />• 57 → 5+7 = 12 (3'ün katı, 3 × 19 = 57)
                  <br />• 87 → 8+7 = 15 (3'ün katı, 3 × 29 = 87)
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span>3. Altın Kural: 2 En Küçük ve Tek Çift Asal</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Soru kökünde "A ve B asal sayılar olmak üzere A + B = 17" gibi bir ifade varsa, toplam tek sayı olduğu için toplananlardan biri MUTLAKA <strong className="text-sky-300">2</strong> olmak zorundadır!
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Aralarında Asallık (LGS Favorisi)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  İki sayının "Aralarında Asal" olması için sayıların kendilerinin asal olması ŞART DEĞİLDİR! Örneğin 8 (bileşik) ve 9 (bileşik) sayıları aralarında asaldır çünkü ortak bölenleri sadece 1'dir. Ardışık sayılar her zaman aralarında asaldır.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>8. Sınıf LGS Matematik Hazırlık Projesi · Eratosthenes Sieve Modeli</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Akıllı Tahta & Mobil Uyumlu</span>
            <span className="text-slate-600">·</span>
            <button
              onClick={handleDownloadSingleHtml}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Tek Dosya HTML İndir
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
