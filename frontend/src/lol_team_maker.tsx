import React, { useState, useMemo, useEffect } from "react";
import { Users, Trash2, Shuffle, Loader2 } from "lucide-react";

// ロールの定義
const ROLES = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

// 全てのランクオプションを定義
const RANK_OPTIONS = [
  { tier: "CHALLENGER", rank: "I", display: "CHALLENGER I" },
  { tier: "GRANDMASTER", rank: "I", display: "GRANDMASTER I" },
  { tier: "MASTER", rank: "I", display: "MASTER I" },
  { tier: "DIAMOND", rank: "I", display: "DIAMOND I" },
  { tier: "DIAMOND", rank: "II", display: "DIAMOND II" },
  { tier: "DIAMOND", rank: "III", display: "DIAMOND III" },
  { tier: "DIAMOND", rank: "IV", display: "DIAMOND IV" },
  { tier: "EMERALD", rank: "I", display: "EMERALD I" },
  { tier: "EMERALD", rank: "II", display: "EMERALD II" },
  { tier: "EMERALD", rank: "III", display: "EMERALD III" },
  { tier: "EMERALD", rank: "IV", display: "EMERALD IV" },
  { tier: "PLATINUM", rank: "I", display: "PLATINUM I" },
  { tier: "PLATINUM", rank: "II", display: "PLATINUM II" },
  { tier: "PLATINUM", rank: "III", display: "PLATINUM III" },
  { tier: "PLATINUM", rank: "IV", display: "PLATINUM IV" },
  { tier: "GOLD", rank: "I", display: "GOLD I" },
  { tier: "GOLD", rank: "II", display: "GOLD II" },
  { tier: "GOLD", rank: "III", display: "GOLD III" },
  { tier: "GOLD", rank: "IV", display: "GOLD IV" },
  { tier: "SILVER", rank: "I", display: "SILVER I" },
  { tier: "SILVER", rank: "II", display: "SILVER II" },
  { tier: "SILVER", rank: "III", display: "SILVER III" },
  { tier: "SILVER", rank: "IV", display: "SILVER IV" },
  { tier: "BRONZE", rank: "I", display: "BRONZE I" },
  { tier: "BRONZE", rank: "II", display: "BRONZE II" },
  { tier: "BRONZE", rank: "III", display: "BRONZE III" },
  { tier: "BRONZE", rank: "IV", display: "BRONZE IV" },
  { tier: "IRON", rank: "I", display: "IRON I" },
  { tier: "IRON", rank: "II", display: "IRON II" },
  { tier: "IRON", rank: "III", display: "IRON III" },
  { tier: "IRON", rank: "IV", display: "IRON IV" },
];

// ロールアイコン(SVG)
const RoleIcon = ({ role, size = 24 }: { role: string; size?: number }) => {
  const icons: { [key: string]: JSX.Element } = {
    TOP: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <g fill="currentColor" fillRule="nonzero">
          <path d="m19 3-4 4H7v8l-4 4V3z"></path>
          <path d="m5 21 4-4h8V9l4-4v16z" opacity="0.2"></path>
          <path d="M10 10h4v4h-4z" opacity="0.2"></path>
        </g>
      </svg>
    ),
    JUNGLE: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          fill="currentColor"
          fillRule="nonzero"
          d="M5.14 2c1.58 1.21 5.58 5.023 6.976 9.953s0 10.047 0 10.047c-2.749-3.164-5.893-5.2-6.18-5.382l-.02-.013C5.45 13.814 3 8.79 3 8.79c3.536.867 4.93 4.279 4.93 4.279C7.558 8.698 5.14 2 5.14 2m14.976 5.907s-1.243 2.471-1.814 4.604c-.235.878-.285 2.2-.29 3.058v.282c.003.347.01.568.01.568s-1.738 2.397-3.38 3.678a27.5 27.5 0 0 0-.208-5.334c.928-2.023 2.846-5.454 5.682-6.856m-2.124-5.331s-2.325 3.052-2.836 6.029c-.11.636-.201 1.194-.284 1.695-.379.584-.73 1.166-1.05 1.733-.033-.125-.06-.25-.095-.375a21 21 0 0 0-1.16-3.08c.053-.146.103-.29.17-.438 0 0 1.814-3.78 5.255-5.564"
        ></path>
      </svg>
    ),
    MID: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <g fill="currentColor" fillRule="nonzero">
          <path
            d="m15 3-4 4H7v4l-4 4V3zM9 21l4-4h4v-4l4-4v12z"
            opacity="0.2"
          ></path>
          <path d="M18 3h3v3L6 21H3v-3z"></path>
        </g>
      </svg>
    ),
    ADC: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <g fill="currentColor" fillRule="nonzero">
          <path d="m19 3-4 4H7v8l-4 4V3z" opacity="0.2"></path>
          <path d="m5 21 4-4h8V9l4-4v16z"></path>
          <path d="M10 10h4v4h-4z" opacity="0.2"></path>
        </g>
      </svg>
    ),
    SUPPORT: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          fill="currentColor"
          fillRule="nonzero"
          d="M12.833 10.833 14.5 17.53v.804L12.833 20h-1.666L9.5 18.333v-.804l1.667-6.696zM7 7.5 9.5 10l-1.667 4.167-2.5-2.5L6.167 10h-2.5L2 7.5zm15 0L20.333 10h-2.5l.834 1.667-2.5 2.5L14.5 10 17 7.5zM13.743 5l.757.833v.834l-1.667 2.5h-1.666L9.5 6.667v-.834L10.257 5z"
        ></path>
      </svg>
    ),
  };
  return icons[role] || null;
};

