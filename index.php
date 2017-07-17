<?php
require('topNav.php');
?>

<div class="container">
    <h1>LDS Scan Reader</h1>
    <div class="row">
        <button class="btn btn-primary"  onclick="setldsrotation()">SET LDS Rotation</button>
        <button class="btn btn-info"  onclick="LDSScan()">Get LDS Scan Data</button>
        <button class="btn btn-warning"  onclick="spam()">Spam That Data</button>
    </div>

    <h3>Server Messages</h3>
    <div class="row">
        <div class="col-sm-2">
            <!-- <canvas id="header-canvas" width="600" height="480"></canvas>-->
        </div>

        <div class="col-sm-10">
            <div id="response"></div>
        </div>

    </div>

    <p id="timer"></p>

</div>

<?php
require('botNav.php');
?>
