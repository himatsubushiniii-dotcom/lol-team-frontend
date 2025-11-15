import React, { useState, useRef } from 'react';
import { ChevronRight, Share2, Download, Sword, Shield, Skull, Trophy, Clock, Target, Sparkles, Check, X, Award, Flame } from 'lucide-react';

// モックデータ生成関数
const generateMockStats = (gameName: string) => {
  // 名前のハッシュ値を使ってランダムだけど一貫性のあるデータを生成
  const hash = gameName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 1000;

  return {
    totalKills: 800 + (seed * 2),
    totalDeaths: 600 + seed,
    totalAssists: 1500 + (seed * 3),
    playTime: 150 + Math.floor(seed / 5),
    winStreak: 5 + Math.floor(seed / 100),
    loseStreak: 3 + Math.floor(seed / 150),
    avgKda: (2.5 + (seed / 500)).toFixed(2),
    pentaKills: Math.floor(seed / 200),
    deathTime: 8 + Math.floor(seed / 100),
    mostKills: 15 + Math.floor(seed / 50),
    longestGame: 35 + Math.floor(seed / 30),
    favoriteChampion: ['Yasuo', 'Zed', 'Lee Sin', 'Ahri', 'Jinx', 'Thresh', 'Ezreal'][seed % 7],
    totalGames: 200 + seed,
    totalWins: 100 + Math.floor(seed / 2),
  };
};

interface StatsData {
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  playTime: number;
  winStreak: number;
  loseStreak: number;
  avgKda: string;
  pentaKills: number;
  deathTime: number;
  mostKills: number;
  longestGame: number;
  favoriteChampion: string;
  totalGames: number;
  totalWins: number;
}

interface QuizAnswer {
  selected: number;
  correct: number;
}

