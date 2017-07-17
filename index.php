<?php
require('topNav.php');
?>

<div class="container">
    <h1>LDS Scan Reader</h1>
    <div class="row">
        <button class="btn btn-danger"  onclick="runMyFunction()">Do Something</button>
        <button class="btn btn-primary"  onclick="setldsrotation()">SET LDS Rotation</button>
        <button class="btn btn-info"  onclick="LDSScan()">Get LDS Scan Data</button>
        <button class="btn btn-warning"  onclick="spam()">Spam That Data</button>
    </div>
    <label for="usr">This will work eventually:</label>
    <input type="text" class="form-control" id="input1">

    <script>
        /*           $("#input1").on('keyup', function (e) {
                    if (e.keyCode == 13) {
                        cool();
                    }
                });*/
    </script>

    <h3>Server Messages</h3>
    <div class="row">
        <div class="col-sm-2">

            <!-- <canvas id="header-canvas" width="600" height="480"></canvas>-->

            <div id="LDSScanDataa"></div>
        </div>
        <div class="col-sm-10">
            <div id="response"></div>
        </div>

    </div>


</div>
<?php
require('botNav.php');
?>
