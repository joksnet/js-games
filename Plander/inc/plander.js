
function addEvent( obj, evType, fn, useCapture )
{
    if ( obj.addEventListener )
    {
        obj.addEventListener(evType, fn, useCapture);
        return true;
    }
    else if ( obj.attachEvent )
    {
        var r = obj.attachEvent("on" + evType, fn);
        return r;
    }

    return false;
}

function removeEvent( obj, evType, fn, useCapture )
{
    if ( obj.removeEventListener )
    {
        obj.removeEventListener(evType, fn, useCapture);
        return true;
    }
    else if ( obj.detachEvent )
    {
        var r = obj.detachEvent("on" + evType, fn);
        return r;
    }

    return false;
}

function $( id ) { return document.getElementById(id); }
function $new( tag ) { return document.createElement(tag); }
function $random( min, max ) { return Math.floor(Math.random() * (max - min + 1) + min); }

var Plander = {

    div          : null,
    ship         : null,
    plataforms   : null,

    labelFuel    : null,
    labelPoints  : null,
    labelLevel   : null,

    labelSpeedX  : null,
    labelSpeedY  : null,

    labelWarn    : null,

    running      : false,
    initSuccess  : false,

    lifes        : 0,
    fuel         : 0,
    points       : 0,
    level        : 0,

    lap          : 0,
    speedX       : 0,
    speedY       : 0,
    speedLanding : 1.00,
    gravity      : 0.01,

    options : {
        divPlanderId : 'plander',

        buttonStart  : 'start',
        buttonStop   : 'stop',
        buttonNext   : 'next',

        labelLifes   : 'lifes',
        labelFuel    : 'fuel',
        labelPoints  : 'points',
        labelLevel   : 'level',

        labelSpeedX  : 'speedx',
        labelSpeedY  : 'speedy',

        labelWarn    : 'warn',

        imageShip    : {
            paused      : 'img/ship1.png',
            original    : 'img/ship2.png'
        }
    },

    constructor : function()
    {
        Plander.ship = $new('img');
        Plander.ship.id = 'ship';
        Plander.ship.alt = '';

        Plander.ship.style.width = '19px';
        Plander.ship.style.height = '33px';

        Plander.div = $(Plander.options.divPlanderId);
        Plander.div.appendChild(Plander.ship);

        addEvent( $(Plander.options.buttonStart), 'click', Plander.start, true);
        addEvent( $(Plander.options.buttonStop), 'click', Plander.stop, true);
        addEvent( $(Plander.options.buttonNext), 'click', Plander.nextLevel, true);

        addEvent(document, 'keypress', Plander.keyPress, true);
        addEvent(document, 'keyup', Plander.keyUp, true);

        Plander.labelLifes = $(Plander.options.labelLifes);
        Plander.labelFuel = $(Plander.options.labelFuel);
        Plander.labelPoints = $(Plander.options.labelPoints);
        Plander.labelLevel = $(Plander.options.labelLevel);

        Plander.labelSpeedX = $(Plander.options.labelSpeedX);
        Plander.labelSpeedY = $(Plander.options.labelSpeedY);

        Plander.labelWarn = $(Plander.options.labelWarn);
    },

    init : function()
    {
        Plander.initSuccess = true;
    },

    keyPress : function( event )
    {
        var keyCode = ( event.which ) ? event.which : event.keyCode;
        var key = String.fromCharCode(keyCode).toLowerCase();

        if ( Plander.running )
        {
            if ( key == 'p' )
                Plander.stop();
            else if ( keyCode == event.DOM_VK_LEFT || key == 'a' )
            {
                Plander.speedX = Plander.speedX - 0.07;
                Plander.fuel = Plander.fuel - 1;
            }
            else if ( keyCode == event.DOM_VK_RIGHT || key == 'd' )
            {
                Plander.speedX = Plander.speedX + 0.07;
                Plander.fuel = Plander.fuel - 1;
            }
            else if ( keyCode == event.DOM_VK_DOWN || key == 's' )
            {
                Plander.speedY = Plander.speedY - 0.10;
                Plander.fuel = Plander.fuel - 2;
            }
        }
        else if ( key == 'p' )
        {
            if ( Plander.initSuccess )
                Plander.start();
        }
    },

    keyUp : function( event )
    {
        if ( Plander.running )
        {
            // Nothing
        }
    },

    drawPoints : function()
    {
        if ( Plander.running )
        {
            Plander.labelLifes.innerHTML = 'lifes ' + parseInt( Plander.lifes );
            Plander.labelFuel.innerHTML = 'fuel ' + parseInt( Plander.fuel );
            Plander.labelPoints.innerHTML = 'points ' + parseInt( Plander.points );
            Plander.labelLevel.innerHTML = 'level ' + parseInt( Plander.level );

            var speedXcant = ( Plander.speedX.toString().indexOf('-') != -1 ) ? 5 : 4;
            var speedYcant = ( Plander.speedY.toString().indexOf('-') != -1 ) ? 5 : 4;

            Plander.labelSpeedX.innerHTML = 'speedX ' + ( ( Plander.speedX != 0 ) ? Plander.speedX.toString().substr(0, speedXcant) : '0' );
            Plander.labelSpeedY.innerHTML = 'speedY ' + ( ( Plander.speedY != 0 ) ? Plander.speedY.toString().substr(0, speedYcant) : '0' );

            if ( Plander.speedY > Plander.speedLanding )
            {
                Plander.labelWarn.style.backgroundColor = '#F00';
                Plander.labelWarn.innerHTML = 'WARN';
            }
            else
            {
                Plander.labelWarn.style.backgroundColor = '#FFF';
                Plander.labelWarn.innerHTML = '&nbsp;';
            }
        }
        else
        {
            Plander.labelLifes.innerHTML = '&nbsp;';
            Plander.labelFuel.innerHTML = '&nbsp;';
            Plander.labelPoints.innerHTML = '&nbsp;';
            Plander.labelLevel.innerHTML = '&nbsp;';

            Plander.labelSpeedX.innerHTML = '&nbsp;';
            Plander.labelSpeedY.innerHTML = '&nbsp;';

            Plander.labelWarn.innerHTML = '&nbsp;';
        }
    },

    drawPlataforms : function()
    {
        var cant = 0;
        var args = '';

        if ( Plander.level < 3 )
            cant = $random(1, 2);
        else if ( Plander.level >= 3 && Plander.level < 7 )
            cant = $random(2, 3);
        else if ( Plander.level >= 7 )
            cant = $random(2, 5);

        var pointsFrom = ( ( Plander.level * Plander.level ) * 100 ) + 100;
        var pointsTo = pointsFrom + 200;

        var topFrom = Plander.div.clientHeight - 120;
        var topTo = Plander.div.clientHeight - 30;

        var leftFrom = 30;
        var leftTo = Plander.div.clientWidth - 30;

        for ( var plataform in Plander.plataforms )
            Plander.div.removeChild( Plander.plataforms[plataform] );

        Plander.plataforms = []

        var checkPlataformsPos = function( left, width )
        {
            for ( var plataform in Plander.plataforms )
            {
                var plataformLeft = parseInt(Plander.plataforms[plataform].style.left);
                var plataformWidth = parseInt(Plander.plataforms[plataform].style.width);

                if ( ( left >= plataformLeft && left <= plataformLeft + plataformWidth )
                  || ( left + width >= plataformLeft && left + width <= plataformLeft + plataformWidth ) )
                    return false;
            }

            return true;
        }

        for ( var i = 0; i < cant; i++ )
        {
            var width = 62;
            var top = $random(topFrom, topTo);
            var left = $random(leftFrom, leftTo);

            while ( left <= leftFrom || left + width >= leftTo || !( checkPlataformsPos(left, width) ) )
                left = $random(leftFrom, leftTo);

            if ( args.length != 0 )
                args += '&';

            args += 'p' + i + '=(' + left + ';' + top + ')';

            var points = $random(pointsFrom, pointsTo);
            var plataform = $new('div');

            plataform.innerHTML = points;
            plataform.style.width = width + 'px';
            plataform.style.top = top + 'px';
            plataform.style.left = left + 'px';

            Plander.plataforms.push(plataform);
            Plander.div.appendChild(plataform);
        }

        Plander.div.style.backgroundImage = 'url("background.php?' + args + '");';
    },

    draw : function()
    {
        if ( Plander.running )
        {
            Plander.lap++;
            Plander.speedY = Plander.speedY + Plander.gravity;

            Plander.ship.style.top = ( parseFloat(Plander.ship.style.top) + Plander.speedY ) + 'px';
            Plander.ship.style.left = ( parseFloat(Plander.ship.style.left) + Plander.speedX ) + 'px';

            Plander.drawPoints();

            setTimeout(Plander.draw, 25);
        }
    },

    start : function()
    {
        if ( !( Plander.initSuccess ) )
        {
            Plander.init();
            Plander.lifes = 3;
            Plander.nextLevel();

            return;
        }

        Plander.running = true;
        Plander.div.style.opacity = 0.99;
        Plander.ship.src = Plander.options.imageShip.original;

        Plander.draw();
    },

    stop : function()
    {
        Plander.running = false;
        Plander.div.style.opacity = 0.5;
        Plander.ship.src = Plander.options.imageShip.paused;
    },

    nextLevel : function()
    {
        Plander.drawPlataforms();

        Plander.ship.style.position = 'relative';
        Plander.ship.style.top = '3px';
        Plander.ship.style.left = ( parseInt( Plander.div.clientWidth / 2 ) - 6 ) + 'px';

        var fuelFrom = parseInt( 500 / ( 1 + Plander.level ) );
        var fuelTo = fuelFrom + 100;

        Plander.fuel = $random(fuelFrom, fuelTo);
        Plander.lap = 0;
        Plander.speedX = 0;
        Plander.speedY = 0;
        Plander.level++;

        Plander.start();
    }
}

addEvent(window, 'load', Plander.constructor, true);