import * as wss from './wss.js';
import * as constants from "./constants.js";
import * as ui from  "./ui.js";
import * as store from "./store.js";

let connectedUserDetails;
let peerConnection;
let dataChannel;

const defaultConstraints= {
    audio:true,
    video:true,

};

const configuration={

    iceServers : [
        {
            urls: 'stun:stun.l.google.com:13902',
        },
    ],

};
export const getLocalPreview= ()=>{
    navigator.mediaDevices.getUserMedia(defaultConstraints)
    .then((stream)=>{
        console.log("Pokrenuta then fja");
        ui.updateLocalVideo(stream);
        ui.showVideoCallButtons();
        store.setCallState(constants.callState.CALL_AVAILABLE);
        store.setLocalStream(stream);
    }).catch((err)=>{
        console.log("error occured when trying to get an access to camera");
        console.log(err);
    }); //pristupi kameri/mikrofonu

};

const createPeerConnection= ()=>{

    peerConnection= new RTCPeerConnection(configuration); // klasa daje metode za uspostavljanje konekcije izmedju pirova

    dataChannel=peerConnection.createDataChannel('chat');

    peerConnection.ondatachannel=(event)=>{
        const dataChannel=event.channel;
        dataChannel.onopen=()=>{
            console.log("peer connection is ready to receive data channel mess");
        }
        dataChannel.onmessage=(event)=>{
            console.log("mess came from data channel");
            const message= JSON.parse(event.data); //logika za razmenu i dekodiranje poruka preko ceta
           // console.log(message);
           ui.appendMessage(message);
        }
    }

    peerConnection.onicecandidate= (event)=>{

        console.log('getting ice candidates from stun server');
        if(event.candidate){

            //logic to send our ice candidates to other peer
        wss.sendDataUsingWebRTCSignaling({
            connectedUserSocketId: connectedUserDetails.socketId,
            type: constants.webRTCSignaling.ICE_CANDIDATE,
            candidate: event.candidate,
        })
        }
    };
    peerConnection.onconnectionstatechange=(event)=>{

        if(peerConnection.connectionState==="connected"){
            console.log('succesfully conncected with other peer');
        }
    };

    // receiving track
    const remoteStream=new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    peerConnection.ontrack=(event)=>{

        remoteStream.addTrack(event.track);
    }
    //add our stream to peer connection

    if(connectedUserDetails.callType=== constants.callType.VIDEO_PERSONAL_CODE
    || connectedUserDetails.callType === constants.callType.VIDEO_STRANGER){
        const localStream=store.getState().localStream;

        for(const track of localStream.getTracks()){
            peerConnection.addTrack(track,localStream);
        }
    }
};
//fja za slanje poruka u cet
export const sendMessageUsingDataChannel=(message)=>{
    const stringifiedMessage= JSON.stringify(message);
    dataChannel.send(stringifiedMessage);
}

export const sendPreOffer = (callType, calleePersonalCode)=> {
//ako korisnik prihvati nas zahtev za konekciju, 
//pisemo logiku za uspostavljanje konekcije izmedju dva korinsika
console.log("pre offer function executed");
//pripremamo podatke koje prosledjujemo serveru

connectedUserDetails ={
     callType,
     socketId: calleePersonalCode,

};

if (callType=== constants.callType.CHAT_PERSONAL_CODE || callType===constants.callType.VIDEO_PERSONAL_CODE) {

const data ={

    callType,
    calleePersonalCode,

};
ui.showCallingDialog(callingDialogRejectCallHandler);
store.setCallState(constants.callState.CALL_UNAVAILABLE);
wss.sendPreOffer(data);
}

if(callType=== constants.callType.CHAT_STRANGER || 
    callType===constants.callType.VIDEO_STRANGER

){

    const data ={

        callType,
        calleePersonalCode,
    
    };
    store.setCallState(constants.callState.CALL_UNAVAILABLE);
    wss.sendPreOffer(data);
}



//console.log("Pre offer function data"+data.callType+" "+data.calleePersonalCode);
};

export const handlePreOffer =(data) =>{


    const { callType, callerSocketId}=data;

   

    if(!checkCallPossibility()){ //nismo available da pick up the call
        return sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE, callerSocketId);
    }

    connectedUserDetails={
        socketId: callerSocketId,
        callType,
    };

    store.setCallState(constants.callState.CALL_UNAVAILABLE);

    if(
        callType === constants.callType.CHAT_PERSONAL_CODE || callType=== constants.callType.VIDEO_PERSONAL_CODE
    ){
        ui.showIncomingCallDialog(callType, acceptCallHandler,rejectCallHandler);

    }
    if(
        callType=== constants.callType.CHAT_STRANGER || 
    callType===constants.callType.VIDEO_STRANGER
    ){
        createPeerConnection();
        sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
        ui.showCallElements(connectedUserDetails.callType);
    }

};

const acceptCallHandler= ()=> {

    console.log("Call accepted");
    createPeerConnection();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType);
};

const rejectCallHandler= ()=> {

    console.log("Call rejected");
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
    setIncomingCallsAvailable();

};

const callingDialogRejectCallHandler= ()=>{
    console.log("Rejecting the call");
    const data={
        connectedUserSocketId: connectedUserDetails.socketId
    }
    closePeerConnectionAndResetState();
    wss.sendUserHangedUp(data);

}

const sendPreOfferAnswer =(preOfferAnswer, callerSocketId=null)=> {

    const socketId= callerSocketId? callerSocketId:connectedUserDetails.socketId;
    const data= {

    callerSocketId:socketId,
    preOfferAnswer

}
ui.removeAllDialogs();
 wss.sendPreOfferAnswer(data); //emitujemo event serveru



}

