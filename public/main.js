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

async function loadAnimals() {
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
        select.innerHTML += `<option value="${a._id}">${a.name} (${a.type})</option>`;
    })
}

async function loadLeaderboard() {
    try {
        const response = await fetch(API + "/leaderboard");
        if (!response.ok) throw new Error("Failed to fetch leaderboard")
        const data = await response.json();

        const entries = document.getElementById("leaderboard-entries")
        entries.innerHTML = ""

        data.forEach(obj => {
            const row = entries.insertRow()

            row.insertCell(0).innerText = obj._id
            row.insertCell(1).innerText = obj.totalGold
            row.insertCell(2).innerText = obj.totalSilver
            row.insertCell(3).innerText = obj.totalBronze
        })
    } catch (err) {
        console.error("Error loading leaderboard:", err);
    }
}

function recalcPoints() {
    const form = document.getElementById("createForm");
    const s = + form.speed.value;
    const st = + form.stamina.value;
    const a = + form.agility.value;
    const d = + form.dexterity.value;
    const total = s + st + a + str + 1;
    const rem = 30 - total;

    document.getElementById("pointsLeft").innerText = remain;
    const error = document.getElementById("createError");
    if (remain < 0) {
        error.innerText = `Too many points allocated by ${-remain}. Reduce some statistics.`;
    } else {
        error.innerText = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("pointTotal").innerText = 30;
    recalcPoints();
})

async function createAnimal(event) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await response.json;
    if (data.error) {
        document.getElementById("createError").innerText = data.error;
    } else {
        form.reset();
        form.speed.value = form.stamina.value = form.agility.value = form.dexterity.value = 0;
        recalcPoints();
        loadAnimals();
    }
}

function showResults(data) {
    const tbody = document.querySelector("#resultsTable tbody");
    tbody.innerHTML = "";
    data.standings.forEach(s => {
        tbody.innerHTML += `<tr>
                <td>${s.place}</td><td>${s.name}</td><td>${s.type}</td><td>${s.score}</td>
            </tr>`;
    });
}

async function startRace(event) {
    event.preventDefault();

    const select = document.getElementById("raceSelect");
    const animalId = select.value;

    if(!animalId) {
        alert("please select an animal to race!");
        return;
    }

    try{
        const res = await fetch("/race", {
            method:"POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({animalId})
        });
        const data = await res.json();

        if(!res.ok) {
            alert(data.error || "failed to start race");
            return;
        }

        const tbody = document.querySelector("#resultsTable tbody");
        tbody.innerHTML = "";

        data.results.forEach(r => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${r.place}</td>
                <td>${r.name}</td>
                <td>${r.username}</td>
                <td>${r.score}</td>
            `;
            tbody.appendChild(tr);
        });

        const raceTitleE1 = document.createElement("h3");
        raceTitleE1.textContent = `${data.title}`;
        document.body.insertBefore(raceTitleE1, document.querySelector("#resultsTable"));

        console.log("Race results:", data);

    } catch (err) {
        console.error("error starting race:", err);
    }

    
}

const viewHistory = async function(event) {
    const response = await fetch("/viewHistory")

    const history = await response.json()
    const entries = document.getElementById("historyLog")
    for (let record of history) {

        const historyTable = document.createElement("table")
        historyTable.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Title</th>
            <th>Player name</th>
            <th>animal name</th>
            <th>animal type</th>
        </tr>
        `
       
        const firstRes = await fetch(`/viewAnimal`, {
            method: "POST",
            body: JSON.stringify({ animalId: record.first }),
            headers: { 'Content-Type': 'application/json' }
        })

        const first = await firstRes.json()

        const firstEntry = document.createElement("tr")
        firstEntry.innerHTML = `
        <td>1</td>
        <td>${record.title}</td>
        <td>${first.username}</td>
        <td>${first.name}</td>
        <td>${first.type}</td>
        `
        historyTable.appendChild(firstEntry)

        const secondRes = await fetch(`/viewAnimal`, {
            method: "POST",
            body: JSON.stringify({ animalId: record.second }),
            headers: { 'Content-Type': 'application/json' }
        })

        const second = await secondRes.json()

        const secondEntry = document.createElement("tr")
        secondEntry.innerHTML = `
        <td>2</td>
        <td>${record.title}</td>
        <td>${second.username}</td>
        <td>${second.name}</td>
        <td>${second.type}</td>
        `
        historyTable.appendChild(secondEntry)

        const thirdRes = await fetch(`/viewAnimal`, {
            method: "POST",
            body: JSON.stringify({ animalId: record.third }),
            headers: { 'Content-Type': 'application/json' }
        })

        const third = await thirdRes.json()

        const thirdEntry = document.createElement("tr")
        thirdEntry.innerHTML = `
        <td>3</td>
        <td>${record.title}</td>
        <td>${third.username}</td>
        <td>${third.name}</td>
        <td>${third.type}</td>
        `
        historyTable.appendChild(thirdEntry)

        const fourthRes = await fetch(`/viewAnimal`, {
            method: "POST",
            body: JSON.stringify({ animalId: record.fourth }),
            headers: { 'Content-Type': 'application/json' }
        })

        const fourth = await fourthRes.json()

        const fourthEntry = document.createElement("tr")
        fourthEntry.innerHTML = `
        <td>4</td>
        <td>${record.title}</td>
        <td>${fourth.username}</td>
        <td>${fourth.name}</td>
        <td>${fourth.type}</td>
        `
        historyTable.appendChild(fourthEntry)

        const fifthRes = await fetch(`/viewAnimal`, {
            method: "POST",
            body: JSON.stringify({ animalId: record.fifth }),
            headers: { 'Content-Type': 'application/json' }
        })

        const fifth = await fifthRes.json()

        const fifthEntry = document.createElement("tr")
        fifthEntry.innerHTML = `
        <td>5</td>
        <td>${record.title}</td>
        <td>${fifth.username}</td>
        <td>${fifth.name}</td>
        <td>${fifth.type}</td>
        `
        historyTable.appendChild(fifthEntry)


        
     entries.appendChild(historyTable)
}
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
    // document.getElementById("credentials").addEventListener("submit", login)
    loadLeaderboard()
    loadAnimals()
    viewHistory()
}