// ティアからレートへの変換(簡易版)
const ratingToTier = (rating) => {
  if (rating >= 3600) return { tier: "CHALLENGER", rank: "I" };
  if (rating >= 3200) return { tier: "GRANDMASTER", rank: "I" };
  if (rating >= 2800) return { tier: "MASTER", rank: "I" };

  const tierRanges = [
    { min: 2400, tier: "DIAMOND" },
    { min: 2000, tier: "EMERALD" },
    { min: 1600, tier: "PLATINUM" },
    { min: 1200, tier: "GOLD" },
    { min: 800, tier: "SILVER" },
    { min: 400, tier: "BRONZE" },
    { min: 0, tier: "IRON" },
  ];

  for (const range of tierRanges) {
    if (rating >= range.min) {
      const withinTier = rating - range.min;
      if (withinTier >= 300) return { tier: range.tier, rank: "I" };
      if (withinTier >= 200) return { tier: range.tier, rank: "II" };
      if (withinTier >= 100) return { tier: range.tier, rank: "III" };
      return { tier: range.tier, rank: "IV" };
    }
  }

  return { tier: "IRON", rank: "IV" };
};

const tierToRating = (tier, rank, lp) => {
  const tierValues = {
    IRON: 0,
    BRONZE: 400,
    SILVER: 800,
    GOLD: 1200,
    PLATINUM: 1600,
    EMERALD: 2000,
    DIAMOND: 2400,
    MASTER: 2800,
    GRANDMASTER: 3200,
    CHALLENGER: 3600,
  };
  const rankValues = { IV: 0, III: 100, II: 200, I: 300 };
  return (tierValues[tier] || 0) + (rankValues[rank] || 0) + (lp || 0);
};

// Riot APIからランク情報を取得
const fetchRankFromAPI = async (gameName, tagLine) => {
  const API_URL = "https://lol-team-backend.onrender.com";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameName: gameName,
        tagLine: tagLine,
      }),
    });

    if (!response.ok) {
      throw new Error("");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("正しいアカウントを入力してください。(例:Player#JP1) ");
  }
};

// モックAPIレスポンス(テスト用・本番では削除)
const mockFetchRank = async (summonerName, tag) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const tiers = [
    "IRON",
    "BRONZE",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "EMERALD",
    "DIAMOND",
  ];
  const ranks = ["IV", "III", "II", "I"];
  const tier = tiers[Math.floor(Math.random() * tiers.length)];
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  const lp = Math.floor(Math.random() * 100);
  return { tier, rank, lp, rating: tierToRating(tier, rank, lp) };
};

