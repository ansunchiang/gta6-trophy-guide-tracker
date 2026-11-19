# gta6-trophy-guide-tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ansunchiang/gta6-trophy-guide-tracker/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ansunchiang/gta6-trophy-guide-tracker/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Atlas is an unofficial offline guide and checklist for all 55 Grand Theft Auto VI trophies on PS5. The roadmap starts with the Chapter 1 meditation window, follows the five story chapters and shows where the in-game 100% targets go beyond individual trophy requirements.

## Run it

```sh
node serve.ts
```

Open **http://127.0.0.1:8080** in Chrome. The server and dossier require Node.js 22.18 or later. The guide also works with any static server rooted at `app/` that serves JSON as `application/json`.

Progress and the story spoiler setting are saved in the current browser for this address. Export downloads a JSON backup. Import asks before replacing the checklist and restores the backup’s spoiler setting.

Run `node capture.mjs` to recreate the four browser captures in `shots.json`. Each shot starts with a fresh checklist and uses the specified clicks. Set `CHROME_BIN` to the Chrome executable if it is outside the default macOS path.

To package the entry locally, use an empty output directory and run:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Checked November 19, 2026. The 55 names, descriptions and grades match the make.fun kit and Platinum Pursuit’s PSN mirror. Exophase and the indexed TrueTrophies list corroborate the trophy text. PSNProfiles is named in the kit’s provenance and returned HTTP 403 on direct access. PlayStation’s public pages confirm the release date.

- [make.fun · Bounty rules and starter list](https://make.fun/bounty/gta6-trophy-guide-01)
- [PlayStation Blog · PS5 launch announcement](https://blog.playstation.com/2026/06/24/grand-theft-auto-vi-plays-best-on-ps5-november-19/comment-page-2/)
- [Exophase · PS5 trophy list](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- [Platinum Pursuit · PSN trophy set NPWR21085_00](https://platpursuit.com/games/NPWR21085_00/)
- [TrueTrophies · PS5 trophy list](https://www.truetrophies.com/game/Grand-Theft-Auto-VI/trophies)
- [PSNProfiles · PS5 trophy list](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
- [PowerPyx · Trophy guide](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/)
- [PowerPyx · Mission order](https://www.powerpyx.com/gta-6-full-walkthrough-all-missions/)
- [PowerPyx · In-game 100% checklist](https://www.powerpyx.com/gta-6-100-completion-checklist-guide/)
- [PowerPyx · Meditation locations](https://www.powerpyx.com/gta-6-all-meditation-spot-locations/)
- [Beebom · Meditation locations](https://beebom.com/gta-6-meditation-spots-locations/)
- [PowerPyx · Shooting range medals](https://www.powerpyx.com/gta-6-all-shooting-range-gold-medal-challenges/)
- [PowerPyx · Drone courses](https://www.powerpyx.com/gta-6-all-top-fun-drone-race-time-trial-locations/)
- [PowerPyx · Race locations](https://www.powerpyx.com/gta-6-all-unique-race-locations-racing-activities/)
- [PowerPyx · Card set locations](https://www.powerpyx.com/gta-6-all-collectible-card-sets-locations/)
- [PowerPyx · WAiNK locations](https://www.powerpyx.com/gta-6-all-waink-scan-locations/)
- [PowerPyx · Race Against Yago](https://www.powerpyx.com/gta-6-race-against-yago-walkthrough/)
- [GTABase · Stranger missions](https://www.gtabase.com/gta-6/strangers-missions/)
- [GTABase · Trophy guide](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series)
- [TrophiesHunter · Ten Pin player report](https://trophieshunter.com/games/grand-theft-auto-vi-ps5/achievements/ten-pin)

The guide flags unconfirmed unlocks and the Chapter 1 meditation risk beside the relevant entries. Source links open on demand and require internet access.

---

<sub>Entered on [make.fun](https://make.fun/?ref=vxfctj3d&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
