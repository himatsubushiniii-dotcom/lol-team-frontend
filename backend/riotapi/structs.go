package riotapi

// Account DTOs (Account-v1)

type Account struct {
	PUUID    string `json:"puuid"`    // PUUID
	GameName string `json:"gameName"` // ゲーム名
	TagLine  string `json:"tagLine"`  // タグライン
}

type ActiveShard struct {
	PUUID       string `json:"puuid"` // PUUID
	Game        string `json:"game"`
	ActiveShard string `json:"activeShard"`
}

// Champion Mastery DTOs (Champion-Mastery-v4)

type ChampionMastery struct {
	ChampionID                   int    `json:"championId"`     // チャンピオンID
	ChampionLevel                int    `json:"championLevel"`  //チャンピオンレベル
	ChampionPoints               int    `json:"championPoints"` // チャンピオンポイント
	LastPlayTime                 int64  `json:"lastPlayTime"`   //最後のプレイ時間
	ChampionPointsSinceLastLevel int    `json:"championPointsSinceLastLevel"`
	ChampionPointsUntilNextLevel int    `json:"championPointsUntilNextLevel"`
	ChestGranted                 bool   `json:"chestGranted"`
	TokensEarned                 int    `json:"tokensEarned"` //獲得したトークン
	PUUID                        string `json:"puuid"`        // PUUID
}

// Champion DTOs (Champion-v3)
type ChampionInfo struct {
	MaxNewPlayerLevel            int   `json:"maxNewPlayerLevel"`            // プレイヤーレベル
	FreeChampionIDs              []int `json:"freeChampionIds"`              //無料チャンピオンID
	FreeChampionIDsForNewPlayers []int `json:"freeChampionIdsForNewPlayers"` // 新規プレイヤー向けの無料チャンピオンID
}

// League DTOs (League-v4 and League-Exp-v4)

type LeagueEntry struct {
	LeagueID     string      `json:"leagueId"`     // リーグID
	SummonerID   string      `json:"summonerId"`   //サモナーID
	PUUID        string      `json:"puuid"`        // PUUID
	SummonerName string      `json:"summonerName"` //サモナー名
	QueueType    string      `json:"queueType"`    // キュータイプ
	Tier         string      `json:"tier"`         // ランクのティア
	Rank         string      `json:"rank"`         // ランク
	LeaguePoints int         `json:"leaguePoints"` // リーグポイント
	Wins         int         `json:"wins"`         //勝利数
	Losses       int         `json:"losses"`       //敗北数
	HotStreak    bool        `json:"hotStreak"`    // ホットストリーク
	Veteran      bool        `json:"veteran"`      // ベテラン
	FreshBlood   bool        `json:"freshBlood"`   // フレッシュブラッド
	Inactive     bool        `json:"inactive"`
	MiniSeries   *MiniSeries `json:"miniSeries,omitempty"`
}

type MiniSeries struct {
	Losses   int    `json:"losses"` //敗北
	Progress string `json:"progress"`
	Target   int    `json:"target"`
	Wins     int    `json:"wins"` // 勝利
}

type LeagueList struct {
	LeagueID string        `json:"leagueId"`
	Entries  []LeagueEntry `json:"entries"`
	Tier     string        `json:"tier"`
	Name     string        `json:"name"`
	Queue    string        `json:"queue"`
}

// Challenges DTOs (LoL-Challenges-v1)

type ChallengeConfig struct {
	ID             int64              `json:"id"`
	LocalizedNames map[string]string  `json:"localizedNames"`
	State          string             `json:"state"`
	Tracking       string             `json:"tracking"`
	StartTimestamp int64              `json:"startTimestamp"`
	EndTimestamp   int64              `json:"endTimestamp"`
	Leaderboard    bool               `json:"leaderboard"`
	Thresholds     map[string]float64 `json:"thresholds"`
}

type ChallengePercentiles map[string]map[string]float64

type ChallengeLeaderboard struct {
	ChallengeID int64                        `json:"challengeId"`
	Level       string                       `json:"level"`
	Players     []ChallengeLeaderboardPlayer `json:"players"`
}

