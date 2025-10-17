package riotapi

import "fmt"

// puuidでマッチIDのリストを取得する
// GET /lol/rso-match/v1/matches/ids
// puuid: Player's PUUID
// start: Start index (default: 0)
// count: Number of match IDs to return (default: 20, max: 100)
func (c *Client) GetMatchIDs(puuid string, start, count int) ([]string, error) {
	endpoint := fmt.Sprintf("/lol/rso-match/v1/matches/ids?puuid=%s&start=%d&count=%d", puuid, start, count)
	var matchIDs []string
	err := c.makeRequest(endpoint, &matchIDs, true)
	if err != nil {
		return nil, err
	}
	return matchIDs, nil
}

// 試合IDで試合を取得する
// GET /lol/rso-match/v1/matches/{matchId}
func (c *Client) GetMatchByID(matchID string) (*Match, error) {
	endpoint := fmt.Sprintf("/lol/rso-match/v1/matches/%s", matchID)
	var match Match
	err := c.makeRequest(endpoint, &match, true)
	if err != nil {
		return nil, err
	}
	return &match, nil
}

// 試合IDで試合タイムラインを取得する
// GET /lol/rso-match/v1/matches/{matchId}/timeline
func (c *Client) GetMatchTimelineByID(matchID string) (*MatchTimeline, error) {
	endpoint := fmt.Sprintf("/lol/rso-match/v1/matches/%s/timeline", matchID)
	var timeline MatchTimeline
	err := c.makeRequest(endpoint, &timeline, true)
	if err != nil {
		return nil, err
	}
	return &timeline, nil
}
