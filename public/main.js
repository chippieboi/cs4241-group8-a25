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

    /*if (data.message) {
        alert(data.message)
    }
    alert("Login successful!");*/
    window.location.href = "/";
}

async function loadAnimals() {
    const response = await fetch("/loadAnimals");
    const animals = await response.json();
    console.log("The Animals: " + JSON.stringify(animals))
    const select = document.getElementById("raceSelect");
    select.innerHTML = "";
    let numAnimals = animals.length;
    console.log(numAnimals)

    let overlays = [document.getElementById("overlay1"), document.getElementById("overlay2"), document.getElementById("overlay3")]
    for(let i = 3; i < 3; i++){
        overlays[i].style.display = 'none';
    }

    let icon1 = document.getElementById("icon1");
    icon1.innerHTML = "<img class='emptyIcons' src='empty.png'> ";
    let icon2 = document.getElementById("icon2");
    icon2.innerHTML = "<img class='emptyIcons' src='empty.png'> ";
    let icon3 = document.getElementById("icon3");
    icon3.innerHTML = "<img class='emptyIcons' src='empty.png'> ";
    const icons = [icon1, icon2, icon3];
    let iconCount = 0;

    let slot1 = document.getElementById("slot1");
    let slot2 = document.getElementById("slot2");
    let slot3 = document.getElementById("slot3");
    const slots = [slot1, slot2, slot3]
    let slotCount = 0;

    animals.forEach(animal => {
        const newAnimal = document.createElement("table");
        let inner = `
            <table class="animalsTable" ><tbody>
                <tr><td style="color: #FFEFB7;">Name:      </td><td colspan="4" class="tableText">${animal.name}</td></tr>
                <tr><td style="color: #FFEFB7;">Type:   </td><td colspan="4" class="tableText">${animal.type}</td></tr>
                <tr><td style="color: #FFEFB7;">Speed:     </td><td class="tableText">${animal.speed}</td>
                    <td style="color: #FFEFB7;">Stamina:   </td><td class="tableText">${animal.stamina}</td>
                    <td style="color: #749951;" rowspan="2" class="createButton" onclick="deleteAnimal('${animal._id}')">Delete</td></tr>
                <tr><td style="color: #FFEFB7;">Agility:</td><td class="tableText">${animal.agility}</td>
                    <td style="color: #FFEFB7;">Dexterity:</td><td class="tableText">${animal.dexterity}</td></tr>
                </tbody>
            </table>
        `;
        slots[slotCount].innerHTML = inner;
        slotCount++;
        console.log("Slot Count: " + slotCount)
        let pick = animal.type
        console.log("Pick: " + pick)
        console.log("current icon: " + icons[iconCount] + " at " + iconCount)
        switch (pick) {
            case "kangaroo":
                icons[iconCount].innerHTML = "<img class='emptyIcons' src='kangaroo.png'> "
                break;
            case "horse":
                icons[iconCount].innerHTML = "<img class='emptyIcons' src='horse.png'>"
                break;
            case "dog":
                icons[iconCount].innerHTML = "<img class='emptyIcons' src='dog.png'>"
                break;
            case "cat":
                icons[iconCount].innerHTML = "<img class='emptyIcons' src='cat.png'>"
                break;
            default:
                break;
        }
        iconCount++;
        const option = document.createElement("option");
        option.value = animal._id;
        option.textContent = `${animal.name} (${animal.type})`;
        select.appendChild(option);
    })
    for (slotCount; slotCount < 3; slotCount++){
        console.log("trying slotcount " + slotCount)
        console.log(overlays[slotCount])
        overlays[slotCount].style.display = 'block';
        console.log("went well")
    }
    
}

const totalPoints = 30;
const statInputs = document.querySelectorAll("#speed, #stamina, #agility, #dexterity");
const remainingNum = document.getElementById("remainingPoints");

function recalcPoints() {
    let used = 0;
    statInputs.forEach(input => {
        used += parseInt(input.value) || 0;
    })

    let remaining = totalPoints - used;

    remainingNum.innerText = remaining;
    const error = document.getElementById("createError");

    if (remaining < 0) {
        error.innerText = `Too many points allocated by ${-remaining}. Reduce some statistics.`;
        remaining = 0;
    } else {
        error.innerText = "";

    }
}

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
    let modal = document.getElementById("createModal");

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
        //alert("Animal created");
        form.reset();
        //recalcPoints();
        loadAnimals();
        modal.style.display = "none";
        
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
    //alert("Animal deleted");
    loadAnimals();
    window.location.reload();
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

    loadLeaderboard();
    viewHistory();
}

