import { LightManager } from "./managers/light_manager/light_manager";
import { OscManager } from "./managers/osc_manager";
import { Utils } from "./utils/utils";

let lightManager: LightManager;
let oscManager: OscManager;
export function TatoMain(lM: LightManager, oM: OscManager) {
    // INICIALIZACIONES, NO TOCAR ##############
    lightManager = lM;
    oscManager = oM;
    lightManager.init();
    oscManager.init(onOSCInitialized);
    // #########################################
    // Tu código empieza aquí
}


// ESTA FUNCIÓN SE EJECUTA CUANDO EL OSC ESTÁ LISTO PARA SER UTILIZADO
// LO CUAL *NO* NECESARIAMENTE SIGNIFICA QUE HAYA ENCONTRADO LA MESA
// PERO *SI* QUE ESTÁ LISTO PARA FUNCIONAR
function onOSCInitialized(): void {
    // Ejemplo de como utilizar el comando "send"
    //oscManager.subscribeToMeter1() ;
    //oscManager.send("/meters", [
    //    { type: "s", value: "/meters/1" },
    //]);

    //DESDE AQUÍ

    oscManager.subscribeToMeter1() ;
    oscManager.subscribeToMeter6() ;
    console.log("empezamos");
    resetLEDS(200);
    reloj(20);
    reporte();
}

// ESTA FUNCIÓN SE EJECUTA CUANDO SE CAMBIA LA CANCIÓN EN LA UI
export function onSongChanged(songName: String, songIndex: number): void {
    lightManager.setValue({ ledNumber: songIndex, value: 1 });
}


// ESTA FUNCION SE EJECUTA CUANDO LLEGA CUALQUIER MENSAJE OSC
export function onOSCMsg(oscMsg: any): void {
    //console.log("msg recibido") ;
    // EJEMPLO DE COMO MANEJAR EL METER 1
    if (oscMsg.address == "/meters/1") {
        // Get data value
        const value = oscMsg.args[0].value;
        // Get size of data package
        let size = value.slice(0, 4);
        // Get array as uint8 array
        let uint8 = value.slice(4);
        // Get array of float numbers from array
        let result = Utils.uInt8ArrayToFloatArray(uint8);
        // The first 16 values (0-15) are the input values
        inputsXAIR = result ;
    };
    if (oscMsg.address == "/meters/6") {
        // Get data value
        const value = oscMsg.args[0].value;
        // Get size of data package
        let size = value.slice(0, 4);
        // Get array as uint8 array
        let uint8 = value.slice(4);
        // Get array of float numbers from array
        let result = Utils.uInt8ArrayToFloatArray(uint8);
        // The first 16 values (0-15) are the input values
        gatesXAIR = result ;
    }
}


// DESDE AQUÍ
let intensidadMedia:number = 0.5 ;
let intensidadBaja:number = 0.1 ;
let intensidadMinima:number = 0.05
let gainReduction = 0.00001; //factor de gain reduction
let gainScale = 50000 // escala de presion sonora

let posicion = 0 ;

let parte: number = 0 ;
console.log("empieza parte "+parte)
const fr = 40 ; //frecuencia de refresco
const hm = 50 ;//número máximo de historias
let inputsXAIR: any[] = [];
let gatesXAIR: any[] = [];
let estadosXAIR: any[] = [];
for (let i:number = 0; i<17; i++) {
    estadosXAIR.push(0) ;
}
let historiasXAIR: any[] = [];
for (let i:number = 0; i<hm; i++) {
    historiasXAIR.push([]) ;
}
let estadoLEDS: any[] = [];
for (let i:number = 0; i<21; i++) {
    estadoLEDS.push(0) ;
}


const chXAIR = {
    kk : 5,
    sn : 6,
    tm : 7,
    hh : 8,
    cr : 9,
    ri : 10,

    bj : 0,

    gl : 14,
    gr : 15,

    lc : 1,
    pi : 3,

    x : 33
};

function resetLEDS (t:number) {
    setTimeout(function () {
        for (let i:number = 0; i<20; i++) {
            lightManager.setValue({ledNumber: i, value:  0 }) ;
        }
    }, t);
}

function reloj (c: number) {
    if (c>0) {
        setTimeout(function () {
            //console.log("CICLO " + c) ;
            ciclo();
            //testeo();
            //testear(chXAIR.lc);
            reloj(c);
        }, fr)
    }
    
}

