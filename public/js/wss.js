import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";

import * as constants from './constants.js';
import * as strangerUtils from './strangerUtils.js';

let socketIO= null;

export const registerSocketEvents = (socket) => {
    socketIO=socket;


    socket.on('connect', ()=>{


        console.log('succesfully connected to socket.io server');
        store.setSocketId(socket.id); //pozvali smo fju iz sotra socketId i ona se izvrsava
        ui.updatePersonalCode(socket.id);
        //console.log(socket.id);
        });//ako se neko sa klijentske strane konektuje na server dobijamo info o uspesnoj koneciji i njegov br porta


        socket.on('pre-offer', (data)=>{
            webRTCHandler.handlePreOffer(data);
        });

        socket.on('pre-offer-answer', (data)=>{
        webRTCHandler.handlePreOfferAnswer(data);

        });


        socket.on('user-hanged-up' ,()=>{
            //ako dogadjaj bude emitovan od servera, mi to slusamo, i prosledjuje se ovde
            webRTCHandler.handleConnectedUserHangedUp();
        })

        socket.on('webRTC-signaling',(data)=>{

            switch (data.type){
                 case constants.webRTCSignaling.OFFER :
                    webRTCHandler.handleWebRTCOffer(data);
                    break;
                    case constants.webRTCSignaling.ANSWER:
                        webRTCHandler.handleWebRTCAnswer(data);
                        break;
                        case constants.webRTCSignaling.ICE_CANDIDATE:
                            webRTCHandler.handleWebRTCCandidate(data);
                            break;
                 default: 
                    return;
            }
        });

        socket.on('stranger-socket-id', (data)=>{

            strangerUtils.connectWithStranger(data);
        })
};



export const sendPreOffer =(data)=>{
    console.log("emiting to server pre offer event");
socketIO.emit("pre-offer" ,data); //emituje se dogadjaj serveru, i prosledjuju se podaci

};


export const sendPreOfferAnswer =(data)=>{

    socketIO.emit("pre-offer-answer",data);
}

export const sendDataUsingWebRTCSignaling= (data)=>{

    socketIO.emit('webRTC-signaling',data);
}

export const sendUserHangedUp= (data)=>{
    socketIO.emit('user-hanged-up',data);
}

export const changeStrangerConnectionStatus =(data)=>{


    socketIO.emit('stranger-connection-status',data);
}

export const getStrangerSocketId=()=>{

    socketIO.emit('get-stranger-socket-id');

    //mi emitujemo ovo serveru, on salje dalje u app u, zapravo app je server
}
