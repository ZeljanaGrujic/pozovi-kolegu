import * as store from "./store.js";
// uvozimo sve iz stora, tj uvozimo stanje iz state
import * as wss from "./wss.js";

import * as webRTCHandler from "./webRTCHandler.js";

import * as constants from "./constants.js";

import * as ui from './ui.js';

import * as recordingUtils from './recordingUtils.js';

import * as strangerUtils from './strangerUtils.js';

//ovo mi ne treba jer sam i u element zakomentarisala 
//import {getIncomingCallDialog} from "./elements.js";

//initialization of socketIO connection

const socket= io('/'); // ovako bismo zakucale io('localhost:3000');, ali ako deploy ujemo aplikaciju, port nece biti isti, i onda koristimo / da procitamo bilo koji port
wss.registerSocketEvents(socket);


webRTCHandler.getLocalPreview();

//register event for personal code copy button
const personalCodeCopyButton =document.getElementById("personal_code_copy_button");
// pomocu ove funkcije imamo pristup elementu sa id jem iz zagrade
personalCodeCopyButton.addEventListener("click", ()=>{

    const personalCode=store.getState().socketId;
    //cuvamo vrednost promenljive personalcode na ekranu
    navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

//register event listeners for connection buttons

const personalCodeChatButton = document.getElementById(
"personal_code_chat_button"
);

const personalCodeVideoButton= document.getElementById(
    "personal_code_video_button"
);

personalCodeChatButton.addEventListener('click', ()=>{
console.log('chat button clicked');

const calleePersonalCode= document.getElementById("personal_code_input").value;

const callType= constants.callType.CHAT_PERSONAL_CODE;

webRTCHandler.sendPreOffer(callType, calleePersonalCode); //sta saljemo serveru, a to je informacija sa kim zelimo da se konektujemo
//,mi saljemo serveru link personal code i sa njim zelimo komunikaciju
//kad kliknemo na chat ili video on treba da se pozove
//u nas zahtev ka serveru dodajemo vrednost iz polja za personal code

});

personalCodeVideoButton.addEventListener('click', ()=>{
    console.log('video button clicked');
    const calleePersonalCode= document.getElementById(
        "personal_code_input"
        ).value;
        

        const callType= constants.callType.VIDEO_PERSONAL_CODE;
        webRTCHandler.sendPreOffer(callType, calleePersonalCode);
    });


   // getIncomingCallDialog('VIDEO', ()=>{}, ()=>{});



   const strangerChatButton= document.getElementById('stranger_chat_button');

   strangerChatButton.addEventListener('click', ()=>{

    //logic

    strangerUtils.getStrangerSocketIdAndConnect(constants.callType.CHAT_STRANGER);
   })

   const strangerVideoButton= document.getElementById('stranger_video_button');


   strangerVideoButton.addEventListener('click',()=>{

    //logic


    strangerUtils.getStrangerSocketIdAndConnect(constants.callType.VIDEO_STRANGER);

   })

   //register event from allow connections from strangers

   const checkbox=document.getElementById('allow_strangers_checkbox');
   checkbox.addEventListener('click', ()=>{

    const checkboxState= store.getState().allowConnectionsFromStrangers;
    ui.updateStrangerCheckbox(!checkboxState);
    store.setAllowConnectionsFromStrangers(!checkboxState);
    strangerUtils.changeStrangerConnectionStatus(!checkboxState);
   })
   //event listeners for video call buttons

   const micButton=document.getElementById('mic_button');
   micButton.addEventListener('click', ()=>{
       const localStream =store.getState().localStream;
       const micEnabled= localStream.getAudioTracks()[0].enabled;
       localStream.getAudioTracks()[0].enabled=!micEnabled;
       ui.updateMicButton(micEnabled);
   })

const cameraButton= document.getElementById('camera_button');
cameraButton.addEventListener('click', ()=>{

    const localStream =store.getState().localStream;
    const cameraEnabled= localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled=!cameraEnabled;
    ui.updateCameraButton(cameraEnabled);

})

const switchForScreenSharingButton= document.getElementById('screen_sharing_button');
switchForScreenSharingButton.addEventListener('click',()=>{

    const screenSharingActive= store.getState().screenSharingActive;
    webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
})

//messanger

const newMessageInput= document.getElementById('new_message_input');
newMessageInput.addEventListener('keydown', (event)=>{
    console.log("change occured");
    const key=event.key; //event.key skenira koje dugme smo kliknuli na tastaturi

    if(key==='Enter'){
        webRTCHandler.sendMessageUsingDataChannel(event.target.value);
        ui.appendMessage(event.target.value,true);
        newMessageInput.value='';
    }
})


const sendMessageButton= document.getElementById('send_message_button');
sendMessageButton.addEventListener('click', ()=>{
    const message= newMessageInput.value;
    webRTCHandler.sendMessageUsingDataChannel(message);
    ui.appendMessage(message,true);

    newMessageInput.value='';
})

//recording

const startRecordingButton =document.getElementById('start_recording_button');
startRecordingButton.addEventListener('click', ()=>{

    recordingUtils.startRecording();
    ui.showRecordingPanel();
})

const stopRecordingButton= document.getElementById('stop_recording_button');
stopRecordingButton.addEventListener('click', ()=>{

    recordingUtils.stopRecording();
    ui.resetRecordingButtons();
})


//listeneri za pause/resume button recording
const pauseRecordingButton=document.getElementById('pause_recording_button');
pauseRecordingButton.addEventListener('click', ()=>{

    recordingUtils.pauseRecording();
    ui.switchRecordingButtons(true);
})

const resumeRecordingButton= document.getElementById('resume_recording_button');
resumeRecordingButton.addEventListener('click', ()=>{

    recordingUtils.resumeRecording();
    ui.switchRecordingButtons();
})

//hang up 
const hangUpButton= document.getElementById('hang_up_button');
hangUpButton.addEventListener('click',()=>{
    webRTCHandler.handleHangUp();
})

const hangUpChatButton= document.getElementById('finish_chat_call_button');
hangUpChatButton.addEventListener('click', ()=>{

    webRTCHandler.handleHangUp();
})