function reporte () {
    setTimeout(function () {
        reporte();
        //console.log(inputsXAIR[1]);
        //console.log(estadosXAIR); 
        //console.log(historiasXAIR[0][5]+","+historiasXAIR[1][5]+","+historiasXAIR[2][5]+","+historiasXAIR[3][5]);
    }, 500)

}

function testeo () {
    actualizarESTADOS();
    for (let i:number = 0; i<17; i++) {
        //lightManager.setValue({ledNumber: i, value:  1-Math.abs(gatesXAIR[i]*gf) }) ;
        lightManager.setValue({ledNumber: i, value:  estadosXAIR[i] }) ;

    }
}

function testear (inst: any) {
    actualizarESTADOS();
    for (let i:number = 0; i<21; i++) {
        lightManager.setValue({ledNumber: i, value:  estadosXAIR[inst] }) ;
    }
}

//===================

function actualizarESTADO (i:any, o:number, c:number, d:number, g:any) {
    //ESTA MIERDA ES BASTANTE MEJORABLE
    if (estadosXAIR[i] > 0     )                             { estadosXAIR[i] -= d ; } ;
    if (estadosXAIR[i] == 0    &&  gatesXAIR[i]> -1 )        { estadosXAIR[i]  = 1 ; if (i == chXAIR.lc) {console.log("listo")} } ;
    if (estadosXAIR[i] <= o    &&  gatesXAIR[i]< -c     )    { estadosXAIR[i]  = 0 ; } ;
    if (estadosXAIR[g] >= 0.1  )                             { estadosXAIR[i]  = 0 ; } ;
    if (estadosXAIR[i] < 0  && i == chXAIR.lc)               { estadosXAIR[i] += 1 ; } ;
 }

function cambiarPARTE () {
    if (estadosXAIR[chXAIR.cr] == 1 && estadosXAIR[chXAIR.lc] == 1 ) {
        estadosXAIR[chXAIR.lc] = -4*1000/fr; 
        if (parte == 19 ) {parte = 0 ;} else parte += 1 ;
        console.log("===CAMBIO A PARTE  "+parte+"===") ;
    } ;
}

function actualizarESTADOS () {
    actualizarESTADO(chXAIR.kk, 1,      70000, 0.03,   undefined);
    actualizarESTADO(chXAIR.sn, 1,      70000,  0.1,    chXAIR.kk);
    actualizarESTADO(chXAIR.tm, 1,      70000,  0.1,    undefined);
    actualizarESTADO(chXAIR.hh, 1,      70000,  0.1,    undefined);
    actualizarESTADO(chXAIR.cr, 0.1,    70000,  0.011,  undefined);
    actualizarESTADO(chXAIR.ri, 1,      70000,  0.2,    undefined);
    actualizarESTADO(chXAIR.lc, 0.1,    10000000,  0,    undefined);
    
    actualizarESTADO(chXAIR.bj, 1,      70000,  0.1,    undefined);
    actualizarESTADO(chXAIR.gl, 1,      50000,  0.15,    undefined);
    actualizarESTADO(chXAIR.gr, 1,      50000,  0.15,    undefined);
    actualizarESTADO(chXAIR.pi, 1,      90000,  0.07,    undefined);

   cambiarPARTE();
}