type ChallengeLeaderboardPlayer struct {
	PUUID    string  `json:"puuid"`
	Value    float64 `json:"value"`
	Position int     `json:"position"`
}

type PlayerChallenges struct {
	TotalPoints    ChallengePoints            `json:"totalPoints"`
	CategoryPoints map[string]ChallengePoints `json:"categoryPoints"`
	Challenges     []PlayerChallenge          `json:"challenges"`
	Preferences    ChallengePreferences       `json:"preferences"`
}

type ChallengePoints struct {
	Level      string  `json:"level"`
	Current    int     `json:"current"`
	Max        int     `json:"max"`
	Percentile float64 `json:"percentile"`
}

type PlayerChallenge struct {
	ChallengeID    int64   `json:"challengeId"`
	PercentileRank float64 `json:"percentileRank"`
	Level          string  `json:"level"`
	Value          float64 `json:"value"`
	AchievedTime   int64   `json:"achievedTime"`
}

type ChallengePreferences struct {
	BannerAccent string  `json:"bannerAccent"`
	Title        string  `json:"title"`
	ChallengeIDs []int64 `json:"challengeIds"`
}

// Match DTOs (LoL-RSO-Match-v1)

type Match struct {
	Metadata MatchMetadata `json:"metadata"`
	Info     MatchInfo     `json:"info"`
}

type MatchMetadata struct {
	DataVersion  string   `json:"dataVersion"`
	MatchID      string   `json:"matchId"`
	Participants []string `json:"participants"`
}

type MatchInfo struct {
	GameCreation       int64         `json:"gameCreation"`
	GameDuration       int           `json:"gameDuration"`
	GameEndTimestamp   int64         `json:"gameEndTimestamp"`
	GameID             int64         `json:"gameId"`
	GameMode           string        `json:"gameMode"`
	GameName           string        `json:"gameName"`
	GameStartTimestamp int64         `json:"gameStartTimestamp"`
	GameType           string        `json:"gameType"`
	GameVersion        string        `json:"gameVersion"`
	MapID              int           `json:"mapId"`
	Participants       []Participant `json:"participants"`
	PlatformID         string        `json:"platformId"`
	QueueID            int           `json:"queueId"`
	Teams              []Team        `json:"teams"`
	TournamentCode     string        `json:"tournamentCode"`
}

