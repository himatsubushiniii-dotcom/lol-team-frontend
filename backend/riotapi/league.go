package riotapi

import "fmt"

// GetChallengerLeague は指定されたキューのチャレンジャーリーグを取得します
// GET /lol/league/v4/challengerleagues/by-queue/{queue}
// queue: キュータイプ (例: "RANKED_SOLO_5x5", "RANKED_FLEX_SR", "RANKED_FLEX_TT")
func (c *Client) GetChallengerLeague(queue string) (*LeagueList, error) {
	endpoint := fmt.Sprintf("/lol/league/v4/challengerleagues/by-queue/%s", queue)
	var league LeagueList
	err := c.makeRequest(endpoint, &league, false)
	if err != nil {
		return nil, err
	}
	return &league, nil
}

// GetLeagueEntriesByPUUID はPUUIDを使用してサモナーのリーグエントリーを取得します
// GET /lol/league/v4/entries/by-puuid/{encryptedPUUID}
// puuid: 暗号化されたプレイヤーのPUUID
func (c *Client) GetLeagueEntriesByPUUID(puuid string) ([]LeagueEntry, error) {
	endpoint := fmt.Sprintf("/lol/league/v4/entries/by-puuid/%s", puuid)
	var entries []LeagueEntry
	err := c.makeRequest(endpoint, &entries, false)
	if err != nil {
		return nil, err
	}
	return entries, nil
}

// GetLeagueEntries はキュー、ティア、ディビジョンによってリーグエントリーを取得します
// GET /lol/league/v4/entries/{queue}/{tier}/{division}
// queue: キュータイプ (例: "RANKED_SOLO_5x5", "RANKED_FLEX_SR")
// tier: ティア (例: "DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON")
// division: ディビジョン (例: "I", "II", "III", "IV")
// page: ページ番号 (1から開始、デフォルト: 1)
func (c *Client) GetLeagueEntries(queue, tier, division string, page int) ([]LeagueEntry, error) {
	endpoint := fmt.Sprintf("/lol/league/v4/entries/%s/%s/%s?page=%d", queue, tier, division, page)
	var entries []LeagueEntry
	err := c.makeRequest(endpoint, &entries, false)
	if err != nil {
		return nil, err
	}
	return entries, nil
}

// GetGrandmasterLeague は指定されたキューのグランドマスターリーグを取得します
// GET /lol/league/v4/grandmasterleagues/by-queue/{queue}
// queue: キュータイプ (例: "RANKED_SOLO_5x5", "RANKED_FLEX_SR", "RANKED_FLEX_TT")
func (c *Client) GetGrandmasterLeague(queue string) (*LeagueList, error) {
	endpoint := fmt.Sprintf("/lol/league/v4/grandmasterleagues/by-queue/%s", queue)
	var league LeagueList
	err := c.makeRequest(endpoint, &league, false)
	if err != nil {
		return nil, err
	}
	return &league, nil
}

// GetLeagueByID はリーグIDを使用してリーグ情報を取得します
// GET /lol/league/v4/leagues/{leagueId}
// leagueId: リーグの一意識別子
func (c *Client) GetLeagueByID(leagueID string) (*LeagueList, error) {
	endpoint := fmt.Sprintf("/lol/league/v4/leagues/%s", leagueID)
	var league LeagueList
	err := c.makeRequest(endpoint, &league, false)
	if err != nil {
		return nil, err
	}
	return &league, nil
}

// GetMasterLeague は指定されたキューのマスターリーグを取得します
// GET /lol/league/v4/masterleagues/by-queue/{queue}
// queue: キュータイプ (例: "RANKED_SOLO_5x5", "RANKED_FLEX_SR", "RANKED_FLEX_TT")
func (c *Client) GetMasterLeague(queue string) (*LeagueList, error) {
	endpoint := fmt.Sprintf("/lol/league/v4/masterleagues/by-queue/%s", queue)
	var league LeagueList
	err := c.makeRequest(endpoint, &league, false)
	if err != nil {
		return nil, err
	}
	return &league, nil
}