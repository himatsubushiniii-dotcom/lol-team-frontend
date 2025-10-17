package riotapi

import (
	"fmt"
	"math"
)

// RoleMMRResult はロール別MMRの計算結果
type RoleMMRResult struct {
	Role        string  `json:"role"`        // ロール名
	MMR         int     `json:"mmr"`         // 計算されたMMR
	GamesPlayed int     `json:"gamesPlayed"` // このロールでプレイしたゲーム数
	WinRate     float64 `json:"winRate"`     // 勝率
	AverageKDA  float64 `json:"averageKda"`  // 平均KDA
	AverageCS   float64 `json:"averageCs"`   // 平均CS/min
	BaseRating  int     `json:"baseRating"`  // ベースレーティング（ランクから）
	Confidence  float64 `json:"confidence"`  // 信頼度（0-1、ゲーム数に基づく）
}

// RoleStats はロール別の統計情報
type RoleStats struct {
	Wins          int
	Losses        int
	TotalKills    int
	TotalDeaths   int
	TotalAssists  int
	TotalCS       int
	TotalDuration int // 秒単位
}

// GetRoleMMR は指定されたPUUIDとロールのMMRを計算する
// puuid: プレイヤーのPUUID
// role: 計算対象のロール（TOP, JUNGLE, MID, ADC, SUPPORT）
// matchCount: 分析するマッチ数（デフォルト: 20, 最大: 100）
func (c *Client) GetRoleMMR(puuid string, role string, matchCount int) (*RoleMMRResult, error) {
	if matchCount <= 0 || matchCount > 100 {
		matchCount = 20
	}

	// 1. ベースレーティングを取得（ランク情報から）
	baseRating, err := c.getBaseRating(puuid)
	if err != nil {
		return nil, fmt.Errorf("ベースレーティングの取得に失敗: %w", err)
	}

	// 2. マッチ履歴を取得
	matchIDs, err := c.GetMatchIDs(puuid, 0, matchCount)
	if err != nil {
		return nil, fmt.Errorf("マッチ履歴の取得に失敗: %w", err)
	}

	// 3. ロール別の統計を収集
	stats := &RoleStats{}
	analyzedMatches := 0

	for _, matchID := range matchIDs {
		match, err := c.GetMatchByID(matchID)
		if err != nil {
			continue // エラーの場合はスキップ
		}

		// プレイヤーの情報を検索
		var participant *Participant
		for i := range match.Info.Participants {
			if match.Info.Participants[i].PUUID == puuid {
				participant = &match.Info.Participants[i]
				break
			}
		}

		if participant == nil {
			continue
		}

		// ロールのマッピング（Riot APIのポジション名を標準化）
		playerRole := normalizeRole(participant.TeamPosition)
		if playerRole != role {
			continue // 指定されたロール以外はスキップ
		}

		analyzedMatches++

		// 統計を集計
		if participant.Win {
			stats.Wins++
		} else {
			stats.Losses++
		}

		stats.TotalKills += participant.Kills
		stats.TotalDeaths += participant.Deaths
		stats.TotalAssists += participant.Assists
		stats.TotalCS += participant.TotalMinionsKilled + participant.NeutralMinionsKilled
		stats.TotalDuration += match.Info.GameDuration
	}

	// 4. MMRを計算
	if analyzedMatches == 0 {
		return &RoleMMRResult{
			Role:        role,
			MMR:         baseRating,
			GamesPlayed: 0,
			BaseRating:  baseRating,
			Confidence:  0.0,
		}, nil
	}

	mmr := calculateMMR(baseRating, stats, analyzedMatches)

	// 5. 各種統計を計算
	winRate := float64(stats.Wins) / float64(analyzedMatches) * 100
	averageKDA := calculateKDA(stats.TotalKills, stats.TotalDeaths, stats.TotalAssists)
	averageCS := calculateCSPerMin(stats.TotalCS, stats.TotalDuration)
	confidence := calculateConfidence(analyzedMatches, matchCount)

	return &RoleMMRResult{
		Role:        role,
		MMR:         mmr,
		GamesPlayed: analyzedMatches,
		WinRate:     winRate,
		AverageKDA:  averageKDA,
		AverageCS:   averageCS,
		BaseRating:  baseRating,
		Confidence:  confidence,
	}, nil
}