// チーム分けアルゴリズム
const divideTeams = (players, previousTeam1 = null) => {
  let bestDiff = Infinity;
  let bestTeams = null;

  const n = players.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    if (countBits(mask) !== 5) continue;

    const team1 = [];
    const team2 = [];

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) team1.push(players[i]);
      else team2.push(players[i]);
    }

    // 前回のチーム1と同じ構成をスキップ
    if (previousTeam1) {
      const team1IDs = team1.map((p) => p.id).sort();
      const prevTeam1IDs = previousTeam1.map((p) => p.id).sort();
      if (JSON.stringify(team1IDs) === JSON.stringify(prevTeam1IDs)) {
        continue;
      }
    }

    const sum1 = team1.reduce((s, p) => s + p.rating, 0);
    const sum2 = team2.reduce((s, p) => s + p.rating, 0);
    const diff = Math.abs(sum1 - sum2);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestTeams = { team1, team2 };
    }
  }

  return bestTeams;
};

const countBits = (n) => {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
};

// ロール配分
const assignRoles = (team) => {
  const roleOrder = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];
  const availableRoles = [...roleOrder];
  const assignments = [];

  const sorted = [...team].sort(
    (a, b) => a.preferredRoles.length - b.preferredRoles.length
  );

  sorted.forEach((player) => {
    const possibleRoles = availableRoles.filter((r) =>
      player.preferredRoles.includes(r)
    );
    const assignedRole =
      possibleRoles.length > 0 ? possibleRoles[0] : availableRoles[0];
    assignments.push({ ...player, assignedRole });
    availableRoles.splice(availableRoles.indexOf(assignedRole), 1);
  });

  return assignments.sort(
    (a, b) =>
      roleOrder.indexOf(a.assignedRole) - roleOrder.indexOf(b.assignedRole)
  );
};

