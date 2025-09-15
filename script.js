// Utility helpers
const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

// Elements
const outfield = qs("#field_outfield");
const gks = qs("#field_goalkeepers");
const teams = qs("#field_teams");
const perTeam = qs("#field_per_team");
const expected_total = qs("#expected_total");

const mode_manual_btn = qs("#mode_manual");
const mode_paste_btn = qs("#mode_paste");
const mode_number_btn = qs("#mode_number");

const manual_panel = qs("#mode_manual_panel");
const paste_panel = qs("#mode_paste_panel");
const number_panel = qs("#mode_number_panel");

const textarea_manual = qs("#textarea_players_manual");
const textarea_gks = qs("#textarea_gks");
const pairs_list = qs("#pairs_list");
const add_pair = qs("#add_pair");
const clear_pairs = qs("#clear_pairs");
const draw_manual = qs("#draw_manual");
const preview_manual = qs("#preview_manual");

const textarea_paste = qs("#textarea_players_paste");
const draw_paste = qs("#draw_paste");
const save_paste = qs("#save_paste");

const number_total = qs("#number_mode_total");
const number_ranges = qs("#number_ranges");
const init_number_draw = qs("#init_number_draw");
const draw_number_one = qs("#draw_number_one");
const reset_number_draw = qs("#reset_number_draw");
const number_draw_log = qs("#number_draw_log");

const results_area = qs("#results_area");
const export_json = qs("#export_json");
const copy_results = qs("#copy_results");
const clear_results = qs("#clear_results");

const save_list_btn = qs("#save_list");
const load_list_btn = qs("#load_list");
const clear_list_btn = qs("#clear_list");
const save_paste_btn = qs("#save_paste");

const last_saved_list = qs("#last_saved_list");
const clear_storage_btn = qs("#clear_storage");

// State
let restrictions = []; // array of arrays of names
let lastResults = null;

// init
function updateExpected() {
  const tot = (parseInt(outfield.value) || 0) + (parseInt(gks.value) || 0);
  expected_total.textContent = tot;
}
[outfield, gks, teams, perTeam].forEach((el) =>
  el.addEventListener("input", updateExpected)
);
updateExpected();

// Mode toggles
function showMode(mode) {
  manual_panel.style.display = mode === "manual" ? "block" : "none";
  paste_panel.style.display = mode === "paste" ? "block" : "none";
  number_panel.style.display = mode === "number" ? "block" : "none";

  [mode_manual_btn, mode_paste_btn, mode_number_btn].forEach((b) =>
    b.classList.remove("danger")
  );
  (mode === "manual"
    ? mode_manual_btn
    : mode === "paste"
    ? mode_paste_btn
    : mode_number_btn
  ).classList.add("danger");
}
mode_manual_btn.addEventListener("click", () => showMode("manual"));
mode_paste_btn.addEventListener("click", () => showMode("paste"));
mode_number_btn.addEventListener("click", () => showMode("number"));
showMode("manual");

// Pairs dynamic
function renderPairs() {
  pairs_list.innerHTML = "";
  restrictions.forEach((grp, idx) => {
    const div = document.createElement("div");
    div.className = "pair-row";
    const inp = document.createElement("input");
    inp.value = grp.join(",");
    inp.placeholder = "Nome1, Nome2, ...";
    inp.style.flex = "1";
    const del = document.createElement("button");
    del.textContent = "X";
    del.className = "small btn-ghost";
    del.addEventListener("click", () => {
      restrictions.splice(idx, 1);
      renderPairs();
    });
    inp.addEventListener("change", () => {
      restrictions[idx] = inp.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    });
    div.append(inp, del);
    pairs_list.append(div);
  });
}
add_pair.addEventListener("click", () => {
  restrictions.push([]);
  renderPairs();
});
clear_pairs.addEventListener("click", () => {
  restrictions = [];
  renderPairs();
});
renderPairs();

// Storage helpers
const STORAGE_KEY = "sorteador_pelada_players";
function saveToStorage(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  last_saved_list.textContent = list.join(", ");
}
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    last_saved_list.textContent = arr.join(", ");
    return arr;
  } catch (e) {
    return null;
  }
}
function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  last_saved_list.textContent = "(nenhuma)";
}
loadFromStorage();

save_list_btn.addEventListener("click", () => {
  const arr = textarea_manual.value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (arr.length === 0) {
    alert("Nenhum jogador para salvar");
    return;
  }
  saveToStorage(arr);
  alert("Lista salva no localStorage");
});
load_list_btn.addEventListener("click", () => {
  const arr = loadFromStorage();
  if (!arr) {
    alert("Nenhuma lista salva");
    return;
  }
  textarea_manual.value = arr.join("\n");
  alert("Lista carregada");
});
clear_list_btn.addEventListener("click", () => {
  textarea_manual.value = "";
});
clear_storage_btn.addEventListener("click", () => {
  if (confirm("Limpar storage local?")) {
    clearStorage();
  }
});