type Participant struct {
	Assists                        int    `json:"assists"`
	BaronKills                     int    `json:"baronKills"`
	BountyLevel                    int    `json:"bountyLevel"`
	ChampExperience                int    `json:"champExperience"`
	ChampLevel                     int    `json:"champLevel"`
	ChampionID                     int    `json:"championId"`
	ChampionName                   string `json:"championName"`
	ChampionTransform              int    `json:"championTransform"`
	ConsumablesPurchased           int    `json:"consumablesPurchased"`
	DamageDealtToBuildings         int    `json:"damageDealtToBuildings"`
	DamageDealtToObjectives        int    `json:"damageDealtToObjectives"`
	DamageDealtToTurrets           int    `json:"damageDealtToTurrets"`
	DamageSelfMitigated            int    `json:"damageSelfMitigated"`
	Deaths                         int    `json:"deaths"`
	DetectorWardsPlaced            int    `json:"detectorWardsPlaced"`
	DoubleKills                    int    `json:"doubleKills"`
	DragonKills                    int    `json:"dragonKills"`
	FirstBloodAssist               bool   `json:"firstBloodAssist"`
	FirstBloodKill                 bool   `json:"firstBloodKill"`
	FirstTowerAssist               bool   `json:"firstTowerAssist"`
	FirstTowerKill                 bool   `json:"firstTowerKill"`
	GameEndedInEarlySurrender      bool   `json:"gameEndedInEarlySurrender"`
	GameEndedInSurrender           bool   `json:"gameEndedInSurrender"`
	GoldEarned                     int    `json:"goldEarned"`
	GoldSpent                      int    `json:"goldSpent"`
	IndividualPosition             string `json:"individualPosition"`
	InhibitorKills                 int    `json:"inhibitorKills"`
	InhibitorTakedowns             int    `json:"inhibitorTakedowns"`
	InhibitorsLost                 int    `json:"inhibitorsLost"`
	Item0                          int    `json:"item0"`
	Item1                          int    `json:"item1"`
	Item2                          int    `json:"item2"`
	Item3                          int    `json:"item3"`
	Item4                          int    `json:"item4"`
	Item5                          int    `json:"item5"`
	Item6                          int    `json:"item6"`
	ItemsPurchased                 int    `json:"itemsPurchased"`
	KillingSprees                  int    `json:"killingSprees"`
	Kills                          int    `json:"kills"`
	Lane                           string `json:"lane"`
	LargestCriticalStrike          int    `json:"largestCriticalStrike"`
	LargestKillingSpree            int    `json:"largestKillingSpree"`
	LargestMultiKill               int    `json:"largestMultiKill"`
	LongestTimeSpentLiving         int    `json:"longestTimeSpentLiving"`
	MagicDamageDealt               int    `json:"magicDamageDealt"`
	MagicDamageDealtToChampions    int    `json:"magicDamageDealtToChampions"`
	MagicDamageTaken               int    `json:"magicDamageTaken"`
	NeutralMinionsKilled           int    `json:"neutralMinionsKilled"`
	NexusKills                     int    `json:"nexusKills"`
	NexusLost                      int    `json:"nexusLost"`
	NexusTakedowns                 int    `json:"nexusTakedowns"`
	ObjectivesStolen               int    `json:"objectivesStolen"`
	ObjectivesStolenAssists        int    `json:"objectivesStolenAssists"`
	ParticipantID                  int    `json:"participantId"`
	PentaKills                     int    `json:"pentaKills"`
	Perks                          Perks  `json:"perks"`
	PhysicalDamageDealt            int    `json:"physicalDamageDealt"`
	PhysicalDamageDealtToChampions int    `json:"physicalDamageDealtToChampions"`
	PhysicalDamageTaken            int    `json:"physicalDamageTaken"`
	ProfileIcon                    int    `json:"profileIcon"`
	PUUID                          string `json:"puuid"`
	QuadraKills                    int    `json:"quadraKills"`
	RiotIDGameName                 string `json:"riotIdGameName"`
	RiotIDTagline                  string `json:"riotIdTagline"`
	Role                           string `json:"role"`
	SightWardsBoughtInGame         int    `json:"sightWardsBoughtInGame"`
	Spell1Casts                    int    `json:"spell1Casts"`
	Spell2Casts                    int    `json:"spell2Casts"`
	Spell3Casts                    int    `json:"spell3Casts"`
	Spell4Casts                    int    `json:"spell4Casts"`
	Summoner1Casts                 int    `json:"summoner1Casts"`
	Summoner1ID                    int    `json:"summoner1Id"`
	Summoner2Casts                 int    `json:"summoner2Casts"`
	Summoner2ID                    int    `json:"summoner2Id"`
	SummonerID                     string `json:"summonerId"`
	SummonerLevel                  int    `json:"summonerLevel"`
	SummonerName                   string `json:"summonerName"`
	TeamEarlySurrendered           bool   `json:"teamEarlySurrendered"`
	TeamID                         int    `json:"teamId"`
	TeamPosition                   string `json:"teamPosition"`
	TimeCCingOthers                int    `json:"timeCCingOthers"`
	TimePlayed                     int    `json:"timePlayed"`
	TotalDamageDealt               int    `json:"totalDamageDealt"`
	TotalDamageDealtToChampions    int    `json:"totalDamageDealtToChampions"`
	TotalDamageShieldedOnTeammates int    `json:"totalDamageShieldedOnTeammates"`
	TotalDamageTaken               int    `json:"totalDamageTaken"`
	TotalHeal                      int    `json:"totalHeal"`
	TotalHealsOnTeammates          int    `json:"totalHealsOnTeammates"`
	TotalMinionsKilled             int    `json:"totalMinionsKilled"`
	TotalTimeCCDealt               int    `json:"totalTimeCCDealt"`
	TotalTimeSpentDead             int    `json:"totalTimeSpentDead"`
	TotalUnitsHealed               int    `json:"totalUnitsHealed"`
	TripleKills                    int    `json:"tripleKills"`
	TrueDamageDealt                int    `json:"trueDamageDealt"`
	TrueDamageDealtToChampions     int    `json:"trueDamageDealtToChampions"`
	TrueDamageTaken                int    `json:"trueDamageTaken"`
	TurretKills                    int    `json:"turretKills"`
	TurretTakedowns                int    `json:"turretTakedowns"`
	TurretsLost                    int    `json:"turretsLost"`
	UnrealKills                    int    `json:"unrealKills"`
	VisionScore                    int    `json:"visionScore"`
	VisionWardsBoughtInGame        int    `json:"visionWardsBoughtInGame"`
	WardsKilled                    int    `json:"wardsKilled"`
	WardsPlaced                    int    `json:"wardsPlaced"`
	Win                            bool   `json:"win"`
}