const LoLFlashback = () => {
  const [step, setStep] = useState<'input' | 'playing'>('input');
  const [currentPage, setCurrentPage] = useState(0);
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, QuizAnswer>>({});
  const [error, setError] = useState('');
  const screenshotRef = useRef<HTMLDivElement>(null);

  const totalPages = 9;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const selectAnswer = (questionId: string, answerIndex: number, correctIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
    setShowAnswer({ ...showAnswer, [questionId]: { selected: answerIndex, correct: correctIndex } });
    
    setTimeout(() => {
      nextPage();
    }, 2500);
  };

  const getScore = () => {
    let correct = 0;
    Object.keys(showAnswer).forEach(key => {
      if (showAnswer[key].selected === showAnswer[key].correct) correct++;
    });
    return correct;
  };

  // プレイヤーデータ取得（モック版）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gameName || !tagLine) {
      setError('Riot IDを入力してください');
      return;
    }

    // モックデータ生成
    const mockStats = generateMockStats(gameName);
    setStatsData(mockStats);
    
    setStep('playing');
    setCurrentPage(0);
  };

  const handleScreenshot = async () => {
    alert('スクリーンショット機能は近日実装予定です');
  };

  const shareToSNS = () => {
    const score = getScore();
    const text = `私の2025年LoL Flashback!\nサモナー: ${gameName}#${tagLine}\n正解数: ${score}/5\n#LoLFlashback #LeagueOfLegends`;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
  };

  // 入力画面
  const InputPage = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6 relative">
            <Trophy className="w-32 h-32 text-yellow-400 animate-bounce-slow" />
            <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent animate-gradient">
            LoL 2025
          </h1>
          <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            FLASHBACK
          </h2>
          <p className="text-xl text-blue-200/80 mb-2">あなたのサモナーズリフトの旅を振り返ろう</p>
          <p className="text-sm text-blue-300/60">自分のことどれくらい知ってる？</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8 rounded-2xl border-2 border-yellow-500/30 shadow-2xl backdrop-blur-sm">
            <label className="block text-yellow-400 font-bold mb-3 text-lg">
              Riot ID を入力
            </label>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Game Name"
                className="flex-1 px-4 py-4 bg-slate-900/80 border-2 border-blue-500/50 rounded-lg text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all text-lg"
                required
              />
              <div className="flex items-center">
                <span className="text-3xl text-blue-400 font-bold">#</span>
              </div>
              <input
                type="text"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                placeholder="Tag"
                className="w-32 px-4 py-4 bg-slate-900/80 border-2 border-blue-500/50 rounded-lg text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all text-lg"
                required
              />
            </div>

            <p className="text-sm text-blue-300/60 mt-3">
              例: Hide on bush#KR1
            </p>

            {error && (
              <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300 flex items-center gap-2">
                <X className="w-5 h-5" />
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-5 rounded-xl font-black text-xl transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50"
          >
            始める <ChevronRight className="w-6 h-6" />
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p className="text-blue-300/70 text-sm">🎮 2025年のあなたの統計を分析</p>
          <p className="text-blue-300/70 text-sm">🎯 クイズに答えて自分のプレイスタイルを確認</p>
          <p className="text-blue-300/70 text-sm">📱 結果をSNSでシェア</p>
          <p className="text-yellow-400/80 text-xs mt-4">※ 現在はデモ版です。入力したRiot IDに基づいて統計データが生成されます。</p>
        </div>
      </div>
    </div>
  );

  // ページ0: オープニング
  const OpeningPage = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 animate-fade-in">
      <div className="mb-8">
        <div className="relative inline-block">
          <Trophy className="w-40 h-40 text-yellow-400 animate-bounce-slow" />
          <div className="absolute inset-0 bg-yellow-400/20 blur-3xl animate-pulse" />
        </div>
      </div>
      <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
        {gameName}#{tagLine}
      </h1>
      <p className="text-3xl text-blue-200 mb-4">の2025年を振り返ろう</p>
      <p className="text-xl text-blue-300/70 mb-12">準備はいい？</p>
      <button
        onClick={nextPage}
        className="px-12 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black text-2xl rounded-xl hover:scale-110 transition-transform flex items-center gap-3 shadow-2xl shadow-yellow-500/50"
      >
        スタート <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );

  // ページ1: 統計サマリー1
  const StatsPage1 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 animate-fade-in">
      <h2 className="text-6xl font-black text-yellow-400 mb-16 animate-slide-down">2025年の戦績</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {[
          { icon: Sword, value: statsData?.totalKills || 0, label: '総キル数', gradient: 'from-blue-500 to-blue-600' },
          { icon: Skull, value: statsData?.totalDeaths || 0, label: '総デス数', gradient: 'from-red-500 to-red-600' },
          { icon: Shield, value: statsData?.totalAssists || 0, label: '総アシスト数', gradient: 'from-green-500 to-green-600' },
          { icon: Clock, value: statsData?.playTime || 0, label: 'プレイ時間（時間）', gradient: 'from-purple-500 to-purple-600' },
        ].map((stat, index) => (
          <div
            key={index}
            className={`group relative bg-gradient-to-br ${stat.gradient} p-8 rounded-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <stat.icon className="w-16 h-16 text-white mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-7xl font-black text-white mb-2 group-hover:scale-110 transition-transform">{stat.value.toLocaleString()}</div>
            <div className="text-xl text-white/90 font-bold">{stat.label}</div>
          </div>
        ))}
      </div>
      <button
        onClick={nextPage}
        className="mt-16 px-10 py-4 bg-yellow-500 text-black font-black text-lg rounded-xl hover:scale-110 transition-transform flex items-center gap-2 shadow-2xl"
      >
        次へ <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );

  // ページ2: 統計サマリー2
  const StatsPage2 = () => (
    <div className="flex flex-col items-center justify-center h-full px-8 animate-fade-in">
      <h2 className="text-6xl font-black text-yellow-400 mb-16 animate-slide-down">もっと深掘り</h2>
      <div className="w-full max-w-3xl space-y-4">
        {[
          { label: '最長連勝記録', value: `${statsData?.winStreak || 0}連勝`, gradient: 'from-blue-500/30 to-blue-600/30', border: 'blue-400', icon: Flame },
          { label: '最長連敗記録', value: `${statsData?.loseStreak || 0}連敗`, gradient: 'from-red-500/30 to-red-600/30', border: 'red-400', icon: Skull },
          { label: '平均KDA', value: statsData?.avgKda || '0.00', gradient: 'from-yellow-500/30 to-yellow-600/30', border: 'yellow-400', icon: Award },
          { label: 'ペンタキル', value: `${statsData?.pentaKills || 0}回`, gradient: 'from-purple-500/30 to-purple-600/30', border: 'purple-400', icon: Trophy },
        ].map((stat, index) => (
          <div
            key={index}
            className={`group bg-gradient-to-r ${stat.gradient} p-6 rounded-2xl border-2 border-${stat.border} hover:scale-105 transition-all duration-300 animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <stat.icon className="w-10 h-10 text-white" />
                <span className="text-2xl text-white font-bold">{stat.label}</span>
              </div>
              <span className="text-6xl font-black text-white group-hover:scale-110 transition-transform">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-12 text-2xl text-blue-200 font-bold animate-pulse">
        さあ、クイズに挑戦！
      </p>
      <button
        onClick={nextPage}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-lg rounded-xl hover:scale-110 transition-transform flex items-center gap-2 shadow-2xl"
      >
        クイズスタート <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );

  // クイズページ
  const QuizPage = ({ question, questionId, options, correctIndex, icon: Icon, explanation }: {
    question: string;
    questionId: string;
    options: string[];
    correctIndex: number;
    icon: React.ElementType;
    explanation: string;
  }) => {
    const answered = showAnswer[questionId] !== undefined;
    const isCorrect = answered && showAnswer[questionId].selected === showAnswer[questionId].correct;

    return (
      <div className="flex flex-col items-center justify-center h-full px-8 animate-fade-in">
        <div className="mb-8">
          <Icon className="w-32 h-32 text-yellow-400 animate-bounce-slow" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-16 text-center max-w-4xl leading-tight">
          {question}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-8">
          {options.map((option, index) => {
            const isSelected = showAnswer[questionId]?.selected === index;
            const isCorrectAnswer = answered && index === correctIndex;
            const isWrongAnswer = answered && isSelected && index !== correctIndex;

            return (
              <button
                key={index}
                onClick={() => !answered && selectAnswer(questionId, index, correctIndex)}
                disabled={answered}
                className={`p-8 rounded-2xl font-black text-2xl transition-all duration-300 relative overflow-hidden ${
                  answered
                    ? isCorrectAnswer
                      ? 'bg-green-500 text-white scale-105 border-4 border-green-300 shadow-2xl shadow-green-500/50'
                      : isWrongAnswer
                      ? 'bg-red-500 text-white border-4 border-red-300 shadow-2xl shadow-red-500/50'
                      : 'bg-gray-700 text-gray-400 opacity-50'
                    : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-2 border-blue-400 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50'
                }`}
              >
                {answered && (
                  <div className="absolute top-3 right-3">
                    {isCorrectAnswer ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : isWrongAnswer ? (
                      <X className="w-8 h-8 text-white" />
                    ) : null}
                  </div>
                )}
                {option}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`mt-8 p-6 rounded-2xl max-w-2xl text-center animate-slide-up ${
            isCorrect ? 'bg-green-500/20 border-2 border-green-400' : 'bg-red-500/20 border-2 border-red-400'
          }`}>
            <p className={`text-3xl font-black mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '🎉 正解！' : '😢 不正解！'}
            </p>
            <p className="text-xl text-white">{explanation}</p>
          </div>
        )}
      </div>
    );
  };

  // 結果ページ
  const ResultPage = () => {
    const score = getScore();
    const total = Object.keys(showAnswer).length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <div ref={screenshotRef} className="flex flex-col items-center justify-center h-full px-8 animate-fade-in">
        <h2 className="text-6xl font-black text-yellow-400 mb-8">最終結果</h2>
        
        <div className="relative mb-12">
          <div className="text-9xl font-black text-white">
            {score} / {total}
          </div>
          <div className="absolute -inset-4 bg-yellow-400/20 blur-3xl -z-10 animate-pulse" />
        </div>

        <div className="text-4xl font-bold text-blue-200 mb-4">
          正解率: {percentage}%
        </div>

        <p className="text-3xl text-white mb-16 font-bold">
          {percentage === 100 ? '🏆 完璧！真のサモナーだ！' :
           percentage >= 80 ? '🎯 素晴らしい！よく知ってるね！' :
           percentage >= 60 ? '👍 まあまあ！' :
           percentage >= 40 ? '📚 もっと自分を知ろう！' :
           '🎮 まだまだ伸びしろがあるぞ！'}
        </p>

        <div className="flex gap-6">
          <button
            onClick={handleScreenshot}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black rounded-xl hover:scale-110 transition-transform flex items-center gap-2 shadow-2xl text-lg"
          >
            <Download className="w-6 h-6" />
            スクリーンショット
          </button>
          <button
            onClick={shareToSNS}
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl hover:scale-110 transition-transform flex items-center gap-2 shadow-2xl text-lg"
          >
            <Share2 className="w-6 h-6" />
            SNSで共有
          </button>
        </div>

        <button
          onClick={() => {
            setStep('input');
            setCurrentPage(0);
            setAnswers({});
            setShowAnswer({});
            setGameName('');
            setTagLine('');
          }}
          className="mt-12 px-8 py-4 bg-gray-700 text-white font-bold rounded-xl hover:scale-105 transition-transform"
        >
          最初に戻る
        </button>
      </div>
    );
  };

  if (step === 'input') {
    return <InputPage />;
  }

  const quizData = statsData ? [
    {
      question: "あなたが死んで真っ暗な画面を見つめている時間は？",
      questionId: "deathTime",
      options: [`${statsData.deathTime - 5}時間`, `${statsData.deathTime}時間`, `${statsData.deathTime + 5}時間`, `${statsData.deathTime + 10}時間`],
      correctIndex: 1,
      icon: Skull,
      explanation: `2025年、あなたは合計${statsData.deathTime}時間をデス画面で過ごしました。その時間で何ができたでしょうか...🤔`
    },
    {
      question: "2025年で最も多くキルを取った試合は？",
      questionId: "mostKills",
      options: [`${statsData.mostKills - 10}キル`, `${statsData.mostKills - 5}キル`, `${statsData.mostKills}キル`, `${statsData.mostKills + 5}キル`],
      correctIndex: 2,
      icon: Sword,
      explanation: `最高記録は${statsData.mostKills}キル！その試合は完全にキャリーしましたね！⚔️`
    },
    {
      question: "あなたの最長試合時間は？",
      questionId: "longestGame",
      options: [`${statsData.longestGame - 10}分`, `${statsData.longestGame - 5}分`, `${statsData.longestGame}分`, `${statsData.longestGame + 5}分`],
      correctIndex: 2,
      icon: Clock,
      explanation: `${statsData.longestGame}分の激戦！最後まで諦めなかった証です！⏰`
    },
    {
      question: "2025年で最もプレイしたチャンピオンは？",
      questionId: "favoriteChampion",
      options: [statsData.favoriteChampion, 'Yasuo', 'Zed', 'Ahri'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
      correctIndex: 0,
      icon: Target,
      explanation: `${statsData.favoriteChampion}を愛用！このチャンピオンのことなら任せてください！🎯`
    },
    {
      question: "2025年の総ゲーム数は？",
      questionId: "totalGames",
      options: [`${statsData.totalGames - 100}試合`, `${statsData.totalGames - 50}試合`, `${statsData.totalGames}試合`, `${statsData.totalGames + 50}試合`],
      correctIndex: 2,
      icon: Trophy,
      explanation: `なんと${statsData.totalGames}試合もプレイ！LoLへの情熱が伝わります！🏆`
    },
  ] : [];

  const pages = [
    <OpeningPage key="opening" />,
    <StatsPage1 key="stats1" />,
    <StatsPage2 key="stats2" />,
    ...quizData.map((quiz, index) => (
      <QuizPage key={`quiz-${index}`} {...quiz} />
    )),
    <ResultPage key="result" />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>

      {/* 背景エフェクト */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(10,132,255,0.15)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(200,155,60,0.15)_0%,transparent_50%)]" />

      {/* プログレスバー */}
      {step === 'playing' && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 transition-all duration-500"
            style={{ width: `${(currentPage / (totalPages - 1)) * 100}%` }}
          />
        </div>
      )}

      {/* メインコンテンツ */}
      {step === 'playing' && (
        <div className="relative h-screen pt-1">
          {pages[currentPage]}
        </div>
      )}

      {/* ページインジケーター */}
      {step === 'playing' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-40">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentPage
                  ? 'w-8 bg-yellow-400'
                  : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoLFlashback;