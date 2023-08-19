const socket = io("http://localhost:3000");
const lightContainer = document.getElementById("light-container");
const topLeft = document.getElementById("top-left");
const topRight = document.getElementById("top-right");
const botLeft = document.getElementById("bot-left");
const botRight = document.getElementById("bot-right");
const ball = document.getElementById("center-ball");

document.body.onload = main;
let decays = [];

socket.on("setValue", (data) => {
    console.log(data);
    setLightOpacity(data.ledNumber, data.value);
})
socket.on("setWithDecay", (data) => {
    console.log(data);
    setWithDecay(data.ledNumber, data.value, data.decayTime, data.stepTime);
});

function main() {

    for (let i = 0; i < 20; i++) {
        lightContainer.appendChild(createLedHtml(i));
        decays.push(null);
    }
}

function createLedHtml(numberText) {
    let light = document.createElement("div");
    light.classList.add("light");
    let indicator = document.createElement("p");
    indicator.innerHTML = numberText;
    let div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.appendChild(light);
    div.appendChild(indicator);
    div.style.paddingTop = `${Math.abs((numberText - 10) * Math.abs(5 * (numberText - 9)))}px`;
    return div;
}


function setLightOpacity(number, opacity) {
    let light;
    if (number >= 20) {
        light = ball;
    } else {
        light = lightContainer.children[number].children[0];
    }
    light.style.backgroundColor = `rgba(0, 255, 0, ${opacity})`;
}


function setWithDecay(number, value, decayTime, stepTime) {
    if (decays[number] != null) {
        clearInterval(decays[number]);
        decays[number] = null;
        return;
    }
    setLightOpacity(number, value);
    let currentValue = value;
    let numSteps = decayTime / stepTime;
    let numToDeduct = (value / numSteps);
    decays[number] = setInterval(() => {
        currentValue -= numToDeduct;
        if (currentValue <= 0.01) {
            clearInterval(decays[number]);
            decays[number] = null;
        } else {
            setLightOpacity(number, currentValue);
        }
    }, stepTime);

}
