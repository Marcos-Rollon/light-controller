/**
 * Handles the UI logic of the light controller. ALWAYS KEEP THIS SIMPLE AND STUPID
 */
document.body.onload = main;

/**
 * Global vars declarations
 */

const ledValueInput = document.getElementById("led_value_input");
const ledNumberInput = document.getElementById("led_number_input");

function main() {

}


async function onButtonClick(withFade) {
    let value = ledValueInput.value;
    let number = ledNumberInput.value;
    if (withFade) {
        let result = await window.fetch(`/set_led_fade/${number}/${value}`);
    } else {
        let result = await window.fetch(`/set_led/${number}/${value}`);
    }
    // let data = await result.json();
    // if (data.success == true) {
    //     console.log("yay");
    // }
}