const viewHistory = async function(event) {
    const response = await fetch("/viewHistory")

    const history = await response.json()
    const entries = document.getElementById("historyLog");
    entries.innerHTML ="";
    for (let record of history) {
        let track = 0;
        let ownAnimal = null;
        try {
            const ownRes = await fetch('/animalInHistory', {
             method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ record })
            });
            if (ownRes.ok) {
            ownAnimal = await ownRes.json();
            } else {
            console.error('animalInHistory failed', ownRes.status);
            }
} catch (err) {
  console.error('animalInHistory network error', err);
}
        
        const historyTable = document.createElement("table")
        historyTable.innerHTML = `
        <tr class="main-row" style="cursor:pointer"><th colspan="2">${record.title}</th><th>${ownAnimal.rank}</th></tr>
        <tr class="detail-row" style="display:none">
            <th>Rank</th>
            <th>Player name</th>
            <th>animal name</th>
            <th>animal type</th>
        </tr>
        `
       
        const firstRes = await fetch('/viewAnimal', {
            method: "POST",
            body: JSON.stringify({ animalId: record.first }),
            headers: { 'Content-Type': 'application/json' }
        })
        if(firstRes.ok){
            track++;
        const first = await firstRes.json()

    const firstEntry = document.createElement("tr")
    firstEntry.className = "detail-row"
    firstEntry.style.display = 'none'
        firstEntry.innerHTML = `
        <td>${track}</td>
        <td>${first.username}</td>
        <td>${first.name}</td>
        <td>${first.type}</td>
        `
        historyTable.appendChild(firstEntry)
        }

        const secondRes = await fetch('/viewAnimal', {
            method: "POST",
            body: JSON.stringify({ animalId: record.second }),
            headers: { 'Content-Type': 'application/json' }
        })
        if(secondRes.ok){
            track++;
        const second = await secondRes.json()

    const secondEntry = document.createElement("tr")
    secondEntry.className = "detail-row"
    secondEntry.style.display = 'none'
        secondEntry.innerHTML = `
        <td>${track}</td>
        <td>${second.username}</td>
        <td>${second.name}</td>
        <td>${second.type}</td>
        `
        historyTable.appendChild(secondEntry)
        }

        const thirdRes = await fetch('/viewAnimal', {
            method: "POST",
            body: JSON.stringify({ animalId: record.third }),
            headers: { 'Content-Type': 'application/json' }
        })

        if(thirdRes.ok){
            track++;
        const third = await thirdRes.json()

    const thirdEntry = document.createElement("tr")
    thirdEntry.className = "detail-row"
    thirdEntry.style.display = 'none'
        thirdEntry.innerHTML = `
        <td>${track}</td>
        <td>${third.username}</td>
        <td>${third.name}</td>
        <td>${third.type}</td>
        `
        historyTable.appendChild(thirdEntry)
        }

        const fourthRes = await fetch('/viewAnimal', {
            method: "POST",
            body: JSON.stringify({ animalId: record.fourth }),
            headers: { 'Content-Type': 'application/json' }
        })
        if(fourthRes.ok){
            track++;
        const fourth = await fourthRes.json()

    const fourthEntry = document.createElement("tr")
    fourthEntry.className = "detail-row"
    fourthEntry.style.display = 'none'
        fourthEntry.innerHTML = `
        <td>${track}</td>
        <td>${fourth.username}</td>
        <td>${fourth.name}</td>
        <td>${fourth.type}</td>
        `
        historyTable.appendChild(fourthEntry)
        }

        const fifthRes = await fetch('/viewAnimal', {
            method: "POST",
            body: JSON.stringify({ animalId: record.fifth }),
            headers: { 'Content-Type': 'application/json' }
        })

        if(fifthRes.ok){
            track++;
        const fifth = await fifthRes.json()

    const fifthEntry = document.createElement("tr")
    fifthEntry.className = "detail-row"
    fifthEntry.style.display = 'none'
        fifthEntry.innerHTML = `
        <td>${track}</td>
        <td>${fifth.username}</td>
        <td>${fifth.name}</td>
        <td>${fifth.type}</td>
        `
        historyTable.appendChild(fifthEntry)
        }


        
     entries.appendChild(historyTable)
    }
}
async function loadLeaderboard() {
    try {
        const response = await fetch(API + "/leaderboard");
        if (!response.ok) throw new Error("Failed to fetch leaderboard")
        const data = await response.json();

        const entries = document.getElementById("leaderboard-entries").getElementsByTagName("tbody")[0]
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
    var modal = document.getElementById("createModal");
    var innerModal = document.getElementById("modalContent");
    var btn1 = document.getElementById("btn1");
    var btn2 = document.getElementById("btn2");
    var btn3 = document.getElementById("btn3");
    var cancelBtn = document.getElementById("cancelCreate")
    var sliders = document.getElementsByClassName("slider")
    var values = document.getElementsByClassName("valueBox")
    var options = document.getElementById("animalType")
    var icon = document.getElementById("theIcon")
    
    options.oninput = function(){
        var pick = options.value
        console.log("The pick: " + pick)
        switch (pick) {
            case "kangaroo":
                icon.innerHTML = "<img src='kangaroo.png'> "
                break;
            case "horse":
                icon.innerHTML = "<img src='horse.png'>"
                break;
            case "dog":
                icon.innerHTML = "<img src='dog.png'>"
                break;
            case "cat":
                icon.innerHTML = "<img src='cat.png'>"
                break;
            default:
                break;
        }
    }
    btn1.onclick = function(){
        console.log("Clicked 1")
        modal.style.display = 'block';
    }
    btn2.onclick = function(){
        console.log("Clicked2")
        modal.style.display = 'block';
    }
    btn3.onclick = function(){
        console.log("Clicked3")
        modal.style.display = 'block';
    }
    cancelBtn.onclick = function(){
        console.log("Canceled")
        modal.style.display = "none";
    }

    for (let i = 0; i < sliders.length; i++){
        sliders[i].oninput = function(){
            values[i].innerHTML = this.value;
        }
    }
    
    // document.getElementById("credentials").addEventListener("submit", login)
    loadLeaderboard()
    loadAnimals()
    recalcPoints()
    viewHistory()
}

statInputs.forEach(input => {
    input.addEventListener("input", recalcPoints);
}); 

// Delegated handler: toggle detail rows when a main-row is clicked
document.getElementById('historyLog').addEventListener('click', (e) => {
    const main = e.target.closest('.main-row')
    if (!main) return
    // find the table this main row belongs to
    const table = main.closest('table')
    if (!table) return
    // toggle all .detail-row rows within this table
    const details = table.querySelectorAll('.detail-row')
    details.forEach(d => {
        d.style.display = d.style.display === 'none' ? '' : 'none'
    })
})