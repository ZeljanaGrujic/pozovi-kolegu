import * as constants from "./constants.js";
import * as elements from "./elements.js";


export const updatePersonalCode =(personalCode) => {

    const personalCodeParagraph=document.getElementById("personal_code_paragraph");
    personalCodeParagraph.innerHTML = personalCode;

};

export const updateLocalVideo =(stream)=>{
const localVideo=document.getElementById("local_video");
localVideo.srcObject=stream;

localVideo.addEventListener('loadedmetadata', ()=>{

    localVideo.play();
});

};

export const showVideoCallButtons =()=>{

    const personalCodeVideoButton=document.getElementById('personal_code_video_button');
    const strangerVideoButton=document.getElementById('stranger_video_button');

    showElement(personalCodeVideoButton);
    showElement(strangerVideoButton);

    //za slucaj da blokiramo kameru, nece nam se ni prikazati dugme video kol
    //ako dozvolimo local stream, pokazace nam se dugme i za video chat
}

export const updateRemoteVideo=(stream)=>{

    const remoteVideo=document.getElementById('remote_video');
    remoteVideo.srcObject=stream;
}

export const showIncomingCallDialog =(callType, acceptCallHandler, rejectCallHandler) => {

    //ako je video poziv ta poruka iskace ako je chat onda ta poruka

    const callTypeInfo = 
        callType=== constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";

       const incomingCallDialog= elements.getIncomingCallDialog(callTypeInfo,acceptCallHandler,rejectCallHandler);

       const dialog= document.getElementById('dialog');
       //uklanjam sve dijaloge, tako da ne dodje do dijaloga u dijalogu
       //zvezdicom sam oznacila kao sve dijaloge
       dialog.querySelectorAll('*').forEach((dialog)=>dialog.remove());
        dialog.appendChild(incomingCallDialog);
    };

    export const showCallingDialog = (rejectCallHandler) =>{

        const callingDialog=elements.getCallingDialog(rejectCallHandler);
        const dialog= document.getElementById('dialog');
        dialog.querySelectorAll('*').forEach((dialog)=>dialog.remove());

        dialog.appendChild(callingDialog);
    }

    export const showNoStrangerAvailableDialog =()=>{
        const infoDialog=elements.getInfoDialog('Nema dostupnih kolega', 'Molim Vas, pokušajte kasnije');

        if(infoDialog){
            const dialog=document.getElementById('dialog');
            dialog.appendChild(infoDialog);
            setTimeout(()=>{
                removeAllDialogs();
            },[4000]);

            }
    
    }

    export const showInfoDialog= (preOfferAnswer)=>{

        let infoDialog=null;
        if(preOfferAnswer=== constants.preOfferAnswer.CALL_REJECTED){
            infoDialog=elements.getInfoDialog('Poziv odbijen',
            'Kolega je odbio Vaš poziv')
        }

        if(preOfferAnswer=== constants.preOfferAnswer.CALLEE_NOT_FOUND){
            infoDialog=elements.getInfoDialog('Kolega nije pronađen',
            'Proverite njegov lični kod')
        }

        if(preOfferAnswer=== constants.preOfferAnswer.CALL_UNAVAILABLE){
            infoDialog=elements.getInfoDialog('Poziv nije moguć',
            'Kolega je verovatno zauzet, pokušajte kasnije')
        }

        if(infoDialog){
            const dialog=document.getElementById('dialog');
            dialog.appendChild(infoDialog);
            setTimeout(()=>{
                removeAllDialogs();
            },[4000]);

            }
        }
        

    export const removeAllDialogs= ()=>{
        //ako se javim na poziv, brisu mi se slicice
        const dialog= document.getElementById('dialog');
        dialog.querySelectorAll('*').forEach((dialog)=>dialog.remove());

    }

    export const showCallElements =(callType)=>{
        if(callType===constants.callType.CHAT_PERSONAL_CODE || callType===constants.callType.CHAT_STRANGER){
            showChatCallElements();
        }
        if(callType===constants.callType.VIDEO_PERSONAL_CODE || callType===constants.callType.VIDEO_STRANGER){
            showVideoCallElements();
        }

    }

    const showChatCallElements=()=>{

        const finishConnectionChatButtonContainer=document.getElementById(
            "finish_chat_button_container"
        );

        showElement(finishConnectionChatButtonContainer);
        const newMessageInput= document.getElementById('new_message');
        showElement(newMessageInput);
        //block panel
        disableDashboard();
    }

    const showVideoCallElements=()=>{

        const callButtons=document.getElementById('call_buttons');
        showElement(callButtons);

        const placeholder=document.getElementById('video_placeholder');
        hideElement(placeholder);

        const remoteVideo=document.getElementById('remote_video');
        showElement(remoteVideo);

        const newMessageInput= document.getElementById('new_message');
        showElement(newMessageInput);
        //block panel
        disableDashboard();
    }


    //ui call buttons

