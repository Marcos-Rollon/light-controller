const socket = io("http://localhost:3000");
const lightContainer = document.getElementById("light-container");


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
    for (let i = 0; i < 21; i++) {
        let light = document.createElement("div");
        light.classList.add("light");
        let indicator = document.createElement("p");
        indicator.innerHTML = i;
        let div = document.createElement("div");
        div.classList.add("flex");
        div.appendChild(light);
        div.appendChild(indicator);
        lightContainer.appendChild(div);

        decays.push(null);
    }
}

function setLightOpacity(number, opacity) {
    // get correct child
    let container = lightContainer.children[number];
    let light = container.children[0];
    light.style.backgroundColor = `rgba(0,255,0,${opacity})`;
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
