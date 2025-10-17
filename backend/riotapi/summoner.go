package riotapi

import "fmt"

// GetSummonerByPUUID はPUUIDでサモナー情報を取得
// GET /lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}
func (c *Client) GetSummonerByPUUID(puuid string) (*Summoner, error) {
	endpoint := fmt.Sprintf("/lol/summoner/v4/summoners/by-puuid/%s", puuid)
	var summoner Summoner
	err := c.makeRequest(endpoint, &summoner, false)
	if err != nil {
		return nil, err
	}
	return &summoner, nil
}

// GetSummonerByName はサモナー名でサモナー情報を取得
// GET /lol/summoner/v4/summoners/by-name/{summonerName}
func (c *Client) GetSummonerByName(summonerName string) (*Summoner, error) {
	endpoint := fmt.Sprintf("/lol/summoner/v4/summoners/by-name/%s", summonerName)
	var summoner Summoner
	err := c.makeRequest(endpoint, &summoner, false)
	if err != nil {
		return nil, err
	}
	return &summoner, nil
}

// GetSummonerByAccountID はアカウントIDでサモナー情報を取得
// GET /lol/summoner/v4/summoners/by-account/{encryptedAccountId}
func (c *Client) GetSummonerByAccountID(accountID string) (*Summoner, error) {
	endpoint := fmt.Sprintf("/lol/summoner/v4/summoners/by-account/%s", accountID)
	var summoner Summoner
	err := c.makeRequest(endpoint, &summoner, false)
	if err != nil {
		return nil, err
	}
	return &summoner, nil
}

// GetSummonerBySummonerID はサモナーIDでサモナー情報を取得
// GET /lol/summoner/v4/summoners/{encryptedSummonerId}
func (c *Client) GetSummonerBySummonerID(summonerID string) (*Summoner, error) {
	endpoint := fmt.Sprintf("/lol/summoner/v4/summoners/%s", summonerID)
	var summoner Summoner
	err := c.makeRequest(endpoint, &summoner, false)
	if err != nil {
		return nil, err
	}
	return &summoner, nil
}
