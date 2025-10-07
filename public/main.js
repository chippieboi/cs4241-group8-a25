const API = "http://localhost:3000";
const login = async function (event) {
    event.preventDefault()
    const username = document.querySelector("#username").value
    const password = document.querySelector("#password").value

    const response = await fetch("/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()

    if (!response.ok) {
        alert(data.message);
        return;
    }

    if (data.message) {
        alert(data.message)
    }
}

async function loadAnimals(){
    const response = await fetch(API + "/animals");
    const animals = await response.json();
    const tbody = document.querySelector("#animalsTable tbody");
    const select = document.getElementById("raceSelect");
    tbody.innerHTML = "";
    select.innerHTML = "";
    animals.forEach(a => {
        tbody.innerHTML += `<tr>
            <td>${a.name}</td><td>${a.type}</td><td>${a.speed}</td><td>${a.stamina}</td>
            <td>${a.agility}</td><td>${a.dexterity}</td>
        </tr>`;
        select.innerHTML += `<option value="${a.id}">${a.name} (${a.type})</option>`;
    })
}

async function loadLeaderboard() {
    const response = await fetch(API + "/leaderboard");
    const board = await response.json();
    const tbody = document.querySelector("#leaderboardTable tbody");
    tbody.innerHTML = "";
    board.forEach(r => {
        tbody.innerHTML += `<tr><td>${r.name}</td><td>${r.type}</td><td>${r.wins}</td></tr>`;
    });
}

function recalcPoints(){
    const form = document.getElementById("createForm");
    const s =+ form.speed.value;
    const st =+ form.stamina.value;
    const a =+ form.agility.value;
    const d =+ form.dexterity.value;
    const total = s + st + a + str + 1;
    const rem = 30 - total;

    document.getElementById("pointsLeft").innerText = remain;
    const error = document.getElementById("createError");
    if (remain < 0){
        error.innerText = `Too many points allocated by ${-remain}. Reduce some statistics.`;
    } else {
        error.innerText = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("pointTotal").innerText = 30;
    recalcPoints();
})

async function createAnimal(event){
    event.preventDefault();
    const form = e.target;
    const body = {
        name: form.name.value,
        type: form.type.value,
        speed: +form.speed.value,
        stamina: +form.stamina.value,
        agility: +form.agility.value,
        dexterity: +form.dexterity.value,
    };
    const total = body.speed + body.stamina + body.agility + body.dexterity;
    if (total > 30) {
        document.getElementById("createError").innerText = `Total exceeds 30`;
        return;
    }
    const response = await fetch(API + "/animals", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    const data = await response.json;
    if (data.error){
        document.getElementById("createError").innerText = data.error;
    } else {
        form.reset();
        form.speed.value = form.stamina.value = form.agility.value = form.dexterity.value = 0;
        recalcPoints();
        loadAnimals();
    }
}

function showResults(data){
    const tbody = document.querySelector("#resultsTable tbody");
        tbody.innerHTML = "";
        data.standings.forEach(s => {
            tbody.innerHTML += `<tr>
                <td>${s.place}</td><td>${s.name}</td><td>${s.type}</td><td>${s.score}</td>
            </tr>`;
        });
}

const leaderboard = async function(event) {
    const response = await fetch("/leaderboard")

    const leaderboard = await response.json()
    const entries = document.getElementById("leaderboard").getElementById("entries")[0]
    entries.innerHTML = ""
}
/*
/create animal
/edit animal      - edit animal
/view history     - show history for the user (as opposed to animal specific)
/race             - handle selecting other users' animals to race against, calculating who wins, displaying race info
                  - insert related info into history table, update animal table (maybe user table if user also tracks total wins)
/view animals     - show all animals of a given user
/leaderboard
*/

window.onload = function () {
    document.getElementById("credentials").addEventListener("submit", login)
}