// Helper: shuffle
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Core: manual draw with restrictions and GK allocation
function drawManual() {
  const players = textarea_manual.value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const gkList = textarea_gks.value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const nTeams = parseInt(teams.value) || 1;
  const per = parseInt(perTeam.value) || 0;

  if (players.length !== (parseInt(outfield.value) || 0)) {
    if (
      !confirm(
        "A quantidade de jogadores de linha informada (" +
          outfield.value +
          ") é diferente da lista atual (" +
          players.length +
          "). Continuar?"
      )
    )
      return;
  }
  if (gkList.length !== parseInt(gks.value || 0)) {
    if (
      !confirm(
        "Quantidade de goleiros informada (" +
          gks.value +
          ") difere da lista atual (" +
          gkList.length +
          "). Continuar?"
      )
    )
      return;
  }
  if (gkList.length < nTeams) {
    alert(
      "Número de goleiros menor que times — impossivel garantir 1 GK por time."
    );
    return;
  }

  // Prepare teams
  const teamsArr = [];
  for (let i = 0; i < nTeams; i++)
    teamsArr.push({ name: "Time " + (i + 1), players: [], gk: null });

  // allocate 1 GK per team randomly
  const shuffledGKs = shuffle(gkList.slice());
  for (let i = 0; i < nTeams; i++)
    teamsArr[i].gk = shuffledGKs[i % shuffledGKs.length];

  // distribute outfield players trying to respect restrictions roughly
  // We'll attempt a simple heuristic: shuffle players and then place, but avoid placing a player in a team that already contains someone from same restriction group if that would make group together entirely.

  let pool = shuffle(players.slice());

  // Convert restrictions to normalized lowercase sets for comparisons
  const normRestrictions = restrictions.map(
    (grp) => new Set(grp.map((s) => s.toLowerCase()))
  );

  // Place players one by one
  while (pool.length) {
    const p = pool.shift();
    // try to find team where placing p doesn't violate (i.e., cause whole restriction group to be together)
    let placed = false;
    const candidates = shuffle(Array.from({ length: nTeams }, (_, i) => i));
    for (const ti of candidates) {
      const team = teamsArr[ti];
      // if team already has a GK? that's fine. We need to check group violation: for any restriction group that contains p, ensure not all other group members will also be in this team after placement.
      let violates = false;
      for (const set of normRestrictions) {
        if (!set.has(p.toLowerCase())) continue;
        // count how many group members already in team
        const teamNames = team.players.map((x) => x.toLowerCase());
        let inTeamCount = 0;
        for (const name of teamNames) if (set.has(name)) inTeamCount++;
        // if placing p would make inTeamCount+1 equal to size of group -> entire group in same team (violation)
        const groupSize = Array.from(set).filter(Boolean).length;
        if (inTeamCount + 1 >= groupSize) {
          violates = true;
          break;
        }
      }
      // also ensure team total players (excluding GK) < per
      if (team.players.length >= per) violates = true;
      if (!violates) {
        team.players.push(p);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // fallback: put to the team with smallest players count that still has space
      const order = teamsArr
        .slice()
        .sort((a, b) => a.players.length - b.players.length);
      let f = false;
      for (const t of order) {
        if (t.players.length < per) {
          t.players.push(p);
          f = true;
          break;
        }
      }
      if (!f) {
        // no space: put in smallest anyway
        teamsArr.sort((a, b) => a.players.length - b.players.length);
        teamsArr[0].players.push(p);
      }
    }
  }

  lastResults = teamsArr;
  renderResults(teamsArr);
}

function previewManual() {
  // quick check whether any restriction group might end up together: we cannot be precise without running, so we run many attempts to see if possible to satisfy.
  const players = textarea_manual.value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const gkList = textarea_gks.value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const nTeams = parseInt(teams.value) || 1;
  const per = parseInt(perTeam.value) || 0;
  if (gkList.length < nTeams) {
    alert("Goleiros insuficientes para equipes");
    return;
  }
  const tries = 150;
  let ok = false;
  for (let i = 0; i < tries; i++) {
    // attempt using same algorithm quickly
    let teamsArr = [];
    for (let t = 0; t < nTeams; t++) teamsArr.push({ players: [], gk: null });
    const shuffledGKs = shuffle(gkList.slice());
    for (let t = 0; t < nTeams; t++)
      teamsArr[t].gk = shuffledGKs[t % shuffledGKs.length];
    const pool = shuffle(players.slice());
    const normRestrictions = restrictions.map(
      (grp) => new Set(grp.map((s) => s.toLowerCase()))
    );
    let failed = false;
    while (pool.length) {
      const p = pool.shift();
      const candidates = shuffle(Array.from({ length: nTeams }, (_, i) => i));
      let placed = false;
      for (const ti of candidates) {
        const team = teamsArr[ti];
        let violates = false;
        for (const set of normRestrictions) {
          if (!set.has(p.toLowerCase())) continue;
          const teamNames = team.players.map((x) => x.toLowerCase());
          let inTeamCount = 0;
          for (const name of teamNames) if (set.has(name)) inTeamCount++;
          const groupSize = Array.from(set).filter(Boolean).length;
          if (inTeamCount + 1 >= groupSize) {
            violates = true;
            break;
          }
        }
        if (team.players.length >= per) violates = true;
        if (!violates) {
          team.players.push(p);
          placed = true;
          break;
        }
      }
      if (!placed) {
        failed = true;
        break;
      }
    }
    if (!failed) {
      ok = true;
      break;
    }
  }
  alert(
    ok
      ? "Parece possível respeitar as restrições (teste rápido)."
      : "Não foi possível encontrar arranjo que respeite as restrições em tentativas. Considere ajustar parâmetros."
  );
}

draw_manual.addEventListener("click", drawManual);
preview_manual.addEventListener("click", previewManual);

// Paste mode
function drawPaste() {
  let list = textarea_paste.value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) {
    alert("Nenhum nome informado");
    return;
  }
  const nTeams = parseInt(teams.value) || 1;
  const per = Math.ceil(list.length / nTeams);
  list = shuffle(list);
  const teamsArr = [];
  for (let i = 0; i < nTeams; i++)
    teamsArr.push({ name: "Time " + (i + 1), players: [] });
  let idx = 0;
  for (const p of list) {
    teamsArr[idx].players.push(p);
    idx = (idx + 1) % nTeams;
  }
  lastResults = teamsArr;
  renderResults(teamsArr);
}
draw_paste.addEventListener("click", drawPaste);
save_paste.addEventListener("click", () => {
  const arr = textarea_paste.value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (arr.length === 0) return alert("Nenhuma entrada");
  saveToStorage(arr);
  alert("Lista salva");
});

