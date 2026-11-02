# Math Heroes: Save the City

A free, superhero-themed learning game for first graders that runs in any web browser. It covers math, reading, spelling, and the water cycle.

**Play it now:** https://superhero-math.pplx.app

Villains are attacking. Kids pick a hero, answer questions, and every right answer fires a power blast at the villain. Win a mission to save the day, earn stars, unlock hero gear, and grow a sidekick.

## What's new in version 4

- **Daily Mission**: a 5-minute mixed mission each day, with a streak calendar and bonus stars
- **Spaced review**: missed questions come back 1, 3, and 7 days later, inside the Daily Mission
- **Hero Stories**: 6 comic stories with read-along captions (tap any word to hear it) and comprehension questions
- **Tracing**: trace letters and numbers with a finger, mouse, or stylus
- **New math**: skip counting, number line, shapes, measuring, doubles, fact families
- **Sentence Builder**: put words in order, add a capital letter, pick the end mark
- **Story mode**: a 4-chapter story for each world, with narrated cutscenes
- **Sidekick pet**: choose a pet that grows from Baby to Super and learns tricks as you earn stars
- **2 Players**: take turns on one device; Player 2 can get harder questions (for an older sibling or a grown-up)
- **Multiple players**: up to 5 kid profiles, each with their own hero, stars, levels, spelling list, pet, and report
- **Break reminders**: optional 3-minute stretch break after 15, 20, or 30 minutes of play
- **Sync across devices**: optional family sync code to share progress between an iPad, phone, and computer

## Worlds and missions

### Math City (villain: Dr. Minus)
Adding to 10, Adding to 20, Taking Away, Word Problems, Telling Time, Counting Coins, Tens & Ones, Bigger or Smaller, Skip Counting, Number Line, Shapes, Measuring, Doubles, Fact Families, Trace Numbers, and Super Mix.

### Word World (villain: The Scrambler)
Sight Word Spotter, Spell It!, My Spelling List (a grown-up enters this week's words), Missing Letter, Rhyme Time, First Sounds, Letter Teams (sh, ch, th, wh), Hero Stories, Sentence Builder, Trace Letters, and Word Mix.

### Water World (villain: Dr. Drought)
Based on a first-grade water cycle study guide: Water Words, Cycle Steps, Fresh or Salt?, Tell the Story, and Say It Out Loud (explain the water cycle with your voice, or a grown-up checks off each part).

### Mega Bosses
Each world has a 12-round Mega Boss that unlocks after earning stars in 3 missions.

## Hero extras

- Recorded hero voice for questions, praise, stories, and cutscenes; villains have their own voice
- Adaptive levels: questions get harder after 3 right in a row and easier after misses
- Super Mode: 3 right in a row gives double stars and bigger attacks
- Hero Creator: build your own hero; unlock capes, emblems, suits, and blasts with stars
- Up to 3 stars per mission, ranks from Rookie Hero to Legend
- Theme music, sound effects, particle effects, and confetti
- Big tap-friendly buttons for desktop, tablet, and phone
- Installable as an app and playable offline after the first visit

## For grown-ups

Tap **Grown-ups** on the start screen and answer the multiplication question to open:

- **Spelling list**: enter this week's words for My Spelling List
- **Progress report**: recent missions, scores, and the questions your child missed
- **Players**: add, rename, or remove kid profiles
- **Settings**: voice, music, break reminders, sync, and a backup code

## Saving and privacy

- Progress saves in the browser on each device. There are no accounts, ads, or tracking.
- **Sync is optional.** When a grown-up turns it on, the family's progress (first names, stars, levels, spelling words, and mission history) is stored on the game's server under a random 10-character code. Any device that enters the code can see and update that progress, so keep the code private. Turn sync off at any time in Settings.
- The server keeps no other personal information. If the server's copy is ever lost, synced devices upload their copy again automatically.
- A **backup code** in Settings can copy progress to another device without sync.

## No sound?

Tap **Test sound** on the start screen. If you hear nothing:

- Turn the device volume up.
- On iPhone or iPad, turn off Silent mode.
- Try Chrome, Edge, or Safari.

## Run it locally

The game is plain HTML, CSS, and JavaScript with no build step.

```bash
# Game only (sync turned off)
python3 -m http.server 8765
# then open http://localhost:8765

# Optional: sync server (Python 3 standard library + SQLite, no installs)
python3 server.py   # listens on port 8000 and creates data.db
```

When opened from `localhost`, the game uses the sync server at `http://localhost:8000`.

## Project layout

| Path | What it is |
|---|---|
| `index.html`, `css/styles.css` | Page layout and styles |
| `js/data.js`, `js/data2.js` | Missions, words, stories, scenes, pets |
| `js/problems.js` | Question generators |
| `js/game.js` | Game flow, screens, grown-up area |
| `js/store.js` | Saving, profiles, spaced review, sync client |
| `js/trace.js` | Letter and number tracing |
| `js/audio.js`, `js/clips.js`, `audio/` | Voice clips, music, sound effects |
| `js/art.js`, `img/`, `icons/` | Hero, villain, and pet art; backgrounds and comics |
| `sw.js`, `manifest.webmanifest` | Offline support and app install |
| `server.py` | Optional sync server |

## Credits

The voice recordings, comic art, and backgrounds were made with AI generation tools. The water cycle content follows a first-grade study guide.

## License

MIT
