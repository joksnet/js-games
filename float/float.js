
var Flo = function(element, form_doc) {
    this.element = element;
    this.form_doc = form_doc || document;
    this.points = 0;
    this.level = 1;
    this.run = false;

    this.init();
    this.reset();
};

Flo.prototype.init = function() {
    this.pointslabel = document.createElement("strong");
    this.pointslabel.innerHTML = "0";

    this.ball = document.createElement("div");
    this.ball.className = "ball";

    var desc = document.createElement("p");
        desc.innerHTML = "Welcome to Flo[at]<br><br>" +
                         "Press <tt>H</tt> to start floating the ball.<br>" +
                         "Press <tt>J</tt>/<tt>K</tt> to change level of difficulty.";

    this.panel = document.createElement("div");
    this.panel.className = "panel";
    this.panel.appendChild(desc);

    this.cols = [];

    for (var i = 0; i < 5; i++) {
        var col = document.createElement("div");
            col.className = "column";

        var hoel = document.createElement("div");
            hoel.className = "hole";

        col.appendChild(hoel);

        this.cols[i] = {
            "elem": col,
            "hoel": hoel,
            "hole": 0,
            "alto": 150,
            "pnts": false,
            "tlvl": 1
        };

        this.element.appendChild(col);
    }

    this.element.appendChild(this.ball);
    this.element.appendChild(this.panel);
    this.element.appendChild(this.pointslabel);

    window.addEventListener("keypress", function(flo) {
        return function(event) {
            if (event.charCode == 104) { // h
                if (!flo.run) {
                    flo.reset();
                    flo.start();
                }
                flo.flap();
            } else if (event.charCode == 106) { // j
                flo.level--;
                if (flo.level < 1) {
                    flo.level = 1;
                }
                flo.pointslabel.innerHTML = flo.level + " // " + flo.points;
            } else if (event.charCode == 107) { // k
                flo.level++;
                flo.pointslabel.innerHTML = flo.level + " // " + flo.points;
            }
        };
    }(this));

    this.interval = setInterval(function(flo) {
        return function() {
            flo.loop();
        };
    }(this), 25);
};

Flo.prototype.reset = function() {
    this.starttime = new Date();
    this.endtime = undefined;
    this.points = 0;
    this.ballspeed = 4;
    this.flapcount = 0;

    this.ball.style.left = (60 + 12 * this.level).toString() + "px";
    this.ball.style.top = "234px";

    for (var i = 0; i < 5; i++) {
        this.reset_col(i);
    }

    this.pointslabel.innerHTML = this.level + " // " + this.points;
};

Flo.prototype.reset_col = function(i) {
    var alto = 150 - (this.level * 10);
    var hole = Math.round(Math.random() * (alto + 5)) + 5;

    this.cols[i]["elem"].style.left = (640 + i * 256).toString() + "px";
    this.cols[i]["hoel"].style.top = hole.toString() + "px";
    this.cols[i]["hoel"].style.height = alto.toString() + "px";
    this.cols[i]["hole"] = hole;
    this.cols[i]["alto"] = alto;
    this.cols[i]["pnts"] = false;
    this.cols[i]["tlvl"] = this.level;
};

Flo.prototype.start = function() {
    this.run = true;
    this.panel.style.display = "none";
};

Flo.prototype.end = function() {
    this.run = false;
    this.endtime = new Date();
    this.panel.style.display = "block";

    this.send_score();
};

Flo.prototype.flap = function() {
    if (!this.run) {
        return;
    }

    this.ballspeed = -8;
    this.flapcount = 1;
};

Flo.prototype.loop = function() {
    if (!this.run) {
        return;
    }

    var balltop = parseInt(this.ball.style.top) + this.ballspeed;
    var ballleft = parseInt(this.ball.style.left);

    if (balltop <= 0 || balltop + 32 >= 480) {
        this.end();
        return;
    }

    if (this.flapcount !== 0) {
        if (this.flapcount % 8 === 0) {
            this.flapcount = 0;
            this.ballspeed = 4;
        } else {
            this.flapcount++;
        }
    }

    for (var i = 0; i < 5; i++) {
        var colleft = parseInt(this.cols[i]["elem"].style.left);
        var colhole = this.cols[i]["hole"];
        var colalto = this.cols[i]["alto"];

        var incol = ballleft + 32 >= colleft && ballleft <= colleft + 64;

        if (incol && (balltop <= colhole || balltop + 32 >= colhole + colalto)) {
            this.end();
            return;
        }
    }

    this.ball.style.top = balltop.toString() + "px";

    for (var i = 0; i < 5; i++) {
        var nextleft = parseInt(this.cols[i]["elem"].style.left) - 4;

        if (nextleft + 64 <= 0) {
            nextleft += parseInt(this.cols[i === 0 ? 4 : i - 1]["elem"].style.left) + 310;
            this.reset_col(i);
        }

        if (nextleft <= ballleft && !this.cols[i]["pnts"]) {
            this.points += this.cols[i]["tlvl"];
            this.pointslabel.innerHTML = this.level + " // " + this.points;
            this.cols[i]["pnts"] = true;
        }

        this.cols[i]["elem"].style.left = nextleft.toString() + "px";
    }
};

Flo.prototype.send_score = function() {
    if (this.run || this.endtime === undefined) {
        return;
    }

    var fdoc = this.form_doc.call();
    var name = prompt("What is your name?", "Type you name here");

    if (name.length === 0) {
        return;
    }

    var input_name = fdoc.createElement("input");
        input_name.name = "name";
        input_name.value = name;
        input_name.type = "hidden";

    var input_points = fdoc.createElement("input");
        input_points.name = "points";
        input_points.value = this.points;
        input_points.type = "hidden";

    var input_time = fdoc.createElement("input");
        input_time.name = "time";
        input_time.value = this.endtime.getTime() - this.starttime.getTime();
        input_time.type = "hidden";

    var form = fdoc.createElement("form");
        form.action = "score.php";
        form.method = "POST";
        form.appendChild(input_name);
        form.appendChild(input_points);
        form.appendChild(input_time);

    fdoc.body.appendChild(form);
    form.submit();
    fdoc.body.removeChild(form);
};
