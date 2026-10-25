# Train Type (prototype)

A browser-based typing trainer for practising keyboard speed and accuracy.
Users pick an exercise by difficulty, type the text shown line by line against
a timer, and get their speed and accuracy at the end. There is also a
peer-to-peer challenge mode where two players race on the same text, a
leaderboard, personal statistics, and an admin panel for managing users and
exercises.

This is the plain HTML/CSS/JavaScript prototype, built as a school project
(ING3 ISI, group 10, theme 7). It is deployed at
[traintype.alexabena.me](https://traintype.alexabena.me).

**Team:** Bilogui Tiguena, Abena Alex, Mfone Amine and Tagam Signe.

## Tech

- HTML, CSS and vanilla JavaScript, with jQuery 3.7
- [PeerJS](https://peerjs.com) for the real-time two-player challenge
- `localStorage` and `sessionStorage` for users, exercises and statistics, so
  there is no backend and no build step

## Run it locally

```bash
git clone https://github.com/NinjaShadowBoy/train-type-proto.git
cd train-type-proto
```

Then open `index.html` in a browser. For the challenge mode, serve the folder
over HTTP instead so PeerJS can connect, for example:

```bash
python3 -m http.server 8000      # then visit http://localhost:8000
```

The challenge mode uses the public PeerJS server, so it needs an internet
connection.

### Admin login

The admin panel is `html/admin.html`. Log in with:

- Username: `Alex`
- Password: `alex`

All data lives in your browser's storage, so clearing site data resets it.

## Project layout

```
index.html     landing page
html/          the other pages (login, dashboard, game, challenge, statistics, admin...)
css/           one stylesheet per page
js/            page scripts, plus jQuery and PeerJS
other/         Visual Paradigm design model (ISI Type.vpp)
```
