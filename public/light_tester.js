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
    addLedsToCuadrante(topLeft, false, true, 0);
    addLedsToCuadrante(topRight, true, true, 5);
    addLedsToCuadrante(botLeft, false, false, 10);
    addLedsToCuadrante(botRight, true, false, 15);
    for (let i = 0; i < 20; i++) {
        decays.push(null);
    }
}

function addLedsToCuadrante(cuadrante, xPositiva, yPositiva, startValue) {
    for (let i = 0; i < 5; i++) {
        let light = document.createElement("div");
        light.classList.add("light");
        let indicator = document.createElement("p");
        indicator.innerHTML = startValue + i;
        let div = document.createElement("div");
        div.style.position = "absolute";
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.appendChild(light);
        div.appendChild(indicator);

        const CONSTANTE_VERTICAL = 50
        const CONSTANTE_HORIZONTAL = 70;
        const padding = 5;

        if (xPositiva) {
            if (yPositiva) {
                div.style.top = `${i * CONSTANTE_VERTICAL + padding}px`;
                div.style.left = `${i * CONSTANTE_HORIZONTAL + padding}px`;
            }
            else {
                div.style.top = `${(400 - 200) - i * CONSTANTE_VERTICAL + padding}px`;
                div.style.left = `${i * CONSTANTE_HORIZONTAL + padding}px`;
            }
        }
        else {
            if (yPositiva) {
                div.style.top = `${i * CONSTANTE_VERTICAL + padding}px`;
                div.style.left = `${(600 - 20) - i * CONSTANTE_HORIZONTAL - padding}px`;
            }
            else {
                div.style.top = `${(400 - 200) - i * CONSTANTE_VERTICAL + padding}px`;
                div.style.left = `${(600 - 20) - i * CONSTANTE_HORIZONTAL - padding}px`;
            }
        }

        cuadrante.appendChild(div);
    }
}


function setLightOpacity(number, opacity) {
    let light;
    if (number < 5) {
        light = topLeft.children[number + 1].children[0];
    } else if (number < 10) {
        light = topRight.children[number + 1 - 5].children[0];
    } else if (number < 15) {
        light = botLeft.children[number + 1 - 10].children[0];
    } else if (number < 20) {
        light = botRight.children[number + 1 - 15].children[0];
    } else {
        light = ball;
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