type Perks struct {
	StatPerks PerkStats   `json:"statPerks"`
	Styles    []PerkStyle `json:"styles"`
}

type PerkStats struct {
	Defense int `json:"defense"`
	Flex    int `json:"flex"`
	Offense int `json:"offense"`
}

type PerkStyle struct {
	Description string          `json:"description"`
	Selections  []PerkSelection `json:"selections"`
	Style       int             `json:"style"`
}

type PerkSelection struct {
	Perk int `json:"perk"`
	Var1 int `json:"var1"`
	Var2 int `json:"var2"`
	Var3 int `json:"var3"`
}

type Team struct {
	Bans       []Ban          `json:"bans"`
	Objectives TeamObjectives `json:"objectives"`
	TeamID     int            `json:"teamId"`
	Win        bool           `json:"win"`
}

type Ban struct {
	ChampionID int `json:"championId"`
	PickTurn   int `json:"pickTurn"`
}

type TeamObjectives struct {
	Baron      Objective `json:"baron"`
	Champion   Objective `json:"champion"`
	Dragon     Objective `json:"dragon"`
	Inhibitor  Objective `json:"inhibitor"`
	RiftHerald Objective `json:"riftHerald"`
	Tower      Objective `json:"tower"`
}

type Objective struct {
	First bool `json:"first"`
	Kills int  `json:"kills"`
}

type MatchTimeline struct {
	Metadata MatchMetadata `json:"metadata"`
	Info     TimelineInfo  `json:"info"`
}

type TimelineInfo struct {
	FrameInterval int                       `json:"frameInterval"`
	Frames        []TimelineFrame           `json:"frames"`
	GameID        int64                     `json:"gameId"`
	Participants  []TimelineParticipantInfo `json:"participants"`
}

type TimelineFrame struct {
	Events            []TimelineEvent             `json:"events"`
	ParticipantFrames map[string]ParticipantFrame `json:"participantFrames"`
	Timestamp         int                         `json:"timestamp"`
}

type TimelineEvent struct {
	Type                    string   `json:"type"`
	Timestamp               int      `json:"timestamp"`
	ParticipantID           int      `json:"participantId,omitempty"`
	ItemID                  int      `json:"itemId,omitempty"`
	KillerID                int      `json:"killerId,omitempty"`
	VictimID                int      `json:"victimId,omitempty"`
	AssistingParticipantIDs []int    `json:"assistingParticipantIds,omitempty"`
	Position                Position `json:"position,omitempty"`
	MonsterType             string   `json:"monsterType,omitempty"`
	MonsterSubType          string   `json:"monsterSubType,omitempty"`
	TeamID                  int      `json:"teamId,omitempty"`
	BuildingType            string   `json:"buildingType,omitempty"`
	LaneType                string   `json:"laneType,omitempty"`
	TowerType               string   `json:"towerType,omitempty"`
}