// Number mode
let availableNumbers = [];
let numberToTeamMap = null;
init_number_draw.addEventListener("click", () => {
  const total = parseInt(number_total.value) || 0;
  if (total <= 0) return alert("Total inválido");
  // parse ranges
  const ranges = number_ranges.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  numberToTeamMap = {};
  if (ranges.length === 0) {
    // default map by equal ranges to teams field
    const nTeams = parseInt(teams.value) || 1;
    const per = Math.ceil(total / nTeams);
    for (let i = 0; i < total; i++) {
      const tindex = Math.floor(i / per);
      numberToTeamMap[i + 1] = "Time " + (tindex + 1);
    }
  } else {
    // ranges like 1-5,6-10
    let teamIndex = 0;
    for (const r of ranges) {
      const [a, b] = r.split("-").map((x) => parseInt(x.trim()));
      if (isNaN(a) || isNaN(b)) continue;
      for (let n = a; n <= b; n++) {
        numberToTeamMap[n] = "Time " + (teamIndex + 1);
      }
      teamIndex++;
    }
  }
  availableNumbers = Object.keys(numberToTeamMap).map((x) => parseInt(x));
  availableNumbers = shuffle(availableNumbers);
  number_draw_log.innerHTML =
    '<div class="muted">Números prontos: ' + availableNumbers.length + "</div>";
});

draw_number_one.addEventListener("click", () => {
  if (!availableNumbers || availableNumbers.length === 0)
    return alert("Inicialize o sorteio primeiro (Iniciar sorteio)");
  const n = availableNumbers.pop();
  const team = numberToTeamMap[n];
  const span = document.createElement("div");
  span.className = "chip";
  span.textContent = "Número " + n + " → " + team;
  number_draw_log.prepend(span);
});
reset_number_draw.addEventListener("click", () => {
  availableNumbers = [];
  numberToTeamMap = null;
  number_draw_log.innerHTML = "";
});

// Render results
function renderResults(teamsArr) {
  results_area.innerHTML = "";
  teamsArr.forEach((t) => {
    const div = document.createElement("div");
    div.className = "team";
    const h = document.createElement("h3");
    h.textContent = t.name + (t.gk ? " — Goleiro: " + t.gk : "");
    div.appendChild(h);
    const ul = document.createElement("ul");
    ul.className = "players";
    (t.players || []).forEach((p) => {
      const li = document.createElement("li");
      li.textContent = p;
      ul.appendChild(li);
    });
    div.appendChild(ul);
    results_area.appendChild(div);
  });
}

export_json.addEventListener("click", () => {
  if (!lastResults) return alert("Sem resultados para exportar");
  const data = JSON.stringify(lastResults, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "times.json";
  a.click();
  URL.revokeObjectURL(url);
});
copy_results.addEventListener("click", () => {
  if (!lastResults) return alert("Sem resultados");
  navigator.clipboard
    .writeText(JSON.stringify(lastResults, null, 2))
    .then(() => alert("Resultados copiados"));
});
clear_results.addEventListener("click", () => {
  results_area.innerHTML = "";
  lastResults = null;
});

// Misc
qs("#export_json");
qs("#copy_results");

// keyboard shortcuts: Ctrl+S save list
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    const arr = textarea_manual.value
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length) {
      saveToStorage(arr);
      alert("Lista salva");
    }
  }
});
