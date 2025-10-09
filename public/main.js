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
    alert("Login successful!");
    window.location.href = "/";
}

async function loadAnimals() {
    const response = await fetch("/loadAnimals");
    const animals = await response.json();

    const animalList = document.querySelector("#animalsTable tbody");
    const select = document.getElementById("raceSelect");
    animalList.innerHTML = "";
    select.innerHTML = "";

    animals.forEach(animal => {
        const newAnimal = document.createElement("tr");
        newAnimal.innerHTML = `
            <td>${animal.name}</td>
            <td>${animal.type}</td>
            <td>${animal.speed}</td>
            <td>${animal.stamina}</td>
            <td>${animal.agility}</td>
            <td>${animal.dexterity}</td>
            <td>
                <button onclick="editAnimal('${animal._id}', '${animal.name}', '${animal.type}', ${animal.speed}, ${animal.stamina}, ${animal.agility}, ${animal.dexterity})">Edit</button>
                <button onclick="deleteAnimal('${animal._id}')">Delete</button>
            </td>
        `;
        animalList.appendChild(newAnimal);
        const option = document.createElement("option");
        option.value = animal._id;
        option.textContent = `${animal.name} (${animal.type})`;
        select.appendChild(option);
        //select.innerHTML += `<option value="${animal._id}">${animal.name} (${animal.type})</option>`;
    })
}

/*function recalcPoints() {
    const form = document.getElementById("createForm");
    const s = + form.speed.value;
    const st = + form.stamina.value;
    const a = + form.agility.value;
    const d = + form.dexterity.value;
    const total = s + st + a + d;
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
})*/

async function createAnimal(event) {
    event.preventDefault();
    const form = event.target;
    //if (form.dataset.editId) return editAnimal(event);
    const name = document.getElementById("animalName").value;
    const type = document.getElementById("animalType").value;
    const speed = parseInt(document.getElementById("speed").value);
    const stamina = parseInt(document.getElementById("stamina").value);
    const agility = parseInt(document.getElementById("agility").value);
    const dexterity = parseInt(document.getElementById("dexterity").value);

    const animalData = { name, type, speed, stamina, agility, dexterity };

    const total = speed + stamina + agility + dexterity;
    if (total > 30) {
        document.getElementById("createError").innerText = `Total exceeds 30`;
        return;
    }

    const response = await fetch("/createAnimal", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(animalData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
        alert("Animal created");
        form.reset();
        //recalcPoints();
        loadAnimals();
    } else {
        alert(result.error || "Error creating animal.");
    }
}

async function editAnimal(id, name, type, speed, stamina, agility, dexterity) {
    //const form = event.target;
    //const id = form.dataset.editId;

    /*const body = {
        name: form.name.value,
        type: form.type.value,
        speed: +form.speed.value,
        stamina: +form.stamina.value,
        agility: +form.agility.value,
        dexterity: +form.dexterity.value,
    };*/
    const newName = prompt("Enter new name:", name) ?? name;
    const newType = prompt("Enter new type:", type) ?? type;
    const newSpeed = parseInt(prompt("Enter new speed:", speed));
    const newStamina = parseInt(prompt("Enter new stamina:", stamina));
    const newAgility = parseInt(prompt("Enter new agility", agility));
    const newDexterity = parseInt(prompt("Enter new dexterity", dexterity));

    const animalStats = { name: newName, type: newType, speed: newSpeed, stamina: newStamina, agility: newAgility, dexterity: newDexterity};
    const total = newSpeed + newStamina + newAgility + newDexterity;
    if (total > 30) {
        document.getElementById("createError").innerText = "Total exceeds 30";
        return;
    }

    const res = await fetch(`/editAnimal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(animalStats)
    });

    const data = await res.json();

    if (data.success) {
        alert("Animal updated");
        loadAnimals();
    } else {
        alert(data.error || "Error updating animal");
    }

    //form.reset();
   // form.removeAttribute("data-edit-id");
    //document.getElementById("createButton").innerText = "Create Animal";
    //loadAnimals();
}

// Load animal into form for editing
/*async function loadAnimalForEdit(id) {
    const res = await fetch("/loadAnimal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animalId: id })
    });

    const animal = await res.json();

    const form = document.getElementById("createForm");
    form.name.value = animal.name;
    form.type.value = animal.type;
    form.speed.value = animal.speed;
    form.stamina.value = animal.stamina;
    form.agility.value = animal.agility;
    form.dexterity.value = animal.dexterity;
    form.dataset.editId = animal._id;

    document.getElementById("createButton").innerText = "Save Changes";
}*/

async function deleteAnimal(id) {
  if (!confirm("Are you sure you want to delete this animal?")) return;

  const res = await fetch(`/deleteAnimal/${id}`, {
    method: "DELETE"});

  const result = await res.json();
  if (result.success) {
    alert("Animal deleted");
    loadAnimals();
  } else {
    alert(result.error || "Error deleting animal");
  }
}



function showResults(data) {
    const tbody = document.querySelector("#resultsTable tbody");
    tbody.innerHTML = "";
    data.standings.forEach(s => {
        tbody.innerHTML += `<tr>
                <td>${s.place}</td>
                <td>${s.name}</td>
                <td>${s.type}</td>
                <td>${s.score}</td>
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
        <tr><th>${record.title}</th></tr
        <tr>
            <th>Rank</th>
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
        <td>${fifth.username}</td>
        <td>${fifth.name}</td>
        <td>${fifth.type}</td>
        `
        historyTable.appendChild(fifthEntry)


        
     entries.appendChild(historyTable)
    }
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