package riotapi

import "fmt"

// puuidでアカウントを取得
// GET /riot/account/v1/accounts/by-puuid/{puuid}
func (c *Client) GetAccountByPUUID(puuid string) (*Account, error) {
	endpoint := fmt.Sprintf("/riot/account/v1/accounts/by-puuid/%s", puuid)
	var account Account
	err := c.makeRequest(endpoint, &account, true)
	if err != nil {
		return nil, err
	}
	return &account, nil
}

// riot ID(gameName#tagLine)でアカウントを取得
// GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
func (c *Client) GetAccountByRiotID(gameName, tagLine string) (*Account, error) {
	endpoint := fmt.Sprintf("/riot/account/v1/accounts/by-riot-id/%s/%s", gameName, tagLine)
	var account Account
	err := c.makeRequest(endpoint, &account, true)
	if err != nil {
		return nil, err
	}
	return &account, nil
}

// プレイヤーのアクティブなシャードを取得する
// GET /riot/account/v1/active-shards/by-game/{game}/by-puuid/{puuid}
func (c *Client) GetActiveShardByGameAndPUUID(game, puuid string) (*ActiveShard, error) {
	endpoint := fmt.Sprintf("/riot/account/v1/active-shards/by-game/%s/by-puuid/%s", game, puuid)
	var shard ActiveShard
	err := c.makeRequest(endpoint, &shard, true)
	if err != nil {
		return nil, err
	}
	return &shard, nil
}

// GetAccountMe retrieves the account information for the authenticated user
// GET /riot/account/v1/accounts/me
// Note: This endpoint requires RSO (Riot Sign-On) authentication, not API key
// Commented out as it requires different authentication mechanism
/*
func (c *Client) GetAccountMe() (*Account, error) {
	endpoint := "/riot/account/v1/accounts/me"
	var account Account
	err := c.makeRequest(endpoint, &account, true)
	if err != nil {
		return nil, err
	}
	return &account, nil
}
*/