export const handlePreOfferAnswer=(data)=>{

    const{ preOfferAnswer}=data;
    ui.removeAllDialogs(); 
    console.log("pre offer answer came");
    console.log(data);
    if(preOfferAnswer=== constants.preOfferAnswer.CALLEE_NOT_FOUND ) {

        ui.showInfoDialog(preOfferAnswer);
        setIncomingCallsAvailable();
        //show dialog that callee has not been found
    }
    if(preOfferAnswer=== constants.preOfferAnswer.CALL_UNAVAILABLE){

        setIncomingCallsAvailable();
        ui.showInfoDialog(preOfferAnswer);
        //show dialog that callee is not able to connect
    }

    if(preOfferAnswer=== constants.preOfferAnswer.CALL_REJECTED ) {

        setIncomingCallsAvailable();
        ui.showInfoDialog(preOfferAnswer);
        //show dialog that call rejected by the callee
    }

    if(preOfferAnswer=== constants.preOfferAnswer.CALL_ACCEPTED ) {

        ui.showCallElements(connectedUserDetails.callType);
        createPeerConnection();
        //send webRTC offer
          sendWebRTCOffer();
    }
}

const sendWebRTCOffer =async()=>{
    //caller side, a salje se ka callee side

const offer= await peerConnection.createOffer();
//menjamo sdp informacije u ovom offer ce biti info od caller side
await peerConnection.setLocalDescription(offer);
wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.OFFER,
    offer: offer,
});
};

export const handleWebRTCOffer = async(data)=>{

   // console.log('webRTC offer came');
   // console.log(data);  //strana pozvanog

    await peerConnection.setRemoteDescription(data.offer);
    const answer= await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    wss.sendDataUsingWebRTCSignaling({

        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer:answer,
    });

};

//caller side
export const handleWebRTCAnswer =async (data)=>{
    console.log("handling webRTC answer");
    await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate= async (data)=>{
    console.log("handling incoming webRTC candidates");
    try {
        await peerConnection.addIceCandidate(data.candidate);

    }catch(err){
        console.error("error occured when trying to add received ice candidate",err);
    }
}


let screenSharingStream;
export const switchBetweenCameraAndScreenSharing = async (screenSharingActive)=> {
    if(screenSharingActive){
        const localStream=store.getState().localStream;
        const senders=peerConnection.getSenders();


        const sender=senders.find((sender)=>{
            return (
            sender.track.kind===localStream.getVideoTracks()[0].kind
            );
        });
        if(sender){
            sender.replaceTrack(localStream.getVideoTracks()[0]);
        }

        //stop screen sharing stream, da nam ne izlazi obavestenje ispod
        //get tracks i tracks stop, zaustavljaju i kameru i mikrofon
        store.getState().screenSharingStream.getTracks()
        .forEach((track)=>track.stop()); 

        store.setScreenSharingActive(!screenSharingActive);

        ui.updateLocalVideo(localStream);

    }else {
        console.log('switching for screen sharing');
        try {
            screenSharingStream= await navigator.mediaDevices.getDisplayMedia({
                video:true

            });
            store.setScreenSharingStream(screenSharingStream);


            //replace track which sender is sending
            const senders= peerConnection.getSenders();

            const sender=senders.find((sender)=>{
                return (
                sender.track.kind===screenSharingStream.getVideoTracks()[0].kind
                );
            });
            if(sender){
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
            }
            store.setScreenSharingActive(!screenSharingActive);

            ui.updateLocalVideo(screenSharingStream);
        } catch (err) {
            console.error("error occured when trying to get screen sharing stream",err);
            
        }
    }
}

//hang up
export const handleHangUp=()=>{

    console.log("finishing the call");
    const data={
        connectedUserSocketId: connectedUserDetails.socketId
    }
    wss.sendUserHangedUp(data); //wss salje ove info preko soket io servera tj wss je soket io server
    closePeerConnectionAndResetState();
}


export const handleConnectedUserHangedUp=()=>{
    console.log("connected peer hanged up");
    closePeerConnectionAndResetState();
}

const closePeerConnectionAndResetState =()=>{

    if(peerConnection){
        peerConnection.close(); 
        //ako postoji konekcija sa nekim peerom, zatvaramo je i stavljamo na null
        peerConnection=null;

    }

    // active mic and camera, tj ukljucen video poziv
    if(connectedUserDetails.callType===constants.callType.VIDEO_PERSONAL_CODE || 
        connectedUserDetails.callType=== constants.callType.VIDEO_STRANGER){

            store.getState().localStream.getVideoTracks()[0].enabled=true;
            store.getState().localStream.getAudioTracks()[0].enabled=true;
            //na pocetku novog poziva ukljuceni mikrofon i kamera

        }
        ui.updateUIAfterHangUp(connectedUserDetails.callType);
        setIncomingCallsAvailable();
        connectedUserDetails=null;

}


const checkCallPossibility= (callType)=>{

    const callState=store.getState().callState;

    if(callState===constants.callState.CALL_AVAILABLE){
        return true;
    }
    if((callType===constants.callType.VIDEO_PERSONAL_CODE ||
        callType===constants.callType.VIDEO_STRANGER) && 
        callState===constants.callState.CALL_AVAILABLE_ONLY_CHAT
    ){
        return false;
        //ako sam slobodna samo za cet, nisam pristupila lokalnoj kameri, ne odgovaram na video pozive
        //nemoguce je javiti se na video poziv

    }
    return false;
}

const setIncomingCallsAvailable =()=>{

    const localStream=store.getState().localStream;

    if(localStream){
        store.setCallState(constants.callState.CALL_AVAILABLE);
    }else {
        store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
    }
}