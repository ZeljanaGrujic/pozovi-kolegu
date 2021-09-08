import * as constants from './constants.js';

let state={ //referenca na stream
//vrednosti koje imamo kad pocne app, na pocetku
socketId: null,
localStream: null,
remoteStream: null, //kad stream dodje od drugog usera
screenSharingStream: null,
screenSharingActive: false,
allowConnectionsFromStrangers: false, //dugmence u cekboksu za dozvolu
//screenSharingActive: false,
callState: constants.callState.CALL_AVAILABLE_ONLY_CHAT,
};

export const setSocketId=(socketId) => {
    state={
        ...state, //ove 3 tacke znace da uzimamo sve prethodne vrednosti postavljene u state
        socketId,
};
console.log(state);
};

export const setLocalStream =(stream)=> {
state={
    ...state,
    localStream:stream,
};
};

export const setAllowConnectionsFromStrangers =(allowConnection)=> {
    state={
        ...state,
        allowConnectionsFromStrangers: allowConnection,
    };
    };

    export const setScreenSharingActive =(screenSharingActive)=> {
        state={
            ...state,
            screenSharingActive,
        };
        };

        export const setScreenSharingStream =(stream)=> {
            state={
                ...state,
                screenSharingStream:stream,
            };
            };

            export const setRemoteStream =(stream)=> {
                state={
                    ...state,
                    remoteStream:stream,
                };
                };


                export const setCallState= (callState)=>{

                    state={
                        ...state,
                        callState,
                    }

                }

                export const getState= ()=> {
                    return state;

                };