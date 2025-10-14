# Balatro Multiplayer Server API

## Overview

This repository contains the multiplayer server that powers the Balatro mod. The implementation is intentionally lightweight: the server assumes clients are behaving in good faith and therefore performs minimal validation. At present there is no TLS support because the Lua environment that loads the mod cannot easily consume SSL libraries. A native security module may be required for hardened deployments in the future.

## Build and Run Guide

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (bundled with Node.js)

### Install dependencies

```bash
npm install
```

### Compile the TypeScript source

Compile the server into the `dist/` directory before running it in production:

```bash
npm run build
```

To rebuild the Lua distribution artifacts used by the Balatro mod, run:

```bash
npm run build-servers
```

### Start the server

Run the compiled server:

```bash
npm start
```

For local development with automatic reloads you can use the TypeScript entry point directly:

```bash
npm run dev
```

Update your mod config to point to localhost:

1. Open `%AppData%\Balatro\config`
2. Edit `Multiplayer.jkr`

```bash
return {
	["misprint_display"] = true,
	["preview"] = {
	},
	["blind_col"] = 1,
	["unlocked"] = false,
	["server_port"] = 8788,
	["logging"] = false,
	["username"] = "Guest",
	["server_url"] = "localhost",
	["integrations"] = {
		["Preview"] = false,
		["TheOrder"] = true,
	},
}
```

## Communication Protocol

Server and client exchange newline-delimited JSON (NDJSON) messages. Each payload is a JSON object with an `action` property and any additional fields required by that action. Messages are terminated with a single `\n` when sent over the socket.

```json
{"action":"username","username":"PlayerOne","modHash":"abc123"}\n
```

Fields that are omitted or set to `null` are treated as absent by the server.

### Server-to-client actions

| Action | Parameters | Description |
| --- | --- | --- |
| `connected` | – | Confirms a client connection. |
| `version` | – | Requests the client report its mod version. |
| `error` | `message` | Displays a critical error to the client. |
| `joinedLobby` | `code`, `type` | Instructs the client to treat itself as joined to the specified lobby. |
| `lobbyInfo` | `host`, `hostHash`, `hostCached`, `guest?`, `guestHash?`, `guestCached?`, `guestReady?`, `isHost` | Provides the current lobby composition, cache status, and readiness flags. |
| `lobbyOptions` | `gamemode`, _other option keys_ | Shares lobby option updates made by the host. |
| `stopGame` | – | Forces a return to the lobby for all clients when any participant exits. |
| `startGame` | `deck`, `seed?`, `stake?` | Starts a run for all players. The server currently emits the default multiplayer challenge deck (`c_multiplayer_1`). |
| `startBlind` | – | Begins the next blind once every client has confirmed readiness. |
| `gameInfo` | `small?`, `big?`, `boss?` | Communicates current blind information. |
| `playerInfo` | `lives` | Communicates the client’s life total at the start of the game and whenever it changes. |
| `enemyInfo` | `score`, `handsLeft`, `skips`, `lives` | Updates the opposing player’s status whenever they complete a hand. |
| `endPvP` | `lost` | Signals the end of a PvP blind. |
| `winGame` | – | Forces the client to win the current run. |
| `loseGame` | – | Forces the client to lose the current run. |
| `enemyLocation` | `location` | Reports the opponent’s current in-game location for syncing exploration events. |
| `sendPhantom` | `key` | Requests the client spawn a phantom joker. |
| `removePhantom` | `key` | Requests the client remove a phantom joker. |
| `speedrun` | – | Grants the speedrun buff to the client that readies first. |
| `asteroid` | – | Triggers the asteroid event. |
| `letsGoGamblingNemesis` | – | Initiates the “Let’s Go Gambling” nemesis encounter. |
| `eatPizza` | `whole` | Consumes pizza in the nemesis encounter. |
| `soldJoker` | – | Indicates that the enemy sold a joker. |
| `spentLastShop` | `amount` | Reports the amount the opponent spent in their last shop visit. |
| `magnet` | – | Announces that the magnet effect should resolve. |
| `magnetResponse` | `key` | Provides the magnet resolution key. |
| `getEndGameJokers` | – | Requests the client send its end-game jokers. |
| `receiveEndGameJokers` | `keys` | Supplies end-game joker identifiers. |
| `getNemesisDeck` | – | Requests the client’s nemesis deck. |
| `receiveNemesisDeck` | `cards` | Supplies nemesis deck card identifiers. |
| `endGameStatsRequested` | – | Requests nemesis end-game statistics. |
| `nemesisEndGameStats` | `reroll_count`, `reroll_cost_total`, `vouchers` | Provides nemesis end-game statistics. |
| `startAnteTimer` | `time` | Starts the ante countdown timer. |
| `pauseAnteTimer` | `time` | Pauses the ante countdown timer, preserving the remaining time. |

