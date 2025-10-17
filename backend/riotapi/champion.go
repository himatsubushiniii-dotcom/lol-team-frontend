package riotapi

// 無料プレイと低レベルの無料プレイのローテーションを含むチャンピオンのローテーションを返します
// GET /lol/platform/v3/champion-rotations
func (c *Client) GetChampionRotations() (*ChampionInfo, error) {
	endpoint := "/lol/platform/v3/champion-rotations"
	var rotations ChampionInfo
	err := c.makeRequest(endpoint, &rotations, false)
	if err != nil {
		return nil, err
	}
	return &rotations, nil
}