export default function LoLTeamMaker() {
  const [players, setPlayers] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [addResults, setAddResults] = useState(null);
  const [sortType, setSortType] = useState("none");
  const [currentProcessing, setCurrentProcessing] = useState("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // ローカルストレージからプレイヤーを読み込む（初回のみ）
  useEffect(() => {
    const savedPlayers = localStorage.getItem("lol_team_players");
    if (savedPlayers) {
      try {
        setPlayers(JSON.parse(savedPlayers));
      } catch (e) {
        console.error("Failed to load saved players:", e);
      }
    }
  }, []);

  // プレイヤーリストが変更されたら保存
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem("lol_team_players", JSON.stringify(players));
    } else {
      localStorage.removeItem("lol_team_players");
    }
  }, [players]);

  // ソート済みプレイヤーリストを取得
  const sortedPlayers = useMemo(() => {
    const sorted = [...players];

    switch (sortType) {
      case "name":
        return sorted.sort((a, b) => {
          const nameA = `${a.summonerName}#${a.tag}`.toLowerCase();
          const nameB = `${b.summonerName}#${b.tag}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case "rating-high":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "rating-low":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [players, sortType]);

  // 全ロール選択/解除ボタン
  const toggleAllRoles = (playerId) => {
    setPlayers(
      players.map((player) => {
        if (player.id === playerId) {
          const allSelected = player.preferredRoles.length === ROLES.length;
          return {
            ...player,
            preferredRoles: allSelected ? [] : [...ROLES],
          };
        }
        return player;
      })
    );
    setResult(null);
  };

  // プレイヤーのロールを切り替える関数
  const togglePlayerRole = (playerId, role) => {
    setPlayers(
      players.map((player) => {
        if (player.id === playerId) {
          const hasRole = player.preferredRoles.includes(role);
          const newRoles = hasRole
            ? player.preferredRoles.filter((r) => r !== role)
            : [...player.preferredRoles, role];
          return { ...player, preferredRoles: newRoles };
        }
        return player;
      })
    );
    setResult(null);
  };
  // ✅ ここに追加
  const changePlayerRank = (playerId, newTier, newRank) => {
    setPlayers(
      players.map((player) => {
        if (player.id === playerId) {
          const newRating = tierToRating(newTier, newRank, 0);
          return {
            ...player,
            tier: newTier,
            rank: newRank,
            lp: 0,
            rating: newRating,
          };
        }
        return player;
      })
    );
    setResult(null);
  };
  const removePlayer = (id) => {
    setPlayers(players.filter((p) => p.id !== id));
    setResult(null);
  };
  const addPlayer = async () => {
    setAddResults(null);

    if (!currentInput.trim()) {
      return;
    }

    // 改行で分割してプレイヤーリストを作成
    const inputLines = currentInput.split("\n").filter((line) => line.trim());

    if (inputLines.length === 0) {
      return;
    }

    // 10人を超える場合はチェック
    if (players.length + inputLines.length > 10) {
      setAddResults({
        success: [],
        failed: inputLines.map((line) => ({
          input: line,
          error: `登録上限です。現在${players.length}人登録済み。あと${
            10 - players.length
          }人まで追加可能です。`,
        })),
      });
      return;
    }

    setLoading(true);
    setTotalCount(inputLines.length);
    setProcessedCount(0);
    const successList = [];
    const failedList = [];

    for (let i = 0; i < inputLines.length; i++) {
      const line = inputLines[i];
      setCurrentProcessing(line);
      setProcessedCount(i + 1);
      // 不要な文字を削除してクリーンアップ
      let trimmedLine = line
        .trim()
        .replace(/\u2066/g, "") // ⁦を削除
        .replace(/\u2069/g, "") // ⁩を削除
        .replace(/\s+/g, "") // 全ての空白（半角・全角）を削除
        .replace(/がロビーに参加しました。$/g, ""); // 語尾の「がロビーに参加しました。」を削除

      if (!trimmedLine.includes("#")) {
        failedList.push({
          input: trimmedLine,
          error: "サモナー名#タグの形式で入力してください(例:Player#JP1)",
        });
        continue;
      }
      // 重複チェック
      const [checkName, checkTag] = trimmedLine.split("#");
      const isDuplicate = players.some(
        (p) =>
          p.summonerName.toLowerCase() === checkName.toLowerCase() &&
          p.tag.toLowerCase() === checkTag.toLowerCase()
      );

      if (isDuplicate) {
        failedList.push({
          input: trimmedLine,
          error: "既に登録されています",
        });
        continue;
      }

      try {
        const [summonerName, tag] = trimmedLine.split("#");

        // 本番環境ではこちらを使用
        const rankData = await fetchRankFromAPI(summonerName, tag);

        const newPlayer = {
          id: Date.now() + Math.random(), // 同時追加対応
          summonerName,
          tag,
          preferredRoles: [...ROLES], // デフォルトで全ロール選択
          ...rankData,
        };

        successList.push({
          input: trimmedLine,
          player: newPlayer,
        });
      } catch (error) {
        failedList.push({
          input: trimmedLine,
          error: error.message || "プレイヤー情報の取得に失敗しました",
        });
      }
    }

    // 成功したプレイヤーを追加
    if (successList.length > 0) {
      setPlayers([...players, ...successList.map((s) => s.player)]);
    }

    // 結果を表示
    setAddResults({
      success: successList,
      failed: failedList,
    });

    // 失敗したプレイヤーのみ入力欄に残す
    if (failedList.length > 0) {
      setCurrentInput(failedList.map((f) => f.input).join("\n"));
    } else {
      setCurrentInput("");
    }

    setLoading(false);
    setCurrentProcessing("");
    setProcessedCount(0);
    setTotalCount(0);
  };
  const createTeams = () => {
    if (players.length !== 10) {
      alert("10人揃ってから実行してください");
      return;
    }

    const teams = divideTeams(players, result?.blueTeam);
    const team1WithRoles = assignRoles(teams.team1);
    const team2WithRoles = assignRoles(teams.team2);

    const avgRating1 = team1WithRoles.reduce((s, p) => s + p.rating, 0) / 5;
    const avgRating2 = team2WithRoles.reduce((s, p) => s + p.rating, 0) / 5;

    const avgTier1 = ratingToTier(Math.round(avgRating1));
    const avgTier2 = ratingToTier(Math.round(avgRating2));

    setResult({
      blueTeam: team1WithRoles,
      redTeam: team2WithRoles,
      avgRating1,
      avgRating2,
      avgTier1,
      avgTier2,
      diff: Math.abs(avgRating1 - avgRating2),
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 50%, rgba(10, 132, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(200, 155, 60, 0.15) 0%, transparent 50%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2 flex items-center justify-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <Users className="w-10 h-10" style={{ color: "#C89B3C" }} />
            LoL カスタムチーム分けシステム
          </h1>
          <p className="text-blue-300">公平なチーム分けとロール配分</p>
        </div>
        {players.length < 10 && (
          <div
            className="rounded-lg p-6 mb-6 border-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(1, 10, 19, 0.9) 0%, rgba(0, 9, 19, 0.95) 100%)",
              borderColor: "#0A1428",
              boxShadow:
                "0 0 30px rgba(10, 132, 255, 0.3), inset 0 0 30px rgba(10, 132, 255, 0.05)",
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: "#C89B3C" }}>
              プレイヤー追加
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className="font-semibold mb-2 block"
                  style={{ color: "#C89B3C" }}
                >
                  サモナー名#タグ
                  (複数行で一括追加可能です。カスタムロビーメッセージを張り付けて追加することできます。)
                </label>
                <textarea
                  placeholder="例:&#10;Player1#JP1がロビーに参加しました&#10;Player2#JP1がロビーに参加しました&#10;Player3#JP1がロビーに参加しました"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 rounded text-white placeholder-white/50 border-2 border-blue-500/50 focus:border-blue-400 focus:outline-none transition-all"
                  style={{
                    background: "rgba(1, 10, 19, 0.6)",
                    boxShadow: "0 0 10px rgba(10, 132, 255, 0.2)",
                  }}
                />
                <p className="mt-2 text-sm text-blue-300">
                  💡
                  改行区切りで複数のプレイヤーを一括追加できます。やりたいロールは登録後に選択できます。
                </p>
              </div>

              {addResults && (
                <div className="space-y-3">
                  {addResults.success.length > 0 && (
                    <div
                      className="rounded-lg p-4 border-2 border-green-500/50"
                      style={{
                        background: "rgba(34, 197, 94, 0.1)",
                      }}
                    >
                      <h3 className="font-bold text-green-400 mb-2">
                        ✅ 追加成功 ({addResults.success.length}人)
                      </h3>
                      <div className="space-y-1">
                        {addResults.success.map((item, idx) => (
                          <div key={idx} className="text-sm text-green-300">
                            • {item.input}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {addResults.failed.length > 0 && (
                    <div
                      className="rounded-lg p-4 border-2 border-red-500/50"
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                      }}
                    >
                      <h3 className="font-bold text-red-400 mb-2">
                        ❌ 追加失敗 ({addResults.failed.length}人)
                      </h3>
                      <div className="space-y-2">
                        {addResults.failed.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="text-red-300">• {item.input}</div>
                            <div className="text-red-400 ml-4 text-xs">
                              → {item.error}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {loading && currentProcessing && (
                <div
                  className="rounded-lg p-3 border-2 border-blue-500/50"
                  style={{
                    background: "rgba(10, 132, 255, 0.1)",
                  }}
                >
                  <div className="text-blue-300 text-sm mb-2">
                    処理中: {currentProcessing}
                  </div>
                  <div className="text-blue-400 text-xs mb-2">
                    進捗: {processedCount}/{totalCount}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(processedCount / totalCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={addPlayer}
                disabled={loading || !currentInput.trim()}
                className="w-full px-6 py-3 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 relative"
                style={{
                  background:
                    loading || !currentInput.trim()
                      ? "rgba(100, 100, 100, 0.5)"
                      : "linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)",
                  border: "2px solid #0A84FF",
                  boxShadow:
                    loading || !currentInput.trim()
                      ? ""
                      : "0 0 20px rgba(10, 132, 255, 0.5)",
                }}
              >
                {loading && (
                  <>
                    <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </>
                )}
                {loading ? "取得中..." : "追加"}
              </button>
            </div>
          </div>
        )}
        {players.length > 0 && (
          <div
            className="rounded-lg p-6 mb-6 border-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(1, 10, 19, 0.9) 0%, rgba(0, 9, 19, 0.95) 100%)",
              borderColor: "#0A1428",
              boxShadow:
                "0 0 30px rgba(10, 132, 255, 0.3), inset 0 0 30px rgba(10, 132, 255, 0.05)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: "#C89B3C" }}>
                登録プレイヤー ({players.length}/10)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortType("none")}
                  className={`px-3 py-1 text-sm rounded transition-all ${
                    sortType === "none" ? "font-bold" : ""
                  }`}
                  style={{
                    background:
                      sortType === "none"
                        ? "linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)"
                        : "rgba(100, 100, 100, 0.3)",
                    color: sortType === "none" ? "#0A1428" : "#C89B3C",
                    border:
                      sortType === "none"
                        ? "2px solid #C89B3C"
                        : "1px solid rgba(200, 155, 60, 0.3)",
                  }}
                >
                  追加順
                </button>
                <button
                  onClick={() => setSortType("name")}
                  className={`px-3 py-1 text-sm rounded transition-all ${
                    sortType === "name" ? "font-bold" : ""
                  }`}
                  style={{
                    background:
                      sortType === "name"
                        ? "linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)"
                        : "rgba(100, 100, 100, 0.3)",
                    color: sortType === "name" ? "#0A1428" : "#C89B3C",
                    border:
                      sortType === "name"
                        ? "2px solid #C89B3C"
                        : "1px solid rgba(200, 155, 60, 0.3)",
                  }}
                >
                  名前順
                </button>
                <button
                  onClick={() => setSortType("rating-high")}
                  className={`px-3 py-1 text-sm rounded transition-all ${
                    sortType === "rating-high" ? "font-bold" : ""
                  }`}
                  style={{
                    background:
                      sortType === "rating-high"
                        ? "linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)"
                        : "rgba(100, 100, 100, 0.3)",
                    color: sortType === "rating-high" ? "#0A1428" : "#C89B3C",
                    border:
                      sortType === "rating-high"
                        ? "2px solid #C89B3C"
                        : "1px solid rgba(200, 155, 60, 0.3)",
                  }}
                >
                  ランク高い順
                </button>
                <button
                  onClick={() => setSortType("rating-low")}
                  className={`px-3 py-1 text-sm rounded transition-all ${
                    sortType === "rating-low" ? "font-bold" : ""
                  }`}
                  style={{
                    background:
                      sortType === "rating-low"
                        ? "linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)"
                        : "rgba(100, 100, 100, 0.3)",
                    color: sortType === "rating-low" ? "#0A1428" : "#C89B3C",
                    border:
                      sortType === "rating-low"
                        ? "2px solid #C89B3C"
                        : "1px solid rgba(200, 155, 60, 0.3)",
                  }}
                >
                  ランク低い順
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="rounded p-3 flex items-center justify-between"
                  style={{
                    background: "rgba(10, 132, 255, 0.05)",
                    border: "1px solid rgba(10, 132, 255, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    {/* プロフィールアイコン */}
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${
                        player.profileIcon || 29
                      }.png`}
                      alt="Profile Icon"
                      className="w-12 h-12 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: "#0A84FF" }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/29.png";
                      }}
                    />
                    <span className="text-white font-semibold w-[180px] truncate block flex-shrink-0">
                      {player.summonerName}#{player.tag}
                    </span>
                    <select
                      value={`${player.tier}-${player.rank}`}
                      onChange={(e) => {
                        const [newTier, newRank] = e.target.value.split("-");
                        changePlayerRank(player.id, newTier, newRank);
                      }}
                      className="font-bold w-[160px] flex-shrink-0 px-2 py-1 rounded cursor-pointer"
                      style={{
                        background: "rgba(200, 155, 60, 0.2)",
                        color: "#C89B3C",
                        border: "2px solid rgba(200, 155, 60, 0.5)",
                      }}
                    >
                      {RANK_OPTIONS.map((option) => (
                        <option
                          key={`${option.tier}-${option.rank}`}
                          value={`${option.tier}-${option.rank}`}
                          style={{ background: "#0A1428", color: "#C89B3C" }}
                        >
                          {option.display}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      {ROLES.map((role) => {
                        const isSelected = player.preferredRoles.includes(role);
                        return (
                          <button
                            key={role}
                            onClick={() => togglePlayerRole(player.id, role)}
                            className="px-2 py-1 rounded text-sm flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                            style={{
                              background: isSelected
                                ? "rgba(10, 132, 255, 0.8)"
                                : "rgba(50, 50, 50, 0.4)",
                              color: isSelected
                                ? "#fff"
                                : "rgba(150, 150, 150, 0.8)",
                              border: isSelected
                                ? "1px solid rgba(10, 132, 255, 0.8)"
                                : "1px solid rgba(100, 100, 100, 0.3)",
                            }}
                          >
                            <RoleIcon role={role} size={14} />
                            {role}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAllRoles(player.id)}
                        className="px-2 py-1 rounded text-xs font-semibold transition-all"
                        style={{
                          background:
                            player.preferredRoles.length === ROLES.length
                              ? "rgba(220, 53, 69, 0.3)"
                              : "rgba(10, 132, 255, 0.3)",
                          color:
                            player.preferredRoles.length === ROLES.length
                              ? "#DC3545"
                              : "#0A84FF",
                          border: "1px solid currentColor",
                        }}
                      >
                        {player.preferredRoles.length === ROLES.length
                          ? "全解除"
                          : "全選択"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={createTeams}
              disabled={players.length !== 10}
              className="mt-4 w-full px-6 py-3 text-white rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
              style={{
                background:
                  players.length === 10
                    ? "linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)"
                    : "rgba(100, 100, 100, 0.3)",
                border:
                  players.length === 10
                    ? "2px solid #C89B3C"
                    : "2px solid rgba(100, 100, 100, 0.5)",
                boxShadow:
                  players.length === 10
                    ? "0 0 30px rgba(200, 155, 60, 0.5)"
                    : "",
                color: players.length === 10 ? "#0A1428" : "#666",
              }}
            >
              <Shuffle className="w-6 h-6" />
              チーム分け実行{" "}
              {players.length !== 10 && `(${10 - players.length}人不足)`}
            </button>
          </div>
        )}

        {result && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              className="rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2"
              style={{
                background:
                  "linear-gradient(135deg, rgba(1, 10, 19, 0.98) 0%, rgba(0, 9, 19, 0.98) 100%)",
                borderColor: "#C89B3C",
                boxShadow: "0 0 50px rgba(200, 155, 60, 0.5)",
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2
                  className="text-3xl font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  チーム分け結果
                </h2>
                <button
                  onClick={() => setResult(null)}
                  className="text-white/70 hover:text-white text-2xl px-4"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div
                  className="rounded-lg p-6 border-2"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(10, 132, 255, 0.05) 100%)",
                    borderColor: "#0A84FF",
                    boxShadow: "0 0 30px rgba(10, 132, 255, 0.3)",
                  }}
                >
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#0A84FF" }}
                  >
                    ブルーチーム
                  </h3>
                  <p className="text-white mb-4 text-sm">
                    平均ランク: {result.avgTier1.tier} {result.avgTier1.rank}
                  </p>
                  <div className="space-y-3">
                    {result.blueTeam.map((player) => (
                      <div
                        key={player.id}
                        className="rounded-lg p-4"
                        style={{
                          background: "rgba(10, 132, 255, 0.1)",
                          border: "1px solid rgba(10, 132, 255, 0.3)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div style={{ color: "#0A84FF" }}>
                            <RoleIcon role={player.assignedRole} size={32} />
                          </div>
                          <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${
                                player.profileIcon || 29
                              }.png`}
                              alt="Profile Icon"
                              className="w-12 h-12 rounded-full border-2"
                              style={{ borderColor: "#0A84FF" }}
                              onError={(e) => {
                                // 画像読み込みエラー時のフォールバック
                                e.currentTarget.src =
                                  "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/29.png";
                              }}
                            />
                            <span className="text-white font-semibold text-xs text-center break-all w-full">
                              {player.summonerName}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1">
                              <span
                                className="font-bold text-lg block"
                                style={{ color: "#5DADE2" }}
                              >
                                {player.assignedRole}
                              </span>
                            </div>
                            <div className="text-sm text-gray-300">
                              <div className="truncate">
                                {player.tier} {player.rank}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-wrap mt-2">
                              {player.preferredRoles.map((role) => (
                                <span
                                  key={role}
                                  className="px-2 py-0.5 rounded text-xs flex items-center gap-1"
                                  style={{
                                    background:
                                      role === player.assignedRole
                                        ? "#0A84FF"
                                        : "rgba(100, 100, 100, 0.3)",
                                    color:
                                      role === player.assignedRole
                                        ? "#fff"
                                        : "#aaa",
                                  }}
                                >
                                  <RoleIcon role={role} size={12} />
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-lg p-6 border-2"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)",
                    borderColor: "#DC3545",
                    boxShadow: "0 0 30px rgba(220, 53, 69, 0.3)",
                  }}
                >
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#DC3545" }}
                  >
                    レッドチーム
                  </h3>
                  <p className="text-white mb-4 text-sm">
                    平均ランク: {result.avgTier2.tier} {result.avgTier2.rank}
                  </p>
                  <div className="space-y-3">
                    {result.redTeam.map((player) => (
                      <div
                        key={player.id}
                        className="rounded-lg p-4"
                        style={{
                          background: "rgba(220, 53, 69, 0.1)",
                          border: "1px solid rgba(220, 53, 69, 0.3)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div style={{ color: "#DC3545" }}>
                            <RoleIcon role={player.assignedRole} size={32} />
                          </div>
                          <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${
                                player.profileIcon || 29
                              }.png`}
                              alt="Profile Icon"
                              className="w-12 h-12 rounded-full border-2"
                              style={{ border: "2px solid #DC3545" }}
                              onError={(e) => {
                                // 画像読み込みエラー時のフォールバック
                                e.currentTarget.src =
                                  "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/29.png";
                              }}
                            />
                            <span className="text-white font-semibold text-xs text-center break-all w-full">
                              {player.summonerName}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1">
                              <span
                                className="font-bold text-lg block"
                                style={{ color: "#FF6B7A" }}
                              >
                                {player.assignedRole}
                              </span>
                            </div>
                            <div className="text-sm text-gray-300">
                              <div className="truncate">
                                {player.tier} {player.rank}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-wrap mt-2">
                              {player.preferredRoles.map((role) => (
                                <span
                                  key={role}
                                  className="px-2 py-0.5 rounded text-xs flex items-center gap-1"
                                  style={{
                                    background:
                                      role === player.assignedRole
                                        ? "#DC3545"
                                        : "rgba(100, 100, 100, 0.3)",
                                    color:
                                      role === player.assignedRole
                                        ? "#fff"
                                        : "#aaa",
                                  }}
                                >
                                  <RoleIcon role={role} size={12} />
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="text-center rounded-lg p-6 border-2 mb-4"
                style={{
                  background:
                    result.diff <= 50
                      ? "rgba(200, 155, 60, 0.1)"
                      : result.avgRating1 > result.avgRating2
                      ? "linear-gradient(135deg, rgba(10, 132, 255, 0.15) 0%, rgba(10, 132, 255, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.05) 100%)",
                  borderColor:
                    result.diff <= 50
                      ? "#C89B3C"
                      : result.avgRating1 > result.avgRating2
                      ? "#0A84FF"
                      : "#DC3545",
                }}
              >
                <div className="mb-2">
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{
                      color:
                        result.diff <= 50
                          ? "#C89B3C"
                          : result.avgRating1 > result.avgRating2
                          ? "#0A84FF"
                          : "#DC3545",
                    }}
                  >
                    {result.diff <= 50 && "⚖️ 互角"}
                    {result.diff > 50 &&
                      result.diff <= 100 &&
                      (result.avgRating1 > result.avgRating2
                        ? "🔵 ブルーチーム やや有利"
                        : "🔴 レッドチーム やや有利")}
                    {result.diff > 100 &&
                      result.diff <= 200 &&
                      (result.avgRating1 > result.avgRating2
                        ? "🔵 ブルーチーム 有利"
                        : "🔴 レッドチーム 有利")}
                    {result.diff > 200 &&
                      result.diff <= 300 &&
                      (result.avgRating1 > result.avgRating2
                        ? "🔵 ブルーチーム かなり有利"
                        : "🔴 レッドチーム かなり有利")}
                    {result.diff > 300 &&
                      (result.avgRating1 > result.avgRating2
                        ? "🔵 ブルーチーム 圧倒的有利"
                        : "🔴 レッドチーム 圧倒的有利")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={createTeams}
                  className="flex-1 px-6 py-3 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)",
                    border: "2px solid #0A84FF",
                    boxShadow: "0 0 20px rgba(10, 132, 255, 0.5)",
                  }}
                >
                  <Shuffle className="w-5 h-5" />
                  再チーム分け
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 px-6 py-3 rounded-lg font-bold transition-all"
                  style={{
                    background: "rgba(100, 100, 100, 0.3)",
                    border: "2px solid rgba(200, 155, 60, 0.5)",
                    color: "#C89B3C",
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