// getBaseRating はプレイヤーのベースレーティングを取得
func (c *Client) getBaseRating(puuid string) (int, error) {
	entries, err := c.GetLeagueEntriesByPUUID(puuid)
	if err != nil {
		return 0, err
	}

	// ソロランクを優先
	for _, entry := range entries {
		if entry.QueueType == "RANKED_SOLO_5x5" {
			return tierToRating(entry.Tier, entry.Rank, entry.LeaguePoints), nil
		}
	}

	// ソロランクがない場合は最初のエントリー
	if len(entries) > 0 {
		return tierToRating(entries[0].Tier, entries[0].Rank, entries[0].LeaguePoints), nil
	}

	// ランク情報がない場合はデフォルト（シルバー相当）
	return 800, nil
}

// tierToRating はティア情報をレーティングに変換
func tierToRating(tier, rank string, lp int) int {
	tierValues := map[string]int{
		"IRON":        0,
		"BRONZE":      400,
		"SILVER":      800,
		"GOLD":        1200,
		"PLATINUM":    1600,
		"EMERALD":     2000,
		"DIAMOND":     2400,
		"MASTER":      2800,
		"GRANDMASTER": 3200,
		"CHALLENGER":  3600,
		"UNRANKED":    800,
	}

	rankValues := map[string]int{
		"IV":  0,
		"III": 100,
		"II":  200,
		"I":   300,
	}

	return tierValues[tier] + rankValues[rank] + lp
}

// normalizeRole はRiot APIのロール名を標準形式に変換
func normalizeRole(position string) string {
	roleMap := map[string]string{
		"TOP":     "TOP",
		"JUNGLE":  "JUNGLE",
		"MIDDLE":  "MID",
		"MID":     "MID",
		"BOTTOM":  "ADC",
		"BOT":     "ADC",
		"UTILITY": "SUPPORT",
		"SUPPORT": "SUPPORT",
	}

	if normalized, ok := roleMap[position]; ok {
		return normalized
	}
	return position
}

// calculateMMR はベースレーティングと統計からMMRを計算
func calculateMMR(baseRating int, stats *RoleStats, gamesPlayed int) int {
	totalGames := stats.Wins + stats.Losses
	if totalGames == 0 {
		return baseRating
	}

	// 勝率による補正（-200 ~ +200）
	winRate := float64(stats.Wins) / float64(totalGames)
	winRateAdjustment := (winRate - 0.5) * 400

	// KDAによる補正（-100 ~ +100）
	kda := calculateKDA(stats.TotalKills, stats.TotalDeaths, stats.TotalAssists)
	kdaAdjustment := 0.0
	if kda < 2.0 {
		kdaAdjustment = (kda - 2.0) * 50 // KDA 2.0未満はマイナス
	} else if kda > 3.0 {
		kdaAdjustment = math.Min((kda-3.0)*50, 100) // KDA 3.0以上はプラス（最大+100）
	}

	// CS効率による補正（-50 ~ +50）
	csPerMin := calculateCSPerMin(stats.TotalCS, stats.TotalDuration)
	csAdjustment := 0.0
	if csPerMin < 5.0 {
		csAdjustment = (csPerMin - 5.0) * 10
	} else if csPerMin > 7.0 {
		csAdjustment = math.Min((csPerMin-7.0)*25, 50)
	}

	// サンプル数による信頼度（ゲーム数が少ない場合は補正を抑える）
	confidence := calculateConfidence(gamesPlayed, 20)

	// 最終MMR計算
	totalAdjustment := (winRateAdjustment + kdaAdjustment + csAdjustment) * confidence
	finalMMR := baseRating + int(totalAdjustment)

	// MMRの範囲を制限（0 ~ 4000）
	if finalMMR < 0 {
		finalMMR = 0
	} else if finalMMR > 4000 {
		finalMMR = 4000
	}

	return finalMMR
}

// calculateKDA はKDAを計算
func calculateKDA(kills, deaths, assists int) float64 {
	if deaths == 0 {
		return float64(kills + assists)
	}
	return float64(kills+assists) / float64(deaths)
}

// calculateCSPerMin は分あたりのCSを計算
func calculateCSPerMin(totalCS, totalDurationSeconds int) float64 {
	if totalDurationSeconds == 0 {
		return 0
	}
	minutes := float64(totalDurationSeconds) / 60.0
	return float64(totalCS) / minutes
}

// calculateConfidence はサンプル数から信頼度を計算（0.0 ~ 1.0）
func calculateConfidence(actualGames, targetGames int) float64 {
	if actualGames >= targetGames {
		return 1.0
	}
	// シグモイド関数で滑らかに信頼度を上げる
	x := float64(actualGames) / float64(targetGames)
	return math.Min(1.0, x*x) // 二次関数で緩やかに上昇
}