//=================
//===ANIMACIONES===
//=================
function locucion () {
    estadoLEDS[20] = gainReduction*(Math.abs(inputsXAIR[1]) -gainScale );
}
function voz () {
    estadoLEDS[20] = gainReduction*(Math.abs(inputsXAIR[1]) -gainScale ) + gainReduction*(Math.abs(inputsXAIR[11]) -gainScale );
}
function todos (inst: any) {
    for (let i:number = 0; i<20; i++) {
        estadoLEDS[i] = estadosXAIR[inst];
    }
}
function global (inst: any, f:number, m:number) {
    for (let i:number = 0; i<20; i++) {
            estadoLEDS[i] = Math.max(estadosXAIR[inst]*f, m);
        
    }
}
function fijoPAR (f:number) {
    for (let i:number = 0; i<10; i++) {
        estadoLEDS[i*2] = f ;  
    }
}
function fijoIMPAR (f:number) {
    for (let i:number = 0; i<10; i++) {
        estadoLEDS[1+i*2] = f ;  
    }
}
function pulso (
    c:number,   // posición centro
    b:number,   // ancho total del centro
    d:number,   // extensión del pulso
    a:number,   // difuminado del pulso (1 sin difuminado, 0 difuminado completo)
    f:number,   // factor de intensidad
    inst : any) {
    for (let i:number = 0; i<b; i++) {
        if (c+i <= 19) {
            estadoLEDS[c+i] = historiasXAIR[0][inst]*f ;
        }
        if (c-i >= 0) {
            estadoLEDS[c-i] = historiasXAIR[0][inst]*f ;
        }
    }
    for (let i:number = 1; i<d; i++) {
        if (c+b+i-1 <= 19) {
            estadoLEDS[c+b+i-1] = (1-i/(d-a))*historiasXAIR[i][inst]*f ;
        }
        if (c-i >= 0) {
            estadoLEDS[c-i] = (1-i/(d-a))*historiasXAIR[i][inst]*f ;
        }
    }
}
function golpe (
    c:number,   // posición centro
    b:number,   // ancho total del centro
    d:number,   // extensión del pulso
    a:number,   // difuminado del pulso (1 sin difuminado, 0 difuminado completo)
    f:number,   // factor de intensidad
    inst : any) {
    for (let i:number = 0; i<b; i++) {
        if (c+i <= 19 && estadoLEDS[c+i] < estadosXAIR[inst]*f) {
            estadoLEDS[c+i] = estadosXAIR[inst]*f ;
        }
        if (c-i >= 0 && estadoLEDS[c-i] < estadosXAIR[inst]*f ) {
            estadoLEDS[c-i] = estadosXAIR[inst]*f ;
        }
    }
    for (let i:number = 1; i<d; i++) {
        if (c+b+i-1 <= 19 && estadoLEDS[c+b+i-1] < (1-i/(d-a))*estadosXAIR[inst]*f) {
            estadoLEDS[c+b+i-1] = (1-i/(d-a))*estadosXAIR[inst]*f ;
        }
        if (c-i >= 0 && estadoLEDS[c-i] < (1-i/(d-a))*estadosXAIR[inst]*f ) {
            estadoLEDS[c-i] = (1-i/(d-a))*estadosXAIR[inst]*f ;
        }
    }
}
function punto (inst:any, i:number, f:number) {
    estadoLEDS[i] = f*estadosXAIR[inst];
    if (estadoLEDS[i-1] < f*estadosXAIR[inst]*0.45 && i-1 >=0 ) {
        estadoLEDS[i-1] = f*estadosXAIR[inst]*0.45
    };
    if (estadoLEDS[i+1] < f*estadosXAIR[inst]*0.45 && i+1 <=19 ) {
        estadoLEDS[i+1] = f*estadosXAIR[inst]*0.45
    };
}
function estrobo (f:number, n:number) {
    for (let i:number = 0; i<20; i++) {
        estadoLEDS[i] = 0;
    };
    for (let i:number = 0; i<n; i++) {
        estadoLEDS[Math.floor(Math.random()*20)] = f ;
    };
}
function base (f:number) {
    for (let i:number = 0; i<20; i++) {
            estadoLEDS[i] = f;
        
    }
}
function destello (inst: any, f:number, j:any) {
    for (let i:number = 0; i<20; i++) {
        if (estadoLEDS[i] < f*estadosXAIR[inst] || j==false) {
            estadoLEDS[i] = f*estadosXAIR[inst];
        }
    }
}
function destelloPAR (
    inst: any,
    f:number,
    j:any
    ) {
    for (let i:number = 0; i<10; i++) {
        if (estadoLEDS[i*2] < f*estadosXAIR[inst] || j==false) {
            estadoLEDS[i*2] = f*estadosXAIR[inst];
        }
    }
}
function destelloIMPAR (inst: any, f:number, j:any) {
    for (let i:number = 0; i<10; i++) {
        if (estadoLEDS[1+i*2] < f*estadosXAIR[inst] || j==false) {
            estadoLEDS[1+i*2] = f*estadosXAIR[inst];
        }
    }
}
function pestañeo (inst: any) {
    for (let i:number = 0; i<20; i++) {
        if ( estadosXAIR[inst] == 1) {
            estadoLEDS[i] = 1 ;
        }
    }
}
function pestañeoPAR (inst: any) {
    for (let i:number = 0; i<10; i++) {
        if ( estadosXAIR[inst] == 1) {
            estadoLEDS[i*2] = 1 ;
        }
    }
}
function pestañeoIMPAR (inst: any) {
    for (let i:number = 0; i<10; i++) {
        if ( estadosXAIR[inst] == 1) {
            estadoLEDS[1+i*2] = 1 ;
        }
    }
}
function locuraPAR (f:number) {
    for (let i:number = 0; i<10; i++) {
            estadoLEDS[i*2] = f*Math.floor(Math.random()*2) ;  
    }
    
}
function locuraIMPPAR (f:number) {
    for (let i:number = 0; i<10; i++) {
            estadoLEDS[1+i*2] = f*Math.floor(Math.random()*2) ;   
    }
    
}
function aleatorioPAR (instA:any, instB:any, f:number, n:number) {
    for (let i:number = 0; i<n; i++) {
        let aleato = Math.floor(Math.random()*10) ;
        if ( estadosXAIR[instA] == 1 || estadosXAIR[instB]) {
            estadoLEDS[2*aleato] = f*Math.floor(Math.random()*2) ;
        }
    }
}
function mitades (instA: any, instB:any, f: number) {
    if (estadosXAIR[instA] == 1 || estadosXAIR[instB] == 1 ) {
        if (estadoLEDS[0] == f ) {
            for (let i:number = 0; i<10; i++) {
                estadoLEDS[i] = 0 ;
            };
            for (let j:number = 10; j<20; j++) {
                estadoLEDS[j] = f ;
            }
        } else {
            for (let i:number = 0; i<10; i++) {
                estadoLEDS[i] = f ;
            };
            for (let j:number = 10; j<20; j++) {
                estadoLEDS[j] = 0 ;
            }
        }
    }
}
//=================
//=====PARTES======
//=================

