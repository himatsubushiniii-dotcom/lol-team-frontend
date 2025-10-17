package riotapi

import "fmt"

// すべてのチャンピオンマスタリーエントリをチャンピオンポイント数の降順で並べ替えて取得します。
// GET /lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}
func (c *Client) GetChampionMasteriesByPUUID(puuid string) ([]ChampionMastery, error) {
	endpoint := fmt.Sprintf("/lol/champion-mastery/v4/champion-masteries/by-puuid/%s", puuid)
	var masteries []ChampionMastery
	err := c.makeRequest(endpoint, &masteries, false)
	if err != nil {
		return nil, err
	}
	return masteries, nil
}

// puuid とチャンピオン ID でチャンピオン マスタリーを取得します。
// GET /lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/by-champion/{championId}
func (c *Client) GetChampionMasteryByPUUIDAndChampionID(puuid string, championID int) (*ChampionMastery, error) {
	endpoint := fmt.Sprintf("/lol/champion-mastery/v4/champion-masteries/by-puuid/%s/by-champion/%d", puuid, championID)
	var mastery ChampionMastery
	err := c.makeRequest(endpoint, &mastery, false)
	if err != nil {
		return nil, err
	}
	return &mastery, nil
}

// チャンピオン ポイント数の降順でソートされた、指定された数のトップ チャンピオン マスタリー エントリを取得します。
// GET /lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/top
// count: Number of entries to retrieve (default: 3)
func (c *Client) GetTopChampionMasteriesByPUUID(puuid string, count int) ([]ChampionMastery, error) {
	endpoint := fmt.Sprintf("/lol/champion-mastery/v4/champion-masteries/by-puuid/%s/top?count=%d", puuid, count)
	var masteries []ChampionMastery
	err := c.makeRequest(endpoint, &masteries, false)
	if err != nil {
		return nil, err
	}
	return masteries, nil
}

// プレイヤーの合計チャンピオン マスタリー スコアを取得します。これは、個々のチャンピオン マスタリー レベルの合計です。
// GET /lol/champion-mastery/v4/scores/by-puuid/{encryptedPUUID}
func (c *Client) GetTotalMasteryScoreByPUUID(puuid string) (int, error) {
	endpoint := fmt.Sprintf("/lol/champion-mastery/v4/scores/by-puuid/%s", puuid)
	var score int
	err := c.makeRequest(endpoint, &score, false)
	if err != nil {
		return 0, err
	}
	return score, nil
}