### Client-to-server actions

| Action | Parameters | Description |
| --- | --- | --- |
| `username` | `username`, `modHash` | Registers the client username and mod hash. |
| `version` | `version` | Reports the client mod version. |
| `setLocation` | `location` | Shares the client’s current in-game location for syncing world events. |
| `syncClient` | `isCached` | Notifies the server that the local cache is synchronized. |
| `createLobby` | `gameMode` | Requests a new lobby. Expects a `joinedLobby` response. |
| `joinLobby` | `code` | Joins an existing lobby by five-character code. Expects a `joinedLobby` or `error` response. |
| `lobbyOptions` | `gamemode`, _other option keys_ | Persists lobby option updates. Send on lobby creation and whenever an option changes. |
| `lobbyInfo` | – | Requests the current lobby composition. |
| `leaveLobby` | – | Leaves the current lobby. |
| `readyLobby` | – | Marks the client as ready within the lobby. |
| `unreadyLobby` | – | Marks the client as not ready within the lobby. |
| `startGame` | – | Instructs the server (host only) to start the game. |
| `stopGame` | – | Requests a return to the lobby. |
| `readyBlind` | – | Indicates the client is ready for the next blind. |
| `unreadyBlind` | – | Cancels readiness for the next blind. |
| `playHand` | `score`, `handsLeft`, `hasSpeedrun` | Sends the player’s hand result. |
| `gameInfo` | – | Requests the next blind information. |
| `playerInfo` | – | Requests the player’s life total. |
| `enemyInfo` | – | Requests the enemy’s status. |
| `failRound` | – | Declares that the client failed the current round. |
| `setAnte` | `ante` | Sets the client’s current ante server-side. |
| `setFurthestBlind` | `furthestBlind` | Records the furthest blind defeated by the client. |
| `newRound` | – | Signals the start of a new round. |
| `skip` | `skips` | Communicates remaining skips. |
| `asteroid` | – | Triggers the asteroid event from the client. |
| `sendPhantom` | `key` | Sends a phantom joker to the opponent. |
| `removePhantom` | `key` | Removes a phantom joker from the opponent. |
| `letsGoGamblingNemesis` | – | Initiates the “Let’s Go Gambling” nemesis encounter. |
| `eatPizza` | `whole` | Consumes pizza in the nemesis encounter. |
| `soldJoker` | – | Reports that the player sold a joker. |
| `spentLastShop` | `amount` | Sends the amount spent in the previous shop visit. |
| `magnet` | – | Notifies the server to resolve magnet effects. |
| `magnetResponse` | `key` | Responds with magnet resolution data. |
| `getEndGameJokers` | – | Requests opponent end-game jokers. |
| `receiveEndGameJokers` | `keys` | Shares end-game joker identifiers. |
| `getNemesisDeck` | – | Requests the opponent’s nemesis deck. |
| `receiveNemesisDeck` | `cards` | Shares nemesis deck card identifiers. |
| `endGameStatsRequested` | – | Requests nemesis end-game statistics. |
| `nemesisEndGameStats` | `reroll_count`, `reroll_cost_total`, `vouchers` | Shares nemesis end-game statistics. |
| `startAnteTimer` | `time` | Starts the ante countdown timer. |
| `pauseAnteTimer` | `time` | Pauses the ante countdown timer. |
| `failTimer` | – | Declares that the ante timer expired. |

