#!/bin/bash
set -e

echo "🎮 Downloading 100 Non-Emulator Games from Seraph..."

GAMES=(
  2048 amongus badpiggies basketbrosio bitlife bloxors bomberman celeste chess clickerheroes
  cookieclicker cookingmama crossy crushthecastle cubefield cuttherope dadish ducklife
  fireboywatergirl flappy fnf fortnite fruitninja geometrydashsky happywheels helixjump
  holeio justfalllol minesweeper pacman papasfreezeria portal redball4 retrobowl roblox
  run run2 run3 skibidi1v100 slope snake stickmanhook subwaysurfers superhot tabs
  tetris thebindingofisaac theimpossiblequiz thereisnogame vex wordle zombotron 1v1lol
  achievementunlocked ageofwar aquaparkslides badicecream baldisbasics battlebeavers btd
  cactusmccoy championisland colorswitch corporationinc crazytunnel3d drifthunters fnaf
  gunmayhem learntofly motox3m paperio2 raftwars stickwar tanukisunset territorialio
  tunnelrush unfairmario watermelongame yohoho zombocalypse 10minutestilldawn 1on1soccer
  infinitecraft jetpackjoyride ovo doodlejump stack tinyfishing worldshardestgame
  thisistheonlylevel electricman2 fancypantsadventure factoryballs shift chooseyourweapon
  pandemic2 sortthecourt hexgl townscaper knifehit
)

mkdir -p games thumbnails

echo "Downloading games (this may take 10-20 minutes)..."
for game in "${GAMES[@]}"; do
  echo "→ $game"
  if [ ! -d "games/$game" ]; then
    git clone --depth 1 --filter=blob:none --sparse https://github.com/a456pur/seraph.git temp 2>/dev/null || true
    (cd temp && git sparse-checkout set "games/$game" 2>/dev/null || true)
    cp -r temp/games/$game games/ 2>/dev/null || echo "    ⚠️ Skipped (folder not found): $game"
    rm -rf temp
  fi
done

echo "Extracting thumbnails..."
cd games
for dir in */; do
  if [ -d "$dir" ]; then
    g=${dir%/}
    if [[ -f "$g/thumbnail.png" ]]; then
      cp "$g/thumbnail.png" "../thumbnails/${g}.png"
    elif [[ -f "$g/icon.png" ]]; then
      cp "$g/icon.png" "../thumbnails/${g}.png"
    elif [[ -f "$g/preview.png" ]]; then
      cp "$g/preview.png" "../thumbnails/${g}.png"
    fi
  fi
done
cd ..

# Create beautiful launcher index.html
cat > index.html << 'EOT'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Playyyy - 100 Non-Emu Games</title>
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #0f0; text-align: center; margin: 0; padding: 20px; }
    h1 { margin: 20px 0 30px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; max-width: 1600px; margin: 0 auto; }
    .card { background: #1a1a1a; border-radius: 12px; overflow: hidden; transition: all 0.3s; }
    .card:hover { transform: scale(1.08); box-shadow: 0 0 25px #0f0; }
    img { width: 100%; height: 160px; object-fit: cover; }
    h3 { margin: 10px 0; font-size: 1.1em; }
    a { color: inherit; text-decoration: none; }
  </style>
</head>
<body>
  <h1>🎮 Playyyy - 100 Non-Emulator Games</h1>
  <div class="grid" id="grid"></div>

  <script>
    const games = ["2048","amongus","badpiggies","basketbrosio","bitlife","bloxors","bomberman","celeste","chess","clickerheroes","cookieclicker","cookingmama","crossy","crushthecastle","cubefield","cuttherope","dadish","ducklife","fireboywatergirl","flappy","fnf","fortnite","fruitninja","geometrydashsky","happywheels","helixjump","holeio","justfalllol","minesweeper","pacman","papasfreezeria","portal","redball4","retrobowl","roblox","run","run2","run3","skibidi1v100","slope","snake","stickmanhook","subwaysurfers","superhot","tabs","tetris","thebindingofisaac","theimpossiblequiz","thereisnogame","vex","wordle","zombotron","1v1lol","achievementunlocked","ageofwar","aquaparkslides","badicecream","baldisbasics","battlebeavers","btd","cactusmccoy","championisland","colorswitch","corporationinc","crazytunnel3d","drifthunters","fnaf","gunmayhem","learntofly","motox3m","paperio2","raftwars","stickwar","tanukisunset","territorialio","tunnelrush","unfairmario","watermelongame","yohoho","zombocalypse","10minutestilldawn","1on1soccer","infinitecraft","jetpackjoyride","ovo","doodlejump","stack","tinyfishing","worldshardestgame","thisistheonlylevel","electricman2","fancypantsadventure","factoryballs","shift","chooseyourweapon","pandemic2","sortthecourt","hexgl","townscaper","knifehit"];
    const grid = document.getElementById('grid');
    games.forEach(g => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <a href="games/${g}/index.html" target="_blank">
          <img src="thumbnails/${g}.png" onerror="this.src='https://via.placeholder.com/180x160/222/0f0?text=${g}'" alt="${g}">
          <h3>${g}</h3>
        </a>`;
      grid.appendChild(card);
    });
  </script>
</body>
</html>
EOT

echo ""
echo "✅ DONE!"
echo "📁 games/          → All 100 non-emulator games"
echo "📁 thumbnails/    → Extracted images"
echo "🌐 index.html     → Beautiful launcher page"
echo ""
echo "To push to your repo:"
echo "   git add . && git commit -m 'Add 100 non-emulator games + launcher' && git push"