/**
 * Handles the UI logic of the light controller. ALWAYS KEEP THIS SIMPLE AND STUPID
 */
document.body.onload = main;

/**
 * Global vars declarations
 */
let songList = [];
let currentSongIndex = 0;
let titleElement = document.getElementById("current_song");

function main() {
    getCurrentSongList();
}

/**
 * Gets the current songs from the server. After creates the button list UI element
 */
async function getCurrentSongList() {
    let result = await window.fetch("/song_list");
    let data = await result.json();
    songList = data.data;
    createButtonList();
}

/**
 * Creates the buttons dynamically and attaches the events handlers
 * After, gets the current song from the server
 */
function createButtonList() {
    for (let i = 0; i < songList.length; i++) {
        const newButton = document.createElement("button");
        newButton.setAttribute("id", "button_" + songList[i]);
        newButton.setAttribute("class", "list_button");
        newButton.textContent = songList[i];
        newButton.onclick = () => { onButtonClick(songList[i]) }
        document.getElementById("button_list").appendChild(newButton);
    }
    getCurrentSongIndex();
}

/**
 * Gets the current song from the server, also changes the active button
 */
async function getCurrentSongIndex() {
    let result = await window.fetch("/current_song");
    let data = await result.json();
    changeActiveButton(songList[currentSongIndex], data.data);
    currentSongIndex = songList.indexOf(data.data);

}

/**
 * Utility to change visually what is the active button, as well as the title
 * @param {String} from Button that is NOT the active anymore
 * @param {String} to Button that is the new active 
 */
function changeActiveButton(from, to) {
    titleElement.innerHTML = to;
    document.getElementById("button_" + from).classList.remove("active_button");
    document.getElementById("button_" + to).classList.add("active_button");
}

/**
 * Event handler for the buttons, sends to the server the petition to make the
 * current button the new active one
 * @param {String} name 
 */
async function onButtonClick(name) {
    let result = await window.fetch(`/change_song/${name}`);
    let data = await result.json();
    if (data.success == true) {
        let newIndex = songList.indexOf(name);
        changeActiveButton(songList[currentSongIndex], name);
        currentSongIndex = newIndex;
    }
}