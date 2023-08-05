var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;

var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 60,
    debug: false
};
pwm = new Pca9685Driver(options, function (err) {
    if (err) {
        console.error("Error initializing PCA9685");
        process.exit(-1);
    }
    console.log("Initialization done");

    let on = false;
    setInterval(() => {
        on ? pwm.channelOff(0) : pwm.channelOn(0);
        on = !on;
    }, 300);

    // let value = 0;
    // let subir = true;
    // setInterval(() => {
    //     if (value > 1) {
    //         value = 1;
    //         subir = false;
    //     } else if (value < 0) {
    //         value = 0;
    //         subir = true;
    //     }
    //     pwm.setDutyCycle(0, value);
    //     value = value + subir ? 0.05 : -0.05;
    // }, 200);

});
