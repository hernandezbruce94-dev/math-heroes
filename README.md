# Math Heroes: Save the City

A free, superhero-themed learning game for early readers and first graders that runs in any web browser. It covers math, reading, phonics, spelling, and the water cycle.

**Play it now:** https://superhero-math.pplx.app

Villains are attacking. Kids pick a hero, answer questions, and every right answer fires a power blast at the villain. Win a mission to save the day, earn stars, unlock hero gear, and grow a sidekick.

## What's new in version 5: Reading Lab and glasses mode

### Reading Lab (a new world, villain: The Mumbler)
Built around decoding, encoding, phonemic awareness, and syllable patterns:

- **Sound Boxes**: count the sounds in a word (phoneme segmenting)
- **Read & Find**: read a printed word and tap its picture, with tap-a-letter clues (letter name + keyword)
- **Blend Blasters**: two- and three-letter blends (bl, st, scr, spl, str, squ, thr, shr) and digraphs
- **Alien Words**: made-up words for real decoding practice
- **Silent Letter Spy**: kn, wr, gn, mb
- **Syllable Split**: clap syllables and choose where a word splits (dis | play)
- **Flip Fix**: b/d/p/q and letter/number reversal practice, with the "bed" trick
- **Read With Me**: short decodable stories shown one line at a time with a line reader that lights up each word as it's read, then "who" and "what" questions
- **Lab Mix** and a Mega Boss; the Daily Mission now includes Reading Lab practice
- Grown-ups can load a school spelling list (three-letter blends and silent letters) in one tap

### Reading help settings
- Easy-read letters (Lexend font with extra letter and word spacing)
- Bigger text
- Calm mode: no screen shaking or flashing and fewer sparkles

### Red/green glasses mode (optional)
For kids who do vision training with red/green glasses (red lens over the right eye, green over the left):

- A setup wizard tunes the red and green so each one disappears through its matching lens, then checks each eye
- The eye being trained sees the words and answers in full-strength ink; the other eye sees lighter ink, so both eyes work while reading
- "Team up" style splits each word's letters between the two eyes
- Session timer (10–30 minutes) with a "take your glasses off" reminder, and minutes shown in the progress report
- This is extra practice inside the game. It is not a medical device and does not replace a prescribed vision program. Check with an eye doctor before adding glasses time.

## What's new in version 4.1

- **Answers read out loud**: after each question, the hero voice reads every answer choice while that button lights up. Tap **Hear the answers** to hear them again. (Sight-word questions skip this, because hearing the words would give the answer away.) Grown-ups can turn it off in Settings.
- **Need help?**: every question has a help button that shows a worked example of the same skill with different numbers or words, read aloud step by step, then returns to the question. The progress report shows how often help was used.

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
| `js/data.js`, `js/data2.js`, `js/data3.js` | Missions, words, stories, scenes, pets, Reading Lab word lists |
| `js/problems.js` | Question generators |
| `js/game.js` | Game flow, screens, grown-up area |
| `js/store.js` | Saving, profiles, spaced review, sync client |
| `js/trace.js` | Letter and number tracing |
| `js/assist.js` | Read-aloud answer choices and Need help examples |
| `js/lab.js` | Reading Lab questions, line reader, reading help, glasses mode |
| `js/audio.js`, `js/clips.js`, `audio/` | Voice clips, music, sound effects |
| `js/art.js`, `img/`, `icons/` | Hero, villain, and pet art; backgrounds and comics |
| `sw.js`, `manifest.webmanifest` | Offline support and app install |
| `server.py` | Optional sync server |

## Credits

The voice recordings, comic art, and backgrounds were made with AI generation tools. The water cycle content follows a first-grade study guide.

## License

MIT
