/*THIS STUFF IS FOR MY FUNCTIONS TO RUN ON THE INDEX.PHP PAGE*/
/*THIS IS LITERALLY ONLY FOR THE WEBSITE NOT FOR THE LOCAL COMPUTER*/
var socket = io.connect("localhost:3000");
socket.on('bumper', function(data){
    document.getElementById("response").innerHTML = data + "<br>";
});

socket.on('bumperData', function(data){
 console.log(data);
});


//calculate things that are too close
function sendMessage(){
    socket.emit('runMyFunction', "test");
}

//toggle lds rotation
function setldsrotation(){
    socket.emit('setldsrotation', "test");
}

//get data from lds scan
function LDSScan(){
    socket.emit('LDSScan', "test");
}

//spam
function spam(){

    setInterval(function() {
        socket.emit('LDSScan', "test");
    },750);

}

function changeValue() {
    document.getElementById("timer").innerHTML = ++value;
}

var timerInterval = null;
function start () {
    stop();
    value = 0;
    timerInterval = setInterval(changeValue, 1000);
}
var stop = function() {
    clearInterval(timerInterval );
}
