package riotapi

import "fmt"

// すべての基本的なチャレンジ設定情報のリスト（名前と説明のすべての翻訳を含む）
// GET /lol/challenges/v1/challenges/config
func (c *Client) GetChallengesConfig() ([]ChallengeConfig, error) {
	endpoint := "/lol/challenges/v1/challenges/config"
	var configs []ChallengeConfig
	err := c.makeRequest(endpoint, &configs, false)
	if err != nil {
		return nil, err
	}
	return configs, nil
}

// レベルとそれを達成したプレイヤーのパーセンタイルのマップ - キー: ChallengeId -> Season -> Level -> それを達成したプレイヤーのパーセンタイル
// GET /lol/challenges/v1/challenges/percentiles
func (c *Client) GetChallengesPercentiles() (ChallengePercentiles, error) {
	endpoint := "/lol/challenges/v1/challenges/percentiles"
	var percentiles ChallengePercentiles
	err := c.makeRequest(endpoint, &percentiles, false)
	if err != nil {
		return nil, err
	}
	return percentiles, nil
}

// チャレンジ設定を取得する（REST）
// GET /lol/challenges/v1/challenges/{challengeId}/config
func (c *Client) GetChallengeConfigByID(challengeID int64) (*ChallengeConfig, error) {
	endpoint := fmt.Sprintf("/lol/challenges/v1/challenges/%d/config", challengeID)
	var config ChallengeConfig
	err := c.makeRequest(endpoint, &config, false)
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// 各レベルのトッププレイヤーを返します。レベルはMASTER、GRANDMASTER、またはCHALLENGERである必要があります。
// GET /lol/challenges/v1/challenges/{challengeId}/leaderboards/by-level/{level}
// level: Challenge level (e.g., "MASTER", "GRANDMASTER", "CHALLENGER")
func (c *Client) GetChallengeLeaderboard(challengeID int64, level string) (*ChallengeLeaderboard, error) {
	endpoint := fmt.Sprintf("/lol/challenges/v1/challenges/%d/leaderboards/by-level/%s", challengeID, level)
	var leaderboard ChallengeLeaderboard
	err := c.makeRequest(endpoint, &leaderboard, false)
	if err != nil {
		return nil, err
	}
	return &leaderboard, nil
}

// レベルとそれを達成したプレイヤーのパーセンタイルマップ
// GET /lol/challenges/v1/challenges/{challengeId}/percentiles
func (c *Client) GetChallengePercentilesByID(challengeID int64) (map[string]float64, error) {
	endpoint := fmt.Sprintf("/lol/challenges/v1/challenges/%d/percentiles", challengeID)
	var percentiles map[string]float64
	err := c.makeRequest(endpoint, &percentiles, false)
	if err != nil {
		return nil, err
	}
	return percentiles, nil
}

// 進行中のすべてのチャレンジのリストを含むプレイヤー情報を返します (REST)
// GET /lol/challenges/v1/player-data/{puuid}
func (c *Client) GetPlayerChallenges(puuid string) (*PlayerChallenges, error) {
	endpoint := fmt.Sprintf("/lol/challenges/v1/player-data/%s", puuid)
	var challenges PlayerChallenges
	err := c.makeRequest(endpoint, &challenges, false)
	if err != nil {
		return nil, err
	}
	return &challenges, nil
}
