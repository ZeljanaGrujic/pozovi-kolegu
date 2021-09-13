const express=require ("express"); //slicno kao import, ukljucuje sve potrebne bibilioteke fazon
const http= require("http");


const PORT=process.env.PORT || 3000;
const app= express();
const server= http.createServer(app);
const io=require("socket.io")(server);

app.use(express.static("public"));


app.get('/', (req, res) => {
    res.sendFile(__dirname+ "/public/index.html");
});

//Ako zelimo da se nakacimo na TURN server preko Twilio
/*app.get('/api/get-turn-credentials', (req,res)=>{

    const accountSid='';
    const authToken='';
    const client=twilio(accountSid,authToken);
})*/

let connectedPeers=[];
let connectedPeersStrangers=[];


io.on("connection",(socket)=> { //izmenila sam na socket.on a ne na io.on
    connectedPeers.push(socket.id);
    console.log(connectedPeers);

    socket.on("pre-offer", (data)=>{
       // console.log("pre-offer-came");
     //console.log(data); //dobicemo pozivaocev personalni kod 

     const {calleePersonalCode, callType}=data;


     //trazimo konektovanog peera
     const connectedPeer=connectedPeers.find(
         (peerSocketId)=> 
         peerSocketId === calleePersonalCode 
         // === promenljive moraju biti istog tipa i iste vrednosti
         // pokusavam da pronadjem pozivaoca, tj njegov personal code iz niza connectedPeers
         //pa u ifu proveravam da li je defined ili undefined, da li sam nasla nekoga
);

     if(connectedPeer) {
         const data= {
             callerSocketId: socket.id, //dodeljujemo id pozivaocu
             callType,
         };
         
         io.to(calleePersonalCode).emit("pre-offer", data); // server prosledjuje nase podatke pozivaocu, tj ovome gore sto smo rastavili njegove podatke
     } else {
         const data={
             preOfferAnswer:"CALLEE_NOT_FOUND",
         };
         io.to(socket.id).emit("pre-offer-answer",data);
     }
});


socket.on("pre-offer-answer",(data)=>{

    console.log("pre offer answer came");
    console.log(data); // informacije koje dolaze od pozivaoca

    //provera da li user postoji
    const {callerSocketId}=data;
    const connectedPeer=connectedPeers.find(
        (peerSocketId)=>  peerSocketId === callerSocketId
);

if(connectedPeer){
    io.to(data.callerSocketId).emit('pre-offer-answer',data); //io salje info ka specific user u

}

});

socket.on('webRTC-signaling', (data)=>{

    const {connectedUserSocketId}=data;

    const connectedPeer=connectedPeers.find(
        (peerSocketId)=>  peerSocketId === connectedUserSocketId
);// da li user postoji
if(connectedPeer){
    io.to(connectedUserSocketId).emit('webRTC-signaling',data);
}//da li je pronadjeni user idalje konektovan, ako jeste saljemo mu data

});

socket.on('user-hanged-up', (data)=>{
    const{connectedUserSocketId}=data;


    const connectedPeer=connectedPeers.find(
        (peerSocketId)=>  peerSocketId === connectedUserSocketId
);

if(connectedPeer){
    io.to(connectedUserSocketId).emit("user-hanged-up");
}

})



socket.on('stranger-connection-status',(data)=>{

    const {status}=data;

    if(status){
        //ako hocemo da dozvolimo/pristupimo konekciji sa strancima
        //poguraju se nase info u niz. status je true, ako je status false idemo u else, i dobijamo niz bez nas
        connectedPeersStrangers.push(socket.id); //niz poveyanih stranaca
    }else {

       
        const newConnectedPeersStrangers=connectedPeersStrangers.filter((peerSocketId) =>peerSocketId!==socket.id);
   
        connectedPeersStrangers=newConnectedPeersStrangers;

    }
    
    console.log(connectedPeersStrangers);
})

socket.on('get-stranger-socket-id',()=>{

    //filtrira nas soket id, izbacuje nas iz niza da se ne bismo sami sa sobom povezali
    let randomStrangerSocketId;
    const filteredConnectedPeersStrangers=connectedPeersStrangers.filter((peerSocketId)=>peerSocketId!==socket.id);

    if (filteredConnectedPeersStrangers.length>0){

        randomStrangerSocketId=filteredConnectedPeersStrangers[
            Math.floor(Math.random()*filteredConnectedPeersStrangers.length)
        ]
        //daje random element iz ovog random niza, gde nismo mi

    }else {
        randomStrangerSocketId=null;
    }
    const data= {
        randomStrangerSocketId
    }
    io.to(socket.id).emit('stranger-socket-id',data);
})

    socket.on("disconnect", ()=>{
        console.log("user disconnected");

        const newConnectedPeers= connectedPeers.filter(
            (peerSocketId)=> peerSocketId!== socket.id
        ); //filter funkcija vraca samo one elemente za koje vazi da je ovaj uslov true

        connectedPeers=newConnectedPeers;
        //console.log(connectedPeers); //stampa niz konektovanih peer idjeva ili ako se svi pogase, stampa prazan niz
    
        const newConnectedPeersStrangers=connectedPeersStrangers.filter((peerSocketId) =>peerSocketId!==socket.id);
    

        connectedPeersStrangers=newConnectedPeersStrangers;
    });

//    console.log("user connected to socket.IO server");
 //console.log(socket.id); umesto ovoga, napravili smo niz konektovanih peerova

}); //kad se klijent poveze na server, ovo u return function se desava, server stampa i soket id tog klijenta
/*
Nodemon- updejtuje sve promene na serveru, tako da ne moramo rucno preko ctrl c u terminalu
app.get('/hello', (req,res)=> {
res.send("hello")
} );

app.get('/hello-world', (req,res)=> {
    res.send("hello-world")
    } );
    */

server.listen(PORT, ()=>{
    console.log('listening on '+PORT);
});