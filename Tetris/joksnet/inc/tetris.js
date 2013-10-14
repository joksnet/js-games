
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

var Tetris = {

    version : '0.5',

    div : null,
    divNext : null,
    divScreen : null,

    iframe : null,

    running : false,
    initSuccess : false,
    gameOver : false,

    bricksWidth : 11,
    bricksHeight : 21,

    level : 0,
    levelLabel : null,
    // levels : [0, 500, 1200, 2100, 3300, 4800, 6800, 9500, 13000, 18000, 25000],

    lives : 1,
    livesLabel : null,

    points : 0,
    pointsLabel : null,

    lines : 0,
    linesLabel : null,

    current : null,
    next : null,
    ghost : null,

    // Will never start with S, Z, O
    history : [0, 1, 2],
    nextForce : [],

    // Config Values
    rotateClockwise : 1,
    randomBrickColors : 0,
    stackPieces : 0,
    useGhost : 0,

    // bricksMap : [],
    bricks : [
        [
            // ##
            // ##
            { w : 2, h : 2, m : [[1, 1], [1, 1]], n : 'cuadrado', i : 0 }
        ],

        [
            //  ##
            // ##
            { w : 3, h : 2, m : [[0, 1, 1], [1, 1, 0]], n : 'escalera right', i : 1 },

            // #
            // ##
            //  #
            { w : 2, h : 3, m : [[1, 0], [1, 1], [0, 1]], n : 'escalera rayo right', i : 1 }
        ],

        [
            // ##
            //  ##
            { w : 3, h : 2, m : [[1, 1, 0], [0, 1, 1]], n : 'escalera left', i : 2 },

            //  #
            // ##
            // #
            { w : 2, h : 3, m : [[0, 1], [1, 1], [1, 0]], n : 'escalera rayo left', i : 2 }
        ],

        [
            //  #
            // ###
            { w : 3, h : 2, m : [[0, 1, 0], [1, 1, 1]], n : 'monumento up', i : 3 },

            // #
            // ##
            // #
            { w : 2, h : 3, m : [[1, 0], [1, 1], [1, 0]], n : 'monumento right', i : 3 },

            // ###
            //  #
            { w : 3, h : 2, m : [[1, 1, 1], [0, 1, 0]], n : 'monumento down', i : 3 },

            //  #
            // ##
            //  #
            { w : 2, h : 3, m : [[0, 1], [1, 1], [0, 1]], n : 'monumento left', i : 3 }
        ],

        [
            // #
            // #
            // #
            // #
            { w : 1, h : 4, m : [[1], [1], [1], [1]], n : 'palito', i : 4 },

            // ####
            { w : 4, h : 1, m : [[1, 1, 1, 1]], n : 'palito acostado', i : 4 }
        ],

        [
            // ##
            //  #
            //  #
            { w : 2, h : 3, m : [[1, 1], [0, 1], [0, 1]], n : 'ele left', i : 5 },

            //   #
            // ###
            { w : 3, h : 2, m : [[0, 0, 1], [1, 1, 1]], n : 'ele up', i : 5 },

            // #
            // #
            // ##
            { w : 2, h : 3, m : [[1, 0], [1, 0], [1, 1]], n : 'ele right', i : 5 },

            // ###
            // #
            { w : 3, h : 2, m : [[1, 1, 1], [1, 0, 0]], n : 'ele down', i : 5 }
        ],

        [
            // ##
            // #
            // #
            { w : 2, h : 3, m : [[1, 1], [1, 0], [1, 0]], n : 'contra-ele right', i : 6 },

            // ###
            //   #
            { w : 3, h : 2, m : [[1, 1, 1], [0, 0, 1]], n : 'contra-ele down', i : 6 },

            //  #
            //  #
            // ##
            { w : 2, h : 3, m : [[0, 1], [0, 1], [1, 1]], n : 'contra-ele left', i : 6 },

            // #
            // ###
            { w : 3, h : 2, m : [[1, 0, 0], [1, 1, 1]], n : 'contra-ele up', i : 6 }
        ]
    ],

    options : {
        divId : 'tetris',
        divNextId : 'next',

        divScreenId : 'screen',
        divScreenTitleId : 'title',
        divScreenMessageId : 'message',
        divScreenScoreId : 'score',
        divScreenConfigId : 'configure',

        labelLevel : 'level',
        labelLives : 'lives',
        labelPoints : 'points',
        labelLines : 'lines',

        brickImage : 'img/brick',
        brickImageExt : 'gif'
    },

    constructor : function()
    {
        document.title = '4Bricks v' + Tetris.version;

        Tetris.div = $(Tetris.options.divId);
        Tetris.divNext = $(Tetris.options.divNextId);

        Tetris.divScreen = $(Tetris.options.divScreenId);
        Tetris.divScreen.heading = $(Tetris.options.divScreenTitleId);
        Tetris.divScreen.message = $(Tetris.options.divScreenMessageId);

        Tetris.divScreen.scoring = $(Tetris.options.divScreenScoreId);
        Tetris.divScreen.scoring.style.display = 'none';

        Tetris.divScreen.conf = $(Tetris.options.divScreenConfigId);
        Tetris.divScreen.conf.style.display = 'none';

        Tetris.levelLabel = $(Tetris.options.labelLevel);
        Tetris.livesLabel = $(Tetris.options.labelLives);
        Tetris.pointsLabel = $(Tetris.options.labelPoints);
        Tetris.linesLabel = $(Tetris.options.labelLines);

        addEvent( $('start'), 'click', Tetris.start, true );
        addEvent( $('stop'), 'click', Tetris.stop, true );
        addEvent( $('restart'), 'click', Tetris.restart, true );
        addEvent( $('config'), 'click', Tetris.viewConfig, true );
        addEvent( $('scores'), 'click', Tetris.viewScores, true );
        addEvent( $('about'), 'click', Tetris.about, true );

        // Config Checkboxs
        addEvent( $('gr'), 'click', Tetris.changeBackground, true );
        addEvent( $('rt'), 'click', Tetris.changeRotateDirection, true );
        addEvent( $('cl'), 'click', Tetris.changeRandomBrickColors, true );
        addEvent( $('st'), 'click', Tetris.changeStackPieces, true );
        addEvent( $('gs'), 'click', Tetris.changeGhost, true );

        $('gr').checked = 'checked';
        $('rt').checked = 'checked';
        $('cl').checked = '';
        $('st').checked = '';
        $('gs').checked = '';

        addEvent(document, 'keypress', Tetris.keyPress, true);
        addEvent(document, 'keyup', Tetris.keyUp, true);

        Tetris.init();
    },

    init : function()
    {
        //
        // Tetris.bricksMap = []
        //
        // for ( var i = 0, h = ( Tetris.div.clientHeight / 16 ); i < h; i++ )
        // {
        //     if ( typeof Tetris.bricksMap[i] == 'undefined' )
        //         Tetris.bricksMap[i] = []
        //
        //     for ( var e = 0, w = ( Tetris.div.clientWidth / 16 ); e < w; e++ )
        //         Tetris.bricksMap[i][e] = 0;
        // }
        //
    },

    changeBackground : function()
    {
        if ( Tetris.div.style.backgroundImage == 'none' )
            Tetris.div.style.backgroundImage = '';
        else
            Tetris.div.style.backgroundImage = 'none';
    },

    changeRotateDirection : function() { Tetris.rotateClockwise = ( Tetris.rotateClockwise == 1 ) ? 0 : 1; },
    changeRandomBrickColors : function() { Tetris.randomBrickColors = ( Tetris.randomBrickColors == 1 ) ? 0 : 1; },
    changeStackPieces : function() { Tetris.stackPieces = ( Tetris.stackPieces == 1 ) ? 0 : 1; },
    changeGhost : function() { Tetris.useGhost = ( Tetris.useGhost == 1 ) ? 0 : 1; },

    randomBrick : function()
    {
        //
        // var rand = parseInt( Math.random() * 7 );
        //
        // while ( typeof Tetris.bricks[rand][0] == 'undefined' )
        //     rand = parseInt( Math.random() * 7 );
        //

        var rand = 0;
        var found = true;

        while ( found )
        {
            rand = parseInt( Math.random() * 7 );
            found = false;

            for ( var p in Tetris.history )
                if ( Tetris.history[p] == rand )
                    found = true;

            if ( !( found ) )
                break;
        }

        // console.log(rand + ( found ? ' found' : ' not found' ) + ' in ' + Tetris.history);

        Tetris.history.pop();
        Tetris.history.unshift(rand);

        return Tetris.bricks[rand][0];
    },

    createBrickImages : function( next )
    {
        var brickImages = []
        // var rand = parseInt( Math.random() * Tetris.options.brickImageCount );

        if ( next )
            Tetris.divNext.innerHTML = '';

        for ( var i = 0; i < 4; i++ )
        {
            var img = $new('img');
                // img.id = 'brick[' + i + ']';
                // img.src = Tetris.options.brickImage + rand + '.' + Tetris.options.brickImageExt;
                img.style.display = 'none';
                img.style.position = 'absolute';

            if ( next )
                Tetris.divNext.appendChild(img);
            else
                Tetris.div.appendChild(img);

            brickImages.push(img);
        }

        return brickImages;
    },

    createBrick : function( next, brickNum )
    {
        if ( next )
        {
            Tetris.next = {
                images : Tetris.createBrickImages(true),
                def    : Tetris.randomBrick()
            }

            Tetris.posBrick(Tetris.next, 1, 1, true);
        }
        else
        {
            if ( brickNum != null && parseInt(brickNum) >= 0 )
                var inDef = Tetris.bricks[brickNum][0];
            else
                var inDef = Tetris.randomBrick();

            Tetris.current = {
                images : Tetris.createBrickImages(),
                def    : inDef,
                x      : 0,
                y      : 0,
                r      : 0
            }

            Tetris.posBrick(Tetris.current, ( 5 - parseInt(Tetris.current.def.w / 2) ), 0);

            if ( Tetris.useGhost == 1 )
            {
                Tetris.ghost = {
                    images : Tetris.createBrickImages(),
                    def    : inDef,
                    ghost  : true,
                    x      : Tetris.current.x,
                    y      : 0,
                    r      : 0
                }

                Tetris.posBrick(Tetris.ghost, Tetris.current.x, Tetris.current.y);
                Tetris.dropBrick(Tetris.ghost, true);
            }
        }
    },

    posBrick : function( brick, x, y, next )
    {
        if ( brick )
        {
            var currentImage = 0;
            var realX = ( x * 16 );
            var realY = ( y * 16 );
            var rand = brick.def.i;

            brick.x = x;
            brick.y = y;

            if ( Tetris.randomBrickColors == 1 )
                rand = parseInt( Math.random() * 7 );

            for ( var i = 0, h = brick.def.h; i < h; i++ )
            {
                for ( var e = 0, w = brick.def.w; e < w; e++ )
                {
                    var bool = brick.def.m[i][e];

                    // alert('n:' + brick.def.n + '; i:' + i + '; e:' + e + '; m: ' + brick.def.m[i][e]);

                    if ( bool == 1 )
                    {
                        var posX = realX + ( e * 16 );
                        var posY = realY + ( i * 16 );

                        // if ( !( next ) )
                        //     Tetris.bricksMap[y + i][x + e] = 1;

                        var ghost = ( Tetris.useGhost == 1 && brick.ghost ) ? 'ghost' : '';

                        // if ( Tetris.randomBrickColors == 1 )
                            brick.images[currentImage].src = Tetris.options.brickImage + rand + ghost + '.'
                                                           + Tetris.options.brickImageExt;
                        // else
                        //     brick.images[currentImage].src = Tetris.options.brickImage + brick.def.i + '.'
                        //                                    + Tetris.options.brickImageExt;

                        brick.images[currentImage].style.display = 'block';
                        brick.images[currentImage].style.position = 'absolute';
                        brick.images[currentImage].style.left = posX + 'px';
                        brick.images[currentImage].posX = parseInt(x + e);

                        if ( y != -1 )
                        {
                            brick.images[currentImage].style.top = posY + 'px';
                            brick.images[currentImage].posY = parseInt(y + i);
                        }

                        if ( next )
                            brick.images[currentImage].id = 'brickNext[' + currentImage + ']';
                        else
                            brick.images[currentImage].id = 'brick[' + parseInt(y + i) + '][' + parseInt(x + e) + ']';

                        currentImage++;
                    }
                }
            }
        }
    },

    dropBrick : function( brick, ghost )
    {
        if ( brick )
        {
            while ( ( brick.y * 16 ) <= Tetris.div.clientHeight - ( brick.def.h * 16 ) )
            {
                if ( Tetris.crash(brick) )
                    break;

                if ( !( ghost ) )
                    Tetris.points += 2;
                Tetris.moveDown(brick, ghost);
            }

            return brick.y;
        }

        return 0;
    },

    crash : function( brick )
    {
        // if ( typeof Tetris.bricksMap[brick.y + brick.def.h] == 'undefined' )
        //     return true;

        if ( parseInt(brick.y + brick.def.h) * 16 >= Tetris.div.clientHeight )
            return true;

        var toCheck = []

        for ( var e = 0, w = brick.def.w; e < w; e++ )
        {
            var lastVertical = null;

            for ( var i = 0, h = brick.def.h; i < h; i++ )
            {
                for ( var r = 0; r < 4; r++ )
                {
                    if ( brick.images[r].posY == brick.y + i && brick.images[r].posX == brick.x + e )
                        lastVertical = brick.images[r];
                }
            }

            if ( lastVertical != null )
                toCheck.push(lastVertical);
        }

        for ( var w = 0, l = toCheck.length; w < l; w++ )
        {
            var brickDown = $('brick[' + parseInt(toCheck[w].posY + 1) + '][' + toCheck[w].posX + ']');

            // if ( Tetris.bricksMap[toCheck[w].posY + 1][toCheck[w].posX] == 1 || ( typeof brickDown != 'undefined' && brickDown != null && brickDown.tagName.toLowerCase() == 'img' ) )
            if ( typeof brickDown != 'undefined' && brickDown != null && brickDown.tagName.toLowerCase() == 'img' )
            {
                // alert('bricks[' + parseInt(toCheck[w].posY + 1) + '][' + toCheck[w].posX + ']');
                // alert('x:' + toCheck[w].posX + '; y:' + toCheck[w].posY);

                if ( brickDown.src.indexOf('ghost') == -1 )
                    return true;
            }
        }

        return false;
    },

    crashLeft : function( brick )
    {
        if ( brick.x <= 0 )
            return true;

        var toCheck = []

        for ( var i = 0, h = brick.def.h; i < h; i++ )
        {
            var firstHoriz = null;
            var found = false;

            for ( var e = 0, w = brick.def.w; e < w; e++ )
            {
                if ( found )
                    break;

                for ( var r = 0; r < 4; r++ )
                {
                    if ( brick.images[r].posY == brick.y + i && brick.images[r].posX == brick.x + e )
                    {
                        firstHoriz = brick.images[r];
                        found = true;
                        break;
                    }
                }
            }

            toCheck.push(firstHoriz);
        }

        for ( var w = 0, l = toCheck.length; w < l; w++ )
        {
            var brickLeft = $('brick[' + toCheck[w].posY + '][' + parseInt(toCheck[w].posX - 1) + ']');

            // if ( Tetris.bricksMap[toCheck[w].posY][toCheck[w].posX - 1] == 1 || ( typeof brickLeft != 'undefined' && brickLeft != null && brickLeft.tagName.toLowerCase() == 'img' ) )
            if ( typeof brickLeft != 'undefined' && brickLeft != null && brickLeft.tagName.toLowerCase() == 'img' )
                return true;
        }

        return false;
    },

    crashRight : function( brick )
    {
        if ( ( brick.x + brick.def.w ) * 16 >= Tetris.div.clientWidth )
            return true;

        var toCheck = []

        for ( var i = 0, h = brick.def.h; i < h; i++ )
        {
            var lastHoriz = null;

            for ( var e = 0, w = brick.def.w; e < w; e++ )
            {
                for ( var r = 0; r < 4; r++ )
                {
                    if ( brick.images[r].posY == brick.y + i && brick.images[r].posX == brick.x + e )
                        lastHoriz = brick.images[r];
                }
            }

            toCheck.push(lastHoriz);
        }

        for ( var w = 0, l = toCheck.length; w < l; w++ )
        {
            var brickRight = $('brick[' + toCheck[w].posY + '][' + parseInt(toCheck[w].posX + 1) + ']');

            // if ( Tetris.bricksMap[toCheck[w].posY][toCheck[w].posX + 1] == 1 || ( typeof brickRight != 'undefined' && brickRight != null && brickRight.tagName.toLowerCase() == 'img' ) )
            if ( typeof brickRight != 'undefined' && brickRight != null && brickRight.tagName.toLowerCase() == 'img' )
                return true;
        }

        return false;
    },

    crashRotate : function( brick )
    {
        var i = brick.def.i;
        var nextBrick;

        if ( Tetris.bricks[i].length > 1 )
        {
            if ( Tetris.rotateClockwise == 1 )
            {
                if ( typeof Tetris.bricks[i][brick.r + 1] == 'undefined' )
                    nextBrick = Tetris.bricks[i][0];
                else
                    nextBrick = Tetris.bricks[i][brick.r + 1];
            }
            else
            {
                if ( typeof Tetris.bricks[i][brick.r - 1] == 'undefined' )
                    nextBrick = Tetris.bricks[i][Tetris.bricks[i].length - 1];
                else
                    nextBrick = Tetris.bricks[i][brick.r - 1];
            }

            if ( ( brick.x + nextBrick.w ) * 16 > Tetris.div.clientWidth )
            {
                // Wall Kick !!!
                // Tetris.posBrick(brick, brick.x - 1, brick.y, false);

                if ( !( Tetris.crashLeft(Tetris.current) ) )
                    Tetris.moveHoriz(Tetris.current, -1);

                return true;
            }

            if ( ( brick.y + nextBrick.h ) * 16 > Tetris.div.clientHeight )
                return true;
        }

        return false;
    },

    moveDown : function( brick, ghost )
    {
        brick.y++;

        for ( var i = 0; i < 4; i++ )
        {
            // alert('x:' + brick.images[i].posX + '; y:' + brick.images[i].posY);
            // Tetris.bricksMap[brick.images[i].posY][brick.images[i].posX] = 0;
            // Tetris.bricksMap[brick.images[i].posY + 1][brick.images[i].posX] = 1;

            brick.images[i].posY++;
            brick.images[i].style.top = ( brick.images[i].posY * 16 ) + 'px';
            brick.images[i].id = 'brick[' + brick.images[i].posY + '][' + brick.images[i].posX + ']';

            // Tetris.bricksMap[brick.images[i].posY][brick.images[i].posX] = 1;
            // alert(brick.images[i].id + ' = ' + Tetris.bricksMap[brick.images[i].posY][brick.images[i].posX]);
        }

        // Tetris.points++;
        // Tetris.writeScore();

        if ( Tetris.useGhost == 1 && Tetris.ghost && !( ghost ) )
            if ( brick.y + brick.def.h > Tetris.ghost.y + 1 )
                Tetris.removeGhost();
    },

    moveHoriz : function( brick, m )
    {
        if ( typeof m == 'undefined' || m == null )
            m = 1;
        var diff = 1 * m;

        brick.x += diff;

        for ( var i = 0; i < 4; i++ )
        {
            // Tetris.bricksMap[brick.images[i].posY][brick.images[i].posX] = 0;
            // Tetris.bricksMap[brick.images[i].posY][brick.images[i].posX + diff] = 1;

            brick.images[i].posX += diff;
            brick.images[i].style.left = ( brick.images[i].posX * 16 ) + 'px';
            brick.images[i].id = 'brick[' + brick.images[i].posY + '][' + brick.images[i].posX + ']';

            // Tetris.bricksMap[brick.images[i].posY][brick.images[i].posX] = 1;
        }

        if ( Tetris.useGhost == 1 && Tetris.ghost )
        {
            Tetris.posBrick(Tetris.ghost, brick.x, brick.y + brick.def.h);
            Tetris.dropBrick(Tetris.ghost, true);
        }
    },

    rotate : function( brick )
    {
        var i = brick.def.i;
        var x = brick.x, y = brick.y;

        if ( Tetris.bricks[i].length > 1 )
        {
            if ( Tetris.rotateClockwise == 1 )
            {
                if ( typeof Tetris.bricks[i][brick.r + 1] == 'undefined' )
                    brick.r = 0;
                else
                    brick.r++;
            }
            else
            {
                if ( typeof Tetris.bricks[i][brick.r - 1] == 'undefined' )
                    brick.r = Tetris.bricks[i].length - 1;
                else
                    brick.r--;
            }

            brick.def = Tetris.bricks[i][brick.r];

            if ( Tetris.useGhost == 1 && Tetris.ghost )
                Tetris.ghost.def = brick.def;

            Tetris.posBrick(brick, x, y);

            if ( Tetris.useGhost == 1 && Tetris.ghost )
            {
                Tetris.posBrick(Tetris.ghost, x, y + brick.def.h);
                Tetris.dropBrick(Tetris.ghost, true);
            }
        }
    },

    keyPress : function( event )
    {
        var keyCode = ( event.which ) ? event.which : event.keyCode;
        var key = String.fromCharCode(keyCode).toLowerCase();

        if ( Tetris.running )
        {
            if ( key == 'p' )
                Tetris.stop();
            else if ( keyCode == event.DOM_VK_SPACE )
                Tetris.dropBrick(Tetris.current);
            else if ( keyCode == event.DOM_VK_LEFT || key == 'a' )
            {
                if ( !( Tetris.crashLeft(Tetris.current) ) )
                    Tetris.moveHoriz(Tetris.current, -1);
            }
            else if ( keyCode == event.DOM_VK_UP || key == 'w' )
            {
                if ( !( Tetris.crashRotate(Tetris.current) ) )
                {
                    // Tetris.points--;
                    // Tetris.writeScore();

                    Tetris.rotate(Tetris.current);
                }
            }
            else if ( keyCode == event.DOM_VK_RIGHT || key == 'd' )
            {
                if ( !( Tetris.crashRight(Tetris.current) ) )
                    Tetris.moveHoriz(Tetris.current, 1);
            }
            else if ( keyCode == event.DOM_VK_DOWN || key == 's' )
            {
                if ( !( Tetris.crash(Tetris.current) ) )
                {
                    Tetris.points++;
                    Tetris.writeScore();

                    Tetris.moveDown(Tetris.current);
                }
            }
        }
        else if ( key == 'p' )
        {
            if ( Tetris.initSuccess )
                Tetris.start();
        }
    },

    keyUp : function()
    {
        if ( Tetris.running )
        {
            // Nothing
        }
    },

    removeGhost : function()
    {
        if ( Tetris.ghost )
        {
            if ( Tetris.ghost.images.length > 0 )
            {
                for ( var i = 0, l = Tetris.ghost.images.length; i < l; i++ )
                {
                    if ( typeof Tetris.ghost.images[i] != 'undefined' )
                        Tetris.div.removeChild(Tetris.ghost.images[i]);
                }
            }

            Tetris.ghost = null;
        }
    },

    removeLines : function( brick )
    {
        var lines = 0;
        var linesPoints = 0;
        var linesPoints2 = 0;

        for ( var j = brick.y, l = brick.y + brick.def.h; j < l; j++ )
        {
            var brickCount = 0;

            for ( var e = 0; e < Tetris.bricksWidth; e++ )
            {
                var brickCurrent = $('brick[' + j + '][' + e + ']');

                if ( typeof brickCurrent != 'undefined' && brickCurrent != null && brickCurrent.tagName.toLowerCase() == 'img' )
                    brickCount++;
            }

            if ( brickCount == Tetris.bricksWidth )
            {
                var line = j;

                for ( var e = 0; e < Tetris.bricksWidth; e++ )
                    Tetris.div.removeChild( $('brick[' + line + '][' + e + ']') );

                for ( var i = ( line - 1 ), w = 0; i > w; i-- )
                {
                    for ( var e = 0; e < Tetris.bricksWidth; e++ )
                    {
                        var brickCurrent = $('brick[' + i + '][' + e + ']');

                        if ( typeof brickCurrent != 'undefined' && brickCurrent != null && brickCurrent.tagName.toLowerCase() == 'img' )
                        {
                            brickCurrent.posY++;
                            brickCurrent.style.top = ( brickCurrent.posY * 16 ) + 'px';
                            brickCurrent.id = 'brick[' + brickCurrent.posY + '][' + brickCurrent.posX + ']';
                        }
                    }
                }

                lines++;
                linesPoints2 += Tetris.bricksHeight - ( brick.y + brick.def.h );
            }
        }

        switch ( lines )
        {
            case 0: linesPoints = 0; break;
            case 1: linesPoints = 40; break;
            case 2: linesPoints = 100; break;
            case 3: linesPoints = 300; break;
            case 4: linesPoints = 1200; break;
        }

        // Tetris.points += ( 100 * lines * lines );
        Tetris.points += linesPoints * ( Tetris.level + 1 + linesPoints2 );

        Tetris.lines += lines;
        Tetris.writeScore();
    },

    writeScore : function()
    {
        if ( Tetris.initSuccess )
        {
            //
            // if ( typeof Tetris.levels[Tetris.level + 1] != 'undefined' )
            // {
            //     if ( Tetris.points > Tetris.levels[Tetris.level + 1] )
            //     {
            //         Tetris.level++;
            //         Tetris.points += 5 * Tetris.level;
            //     }
            // }
            //

            var l = parseInt(Tetris.lines / 10);

            if ( ( l > Tetris.level ) && ( l <= 10 ) )
            {
                Tetris.level = l;
                Tetris.points += 5 * l;
            }

            Tetris.levelLabel.innerHTML = 'level ' + Tetris.level;
            Tetris.livesLabel.innerHTML = 'lives: ' + Tetris.lives;
            Tetris.pointsLabel.innerHTML = 'points: ' + Tetris.points;
            Tetris.linesLabel.innerHTML = 'lines: ' + Tetris.lines;
        }
        else
        {
            Tetris.levelLabel.innerHTML = '&nbsp;';
            Tetris.livesLabel.innerHTML = '&nbsp;';
            Tetris.pointsLabel.innerHTML = '&nbsp;';
            Tetris.linesLabel.innerHTML = '&nbsp;';
        }
    },

    start : function()
    {
        if ( Tetris.gameOver )
            return;

        if ( Tetris.iframe )
        {
            document.body.removeChild(Tetris.iframe);
            Tetris.iframe = null;
        }

        if ( !( Tetris.running ) )
        {
            if ( !( Tetris.initSuccess ) )
            {
                Tetris.init();
                Tetris.createBrick();
                Tetris.createBrick(true);
            }

            Tetris.div.className = '';
            Tetris.divScreen.style.display = 'none';
            Tetris.divScreen.scoring.style.display = 'none';
            Tetris.divScreen.conf.style.display = 'none';

            Tetris.initSuccess = true;
            Tetris.running = true;

            Tetris.writeScore();
            Tetris.redraw();
        }
    },

    stop : function()
    {
        if ( Tetris.gameOver )
            return;

        if ( Tetris.iframe )
        {
            document.body.removeChild(Tetris.iframe);
            Tetris.iframe = null;
        }

        Tetris.running = false;
        Tetris.div.className = 'pause';

        Tetris.divScreen.style.display = '';
        Tetris.divScreen.scoring.style.display = 'none';
        Tetris.divScreen.conf.style.display = 'none';

        Tetris.divScreen.heading.innerHTML = 'Pause';
        Tetris.divScreen.message.innerHTML = 'press start to continue';
    },

    restart : function(  )
    {
        if ( Tetris.iframe )
        {
            document.body.removeChild(Tetris.iframe);
            Tetris.iframe = null;
        }

        Tetris.div.innerHTML = '';
        Tetris.div.className = '';
        Tetris.divNext.innerHTML = '';

        Tetris.divScreen.style.display = '';
        Tetris.divScreen.scoring.style.display = 'none';
        Tetris.divScreen.conf.style.display = 'none';

        Tetris.divScreen.heading.innerHTML = 'Welcome to 4Bricks';
        Tetris.divScreen.message.innerHTML = '&nbsp;';

        Tetris.initSuccess = false;
        Tetris.running = false;

        Tetris.current = null;
        Tetris.next = null;
        Tetris.ghost = null;

        Tetris.history = [0, 1, 2];
        Tetris.level = 0;
        Tetris.lives = 1;
        Tetris.points = 0;
        Tetris.lines = 0;

        Tetris.writeScore();
        Tetris.gameOver = false;
        // Tetris.start();
    },

    viewConfig : function()
    {
        if ( Tetris.iframe )
        {
            document.body.removeChild(Tetris.iframe);
            Tetris.iframe = null;
        }

        Tetris.stop();
        Tetris.divScreen.style.display = '';
        Tetris.divScreen.scoring.style.display = 'none';
        Tetris.divScreen.conf.style.display = '';

        Tetris.divScreen.heading.innerHTML = 'Configure';
        Tetris.divScreen.message.innerHTML = '&nbsp;';
    },

    viewScores : function()
    {
        if ( Tetris.iframe )
        {
            document.body.removeChild(Tetris.iframe);
            Tetris.iframe = null;
        }

        Tetris.stop();
        Tetris.iframe = $new('iframe');
        Tetris.iframe.src = 'score.php';

        document.body.appendChild(Tetris.iframe);
    },

    about : function()
    {
        if ( Tetris.iframe )
        {
            document.body.removeChild(Tetris.iframe);
            Tetris.iframe = null;
        }

        Tetris.stop();

        Tetris.divScreen.style.display = '';
        Tetris.divScreen.scoring.style.display = 'none';
        Tetris.divScreen.conf.style.display = 'none';

        Tetris.divScreen.heading.innerHTML = 'About';
        Tetris.divScreen.message.innerHTML = 'by <a href="mailto:joksnet@gmail.com">joksnet@gmail.com</a>';
    },

    redraw : function()
    {
        if ( Tetris.running )
        {
            if ( Tetris.crash(Tetris.current) )
            {
                if ( Tetris.useGhost == 1 && Tetris.ghost )
                    Tetris.removeGhost();

                Tetris.removeLines(Tetris.current);

                if ( Tetris.current.y == 0 )
                {
                    Tetris.lives--;
                    Tetris.writeScore();
                    // Tetris.stop();

                    if ( Tetris.lives == 0 )
                    {
                        Tetris.stop();
                        Tetris.gameOver = true;

                        Tetris.divScreen.style.display = '';
                        Tetris.divScreen.scoring.style.display = '';
                        Tetris.divScreen.conf.style.display = 'none';

                        Tetris.divScreen.heading.innerHTML = 'Game Over';
                        Tetris.divScreen.message.innerHTML = 'press restart or submit your score';

                        var elementPoints = null;
                        var elementName = null;
                        var elementSubmit = null;

                        // for ( var i in Tetris.divScreen.scoring.childNodes )
                        for ( var i = 0, l = Tetris.divScreen.scoring.childNodes.length; i < l; i++ )
                        {
                            var element = Tetris.divScreen.scoring.childNodes[i];

                            if ( typeof element != 'undefined' && element != null && element.nodeType == 1 )
                            {
                                if ( element.tagName.toLowerCase() == 'h3' )
                                    elementPoints = element;
                                else if ( element.tagName.toLowerCase() == 'input' )
                                {
                                    if ( elementName )
                                        elementSubmit = element;
                                    else
                                        elementName = element;
                                }
                            }
                        }

                        // IE Fix
                        if ( Tetris.divScreen.conf.style.display == '' )
                            Tetris.divScreen.conf.style.display = 'none';

                        if ( elementPoints && elementName && elementSubmit )
                        {
                            elementPoints.innerHTML = Tetris.points;
                            elementName.value = '';
                            elementSubmit.onclick = function()
                            {
                                Tetris.iframe = $new('iframe');
                                Tetris.iframe.src = 'score.php?n=' + elementName.value + '&p=' + Tetris.points;

                                document.body.appendChild(Tetris.iframe);
                            }
                        }
                    }
                    else
                    {
                        Tetris.div.innerHTML = '';
                        Tetris.div.className = '';
                        Tetris.divNext.innerHTML = '';

                        Tetris.divScreen.style.display = '';
                        Tetris.divScreen.scoring.style.display = 'none';
                        Tetris.divScreen.conf.style.display = 'none';

                        Tetris.divScreen.heading.innerHTML = 'Pause';
                        Tetris.divScreen.message.innerHTML = 'you loose one life, press start to continue';

                        Tetris.initSuccess = false;
                        Tetris.running = false;
                    }

                    return;
                }

                if ( Tetris.stackPieces == 1 )
                {
                    if ( Tetris.current.images.length > 0 )
                    {
                        for ( var i = 0, l = Tetris.current.images.length; i < l; i++ )
                        {
                            if ( typeof Tetris.current.images[i] != 'undefined' )
                                Tetris.current.images[i].src = Tetris.current.images[i].src.replace(/.gif/, 'stack.gif');
                        }
                    }
                }

                if ( typeof Tetris.next != 'undefined' && Tetris.next != null )
                    Tetris.createBrick(false, Tetris.next.def.i);
                else
                    Tetris.createBrick();

                if ( Tetris.nextForce.length > 0 )
                    Tetris.createBrick(false, Tetris.nextForce.unshift());
                else
                    Tetris.createBrick(true);
            }
            else
                Tetris.moveDown(Tetris.current);

            if ( Tetris.running )
                setTimeout(Tetris.redraw, ( ( 10 - Tetris.level ) * 50 ) + 50);
        }
    }
}

addEvent(window, 'load', Tetris.constructor, true);