### Utility messages

Utility actions are shared by both client and server to maintain the connection.

| Action | Description |
| --- | --- |
| `keepAlive` | Requests a heartbeat acknowledgement. |
| `keepAliveAck` | Acknowledges a `keepAlive` ping. |

## Server Types

- `attrition`
  - Both players start with four lives.
  - Every set’s boss blind is PvP.
- `showdown`
  - Both players start with two lives.
  - The first four antes follow normal rules; all subsequent antes are PvP blinds only.

## Game Types

### Blind Types

The following map server identifiers to in-game blind names:

- `bl_small` = Small Blind
- `bl_big` = Big Blind
- `bl_ox` = The Ox
- `bl_hook` = The Hook
- `bl_mouth` = The Mouth
- `bl_fish` = The Fish
- `bl_club` = The Club
- `bl_manacle` = The Manacle
- `bl_tooth` = The Tooth
- `bl_wall` = The Wall
- `bl_house` = The House
- `bl_mark` = The Mark
- `bl_final_bell` = Cerulean Bell
- `bl_wheel` = The Wheel
- `bl_arm` = The Arm
- `bl_psychic` = The Psychic
- `bl_goad` = The Goad
- `bl_water` = The Water
- `bl_eye` = The Eye
- `bl_plant` = The Plant
- `bl_needle` = The Needle
- `bl_head` = The Head
- `bl_final_leaf` = Verdant Leaf
- `bl_final_vessel` = Violet Vessel
- `bl_window` = The Window
- `bl_serpent` = The Serpent
- `bl_pillar` = The Pillar
- `bl_flint` = The Flint
- `bl_final_acorn` = Amber Acorn
- `bl_final_heart` = Crimson Heart
- **`b1_pvp` = Your Nemesis** — required for head-to-head score comparisons.

### Deck Types

Deck identifiers resolve to the following in-game decks:

- `b_red` = Red Deck
- `b_blue` = Blue Deck
- `b_yellow` = Yellow Deck
- `b_green` = Green Deck
- `b_black` = Black Deck
- `b_magic` = Magic Deck
- `b_nebula` = Nebula Deck
- `b_ghost` = Ghost Deck
- `b_abandoned` = Abandoned Deck
- `b_checkered` = Checkered Deck
- `b_zodiac` = Zodiac Deck
- `b_painted` = Painted Deck
- `b_anaglyph` = Anaglyph Deck
- `b_plasma` = Plasma Deck
- `b_erratic` = Erratic Deck

### Challenge Types

Challenge identifiers resolve to the following in-game challenges:

- `c_omelette_1` = The Omelette
- `c_city_1` = 15 Minute City
- `c_rich_1` = Rich Get Richer
- `c_knife_1` = On a Knife’s Edge
- `c_xray_1` = X-ray Vision
- `c_mad_world_1` = Mad World
- `c_luxury_1` = Luxury Tax
- `c_non_perishable_1` = Non-Perishable
- `c_medusa_1` = Medusa
- `c_double_nothing_1` = Double or Nothing
- `c_typecast_1` = Typecast
- `c_inflation_1` = Inflation
- `c_bram_poker_1` = Bram Poker
- `c_fragile_1` = Fragile
- `c_monolith_1` = Monolith
- `c_blast_off_1` = Blast Off
- `c_five_card_1` = Five-Card Draw
- `c_golden_needle_1` = Golden Needle
- `c_cruelty_1` = Cruelty
- `c_jokerless_1` = Jokerless
- **`c_multiplayer_1` = Multiplayer Default** — temporary default until deck selection is implemented.

### Seed Type

Seeds must:

- Be strings exactly eight characters long.
- Consist only of uppercase letters and numbers.