type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type ParticipantFrame struct {
	ChampionStats            ChampionStats `json:"championStats"`
	CurrentGold              int           `json:"currentGold"`
	DamageStats              DamageStats   `json:"damageStats"`
	GoldPerSecond            int           `json:"goldPerSecond"`
	JungleMinionsKilled      int           `json:"jungleMinionsKilled"`
	Level                    int           `json:"level"`
	MinionsKilled            int           `json:"minionsKilled"`
	ParticipantID            int           `json:"participantId"`
	Position                 Position      `json:"position"`
	TimeEnemySpentControlled int           `json:"timeEnemySpentControlled"`
	TotalGold                int           `json:"totalGold"`
	XP                       int           `json:"xp"`
}

type ChampionStats struct {
	AbilityHaste         int `json:"abilityHaste"`
	AbilityPower         int `json:"abilityPower"`
	Armor                int `json:"armor"`
	ArmorPen             int `json:"armorPen"`
	ArmorPenPercent      int `json:"armorPenPercent"`
	AttackDamage         int `json:"attackDamage"`
	AttackSpeed          int `json:"attackSpeed"`
	BonusArmorPenPercent int `json:"bonusArmorPenPercent"`
	BonusMagicPenPercent int `json:"bonusMagicPenPercent"`
	CCReduction          int `json:"ccReduction"`
	CooldownReduction    int `json:"cooldownReduction"`
	Health               int `json:"health"`
	HealthMax            int `json:"healthMax"`
	HealthRegen          int `json:"healthRegen"`
	Lifesteal            int `json:"lifesteal"`
	MagicPen             int `json:"magicPen"`
	MagicPenPercent      int `json:"magicPenPercent"`
	MagicResist          int `json:"magicResist"`
	MovementSpeed        int `json:"movementSpeed"`
	Omnivamp             int `json:"omnivamp"`
	PhysicalVamp         int `json:"physicalVamp"`
	Power                int `json:"power"`
	PowerMax             int `json:"powerMax"`
	PowerRegen           int `json:"powerRegen"`
	SpellVamp            int `json:"spellVamp"`
}

type DamageStats struct {
	MagicDamageDone               int `json:"magicDamageDone"`
	MagicDamageDoneToChampions    int `json:"magicDamageDoneToChampions"`
	MagicDamageTaken              int `json:"magicDamageTaken"`
	PhysicalDamageDone            int `json:"physicalDamageDone"`
	PhysicalDamageDoneToChampions int `json:"physicalDamageDoneToChampions"`
	PhysicalDamageTaken           int `json:"physicalDamageTaken"`
	TotalDamageDone               int `json:"totalDamageDone"`
	TotalDamageDoneToChampions    int `json:"totalDamageDoneToChampions"`
	TotalDamageTaken              int `json:"totalDamageTaken"`
	TrueDamageDone                int `json:"trueDamageDone"`
	TrueDamageDoneToChampions     int `json:"trueDamageDoneToChampions"`
	TrueDamageTaken               int `json:"trueDamageTaken"`
}

type TimelineParticipantInfo struct {
	ParticipantID int    `json:"participantId"`
	PUUID         string `json:"puuid"`
}

// Summoner DTOs (Summoner-v4)

type Summoner struct {
	ID            string `json:"id"`            // サモナーID
	AccountID     string `json:"accountId"`     // アカウントID
	PUUID         string `json:"puuid"`         // PUUID
	Name          string `json:"name"`          // サモナー名
	ProfileIconID int    `json:"profileIconId"` // プロフィールアイコンID
	RevisionDate  int64  `json:"revisionDate"`  // 更新日時
	SummonerLevel int    `json:"summonerLevel"` // サモナーレベル
}

type RankResponse struct {
	Tier        string `json:"tier"`
	Rank        string `json:"rank"`
	LP          int    `json:"lp"`
	Rating      int    `json:"rating"`
	ProfileIcon int    `json:"profileIcon"`
}
