package riotapi

import "fmt"

// すべてのリーグエントリーを取得します。
// GET /lol/league-exp/v4/entries/{queue}/{tier}/{division}
// queue: キュータイプ (例: "RANKED_SOLO_5x5")
// tier: ティア (例: "DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON")
// division: ディビジョン (例: "I", "II", "III", "IV")
// page: ページ番号 (1から開始)
func (c *Client) GetLeagueExpEntries(queue, tier, division string, page int) ([]LeagueEntry, error) {
	endpoint := fmt.Sprintf("/lol/league-exp/v4/entries/%s/%s/%s?page=%d", queue, tier, division, page)
	var entries []LeagueEntry
	err := c.makeRequest(endpoint, &entries, false)
	if err != nil {
		return nil, err
	}
	return entries, nil
}
