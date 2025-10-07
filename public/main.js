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