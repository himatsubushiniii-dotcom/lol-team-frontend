import React, { useState, useMemo, useEffect } from "react";
import { Users, Trash2, Shuffle, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

// ロールの定義
type Role = "TOP" | "JUG" | "MID" | "ADC" | "SUP";

interface Region {
  code: string;
  name: string;
  continent: string;
}

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
  strictRoleMatch: boolean;
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

const ROLES: Role[] = ["TOP", "JUG", "MID", "ADC", "SUP"];

const REGIONS: Region[] = [
  { code: "jp1", name: "日本", continent: "asia" },
  { code: "kr", name: "韓国", continent: "asia" },
  { code: "na1", name: "北米", continent: "americas" },
  { code: "euw1", name: "ヨーロッパ西", continent: "europe" },
  { code: "eun1", name: "ヨーロッパ北東", continent: "europe" },
  { code: "br1", name: "ブラジル", continent: "americas" },
  { code: "la1", name: "ラテンアメリカ北", continent: "americas" },
  { code: "la2", name: "ラテンアメリカ南", continent: "americas" },
  { code: "oc1", name: "オセアニア", continent: "sea" },
  { code: "tr1", name: "トルコ", continent: "europe" },
  { code: "ru", name: "ロシア", continent: "europe" },
];

// 全てのランクオプションを定義
const RANK_OPTIONS = [
  { tier: "UNRANKED", rank: "", display: "UNRANKED" },
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
    JUG: (
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
    SUP: (
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

const AdBanner: React.FC<{ slot: string; format?: string }> = ({
  slot,
  format = "auto",
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Ad error:", err);
    }
  }, []);

  return (
    <div style={{ margin: "20px 0", textAlign: "center" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // 実際のAdSense IDに変更
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
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

  return { tier: "UNRANKED", rank: "" };
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
  tagLine: string,
  region: string
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
        region: region,
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
): { team1: Player[]; team2: Player[] } | { error: string } | null => {
  let bestScore = Infinity;
  let bestTeams = null;
  const previousTeam1Ids = previousTeam1
    ? new Set(previousTeam1.map((p) => p.id))
    : null;

  const n = players.length;
  const maxAttempts = 5000;
  let attempts = 0;

  // 希望ロール絶対条件のプレイヤーを抽出
  const strictPlayers = players.filter((p) => p.strictRoleMatch);
  const flexiblePlayers = players.filter((p) => !p.strictRoleMatch);

  console.log(
    `厳格マッチ: ${strictPlayers.length}人, 柔軟: ${flexiblePlayers.length}人`
  );

  const shuffledPlayers = [...players];
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlayers[i], shuffledPlayers[j]] = [
      shuffledPlayers[j],
      shuffledPlayers[i],
    ];
  }

  // チームの人数を計算（総人数の半分）
  const teamSize = Math.floor(n / 2);

  for (let mask = 0; mask < 1 << n && attempts < maxAttempts; mask++) {
    if (countBits(mask) !== teamSize) continue;
    attempts++;

    const team1 = [];
    const team2 = [];

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) team1.push(shuffledPlayers[i]);
      else team2.push(shuffledPlayers[i]);
    }

    if (previousTeam1Ids) {
      const team1IDs = team1.map((p) => p.id).sort();
      const prevTeam1IDs = previousTeam1
        ? previousTeam1.map((p) => p.id).sort()
        : [];
      if (JSON.stringify(team1IDs) === JSON.stringify(prevTeam1IDs)) {
        continue;
      }

      const team2IDs = team2.map((p) => p.id).sort();
      if (JSON.stringify(team2IDs) === JSON.stringify(prevTeam1IDs)) {
        continue;
      }
    }

    // ロール割り当てを試す（希望ロール優先モード対応）
    const team1WithRoles = assignRolesWithStrictMode(team1);
    const team2WithRoles = assignRolesWithStrictMode(team2);

    // 厳格マッチのプレイヤーが希望ロールに割り当てられているかチェック
    const team1Valid = team1WithRoles.every(
      (p) => !p.strictRoleMatch || p.preferredRoles.includes(p.assignedRole!)
    );
    const team2Valid = team2WithRoles.every(
      (p) => !p.strictRoleMatch || p.preferredRoles.includes(p.assignedRole!)
    );

    if (!team1Valid || !team2Valid) {
      continue; // 厳格条件を満たさない場合はスキップ
    }

    const sum1 = team1WithRoles.reduce((s, p) => s + p.rating, 0);
    const sum2 = team2WithRoles.reduce((s, p) => s + p.rating, 0);
    const totalDiff = Math.abs(sum1 - sum2);

    const team1Bot = team1WithRoles.filter(
      (p) => p.assignedRole === "ADC" || p.assignedRole === "SUP"
    );
    const team2Bot = team2WithRoles.filter(
      (p) => p.assignedRole === "ADC" || p.assignedRole === "SUP"
    );

    const team1BotRating = team1Bot.reduce((s, p) => s + p.rating, 0);
    const team2BotRating = team2Bot.reduce((s, p) => s + p.rating, 0);
    const botDiff = Math.abs(team1BotRating - team2BotRating);

    const roleDiffs: number[] = [];
    ["TOP", "JUG", "MID"].forEach((role) => {
      const p1 = team1WithRoles.find((p) => p.assignedRole === role);
      const p2 = team2WithRoles.find((p) => p.assignedRole === role);
      if (p1 && p2) {
        roleDiffs.push(Math.abs(p1.rating - p2.rating));
      }
    });
    const maxRoleDiff = Math.max(...roleDiffs);

    const score = totalDiff + botDiff * 1.5 + maxRoleDiff * 0.5;

    if (score < bestScore) {
      bestScore = score;
      bestTeams = { team1: team1WithRoles, team2: team2WithRoles };
    }
  }

  // bestTeamsがnullの場合、どのロールが不足しているか確認
  if (!bestTeams) {
    const allRoles: Role[] = ["TOP", "JUG", "MID", "ADC", "SUP"];
    const strictPlayersByRole = new Map<Role, Player[]>();

    // 厳格マッチのプレイヤーをロール別に分類
    strictPlayers.forEach((player) => {
      player.preferredRoles.forEach((role) => {
        if (!strictPlayersByRole.has(role)) {
          strictPlayersByRole.set(role, []);
        }
        strictPlayersByRole.get(role)!.push(player);
      });
    });

    // 不足しているロールを特定
    const insufficientRoles: Role[] = [];
    allRoles.forEach((role) => {
      const playersForRole = strictPlayersByRole.get(role) || [];
      // 各ロールに最低2人必要（両チームに1人ずつ）
      if (playersForRole.length < 2) {
        insufficientRoles.push(role);
      }
    });

    if (insufficientRoles.length > 0) {
      return {
        error: `${insufficientRoles.join(
          ", "
        )}のロールが足りません。\n「他ロール拒否」の選択を外すか、${insufficientRoles.join(
          ", "
        )}を選択してください。`,
      };
    }
  }

  return bestTeams;
};
// 希望ロール優先モード対応のロール割り当て関数
const assignRolesWithStrictMode = (team: Player[]): Player[] => {
  const roleOrder: Role[] = ["TOP", "JUG", "MID", "ADC", "SUP"];
  const availableRoles: Role[] = [...roleOrder];
  const assignments: Player[] = [];

  // 厳格マッチのプレイヤーを優先的に処理
  const strictPlayers = team.filter((p) => p.strictRoleMatch);
  const flexiblePlayers = team.filter((p) => !p.strictRoleMatch);

  // 厳格マッチのプレイヤーを希望ロールの少ない順にソート
  const sortedStrict = [...strictPlayers].sort(
    (a, b) => a.preferredRoles.length - b.preferredRoles.length
  );

  // 厳格マッチのプレイヤーを先に割り当て
  sortedStrict.forEach((player) => {
    const possibleRoles = availableRoles.filter((r) =>
      player.preferredRoles.includes(r)
    );

    if (possibleRoles.length > 0) {
      const assignedRole = possibleRoles[0];
      assignments.push({ ...player, assignedRole });
      const index = availableRoles.indexOf(assignedRole);
      if (index > -1) {
        availableRoles.splice(index, 1);
      }
    } else {
      // 希望ロールが全て埋まっている場合でも割り当て（エラー回避）
      const assignedRole = availableRoles[0] || roleOrder[0];
      assignments.push({ ...player, assignedRole });
      const index = availableRoles.indexOf(assignedRole);
      if (index > -1) {
        availableRoles.splice(index, 1);
      }
    }
  });

  // 柔軟なプレイヤーを希望ロールの少ない順にソート
  const sortedFlexible = [...flexiblePlayers].sort(
    (a, b) => a.preferredRoles.length - b.preferredRoles.length
  );

  // 柔軟なプレイヤーを残りのロールに割り当て
  sortedFlexible.forEach((player) => {
    const possibleRoles = availableRoles.filter((r) =>
      player.preferredRoles.includes(r)
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
  const roleOrder: Role[] = ["TOP", "JUG", "MID", "ADC", "SUP"];
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

    // プレイヤーの全情報を保持したままassignedRoleを追加
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
  const [selectedRegion, setSelectedRegion] = useState<string>("jp1");
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
  const [gameMode, setGameMode] = useState<"summoners-rift" | "aram">(
    "summoners-rift"
  );

  // ローカルストレージからプレイヤーを読み込む（初回のみ）
  useEffect(() => {
    const savedPlayers = localStorage.getItem("lol_team_players");
    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers);
        // strictRoleMatchフィールドが存在しない古いデータの場合は追加
        const updatedPlayers = parsed.map((p: Player) => ({
          ...p,
          strictRoleMatch: p.strictRoleMatch ?? false,
        }));
        setPlayers(updatedPlayers);
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

  useEffect(() => {
    if (result) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [result]);

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
  // 希望ロール絶対条件の切り替え
  const toggleStrictRoleMatch = (playerId: number): void => {
    setPlayers(
      players.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            strictRoleMatch: !player.strictRoleMatch,
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
        .replace(/\u2066/g, "") // ⦆を削除
        .replace(/\u2069/g, "") // ⩩を削除
        .replace(/\s+(?=#)/g, "") // #の前の空白のみを削除
        .replace(/がロビーに参加しました。?$/g, ""); // 語尾の「がロビーに参加しました。」を削除

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
        const rankData = await fetchRankFromAPI(
          summonerName,
          tag,
          selectedRegion
        );

        const newPlayer = {
          id: Date.now() + Math.random(), // 同時追加対応
          summonerName,
          tag,
          preferredRoles: [...ROLES], // デフォルトで全ロール選択
          strictRoleMatch: false,
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
    const requiredPlayers = gameMode === "summoners-rift" ? 10 : 2;
    if (players.length < requiredPlayers) {
      alert(
        gameMode === "summoners-rift"
          ? "10人揃ってから実行してください"
          : "最低2人必要です"
      );
      return;
    }

    // 👇 最大試行回数を増やし、より厳密なチェックを追加
    const maxAttempts = 100;
    let bestTeams = null;
    let bestScore = Infinity;

    // 前回のブルーチームのプレイヤーIDセットを作成
    const previousBlueTeamIds = result?.blueTeam
      ? new Set(result.blueTeam.map((p) => p.id))
      : null;

    // 前回のロール割り当てを保存
    const previousBlueTeamRoles = result?.blueTeam
      ? new Map(result.blueTeam.map((p) => [p.id, p.assignedRole]))
      : null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const teams = divideTeams(players, result?.blueTeam || null);

      if (!teams) continue;

      // エラーメッセージがある場合は表示して終了
      if ("error" in teams) {
        alert(teams.error);
        return;
      }

      const sum1 = teams.team1.reduce((s, p) => s + p.rating, 0);
      const sum2 = teams.team2.reduce((s, p) => s + p.rating, 0);
      const totalDiff = Math.abs(sum1 - sum2);

      // ボットレーン差も考慮
      const team1Bot = teams.team1.filter(
        (p) => p.assignedRole === "ADC" || p.assignedRole === "SUP"
      );
      const team2Bot = teams.team2.filter(
        (p) => p.assignedRole === "ADC" || p.assignedRole === "SUP"
      );
      const team1BotRating = team1Bot.reduce((s, p) => s + p.rating, 0);
      const team2BotRating = team2Bot.reduce((s, p) => s + p.rating, 0);
      const botDiff = Math.abs(team1BotRating - team2BotRating);

      const score = totalDiff + botDiff * 1.5;

      // 👇 前回のチームと比較して変更があるかチェック
      let hasSignificantChange = true;
      if (previousBlueTeamIds && previousBlueTeamRoles) {
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

        // ロール割り当てが同じプレイヤーが4人以上いる場合はスキップ
        let sameRoleCount = 0;
        for (const player of teams.team1) {
          const prevRole = previousBlueTeamRoles.get(player.id);
          if (prevRole && prevRole === player.assignedRole) {
            sameRoleCount++;
          }
        }
        if (sameRoleCount >= 4) {
          continue;
        }

        // 少なくとも2人以上の変更がある場合のみ採用
        const changedPlayers = [...currentTeam1Ids].filter(
          (id) => !previousBlueTeamIds.has(id)
        ).length;
        if (changedPlayers < 2) {
          continue;
        }
      }

      // スコアが最小のチームを保存
      if (score < bestScore) {
        bestScore = score;
        bestTeams = teams;
      }

      // 十分に良いバランスが見つかったら早期終了
      if (
        totalDiff <= 50 &&
        botDiff <= 100 &&
        (!previousBlueTeamIds || bestTeams)
      ) {
        break;
      }
    }

    if (!bestTeams) {
      // フォールバック: 前回のチーム情報を無視して再試行
      const fallbackTeams = divideTeams(players, null);

      if (!fallbackTeams) {
        alert("チーム分けに失敗しました");
        return;
      }

      if ("error" in fallbackTeams) {
        alert(fallbackTeams.error);
        return;
      }

      bestTeams = fallbackTeams;
    }

    const avgRating1 = bestTeams.team1.reduce((s, p) => s + p.rating, 0) / 5;
    const avgRating2 = bestTeams.team2.reduce((s, p) => s + p.rating, 0) / 5;

    const avgTier1 = ratingToTier(Math.round(avgRating1));
    const avgTier2 = ratingToTier(Math.round(avgRating2));

    setResult({
      blueTeam: bestTeams.team1,
      redTeam: bestTeams.team2,
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
    loadingDiv.className = "loading-overlay";
    document.body.appendChild(loadingDiv);

    try {
      // 元のスタイルを保存
      const originalOverflow = element.style.overflow;
      const originalMaxHeight = element.style.maxHeight;
      const originalWidth = element.style.width;

      // ボタンエリアを一時的に非表示
      const buttonArea = document.getElementById("button-area");
      const originalButtonDisplay = buttonArea?.style.display;
      if (buttonArea) {
        buttonArea.style.display = "none";
      }

      // グリッドコンテナを取得して強制的に2カラムレイアウトを維持
      const gridContainer = document.getElementById("teams-grid-container");
      const originalGridWidth = gridContainer?.style.width;
      if (gridContainer) {
        gridContainer.style.display = "grid";
        gridContainer.style.gridTemplateColumns = "1fr 1fr";
        gridContainer.style.gap = "0.75rem";
        gridContainer.style.width = "auto"; // 自動幅に設定
      }

      // 一時的にスクロールを無効化し、全体を表示
      element.style.overflow = "visible";
      element.style.maxHeight = "none";
      element.style.width = "fit-content"; // コンテンツ全体の幅に合わせる

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

          if (!clonedElement) return;

          const roleIcons = clonedElement.querySelectorAll(
            ".role-icon-container"
          );
          roleIcons.forEach((icon: any) => {
            icon.style.display = "inline-block";
            icon.style.verticalAlign = "middle";
            icon.style.width = "12px";
            icon.style.height = "12px";
            icon.style.lineHeight = "12px";
            icon.style.marginRight = "2px";
            icon.style.position = "relative";
            icon.style.overflow = "visible";
            icon.style.alignItems = "";
            icon.style.justifyContent = "";
            icon.style.flexShrink = "";
          });

          const roleIconSvgsInBadge = clonedElement.querySelectorAll(
            ".preferred-role-badge .role-icon-container svg"
          );
          roleIconSvgsInBadge.forEach((svg: any) => {
            svg.style.display = "block";
            svg.style.width = "12px";
            svg.style.height = "12px";
            svg.style.verticalAlign = "top";
            svg.style.fill = "currentColor";
            svg.style.margin = "0";
            svg.style.padding = "0";
          });

          const roleTexts = clonedElement.querySelectorAll(".role-text");
          roleTexts.forEach((text: any) => {
            text.style.display = "inline-block";
            text.style.verticalAlign = "middle";
            text.style.lineHeight = "12px";
            text.style.fontSize = "9px";
            text.style.height = "12px";
            text.style.fontWeight = "inherit";
            text.style.margin = "0";
            text.style.padding = "0";
            text.style.color = "inherit";
            text.style.backgroundColor = "transparent";
          });

          const roleBadges = clonedElement.querySelectorAll(
            '[class*="preferred-role-badge"]'
          );
          roleBadges.forEach((badge: any) => {
            badge.style.display = "inline-block";
            badge.style.verticalAlign = "middle";
            badge.style.marginRight = "2px";
            badge.style.marginBottom = "2px";
            badge.style.padding = "3px 5px";
            badge.style.fontSize = "9px";
            badge.style.lineHeight = "12px";
            badge.style.borderRadius = "4px";
            badge.style.whiteSpace = "nowrap";
            badge.style.height = "18px";
            badge.style.minHeight = "18px";
            badge.style.boxSizing = "border-box";
            badge.style.position = "relative";
            badge.style.overflow = "visible";
            badge.style.alignItems = "";
            badge.style.justifyContent = "";
            badge.style.gap = "";
          });

          if (clonedElement) {
            // 背景色を確実に適用
            clonedElement.style.backgroundColor = "#010A13";

            // タイトルを金色に修正
            const title = clonedElement.querySelector("h2");
            if (title) {
              (title as HTMLElement).style.color = "#C89B3C";
              (title as HTMLElement).style.background = "none";
              (title as HTMLElement).style.webkitTextFillColor = "#C89B3C";
              (title as HTMLElement).style.webkitBackgroundClip = "unset";
            }

            // 🔥 重要: Tableレイアウトを維持したまま、display:table-cellの中央揃えを強化
            const playerCards = clonedElement.querySelectorAll(
              '[class*="player-card-inner-table"]'
            );
            playerCards.forEach((table: any) => {
              table.style.display = "table";
              table.style.width = "100%";
              table.style.tableLayout = "fixed";
              table.style.borderCollapse = "collapse";
            });

            const playerRows = clonedElement.querySelectorAll(
              '[class*="player-card-inner-row"]'
            );
            playerRows.forEach((row: any) => {
              row.style.display = "table-row";
              row.style.height = "60px";
            });

            // ロールアイコンセル - vertical-align: middleを強制
            const roleIconCells = clonedElement.querySelectorAll(
              '[class*="player-card-cell-role-icon"]'
            );
            roleIconCells.forEach((cell: any) => {
              cell.style.display = "table-cell";
              cell.style.verticalAlign = "middle";
              cell.style.width = "35px";
              cell.style.height = "40px";
              cell.style.paddingRight = "6px";
              cell.style.textAlign = "center";
              cell.style.lineHeight = "60px";
            });

            // ロールアイコン内のSVG
            const roleIconSvgs = clonedElement.querySelectorAll(
              ".role-icon-container svg"
            );
            roleIconSvgs.forEach((svg: any) => {
              svg.style.display = "block";
              svg.style.width = "12px";
              svg.style.height = "12px";
              svg.style.verticalAlign = "baseline";
            });

            // プロフィールセル
            const profileCells = clonedElement.querySelectorAll(
              '[class*="player-card-cell-profile"]'
            );
            profileCells.forEach((cell: any) => {
              cell.style.display = "table-cell";
              cell.style.verticalAlign = "top";
              cell.style.width = "50px";
              cell.style.height = "60px";
              cell.style.paddingRight = "8px";
              cell.style.paddingTop = "4px";
              cell.style.textAlign = "center";
              cell.style.lineHeight = "1";
            });

            // プロフィールアイコン画像
            const profileIcons = clonedElement.querySelectorAll(
              '[class*="profile-icon"]'
            );
            profileIcons.forEach((icon: any) => {
              if (icon.tagName === "IMG") {
                icon.style.display = "block";
                icon.style.margin = "0 auto 2px auto";
                icon.style.width = "32px";
                icon.style.height = "32px";
                icon.style.borderRadius = "50%";
              }
            });
            // サモナー名ラッパー - マージンとパディングを削除
            const summonerNameWrappers = clonedElement.querySelectorAll(
              ".summoner-name-wrapper"
            );
            summonerNameWrappers.forEach((wrapper: any) => {
              wrapper.style.display = "block";
              wrapper.style.margin = "0";
              wrapper.style.padding = "0";
              wrapper.style.lineHeight = "1";
            });
            // プロフィールアイコンラッパー - マージンを削除
            const profileIconWrappers = clonedElement.querySelectorAll(
              ".profile-icon-wrapper"
            );
            profileIconWrappers.forEach((wrapper: any) => {
              wrapper.style.display = "block";
              wrapper.style.margin = "0";
              wrapper.style.padding = "0";
              wrapper.style.lineHeight = "1";
            });

            // サモナー名
            const summonerNames =
              clonedElement.querySelectorAll(".summoner-name");
            summonerNames.forEach((name: any) => {
              name.style.display = "block";
              name.style.textAlign = "center";
              name.style.lineHeight = "1.1";
              name.style.fontSize = "9px";
              name.style.margin = "0";
              name.style.padding = "0";
              name.style.wordBreak = "break-all";
              name.style.color = "white";
              name.style.fontWeight = "600";
            });

            // 情報セル
            const infoCells = clonedElement.querySelectorAll(
              '[class*="player-card-cell-info"]'
            );
            infoCells.forEach((cell: any) => {
              cell.style.display = "table-cell";
              cell.style.verticalAlign = "top"; // middle → top に変更
              cell.style.width = "auto";
              cell.style.height = "60px";
              cell.style.paddingLeft = "6px";
              cell.style.paddingTop = "4px"; // 上部パディングを追加
            });

            // player-info-wrapper
            const infoWrappers = clonedElement.querySelectorAll(
              ".player-info-wrapper"
            );
            infoWrappers.forEach((wrapper: any) => {
              wrapper.style.display = "block";
              wrapper.style.width = "100%";
              wrapper.style.padding = "0";
              wrapper.style.margin = "0";
              wrapper.style.lineHeight = "1";
            });
            // ロール割り当て行
            const roleAssignmentRows = clonedElement.querySelectorAll(
              ".role-assignment-row"
            );
            roleAssignmentRows.forEach((row: any) => {
              row.style.margin = "0";
              row.style.padding = "0";
              row.style.marginBottom = "2px";
              row.style.lineHeight = "1.2";
              row.style.height = "auto";
            });
            // ロール名 (TOP, JUG, MID, ADC, SUP)
            const roleNames = clonedElement.querySelectorAll(
              ".blue-assigned-role, .red-assigned-role"
            );
            roleNames.forEach((el: any) => {
              el.style.display = "block";
              el.style.lineHeight = "0";
              el.style.fontSize = "13px";
              el.style.fontWeight = "bold";
              el.style.marginBottom = "15px";
              el.style.marginTop = "0";
              el.style.paddingTop = "0";
              el.style.whiteSpace = "nowrap";
              el.style.overflow = "visible";
            });

            // ランク情報 (DIAMOND IV など)
            const rankInfos = clonedElement.querySelectorAll(".rank-info");
            rankInfos.forEach((info: any) => {
              info.style.marginBottom = "10px"; // 2px → 4px に増やして余白を追加
              info.style.marginTop = "0";
              info.style.lineHeight = "10px";
              info.style.fontSize = "10px";
              info.style.color = "#d1d5db";
            });

            const rankInfoDivs =
              clonedElement.querySelectorAll(".rank-info div");
            rankInfoDivs.forEach((div: any) => {
              div.style.overflow = "visible";
              div.style.textOverflow = "clip";
              div.style.whiteSpace = "normal";
            });

            // 希望ロールコンテナ
            const preferredRolesContainers = clonedElement.querySelectorAll(
              ".preferred-roles-container"
            );
            preferredRolesContainers.forEach((container: any) => {
              container.style.marginTop = "2px";
              container.style.lineHeight = "0"; // 重要: inline-block間の隙間削除
              container.style.fontSize = "0"; // さらに確実にするため
            });

            // 希望ロールバッジ
            const roleBadges = clonedElement.querySelectorAll(
              '[class*="preferred-role-badge"]'
            );
            roleBadges.forEach((badge: any) => {
              badge.style.display = "inline-flex";
              badge.style.alignItems = "center";
              badge.style.verticalAlign = "middle";
              badge.style.marginRight = "2px";
              badge.style.marginBottom = "2px";
              badge.style.padding = "3px 5px";
              badge.style.fontSize = "9px";
              badge.style.lineHeight = "1";
              badge.style.borderRadius = "4px";
              badge.style.whiteSpace = "nowrap";
              badge.style.height = "18px";
              badge.style.minHeight = "18px";
              badge.style.boxSizing = "border-box";
              badge.style.position = "relative";
              badge.style.overflow = "visible";
              badge.style.gap = "2px";
            });
            // 選択されたロールバッジ（青チーム）
            const blueActiveBadges = clonedElement.querySelectorAll(
              ".blue-preferred-role-active"
            );
            blueActiveBadges.forEach((badge: any) => {
              badge.style.backgroundColor = "#0a84ff";
              badge.style.color = "#ffffff";
              badge.style.fontWeight = "600";
              badge.style.border = "none";
              badge.style.opacity = "1";
            });
            // 未選択ロールバッジ（青チーム）
            const blueInactiveBadges = clonedElement.querySelectorAll(
              ".blue-preferred-role-inactive"
            );
            blueInactiveBadges.forEach((badge: any) => {
              badge.style.backgroundColor = "rgba(100, 100, 100, 0.3)";
              badge.style.color = "#aaaaaa";
              badge.style.fontWeight = "normal";
              badge.style.border = "none";
              badge.style.opacity = "1";
            });
            // 選択されたロールバッジ（赤チーム）
            const redActiveBadges = clonedElement.querySelectorAll(
              ".red-preferred-role-active"
            );
            redActiveBadges.forEach((badge: any) => {
              badge.style.backgroundColor = "#dc3545";
              badge.style.color = "#ffffff";
              badge.style.fontWeight = "600";
              badge.style.border = "none";
              badge.style.opacity = "1";
            });

            // 未選択ロールバッジ（赤チーム）
            const redInactiveBadges = clonedElement.querySelectorAll(
              ".red-preferred-role-inactive"
            );
            redInactiveBadges.forEach((badge: any) => {
              badge.style.backgroundColor = "rgba(100, 100, 100, 0.3)";
              badge.style.color = "#aaaaaa";
              badge.style.fontWeight = "normal";
              badge.style.border = "none";
              badge.style.opacity = "1";
            });
            // ロールアイコンコンテナ
            const roleIcons = clonedElement.querySelectorAll(
              ".role-icon-container"
            );
            roleIcons.forEach((icon: any) => {
              icon.style.display = "flex";
              icon.style.alignItems = "center";
              icon.style.justifyContent = "center";
              icon.style.width = "12px";
              icon.style.height = "12px";
              icon.style.flexShrink = "0";
              icon.style.position = "relative";
              icon.style.overflow = "visible";
            });
            const roleIconSvgsInBadge = clonedElement.querySelectorAll(
              ".preferred-role-badge .role-icon-container svg"
            );
            roleIconSvgsInBadge.forEach((svg: any) => {
              svg.style.display = "block";
              svg.style.width = "12px";
              svg.style.height = "12px";
              svg.style.verticalAlign = "top"; // topに変更
              svg.style.fill = "currentColor";
              svg.style.margin = "0";
              svg.style.padding = "0";
            });
            // ロールテキスト - サイズ調整
            const roleTexts = clonedElement.querySelectorAll(".role-text");
            roleTexts.forEach((text: any) => {
              text.style.display = "inline-block";
              text.style.verticalAlign = "middle";
              text.style.lineHeight = "0";
              text.style.fontSize = "9px";
              text.style.height = "12px";
              text.style.fontWeight = "inherit";
              text.style.margin = "0";
              text.style.padding = "0";
              text.style.color = "inherit";
              text.style.backgroundColor = "transparent";
            });

            // グラデーション背景を持つ要素を単色に変換
            const allTextElements = clonedElement.querySelectorAll(
              "span, div, p, h1, h2, h3"
            );
            allTextElements.forEach((el: any) => {
              if (el.style.webkitBackgroundClip === "text") {
                el.style.webkitBackgroundClip = "unset";
                el.style.webkitTextFillColor = "#C89B3C";
                el.style.color = "#C89B3C";
                el.style.background = "none";
              }
            });

            // 最後に全体のレイアウトを強制的に再計算
            clonedElement.style.position = "relative";
            clonedElement.style.display = "block";
          }
        },
      });

      // スタイルを元に戻す
      element.style.overflow = originalOverflow;
      element.style.maxHeight = originalMaxHeight;
      element.style.width = originalWidth;
      element.style.transform = "";

      // グリッドコンテナも元に戻す
      if (gridContainer && originalGridWidth !== undefined) {
        gridContainer.style.width = originalGridWidth;
      }

      // ボタンエリアを再表示
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
            "❌ コピーに失敗しました\n\n" +
              "【原因】\n" +
              "画像生成中に別のウィンドウやタブに\n" +
              "切り替えたため、処理が中断されました\n\n" +
              "【もう一度試す方法】\n" +
              "• このページに留まったまま\n" +
              "• ボタンをもう一度押してください\n" +
              "• 完了まで他の操作をしないでください"
          );
        }
      }, "image/png");
    } catch (error) {
      document.body.removeChild(loadingDiv);
      console.error("スクリーンショットの生成に失敗:", error);
      alert("❌ スクリーンショットの生成に失敗しました");
    }
  };

  return (
    <div className="main-container">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2 title-gradient title-clickable"
            onClick={resetToInitialState}
            title="クリックで初期状態に戻す"
            style={{ textAlign: "center" }}
          >
            <Users
              className="w-10 h-10 title-icon"
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                marginRight: "0.75rem",
              }}
            />
            <span style={{ display: "inline-block", verticalAlign: "middle" }}>
              LoL カスタムチーム分けシステム
            </span>
          </h1>
          <p
            className="subtitle-clickable"
            onClick={resetToInitialState}
            title="クリックで初期状態に戻す"
          >
            公平なチーム分けとロール配分
          </p>
          <AdBanner slot="1234567890" />
        </div>
        {/* ========== カード1: 基本設定 ========== */}
        <div className="card-base mb-4 max-w-4xl mx-auto">
          <h2 className="section-title">■ 基本設定</h2>

          <div className="mb-4">
            <label className="form-label">リージョン選択</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="rank-select"
              style={{ width: "100%" }}
            >
              {REGIONS.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name} ({region.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-0">
            <label className="form-label">ゲームモード</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGameMode("summoners-rift")}
                className={`px-4 py-2 rounded transition-all ${
                  gameMode === "summoners-rift"
                    ? "sort-button-active"
                    : "sort-button-inactive"
                }`}
              >
                サモナーズリフト (5v5)
              </button>
              <button
                onClick={() => setGameMode("aram")}
                className={`px-4 py-2 rounded transition-all ${
                  gameMode === "aram"
                    ? "sort-button-active"
                    : "sort-button-inactive"
                }`}
              >
                ランダムミッド (ARAM)
              </button>
            </div>
          </div>
        </div>

        {/* ========== カード2: プレイヤー追加 ========== */}
        {players.length < 10 && (
          <div className="card-base mb-4 max-w-4xl mx-auto">
            <h2 className="section-title">■ プレイヤー追加</h2>

            <div className="space-y-4">
              <div>
                <label className="form-label">サモナー名#タグ</label>
                <div className="rounded-lg p-3 mb-4 border info-box">
                  <p className="text-blue-200 text-sm">
                    💡複数行で一括追加可能です。カスタムロビーチャットを貼り付けて追加することできます。
                  </p>
                </div>
                <textarea
                  placeholder="例:&#10;Player1#JP1がロビーに参加しました。&#10;Player2#JP1がロビーに参加しました。&#10;Player3#JP1がロビーに参加しました。"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 rounded text-white placeholder-white/50 border-2 border-blue-500/50 focus:border-blue-400 focus:outline-none transition-all input-field"
                />
              </div>

              {addResults && (
                <div className="space-y-3">
                  {addResults.success.length > 0 && (
                    <div className="message-success">
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
                    <div className="rounded-lg p-4 border-2 border-red-500/50 message-error">
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
                <div className="rounded-lg p-3 border-2 border-blue-500/50 message-processing">
                  <div className="text-blue-300 text-sm mb-2">
                    処理中: {currentProcessing}
                  </div>
                  <div className="text-blue-400 text-xs mb-2">
                    進捗: {processedCount}/{totalCount}
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
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
                className={`add-button ${
                  loading || !currentInput.trim()
                    ? "add-button-disabled"
                    : "add-button-enabled"
                }`}
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
          <div className="card-base mb-4 max-w-4xl mx-auto">
            <table
              style={{
                width: "100%",
                marginBottom: "0.75rem",
                borderCollapse: "collapse",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                    <h2 className="section-title">
                      ■ 登録プレイヤー ({players.length}/10)
                    </h2>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      verticalAlign: "middle",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      onClick={() => setSortType("none")}
                      className={
                        sortType === "none"
                          ? "sort-button-active"
                          : "sort-button-inactive"
                      }
                      style={{ marginLeft: "0.5rem" }}
                    >
                      追加順
                    </button>
                    <button
                      onClick={() => setSortType("rating-high")}
                      className={
                        sortType === "rating-high"
                          ? "sort-button-active"
                          : "sort-button-inactive"
                      }
                      style={{ marginLeft: "0.5rem" }}
                    >
                      ランク高い順
                    </button>
                    <button
                      onClick={() => setSortType("rating-low")}
                      className={
                        sortType === "rating-low"
                          ? "sort-button-active"
                          : "sort-button-inactive"
                      }
                      style={{ marginLeft: "0.5rem" }}
                    >
                      ランク低い順
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 説明文を追加 */}
            <div className="rounded-lg p-3 mb-4 border info-box">
              <p className="text-blue-200 text-sm">💡使い方</p>
              <p className="text-blue-200 text-sm">
                &nbsp;&nbsp;&nbsp;&nbsp;●
                過去最高ランクと差がある場合、選択されてる「ランク」を調整してください。
              </p>
              {gameMode === "summoners-rift" && (
                <>
                  <p className="text-blue-200 text-sm">
                    &nbsp;&nbsp;&nbsp;&nbsp;●
                    「各ロール」ボタンを選択すると希望ロールを優先しつつ、必要に応じて他ロールにも割り当てます。
                  </p>
                  <p className="text-blue-200 text-sm">
                    &nbsp;&nbsp;&nbsp;&nbsp;●
                    「他ロール拒否」を選択すると、選択したロール以外には割り当てられなくなります。
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              {sortedPlayers.map((player) => (
                <div key={player.id} className="player-card-registration">
                  <div className="player-card-registration-flex">
                    {" "}
                    {/* プロフィールアイコン */}
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${
                        player.profileIcon || 29
                      }.png`}
                      alt="Profile Icon"
                      className="profile-icon-registration"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/29.png";
                      }}
                    />
                    <span className="summoner-name-registration">
                      {" "}
                      {player.summonerName}#{player.tag}
                    </span>
                    <select
                      value={
                        player.rank
                          ? `${player.tier}-${player.rank}`
                          : player.tier
                      }
                      onChange={(e) => {
                        const [newTier, newRank] = e.target.value.split("-");
                        changePlayerRank(player.id, newTier, newRank);
                      }}
                      className="rank-select-registration"
                    >
                      {RANK_OPTIONS.map((option) => (
                        <option
                          key={`${option.tier}-${option.rank}`}
                          value={
                            option.rank
                              ? `${option.tier}-${option.rank}`
                              : option.tier
                          }
                        >
                          {option.display}
                        </option>
                      ))}
                    </select>
                    {/* ロール選択ボタン部分を条件付きレンダリング */}
                    {gameMode === "summoners-rift" && (
                      <>
                        <div className="flex gap-1">
                          {ROLES.map((role) => {
                            const isSelected =
                              player.preferredRoles.includes(role);
                            return (
                              <button
                                key={role}
                                onClick={() =>
                                  togglePlayerRole(player.id, role)
                                }
                                className={
                                  isSelected
                                    ? "role-button-registration-selected"
                                    : "role-button-registration-unselected"
                                }
                              >
                                <RoleIcon role={role} size={12} />
                                {role}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <label
                            className="flex items-center gap-1 cursor-pointer"
                            style={{
                              fontSize: "0.75rem",
                              color: player.strictRoleMatch
                                ? "#0A84FF"
                                : "#999",
                              userSelect: "none",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={player.strictRoleMatch}
                              onChange={() => toggleStrictRoleMatch(player.id)}
                              style={{
                                width: "14px",
                                height: "14px",
                                cursor: "pointer",
                                accentColor: "#0A84FF",
                              }}
                            />
                            <span>他ロール拒否</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAllRoles(player.id)}
                            className={
                              player.preferredRoles.length === ROLES.length
                                ? "toggle-all-button-deselect"
                                : "toggle-all-button-select"
                            }
                          >
                            {player.preferredRoles.length === ROLES.length
                              ? "全解除"
                              : "全選択"}
                          </button>
                        </div>
                      </>
                    )}
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
              disabled={
                gameMode === "summoners-rift"
                  ? players.length !== 10
                  : players.length < 2
              }
              className={`create-teams-button ${
                (gameMode === "summoners-rift" && players.length === 10) ||
                (gameMode === "aram" && players.length >= 2)
                  ? "create-teams-button-enabled"
                  : "create-teams-button-disabled"
              }`}
            >
              <Shuffle className="w-5 h-5" />
              チーム分け実行{" "}
              {gameMode === "summoners-rift" &&
                players.length !== 10 &&
                `(${10 - players.length}人不足)`}
              {gameMode === "aram" && players.length < 2 && `(最低2人必要)`}
            </button>
            <AdBanner slot="9876543210" format="horizontal" />
          </div>
        )}

        {result && (
          <div className="result-modal-overlay">
            <div id="team-result-container" className="result-container">
              <table
                style={{
                  width: "100%",
                  marginBottom: "0.75rem",
                  borderCollapse: "collapse",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                      <h2 className="result-title">■ チーム分け結果</h2>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        verticalAlign: "middle",
                        width: "auto",
                      }}
                    >
                      <button
                        onClick={() => setResult(null)}
                        className="modal-close-button"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div id="teams-grid-container" className="teams-grid">
                {/* ブルーチーム */}
                <div className="blue-team-card">
                  <h3 className="blue-team-title">ブルーチーム</h3>
                  <p className="avg-rank-text">
                    平均ランク: {result.avgTier1.tier} {result.avgTier1.rank}
                  </p>
                  <div className="space-y-1.5">
                    {result.blueTeam.map((player) => (
                      <div
                        key={player.id}
                        className="rounded p-2 blue-player-card"
                      >
                        <table className="player-card-inner-table">
                          <tbody>
                            <tr className="player-card-inner-row">
                              {/* ロールアイコンセル */}
                              {gameMode === "summoners-rift" && (
                                <td className="player-card-cell-role-icon blue-role-icon">
                                  <RoleIcon
                                    role={player.assignedRole!}
                                    size={20}
                                  />
                                </td>
                              )}
                              {/* プロフィール画像とサモナー名 */}
                              <td className="player-card-cell-profile">
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${
                                    player.profileIcon || 29
                                  }.png`}
                                  alt="Profile Icon"
                                  className="blue-profile-icon"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/29.png";
                                  }}
                                />
                                <span className="summoner-name">
                                  {player.summonerName}
                                </span>
                              </td>

                              {/* プレイヤー情報 */}
                              <td className="player-card-cell-info">
                                <div>
                                  {/* 割り当てられたロール */}
                                  {gameMode === "summoners-rift" && (
                                    <div className="role-assignment-row">
                                      <span className="blue-assigned-role">
                                        {player.assignedRole}
                                      </span>
                                    </div>
                                  )}
                                  {/* ランク情報 */}
                                  <div className="rank-info">
                                    <div>
                                      {player.tier} {player.rank}
                                    </div>
                                  </div>

                                  {/* 希望ロール一覧 */}

                                  {gameMode === "summoners-rift" && (
                                    <div className="preferred-roles-container">
                                      {player.preferredRoles.map((role) => (
                                        <span
                                          key={role}
                                          className={`preferred-role-badge ${
                                            role === player.assignedRole
                                              ? "blue-preferred-role-active"
                                              : "blue-preferred-role-inactive"
                                          }`}
                                        >
                                          <span className="role-icon-container">
                                            <RoleIcon role={role} size={12} />
                                          </span>
                                          <span className="role-text">
                                            {role}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>

                {/* レッドチーム */}
                <div className="red-team-card">
                  <h3 className="red-team-title">レッドチーム</h3>
                  <p className="avg-rank-text">
                    平均ランク: {result.avgTier2.tier} {result.avgTier2.rank}
                  </p>
                  <div className="space-y-1.5">
                    {result.redTeam.map((player) => (
                      <div
                        key={player.id}
                        className="rounded p-2 red-player-card"
                      >
                        <table className="player-card-inner-table">
                          <tbody>
                            <tr className="player-card-inner-row">
                              {/* ロールアイコン */}

                              {gameMode === "summoners-rift" && (
                                <td className="player-card-cell-role-icon red-role-icon">
                                  <RoleIcon
                                    role={player.assignedRole!}
                                    size={20}
                                  />
                                </td>
                              )}
                              {/* プロフィール画像とサモナー名 */}
                              <td className="player-card-cell-profile">
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${
                                    player.profileIcon || 29
                                  }.png`}
                                  alt="Profile Icon"
                                  className="red-profile-icon"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/29.png";
                                  }}
                                />
                                <span className="summoner-name">
                                  {player.summonerName}
                                </span>
                              </td>

                              {/* プレイヤー情報 */}
                              <td className="player-card-cell-info">
                                <div>
                                  {/* 割り当てられたロール */}
                                  {gameMode === "summoners-rift" && (
                                    <div className="role-assignment-row">
                                      <span className="red-assigned-role">
                                        {player.assignedRole}
                                      </span>
                                    </div>
                                  )}

                                  {/* ランク情報 */}
                                  <div className="rank-info">
                                    <div>
                                      {player.tier} {player.rank}
                                    </div>
                                  </div>

                                  {/* 希望ロール一覧 */}
                                  {gameMode === "summoners-rift" && (
                                    <div className="preferred-roles-container">
                                      {player.preferredRoles.map((role) => (
                                        <span
                                          key={role}
                                          className={`preferred-role-badge ${
                                            role === player.assignedRole
                                              ? "red-preferred-role-active"
                                              : "red-preferred-role-inactive"
                                          }`}
                                        >
                                          <span className="role-icon-container">
                                            <RoleIcon role={role} size={12} />
                                          </span>
                                          <span className="role-text">
                                            {role}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div id="button-area" style={{ marginTop: "0.5rem" }}>
                {/* 1行目: コピーと再チーム分けボタン */}
                <table className="button-area-table">
                  <tbody>
                    <tr className="button-area-row">
                      <td className="button-area-cell">
                        <button
                          onClick={copyResultToClipboard}
                          className="action-button"
                          style={{ width: "100%", display: "block" }}
                        >
                          <span style={{ display: "inline-block" }}>
                            📋 クリップボードにコピー
                          </span>
                          <span
                            className="action-button-beta"
                            style={{
                              display: "inline-block",
                              marginLeft: "0.25rem",
                            }}
                          ></span>
                        </button>
                      </td>
                      <td className="button-area-cell">
                        <button
                          onClick={createTeams}
                          className="reshuffle-button"
                          style={{ width: "100%", display: "block" }}
                        >
                          <Shuffle
                            className="w-5 h-5"
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle",
                              marginRight: "0.5rem",
                            }}
                          />
                          <span
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle",
                            }}
                          >
                            再チーム分け
                          </span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 2行目: 閉じるボタン */}
                <button
                  onClick={() => setResult(null)}
                  className="close-button"
                  style={{ width: "100%", display: "block" }}
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