const micOnImgSrc= './utils/images/mic.png';
const micOffImgSrc= './utils/images/micOff.png';

    export const updateMicButton=(micActive)=>{

        const micButtonImage= document.getElementById('mic_button_image');

        micButtonImage.src=micActive? micOffImgSrc : micOnImgSrc;

    }

    const cameraOnImgSrc= './utils/images/camera.png';
    const cameraOffImgSrc= './utils/images/cameraOff.png';

    export const updateCameraButton= (cameraActive)=>{
        const cameraButtonImage= document.getElementById('camera_button_image');
        cameraButtonImage.src= cameraActive? cameraOffImgSrc: cameraOnImgSrc;
    }


    //ui messages
    // u zavisnosti da li dolazi leva ili desna poruka ovo se sracunava
    export const appendMessage= (message, right=false)=>{

        const messagesContainer= document.getElementById('messages_container');
        const messageElement= right? elements.getRightMessage(message):elements.getLeftMessage(message);
        messagesContainer.appendChild(messageElement);

    }

    export const clearMessanger =()=>{

        const messagesContainer= document.getElementById('messages_container');
        messagesContainer.querySelectorAll('*').forEach((n)=>n.remove());
    }


    //recording

    export const showRecordingPanel =()=>{

        const recordingButtons= document.getElementById('video_recording_buttons');
        showElement(recordingButtons);

        //start recording button kad se zapocne snimanje
        const startRecordingButton=document.getElementById('start_recording_button');
        hideElement(startRecordingButton);
    }

    export const resetRecordingButtons =()=>{

        const startRecordingButton=document.getElementById('start_recording_button');
        const recordingButtons= document.getElementById('video_recording_buttons');
       
        
        hideElement(recordingButtons);
        showElement(startRecordingButton);
    
    }


    export const switchRecordingButtons= (switchForResumeButton=false)=>{
        const resumeButton= document.getElementById('resume_recording_button');
        const pauseButton=document.getElementById('pause_recording_button');

        if(switchForResumeButton){
            hideElement(pauseButton);
            showElement(resumeButton);
        }else {
            hideElement(resumeButton);
            showElement(pauseButton);
        }
    }


    //ui after hang up 

   export const updateUIAfterHangUp= (callType)=>{

        enableDashboard();

        //hide the call buttons
        if(callType===constants.callType.VIDEO_PERSONAL_CODE || 
            callType=== constants.callType.VIDEO_STRANGER){
                const callButtons=document.getElementById('call_buttons');
                hideElement(callButtons);
            }else {
                //chat conncection
                const chatCallButtons= document.getElementById('finish_chat_button_container');
                hideElement(chatCallButtons);
            }

            const newMessageInput=document.getElementById('new_message');
            hideElement(newMessageInput);
            clearMessanger();

            updateMicButton(false);
            updateCameraButton(false);

            //hide remote video and show placeholder

            const remoteVideo= document.getElementById('remote_video');
            hideElement(remoteVideo);
           
            const placeholder=document.getElementById('video_placeholder');
            showElement(placeholder);

            removeAllDialogs();
    }


    //changing  status of checkbox

    export const updateStrangerCheckbox =(allowConnections)=>{

        const checkboxCheckImg=document.getElementById('allow_strangers_checkbox_image');
        
        allowConnections ? showElement(checkboxCheckImg) : hideElement(checkboxCheckImg);
    }
    // ui helper functions 

    const enableDashboard= ()=>{

        const dashboardBlocker= document.getElementById('dashboard_blur');
        if(!dashboardBlocker.classList.contains('display_none')){
            //ova fja vraca true/false ako element u lisiti ima displej none
            dashboardBlocker.classList.add('display_none');
        }
    }

    const disableDashboard= ()=>{

        const dashboardBlocker= document.getElementById('dashboard_blur');
        if(dashboardBlocker.classList.contains('display_none')) {
            dashboardBlocker.classList.remove('display_none');
        }
    }

    const hideElement= (element)=>{


        if(!element.classList.contains('display_none')){
            element.classList.add('display_none');
        }
    }

    const showElement=(element)=>{

        if(element.classList.contains('display_none')){
            element.classList.remove('display_none');
        }

    }

   