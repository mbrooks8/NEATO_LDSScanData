</body>

<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.1/socket.io.js"></script>
<script
        src="https://code.jquery.com/jquery-3.2.1.min.js"
        integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
        crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
<script src="./assets/js/vendors/Chart.Core.min.js"></script>
<script src="./assets/js/vendors/Chart.Scatter.min.js"></script>
<script src="./assets/js/index/functions.js"></script>
<script>

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

</script>
</html>
