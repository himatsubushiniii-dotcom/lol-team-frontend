import React, { useState, useMemo, useEffect } from "react";
import { Users, Trash2, Shuffle, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

// ロールの定義
type Role = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

interface Player {
  id: number;
  summonerName: string;
  tag: string;
  tier: string;
  rank: string;
  lp: number;
  rating: number;
  profileIcon: number;
  preferredRoles: Role[];
  assignedRole?: Role;
}

interface RankData {
  tier: string;
  rank: string;
  lp: number;
  rating: number;
  profileIcon: number;
}

interface TeamResult {
  blueTeam: Player[];
  redTeam: Player[];
  avgRating1: number;
  avgRating2: number;
  avgTier1: { tier: string; rank: string };
  avgTier2: { tier: string; rank: string };
  diff: number;
}

interface AddResult {
  success: { input: string; player: Player }[];
  failed: { input: string; error: string }[];
}

const ROLES: Role[] = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

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
const RoleIcon: React.FC<{ role: Role; size?: number }> = ({
  role,
  size = 24,
}) => {
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
const ratingToTier = (rating: number): { tier: string; rank: string } => {
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

const tierToRating = (tier: string, rank: string, lp: number): number => {
  const tierValues: { [key: string]: number } = {
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
  const rankValues: { [key: string]: number } = {
    IV: 0,
    III: 100,
    II: 200,
    I: 300,
  };
  return (tierValues[tier] || 0) + (rankValues[rank] || 0) + (lp || 0);
};

// Riot APIからランク情報を取得
const fetchRankFromAPI = async (
  gameName: string,
  tagLine: string
): Promise<RankData> => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  try {
    const response = await fetch(`${API_URL}`, {
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

    const data: RankData = await response.json();
    return data;
  } catch (error) {
    throw new Error("正しいアカウントを入力してください。(例:Player#JP1) ");
  }
};

// チーム分けアルゴリズム
const divideTeams = (
  players: Player[],
  previousTeam1: Player[] | null = null
): { team1: Player[]; team2: Player[] } | null => {
  let bestDiff = Infinity;
  let bestTeams = null;
  const previousTeam1Ids = previousTeam1
    ? new Set(previousTeam1.map((p) => p.id))
    : null;

  const n = players.length;

  // ランダムな順序も試すために配列をシャッフル
  const shuffledPlayers = [...players];
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlayers[i], shuffledPlayers[j]] = [
      shuffledPlayers[j],
      shuffledPlayers[i],
    ];
  }

  for (let mask = 0; mask < 1 << n; mask++) {
    if (countBits(mask) !== 5) continue;

    const team1 = [];
    const team2 = [];

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) team1.push(shuffledPlayers[i]);
      else team2.push(shuffledPlayers[i]);
    }

    // 前回のチーム1と同じ構成をスキップ
    if (previousTeam1Ids) {
      const team1IDs = team1.map((p) => p.id).sort();
      const prevTeam1IDs = previousTeam1
        ? previousTeam1.map((p) => p.id).sort()
        : []; // 👈 修正: team変数をpreviousTeam1に変更
      if (JSON.stringify(team1IDs) === JSON.stringify(prevTeam1IDs)) {
        continue;
      }

      // チーム2が前回のチーム1と同じ（入れ替わっただけ）もスキップ
      const team2IDs = team2.map((p) => p.id).sort();
      if (JSON.stringify(team2IDs) === JSON.stringify(prevTeam1IDs)) {
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

const countBits = (n: number): number => {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
};

// ロール配分
const assignRoles = (team: Player[]): Player[] => {
  const roleOrder: Role[] = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];
  const availableRoles: Role[] = [...roleOrder];
  const assignments: Player[] = [];

  const sorted = [...team].sort(
    (a, b) => a.preferredRoles.length - b.preferredRoles.length
  );

  sorted.forEach((player) => {
    const possibleRoles = availableRoles.filter((r) =>
      player.preferredRoles.includes(r as Role)
    );
    const assignedRole: Role =
      possibleRoles.length > 0 ? possibleRoles[0] : availableRoles[0];
    assignments.push({ ...player, assignedRole });
    const index = availableRoles.indexOf(assignedRole);
    if (index > -1) {
      availableRoles.splice(index, 1);
    }
  });

  return assignments.sort(
    (a, b) =>
      roleOrder.indexOf(a.assignedRole!) - roleOrder.indexOf(b.assignedRole!)
  );
};

export default function LoLTeamMaker(): JSX.Element {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TeamResult | null>(null);
  const [addResults, setAddResults] = useState<AddResult | null>(null);
  const [sortType, setSortType] = useState<
    "none" | "name" | "rating-high" | "rating-low"
  >("none");
  const [currentProcessing, setCurrentProcessing] = useState<string>("");
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

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
  const toggleAllRoles = (playerId: number): void => {
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
  const togglePlayerRole = (playerId: number, role: Role): void => {
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
  const changePlayerRank = (
    playerId: number,
    newTier: string,
    newRank: string
  ): void => {
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

  const removePlayer = (id: number): void => {
    setPlayers(players.filter((p) => p.id !== id));
    setResult(null);
    setAddResults(null); // 追加結果メッセージをクリア
  };

  const addPlayer = async (): Promise<void> => {
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
          error:
            error instanceof Error
              ? error.message
              : "プレイヤー情報の取得に失敗しました",
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
  const areSetsEqual = (set1: Set<number>, set2: Set<number>): boolean => {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  };

  const createTeams = (): void => {
    if (players.length !== 10) {
      alert("10人揃ってから実行してください");
      return;
    }

    // 👇 最大試行回数を設定
    const maxAttempts = 50;
    let bestTeams = null;
    let bestDiff = Infinity;

    // 前回のブルーチームのプレイヤーIDセットを作成
    const previousBlueTeamIds = result?.blueTeam
      ? new Set(result.blueTeam.map((p) => p.id))
      : null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const teams = divideTeams(players, result?.blueTeam || null);

      if (!teams) continue;

      const sum1 = teams.team1.reduce((s, p) => s + p.rating, 0);
      const sum2 = teams.team2.reduce((s, p) => s + p.rating, 0);
      const diff = Math.abs(sum1 - sum2);

      // 👇 前回のチームと比較して変更があるかチェック
      if (previousBlueTeamIds) {
        const currentTeam1Ids = new Set(teams.team1.map((p) => p.id));

        // 完全に同じチーム構成をスキップ
        if (areSetsEqual(currentTeam1Ids, previousBlueTeamIds)) {
          continue;
        }

        // ブルーとレッドが入れ替わっただけのパターンもスキップ
        const currentTeam2Ids = new Set(teams.team2.map((p) => p.id));
        if (areSetsEqual(currentTeam2Ids, previousBlueTeamIds)) {
          continue;
        }

        // 👇 少なくとも2人以上の変更があるチームを優先
        const changedPlayers = [...currentTeam1Ids].filter(
          (id) => !previousBlueTeamIds.has(id)
        ).length;
        if (changedPlayers < 2) {
          continue;
        }
      }

      // レーティング差が最小のチームを保存
      if (diff < bestDiff) {
        bestDiff = diff;
        bestTeams = teams;
      }

      // 十分に良いバランスが見つかったら早期終了
      if (diff <= 50 && (!previousBlueTeamIds || bestTeams)) {
        break;
      }
    }

    if (!bestTeams) {
      // フォールバック: 前回のチーム情報を無視して再試行
      bestTeams = divideTeams(players, null);
    }

    if (!bestTeams) {
      alert("チーム分けに失敗しました");
      return;
    }

    const team1WithRoles = assignRoles(bestTeams.team1);
    const team2WithRoles = assignRoles(bestTeams.team2);

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

  const resetToInitialState = (): void => {
    setPlayers([]);
    setResult(null);
    setCurrentInput("");
    setAddResults(null);
    setSortType("none");
  };

  const copyResultToClipboard = async (): Promise<void> => {
    const element = document.getElementById("team-result-container");
    if (!element) {
      alert("結果が見つかりませんでした");
      return;
    }

    // ローディング表示
    const loadingDiv = document.createElement("div");
    loadingDiv.textContent = "📸 スクリーンショットを生成中...";
    loadingDiv.style.cssText =
      "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; z-index: 9999; font-size: 18px;";
    document.body.appendChild(loadingDiv);

    try {
      // 元のスタイルを保存
      const originalOverflow = element.style.overflow;
      const originalMaxHeight = element.style.maxHeight;

      // 👇 ボタンエリアを一時的に非表示
      const buttonArea = document.getElementById("button-area");
      const originalButtonDisplay = buttonArea?.style.display;
      if (buttonArea) {
        buttonArea.style.display = "none";
      }

      // 👇 グリッドコンテナを取得して強制的に2カラムレイアウトを維持
      const gridContainer = document.getElementById("teams-grid-container");
      if (gridContainer) {
        gridContainer.style.display = "grid";
        gridContainer.style.gridTemplateColumns = "1fr 1fr";
        gridContainer.style.gap = "0.75rem"; // gap-3 = 0.75rem
      }

      // 一時的にスクロールを無効化
      element.style.overflow = "visible";
      element.style.maxHeight = "none";

      // フォントの完全な読み込みを待機
      await document.fonts.ready;

      // 追加: 再度フォントを確認（一部のブラウザで必要）
      await new Promise((resolve) => setTimeout(resolve, 100));

      const images = element.querySelectorAll("img");
      const imagePromises = Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(img);
          } else {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            setTimeout(() => resolve(img), 5000);
          }
        });
      });

      await Promise.all(imagePromises);

      // レンダリング完了を確実にするため待機時間を延長
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 強制的に再描画をトリガー
      element.style.transform = "translateZ(0)";

      // フォントのアンチエイリアシングを無効化して正確な位置を確保
      (element.style as any).webkitFontSmoothing = "antialiased";
      (element.style as any).mozOsxFontSmoothing = "grayscale";

      await new Promise((resolve) => setTimeout(resolve, 200));

      // スクリーンショットを撮る
      const canvas = await html2canvas(element, {
        backgroundColor: "#010A13",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(
            "team-result-container"
          );
          if (clonedElement) {
            // 背景色を確実に適用
            clonedElement.style.backgroundColor = "#010A13";
            clonedElement.style.transform = "translateZ(0)";

            // タイトルを金色に修正
            const title = clonedElement.querySelector("h2");
            if (title) {
              (title as HTMLElement).style.color = "#C89B3C";
              (title as HTMLElement).style.background = "none";
              (title as HTMLElement).style.webkitBackgroundClip = "unset";
              (title as HTMLElement).style.webkitTextFillColor = "#C89B3C";
            }

            // すべてのテキスト要素のスタイルを明示的に設定
            const allTextElements = clonedElement.querySelectorAll(
              "span, div, p, h1, h2, h3, button"
            );
            allTextElements.forEach((el: any) => {
              const computedStyle = window.getComputedStyle(el);
              el.style.lineHeight = computedStyle.lineHeight;
              el.style.fontSize = computedStyle.fontSize;
              el.style.fontFamily = computedStyle.fontFamily;
              el.style.fontWeight = computedStyle.fontWeight;
              el.style.color = computedStyle.color;

              // ✅ 垂直方向の位置を修正
              el.style.verticalAlign = "middle";
              el.style.display = computedStyle.display;

              // グラデーション背景を持つ要素を単色に変換
              if (el.style.webkitBackgroundClip === "text") {
                el.style.webkitBackgroundClip = "unset";
                el.style.webkitTextFillColor = "#C89B3C";
                el.style.color = "#C89B3C";
                el.style.background = "none";
              }
            });

            // ✅ Flexboxコンテナの設定を確実に適用（修正版）
            const flexContainers = clonedElement.querySelectorAll(".flex");
            flexContainers.forEach((el: any) => {
              el.style.display = "flex";
              el.style.alignItems = "center";
              el.style.justifyContent = el.style.justifyContent || "flex-start";

              // flex内の子要素も中央揃えを強制
              Array.from(el.children).forEach((child: any) => {
                child.style.alignSelf = "center";
              });
            });

            // ✅ ロール名などの特定要素に対する追加修正
            const roleNames = clonedElement.querySelectorAll(
              '[class*="font-bold"][class*="text-"]'
            );
            roleNames.forEach((el: any) => {
              el.style.lineHeight = "1";
              el.style.display = "inline-block";
              el.style.verticalAlign = "middle";
            });
          }
        },
      });

      // スタイルを元に戻す
      element.style.overflow = originalOverflow;
      element.style.maxHeight = originalMaxHeight;
      element.style.transform = ""; // 追加: transformをリセット

      // 👇 ボタンエリアを再表示
      if (buttonArea) {
        buttonArea.style.display = originalButtonDisplay || "";
      }

      // Blobに変換
      canvas.toBlob(async (blob: Blob | null) => {
        document.body.removeChild(loadingDiv);

        if (!blob) {
          alert("画像の生成に失敗しました");
          return;
        }

        try {
          // クリップボードに書き込み
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          alert(
            "✅ クリップボードにコピーしました!\nDiscordで Ctrl+V (Mac: Cmd+V) で貼り付けできます"
          );
        } catch (err) {
          console.error("クリップボードへのコピーに失敗:", err);
          alert(
            "❌ クリップボードへのコピーに失敗しました。ブラウザの設定を確認してください。"
          );
        }
      }, "image/png");
    } catch (error) {
      document.body.removeChild(loadingDiv);
      console.error("スクリーンショットの生成に失敗:", error);
      alert("❌ スクリーンショットの生成に失敗しました");
    }
  };

  const downloadScreenshot = async (): Promise<void> => {
    const element = document.getElementById("team-result-container");
    if (!element) {
      alert("結果が見つかりませんでした");
      return;
    }

    // ローディング表示
    const loadingDiv = document.createElement("div");
    loadingDiv.textContent = "📸 画像を生成中...";
    loadingDiv.style.cssText =
      "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; z-index: 9999; font-size: 18px;";
    document.body.appendChild(loadingDiv);

    try {
      const originalOverflow = element.style.overflow;
      const originalMaxHeight = element.style.maxHeight;

      // 👇 ボタンエリアを一時的に非表示
      const buttonArea = document.getElementById("button-area");
      const originalButtonDisplay = buttonArea?.style.display;
      if (buttonArea) {
        buttonArea.style.display = "none";
      }

      // 👇 グリッドコンテナを取得して強制的に2カラムレイアウトを維持
      const gridContainer = document.getElementById("teams-grid-container");
      if (gridContainer) {
        gridContainer.style.display = "grid";
        gridContainer.style.gridTemplateColumns = "1fr 1fr";
        gridContainer.style.gap = "0.75rem";
      }

      element.style.overflow = "visible";
      element.style.maxHeight = "none";

      // フォントの完全な読み込みを待機
      await document.fonts.ready;

      // 追加: 再度フォントを確認
      await new Promise((resolve) => setTimeout(resolve, 100));

      const images = element.querySelectorAll("img");
      const imagePromises = Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(img);
          } else {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            setTimeout(() => resolve(img), 5000);
          }
        });
      });

      await Promise.all(imagePromises);

      // レンダリング完了を確実にするため待機時間を延長
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 強制的に再描画をトリガー
      element.style.transform = "translateZ(0)";

      // フォントのアンチエイリアシングを無効化して正確な位置を確保
      (element.style as any).webkitFontSmoothing = "antialiased";
      (element.style as any).mozOsxFontSmoothing = "grayscale";

      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        backgroundColor: "#010A13",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(
            "team-result-container"
          );
          if (clonedElement) {
            // 背景色を確実に適用
            clonedElement.style.backgroundColor = "#010A13";
            clonedElement.style.transform = "translateZ(0)";

            // タイトルを金色に修正
            const title = clonedElement.querySelector("h2");
            if (title) {
              (title as HTMLElement).style.color = "#C89B3C";
              (title as HTMLElement).style.background = "none";
              (title as HTMLElement).style.webkitBackgroundClip = "unset";
              (title as HTMLElement).style.webkitTextFillColor = "#C89B3C";
            }

            // すべてのテキスト要素のスタイルを明示的に設定
            const allTextElements = clonedElement.querySelectorAll(
              "span, div, p, h1, h2, h3, button"
            );
            allTextElements.forEach((el: any) => {
              const computedStyle = window.getComputedStyle(el);
              el.style.lineHeight = computedStyle.lineHeight;
              el.style.fontSize = computedStyle.fontSize;
              el.style.fontFamily = computedStyle.fontFamily;
              el.style.fontWeight = computedStyle.fontWeight;
              el.style.color = computedStyle.color;

              // ✅ 垂直方向の位置を修正
              el.style.verticalAlign = "middle";
              el.style.display = computedStyle.display;

              // グラデーション背景を持つ要素を単色に変換
              if (el.style.webkitBackgroundClip === "text") {
                el.style.webkitBackgroundClip = "unset";
                el.style.webkitTextFillColor = "#C89B3C";
                el.style.color = "#C89B3C";
                el.style.background = "none";
              }
            });

            // ✅ Flexboxコンテナの設定を確実に適用（修正版）
            const flexContainers = clonedElement.querySelectorAll(".flex");
            flexContainers.forEach((el: any) => {
              el.style.display = "flex";
              el.style.alignItems = "center";
              el.style.justifyContent = el.style.justifyContent || "flex-start";

              // flex内の子要素も中央揃えを強制
              Array.from(el.children).forEach((child: any) => {
                child.style.alignSelf = "center";
              });
            });

            // ✅ ロール名などの特定要素に対する追加修正
            const roleNames = clonedElement.querySelectorAll(
              '[class*="font-bold"][class*="text-"]'
            );
            roleNames.forEach((el: any) => {
              el.style.lineHeight = "1";
              el.style.display = "inline-block";
              el.style.verticalAlign = "middle";
            });
          }
        },
      });

      element.style.overflow = originalOverflow;
      element.style.maxHeight = originalMaxHeight;
      element.style.transform = ""; // 追加: transformをリセット

      // 👇 ボタンエリアを再表示
      if (buttonArea) {
        buttonArea.style.display = originalButtonDisplay || "";
      }

      canvas.toBlob((blob: Blob | null) => {
        document.body.removeChild(loadingDiv);

        if (!blob) {
          alert("画像の生成に失敗しました");
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lol-team-result-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);

        alert(
          "✅ 画像をダウンロードしました!\nDiscordにドラッグ&ドロップで共有できます"
        );
      }, "image/png");
    } catch (error) {
      document.body.removeChild(loadingDiv);
      console.error("画像の生成に失敗:", error);
      alert("❌ 画像の生成に失敗しました");
    }
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
            className="text-4xl font-bold mb-2 flex items-center justify-center gap-3 cursor-pointer transition-transform"
            style={{
              background:
                "linear-gradient(135deg, #C89B3C 0%, #F0E6D2 50%, #C89B3C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            onClick={resetToInitialState}
            title="クリックで初期状態に戻す"
          >
            <Users className="w-10 h-10" style={{ color: "#C89B3C" }} />
            LoL カスタムチーム分けシステム
          </h1>
          <p
            className="text-blue-300 cursor-pointer hover:text-blue-200 transition-colors"
            onClick={resetToInitialState}
            title="クリックで初期状態に戻す"
          >
            公平なチーム分けとロール配分
          </p>
        </div>
        {players.length < 10 && (
          <div
            className="rounded-lg p-4 mb-4 border-2 max-w-4xl mx-auto" // 👈 max-w-4xlとmx-autoを追加
            style={{
              background:
                "linear-gradient(135deg, rgba(1, 10, 19, 0.9) 0%, rgba(0, 9, 19, 0.95) 100%)",
              borderColor: "#0A1428",
              boxShadow:
                "0 0 30px rgba(10, 132, 255, 0.3), inset 0 0 30px rgba(10, 132, 255, 0.05)",
            }}
          >
            <h2 className="text-lg font-bold mb-3" style={{ color: "#C89B3C" }}>
              {" "}
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className="font-semibold mb-2 block"
                  style={{ color: "#C89B3C" }}
                >
                  サモナー名#タグ
                  (複数行で一括追加可能です。カスタムロビーメッセージを張り付けて追加することできます)
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
            className="rounded-lg p-4 mb-4 border-2 max-w-4xl mx-auto" // 👈 max-w-4xlとmx-autoを追加
            style={{
              background:
                "linear-gradient(135deg, rgba(1, 10, 19, 0.9) 0%, rgba(0, 9, 19, 0.95) 100%)",
              borderColor: "#0A1428",
              boxShadow:
                "0 0 30px rgba(10, 132, 255, 0.3), inset 0 0 30px rgba(10, 132, 255, 0.05)",
            }}
          >
            <div className="flex justify-between items-center mb-3">
              {" "}
              <h2 className="text-lg font-bold" style={{ color: "#C89B3C" }}>
                {" "}
                登録プレイヤー ({players.length}
                /10)
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

            {/* 説明文を追加 */}
            <div
              className="rounded-lg p-3 mb-4 border"
              style={{
                background: "rgba(10, 132, 255, 0.05)",
                borderColor: "rgba(10, 132, 255, 0.2)",
              }}
            >
              <p className="text-blue-200 text-sm">
                💡 初期表示は現在ランクで過去ランクなどに変更可能です。
                各ロールボタン押下することで希望ロールを選択することできます。
              </p>
            </div>

            <div className="space-y-2">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="rounded p-2 flex items-center justify-between" // 👈 p-3からp-2に変更
                  style={{
                    background: "rgba(10, 132, 255, 0.05)",
                    border: "1px solid rgba(10, 132, 255, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    {" "}
                    {/* プロフィールアイコン */}
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${
                        player.profileIcon || 29
                      }.png`}
                      alt="Profile Icon"
                      className="w-10 h-10 rounded-full border-2 flex-shrink-0" // 👈 w-12 h-12からw-10 h-10に変更
                      style={{ borderColor: "#0A84FF" }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/29.png";
                      }}
                    />
                    <span className="text-white font-semibold w-[150px] truncate block flex-shrink-0 text-sm">
                      {" "}
                      {player.summonerName}#{player.tag}
                    </span>
                    <select
                      value={`${player.tier}-${player.rank}`}
                      onChange={(e) => {
                        const [newTier, newRank] = e.target.value.split("-");
                        changePlayerRank(player.id, newTier, newRank);
                      }}
                      className="font-bold w-[140px] flex-shrink-0 px-2 py-1 rounded cursor-pointer text-sm"
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
                            className="px-1.5 py-1 rounded text-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105" // 👈 px-2からpx-1.5、text-smからtext-xsに変更
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
                            <RoleIcon role={role} size={12} />
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
              className="mt-3 w-full px-5 py-2.5 text-white rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2" // 👈 mt-4→mt-3、px-6→px-5、py-3→py-2.5、text-lg→text-baseに変更
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
              <Shuffle className="w-5 h-5" />
              チーム分け実行{" "}
              {players.length !== 10 && `(${10 - players.length}人不足)`}
            </button>
          </div>
        )}

        {result && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              id="team-result-container"
              className="rounded-xl p-3 sm:p-4 max-w-4xl w-full max-h-[96vh] overflow-y-auto border-2"
              style={{
                background:
                  "linear-gradient(135deg, rgba(1, 10, 19, 0.98) 0%, rgba(0, 9, 19, 0.98) 100%)",
                borderColor: "#C89B3C",
                boxShadow: "0 0 50px rgba(200, 155, 60, 0.5)",
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <h2
                  className="text-xl sm:text-2xl font-bold"
                  style={{
                    color: "#C89B3C", // 金色を直接指定
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

              <div
                id="teams-grid-container"
                className="grid gap-3 mb-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr", // 必ず2カラム
                  minWidth: "800px", // スクリーンショット時も2カラムを維持
                }}
              >
                {/* ブルーチーム */}
                <div
                  className="rounded-lg p-3 border-2"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(10, 132, 255, 0.05) 100%)",
                    borderColor: "#0A84FF",
                    boxShadow: "0 0 30px rgba(10, 132, 255, 0.3)",
                  }}
                >
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: "#0A84FF" }}
                  >
                    ブルーチーム
                  </h3>
                  <p className="text-white mb-2 text-xs">
                    平均ランク: {result.avgTier1.tier} {result.avgTier1.rank}
                  </p>
                  <div className="space-y-1.5">
                    {result.blueTeam.map((player) => (
                      <div
                        key={player.id}
                        className="rounded p-2"
                        style={{
                          background: "rgba(10, 132, 255, 0.1)",
                          border: "1px solid rgba(10, 132, 255, 0.3)",
                        }}
                      >
                        <div style={{ display: "table", width: "100%" }}>
                          <div style={{ display: "table-row" }}>
                            {/* ロールアイコン */}
                            <div
                              style={{
                                display: "table-cell",
                                verticalAlign: "middle",
                                width: "30px",
                                paddingRight: "6px",
                                color: "#0A84FF",
                              }}
                            >
                              <RoleIcon role={player.assignedRole!} size={20} />
                            </div>

                            {/* プロフィール画像とサモナー名 */}
                            <div
                              style={{
                                display: "table-cell",
                                verticalAlign: "middle",
                                width: "48px",
                                paddingRight: "6px",
                                textAlign: "center",
                              }}
                            >
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${
                                  player.profileIcon || 29
                                }.png`}
                                alt="Profile Icon"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  border: "2px solid #0A84FF",
                                  display: "block",
                                  margin: "0 auto 2px auto",
                                }}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/29.png";
                                }}
                              />
                              <span
                                style={{
                                  color: "white",
                                  fontWeight: "600",
                                  fontSize: "9px",
                                  display: "block",
                                  lineHeight: "1.2",
                                  wordBreak: "break-all",
                                }}
                              >
                                {player.summonerName}
                              </span>
                            </div>

                            {/* プレイヤー情報 */}
                            <div
                              style={{
                                display: "table-cell",
                                verticalAlign: "middle",
                                paddingLeft: "6px",
                              }}
                            >
                              {/* 割り当てられたロール */}
                              <div style={{ marginBottom: "2px" }}>
                                <span
                                  style={{
                                    color: "#5DADE2",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    display: "block",
                                    lineHeight: "1.2",
                                  }}
                                >
                                  {player.assignedRole}
                                </span>
                              </div>

                              {/* ランク情報 */}
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#d1d5db",
                                  marginBottom: "2px",
                                }}
                              >
                                <div
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {player.tier} {player.rank}
                                </div>
                              </div>

                              {/* 希望ロール一覧 */}
                              <div
                                style={{
                                  display: "table",
                                  marginTop: "2px",
                                }}
                              >
                                <div style={{ display: "table-row" }}>
                                  {player.preferredRoles.map((role) => (
                                    <span
                                      key={role}
                                      style={{
                                        display: "table-cell",
                                        padding: "2px 4px",
                                        borderRadius: "4px",
                                        fontSize: "9px",
                                        background:
                                          role === player.assignedRole
                                            ? "#0A84FF"
                                            : "rgba(100, 100, 100, 0.3)",
                                        color:
                                          role === player.assignedRole
                                            ? "#fff"
                                            : "#aaa",
                                        paddingRight: "4px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          display: "inline-block",
                                          verticalAlign: "middle",
                                          marginRight: "2px",
                                        }}
                                      >
                                        <RoleIcon role={role} size={12} />
                                      </span>
                                      <span
                                        style={{
                                          display: "inline-block",
                                          verticalAlign: "middle",
                                        }}
                                      >
                                        {role}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* レッドチーム */}
                <div
                  className="rounded-lg p-3 border-2"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)",
                    borderColor: "#DC3545",
                    boxShadow: "0 0 30px rgba(220, 53, 69, 0.3)",
                  }}
                >
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: "#DC3545" }}
                  >
                    レッドチーム
                  </h3>
                  <p className="text-white mb-2 text-xs">
                    平均ランク: {result.avgTier2.tier} {result.avgTier2.rank}
                  </p>
                  <div className="space-y-1.5">
                    {result.redTeam.map((player) => (
                      <div
                        key={player.id}
                        className="rounded p-2"
                        style={{
                          background: "rgba(220, 53, 69, 0.1)",
                          border: "1px solid rgba(220, 53, 69, 0.3)",
                        }}
                      >
                        <div style={{ display: "table", width: "100%" }}>
                          <div style={{ display: "table-row" }}>
                            {/* ロールアイコン */}
                            <div
                              style={{
                                display: "table-cell",
                                verticalAlign: "middle",
                                width: "30px",
                                paddingRight: "6px",
                                color: "#DC3545",
                              }}
                            >
                              <RoleIcon role={player.assignedRole!} size={20} />
                            </div>

                            {/* プロフィール画像とサモナー名 */}
                            <div
                              style={{
                                display: "table-cell",
                                verticalAlign: "middle",
                                width: "48px",
                                paddingRight: "6px",
                                textAlign: "center",
                              }}
                            >
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${
                                  player.profileIcon || 29
                                }.png`}
                                alt="Profile Icon"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  border: "2px solid #DC3545",
                                  display: "block",
                                  margin: "0 auto 2px auto",
                                }}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/29.png";
                                }}
                              />
                              <span
                                style={{
                                  color: "white",
                                  fontWeight: "600",
                                  fontSize: "9px",
                                  display: "block",
                                  lineHeight: "1.2",
                                  wordBreak: "break-all",
                                }}
                              >
                                {player.summonerName}
                              </span>
                            </div>

                            {/* プレイヤー情報 */}
                            <div
                              style={{
                                display: "table-cell",
                                verticalAlign: "middle",
                                paddingLeft: "6px",
                              }}
                            >
                              {/* 割り当てられたロール */}
                              <div style={{ marginBottom: "2px" }}>
                                <span
                                  style={{
                                    color: "#DC3545",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    display: "block",
                                    lineHeight: "1.2",
                                  }}
                                >
                                  {player.assignedRole}
                                </span>
                              </div>

                              {/* ランク情報 */}
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#d1d5db",
                                  marginBottom: "2px",
                                }}
                              >
                                <div
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {player.tier} {player.rank}
                                </div>
                              </div>

                              {/* 希望ロール一覧 */}
                              <div
                                style={{
                                  display: "table",
                                  marginTop: "2px",
                                }}
                              >
                                <div style={{ display: "table-row" }}>
                                  {player.preferredRoles.map((role) => (
                                    <span
                                      key={role}
                                      style={{
                                        display: "table-cell",
                                        padding: "2px 4px",
                                        borderRadius: "4px",
                                        fontSize: "9px",
                                        background:
                                          role === player.assignedRole
                                            ? "#DC3545"
                                            : "rgba(100, 100, 100, 0.3)",
                                        color:
                                          role === player.assignedRole
                                            ? "#fff"
                                            : "#aaa",
                                        paddingRight: "4px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          display: "inline-block",
                                          verticalAlign: "middle",
                                          marginRight: "2px",
                                        }}
                                      >
                                        <RoleIcon role={role} size={12} />
                                      </span>
                                      <span
                                        style={{
                                          display: "inline-block",
                                          verticalAlign: "middle",
                                        }}
                                      >
                                        {role}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div id="button-area" className="space-y-2">
                {/* ボタン群 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={copyResultToClipboard}
                    className="px-4 py-2 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 text-sm"
                    style={{
                      background: "rgba(200, 155, 60, 0.4)",
                      border: "2px solid #C89B3C",
                      color: "#F0E6D2",
                      boxShadow: "0 0 10px rgba(200, 155, 60, 0.3)",
                    }}
                  >
                    📋 クリップボードにコピー
                    <span className="text-xs opacity-70">(β版)</span>
                  </button>
                  <button
                    onClick={downloadScreenshot}
                    className="px-4 py-2 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 text-sm"
                    style={{
                      background: "rgba(200, 155, 60, 0.4)",
                      border: "2px solid #C89B3C",
                      color: "#F0E6D2",
                      boxShadow: "0 0 10px rgba(200, 155, 60, 0.3)",
                    }}
                  >
                    💾 画像ダウンロード
                    <span className="text-xs opacity-70">(β版)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={createTeams}
                    className="px-4 py-2 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 text-sm"
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
                    className="px-4 py-2 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 text-sm"
                    style={{
                      background: "rgba(100, 100, 100, 0.5)",
                      border: "2px solid rgba(150, 150, 150, 0.7)",
                      color: "#E0E0E0",
                      boxShadow: "0 0 10px rgba(100, 100, 100, 0.3)",
                    }}
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