function bol0() {
    base(intensidadMinima);
    golpe(8, 4, 5, 0, intensidadMedia, chXAIR.kk);
}
function bol1 () {
    destelloPAR(chXAIR.kk, intensidadMedia, false);
    destelloIMPAR(chXAIR.cr, 1, false);
    locucion();
}
function bol2 () { 
    destelloPAR(chXAIR.kk, intensidadMedia, false);
    destelloIMPAR(chXAIR.sn, intensidadBaja, false);
    destelloIMPAR(chXAIR.cr, 1, true);
    locucion();
}
function bol3 () {
    destelloPAR(chXAIR.kk, intensidadMedia, false);
    destelloIMPAR(chXAIR.cr, 1, false);
    locucion();
}  
function bol4 () {
    fijoPAR(intensidadMedia);
    destelloIMPAR(chXAIR.cr, intensidadMedia, false);
    locucion();
}
function bol5 () {
    destelloPAR(chXAIR.kk, intensidadMedia, false);
    destelloIMPAR(chXAIR.cr, 1, false);
    locucion();
} 
function bol6 () {
    fijoPAR(intensidadMedia);
    destelloIMPAR(chXAIR.cr, intensidadMedia, false);
    locucion();
}  
function bol7 () {
    fijoPAR(intensidadBaja);
    destelloIMPAR(chXAIR.kk, intensidadBaja, false);
    locucion();
}
function bol8 () {
    pulso(0, 1, 20, 0.9, intensidadMedia, chXAIR.kk);
    destello(chXAIR.cr, 1, true);
    locucion();
}  
function bol9 () {
    fijoPAR(intensidadBaja);
    destelloIMPAR(chXAIR.kk, intensidadBaja, false);
    locucion();
}
function bol10 () {
    base(intensidadMinima);
    golpe(8, 4, 5, 0, intensidadMedia, chXAIR.sn);
    golpe(0, 1, 8, 0, intensidadMedia, chXAIR.kk);
    golpe(19, 1, 8, 0, intensidadMedia, chXAIR.kk);
    locucion();
}
function bol11 () {
    pulso(8, 4, 9, 0, intensidadBaja, chXAIR.kk);
    destelloIMPAR(chXAIR.sn, intensidadMedia, true);
    locucion();
}
function bol12 () {
    todos(chXAIR.bj) ;
    locucion();
}
function bol13 () {
    pulso(8, 4, 9, 0, intensidadMedia, chXAIR.kk);
}
function bol14 () {
    pulso(0, 1, 20, 0.9, intensidadMedia, chXAIR.kk);
    destello(chXAIR.cr, 1, true);
}
function bol15 () {
    pulso(8, 4, 9, 0, intensidadMedia, chXAIR.kk);
}
function bol16 () {
    destelloPAR(chXAIR.kk, intensidadMedia, false);
    destelloPAR(chXAIR.cr, 1, true);
    destelloIMPAR(chXAIR.sn, intensidadBaja, false);
}
function bol17 () {
    locuraPAR(intensidadMedia);
    destelloPAR(chXAIR.cr, 1, true);
    destelloIMPAR(chXAIR.kk, intensidadMedia, false);
}
function bol18 () {
    destelloIMPAR(chXAIR.cr, 1, false);
}  
//=============================
function asf1() {
    base(0);
    punto(chXAIR.gl, 16, intensidadMedia);
    punto(chXAIR.gr, 18, intensidadMedia);
    punto(chXAIR.bj, 1, intensidadMedia);
    punto(chXAIR.bj, 2, intensidadMedia);
    punto(chXAIR.kk, 7, intensidadMedia);
    punto(chXAIR.kk, 8, intensidadMedia);
    punto(chXAIR.sn, 5, intensidadMedia);
    punto(chXAIR.sn, 10, intensidadMedia);
    punto(chXAIR.pi, 13, intensidadMedia);
    destello(chXAIR.cr, 1, true);
    locucion();
}
function asf2() {
    base(0);
    destelloPAR(chXAIR.kk, intensidadMedia, false) ;
    destelloIMPAR(chXAIR.bj, intensidadBaja, false) ;
    destello(chXAIR.cr, 1, true);
    voz();
}
function asf3() {
    base(0);
    punto(chXAIR.bj, 3, intensidadMedia);
    punto(chXAIR.bj, 5, intensidadMedia);
    punto(chXAIR.bj, 14, intensidadMedia);
    punto(chXAIR.bj, 16, intensidadMedia);
    punto(chXAIR.kk, 9, 1);
    punto(chXAIR.kk, 10, 1);
    punto(chXAIR.sn, 7, 1);
    punto(chXAIR.sn, 12, 1);
    destello(chXAIR.cr, 1, true);
    locucion(); 
}
//=============================
function mag1 () {
    pulso(8, 4, 9, 0, intensidadBaja, chXAIR.kk);
    destelloIMPAR(chXAIR.sn, intensidadMedia, true);
    destello(chXAIR.cr, intensidadMedia, true);
}
function mag2 () {
    destelloPAR(chXAIR.pi, intensidadMedia, false);
    destelloIMPAR(chXAIR.sn, intensidadMedia, false);
    destelloIMPAR(chXAIR.cr, 1, true);
}
function mag3 () {
    base(intensidadBaja);
    destello(chXAIR.cr, intensidadMedia, true);
    locucion();
}
function mag4 () {
    estrobo(1, 4) ;
    destello(chXAIR.cr, intensidadMedia, true);
}
//=============================
function ray1 () {
    global(chXAIR.gl,intensidadBaja, intensidadMinima);
    destello(chXAIR.cr, intensidadMedia, true);
    voz();
}
function ray2 () {
    global(chXAIR.kk,intensidadMedia, intensidadBaja);
    destello(chXAIR.cr, 1, true);
    estadoLEDS[20] = 1 ;
}
//=============================
function jun1 () {
    mitades(chXAIR.kk, chXAIR.sn, intensidadMedia) ;
}
function jun2 () {
    base(0);
    punto(chXAIR.bj, 3, intensidadMedia);
    punto(chXAIR.bj, 5, intensidadMedia);
    punto(chXAIR.bj, 14, intensidadMedia);
    punto(chXAIR.bj, 16, intensidadMedia);
    punto(chXAIR.kk, 9, 1);
    punto(chXAIR.kk, 10, 1);
    punto(chXAIR.sn, 7, 1);
    punto(chXAIR.sn, 12, 1);
    destello(chXAIR.cr, 1, true);
}
//=============================
function rep1 () {
    mitades(chXAIR.kk, chXAIR.sn, 1) ;
}
function rep2 () {
    base(0);
    punto(chXAIR.bj, 3, intensidadMedia);
    punto(chXAIR.bj, 5, intensidadMedia);
    punto(chXAIR.bj, 14, intensidadMedia);
    punto(chXAIR.bj, 16, intensidadMedia);
    punto(chXAIR.kk, 9, 1);
    punto(chXAIR.kk, 10, 1);
    punto(chXAIR.sn, 7, 1);
    punto(chXAIR.sn, 12, 1);
    destello(chXAIR.cr, 1, true);
}
function rep3 () {
    estrobo(1, 4) ;
    destello(chXAIR.cr, intensidadMedia, true);
    locucion();
}
//=============================
//====CANCIONES
//=============================
function cancionBOL () {
    if (parte == 0 ) { bol0();  } ;
    if (parte == 1 ) { bol1();  } ;
    if (parte == 2 ) { bol2();  } ;
    if (parte == 3 ) { bol3();  } ;
    if (parte == 4 ) { bol4();  } ;
    if (parte == 5 ) { bol5();  } ; //riff
    if (parte == 6 ) { bol6();  } ; //suave
    if (parte == 7 ) { bol7();  } ; //riff
    if (parte == 8 ) { bol8();  } ; //INSTRUMENTAL LARGA
    if (parte == 9 ) { bol9();  } ; //riff
    if (parte == 10) { bol10(); } ;
    if (parte == 11) { bol11(); } ;
    if (parte == 12) { bol12(); } ;
    if (parte == 13) { bol13(); } ; //---subida
    if (parte == 14) { bol14(); } ; //INSTRUMENTAL LARGA
    if (parte == 15) { bol15(); } ; //---subida
    if (parte == 16) { bol16(); } ; //ESTRIBILLO
    if (parte == 17) { bol17(); } ; //OUTRO
    if (parte == 18) { bol18(); } ; //FINAL
}
function cancionASF () {
    if (parte == 0 ) { asf1();  } ;
    if (parte == 1 ) { asf2();  } ; //negro
    if (parte == 2 ) { asf1();  } ;
    if (parte == 3 ) { asf3();  } ; //blanco
    if (parte == 4 ) { asf1();  } ;
    if (parte == 5 ) { asf2();  } ; //negro
    if (parte == 6 ) { asf1();  } ;
    if (parte == 7 ) { asf3();  } ; //blanco
    if (parte == 8 ) { asf1();  } ; 
}
function cancionMAG () {
    if (parte == 0 ) { mag1();  } ;
    if (parte == 1 ) { mag2();  } ; //estribillo
    if (parte == 2 ) { mag1();  } ;
    if (parte == 3 ) { mag3();  } ; //interludio
    if (parte == 4 ) { mag1();  } ;
    if (parte == 5 ) { mag2();  } ; //estribillo
    if (parte == 6 ) { mag4();  } ; //LOCURA
    if (parte == 7 ) { mag2();  } ; //estribillo
}
function cancionRAY () {
    if (parte == 0 ) { ray1();  } ;
    if (parte == 1 ) { ray2();  } ; 
    if (parte == 2 ) { ray1();  } ;
    if (parte == 3 ) { ray2();  } ;
}
function cancionJUN () {
    if (parte == 0 ) { jun1();  } ;
    if (parte == 1 ) { jun2();  } ; 
    if (parte == 2 ) { jun1();  } ;
    if (parte == 3 ) { jun2();  } ; 
    if (parte == 4 ) { jun1();  } ;
    if (parte == 5 ) { jun2();  } ; 
}
function cancionREP () {
    if (parte == 0 ) { rep1();  } ;
    if (parte == 1 ) { rep2();  } ; 
    if (parte == 2 ) { rep1();  } ;
    if (parte == 3 ) { rep2();  } ; 
    if (parte == 4 ) { rep3();  } ;
    if (parte == 5 ) { rep2();  } ; 
}
//=============================
//====CICLO
//=============================
function ciclo () {
    actualizarESTADOS();
    let nuevaHistoria: any[] = estadosXAIR.toString().split(",");
    historiasXAIR.splice(0,0, nuevaHistoria); 
    historiasXAIR.slice(0,hm);

    //if cancion tal, func cancion
    cancionASF();
    //cancionMAG();
    //cancionBOL();
    //cancionRAY();
    //cancionJUN();

    for (let i:number = 0; i<21; i++) {
        lightManager.setValue({ledNumber: i, value:  estadoLEDS[i] }) ;
    }; 
}

// escenas que no me molan pero podrían molar
function escena1 () {
    aleatorioPAR(chXAIR.kk, chXAIR.sn, 1, 10);
    destelloIMPAR(chXAIR.cr, 1, false);
}
 