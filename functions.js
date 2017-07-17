var socket = io.connect("localhost:3000");
socket.on('message', function(data){
    document.getElementById("response").innerHTML = data + "<br>";
});
var pos2 = [];
pos2.push({
    x:0,
    y:0
});
pos2.push({
    x:0,
    y:-55
});
pos2.push({
    x:-170,
    y:175
});
pos2.push({
    x:150,
    y:175
});
pos2.push({
    x:-125,
    y:225
});
pos2.push({
    x:-125,
    y:-25
});
pos2.push({
    x:125,
    y:-25
});
pos2.push({
    x:105,
    y:225
});
var pos = [];
var thing = [];
var ctx = document.getElementById("header-canvas").getContext("2d");
var myChart = new Chart(ctx).Scatter([
    { label: "Stuff", data: pos },
    { label: "Robit", data: pos2 } ], {
    showScale: true,
    scaleShowLabels: true,
    scaleShowHorizontalLines: true,
    scaleShowVerticalLines: true,
    scaleLineWidth: 1,
    scaleLineColor: "red",
    scaleGridLineColor: "rgba(0,0,0,.5)",
    datasetPointStrokeColor: 'red',
    scaleGridLineWidth: 1,
    pointDotStrokeWidth: .3,
    pointDot: true,
    scaleType: 'number',
    animation: false,
    // Boolean - Whether to show a stroke for datasets
    datasetStroke: false,
    showTooltips: false,
});

socket.on('graph', async function(pos){
    var ctx = document.getElementById("header-canvas").getContext("2d");
    var myChart = new Chart(ctx).Scatter([
        { label: "Stuff", data: pos },
        { label: "Robit", data: pos2 } ], {
        showScale: true,
        scaleShowLabels: true,
        scaleShowHorizontalLines: true,
        scaleShowVerticalLines: true,
        scaleLineWidth: 1,
        scaleLineColor: "red",
        scaleGridLineColor: "rgba(0,0,0,.5)",
        datasetPointStrokeColor: 'red',
        scaleGridLineWidth: 1,
        pointDotStrokeWidth: 0,
        pointDot: true,
        scaleType: 'number',
        animation: false,
        // Boolean - Whether to show a stroke for datasets
        datasetStroke: false,
        showTooltips: true,
    });

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
    }, 1000);

}
