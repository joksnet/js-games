(function()
{
    Bkout = function( div )
    {
        return ( this instanceof Bkout )
            ? this.__init__(div)
            : new Bkout(div);
    };

    $ = function( id )
    {
        return document.getElementById(id);
    };

    Element.prototype.newInside = function( tag )
    {
        var newElement = document.createElement(tag);
        this.appendChild(newElement);
        return newElement;
    };

    if ( !( Math.distance ) )
    {
        Math.distance = function( x1, y1, x2, y2 )
        {
            return Math.sqrt( Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) );
        };
    }

    /*
     * Start values.
     */
    Bkout.level = 0;
    Bkout.lifes = 3;
    Bkout.points = 0;

    Bkout.levels = [
        '###########\n###########\n###########',
        '###########\n#   #     #\n## ## # # #\n## ## # # #\n#  ## # # #\n###########'
    ];

    Bkout.CRASH_BOTTOMRIGHT = 1;
    Bkout.CRASH_BOTTOMLEFT  = 2;
    Bkout.CRASH_TOPRIGHT    = 3;
    Bkout.CRASH_TOPLEFT     = 4;
    Bkout.CRASH_BOTTOM      = 5;
    Bkout.CRASH_RIGHT       = 6;

    Bkout.prototype.__init__ = function( div )
    {
        this.div = $(div);
        this.game = this.div.newInside('div');
        this.paddle = this.game.newInside('div');
        this.ball = this.game.newInside('div');

        this.stats = this.div.newInside('div');

        labelLevel = this.stats.newInside('label');
        labelLevel.style.display = 'block';
        labelLevel.style.padding = '5px';
        labelLevel.innerHTML = 'level';

        labelLifes = this.stats.newInside('label');
        labelLifes.style.display = 'block';
        labelLifes.style.padding = '5px';
        labelLifes.innerHTML = 'lifes';

        labelPoints = this.stats.newInside('label');
        labelPoints.style.display = 'block';
        labelPoints.style.padding = '5px';
        labelPoints.innerHTML = 'points';

        this.stats.level = labelLevel.newInside('span');
        this.stats.lifes = labelLifes.newInside('span');
        this.stats.points = labelPoints.newInside('span');

        this.debug = ( typeof console.log != 'undefined' );

        if ( this.debug )
        {
            this.labelTop = this.game.newInside('label');
            this.labelRight = this.game.newInside('label');
            this.labelBottom = this.game.newInside('label');
            this.labelLeft = this.game.newInside('label');

            this.labelTop.innerHTML = 'Math.PI + Math.PI / 2';
            this.labelRight.innerHTML = '2 * Math.PI';
            this.labelBottom.innerHTML = 'Math.PI / 2';
            this.labelLeft.innerHTML = 'Math.PI';

            console.log('Bkout initialize. Debug Mode.');
        }

        this.style();
        this.events();
        this.start();
    };

    Bkout.prototype.style = function()
    {
        this.game.style.position = 'absolute';
        this.game.style.width = '640px';
        this.game.style.height = '320px';
        this.game.style.border = '1px solid red';

        if ( this.debug )
        {
            this.labelTop.style.position = 'absolute';
            this.labelTop.style.fontSize = '10px';
            this.labelTop.style.color = 'red';
            this.labelTop.style.left = ( ( this.game.clientWidth - this.labelTop.clientWidth ) / 2 ).toString() + 'px';
            this.labelTop.style.top = '0px';

            this.labelRight.style.position = 'absolute';
            this.labelRight.style.fontSize = '10px';
            this.labelRight.style.color = 'red';
            this.labelRight.style.left = ( ( this.game.clientWidth - this.labelRight.clientWidth ) - 2 ).toString() + 'px';
            this.labelRight.style.top = ( ( this.game.clientHeight - this.labelRight.clientHeight ) / 2 ).toString() + 'px';

            this.labelBottom.style.position = 'absolute';
            this.labelBottom.style.fontSize = '10px';
            this.labelBottom.style.color = 'red';
            this.labelBottom.style.left = ( ( this.game.clientWidth - this.labelBottom.clientWidth ) / 2 ).toString() + 'px';
            this.labelBottom.style.top = ( this.game.clientHeight - this.labelBottom.clientHeight ).toString() + 'px';

            this.labelLeft.style.position = 'absolute';
            this.labelLeft.style.fontSize = '10px';
            this.labelLeft.style.color = 'red';
            this.labelLeft.style.left = '2px';
            this.labelLeft.style.top = ( ( this.game.clientHeight - this.labelLeft.clientHeight ) / 2 ).toString() + 'px';
        }

        this.paddle.style.backgroundColor = 'red';
        this.paddle.style.position = 'absolute';
        this.paddle.style.width = '64px';
        this.paddle.style.height = '12px';
        this.paddle.style.borderRight = '1px solid #aaa';
        this.paddle.style.borderBottom = '1px solid #aaa';

        this.ball.style.position = 'absolute';
        this.ball.style.width = '16px';
        this.ball.style.height = '16px';
        this.ball.style.background = 'url("img/world.png") no-repeat;';

        this.stats.style.position = 'absolute';
        this.stats.style.left = ( this.game.offsetLeft + this.game.clientWidth + 10 ).toString() + 'px';
        this.stats.style.width = '90px';
        this.stats.style.height = this.game.clientHeight.toString() + 'px';
        this.stats.style.border = '1px solid red';
        this.stats.style.fontFamily = '"Courrier New"';
        this.stats.style.fontSize = '12px';

        this.stats.level.style.position = 'absolute';
        this.stats.level.style.right = '10px';

        this.stats.lifes.style.position = 'absolute';
        this.stats.lifes.style.right = '10px';

        this.stats.points.style.position = 'absolute';
        this.stats.points.style.right = '10px';
    };

    Bkout.prototype.events = function()
    {
        var $this = this;

        document.addEventListener('keypress', function( event ) { $this.keypress(event); }, true);
        document.addEventListener('keyup', function( event ) { $this.keyup(event); }, true);
    };

    Bkout.prototype.keypress = function( event )
    {
        var keyCode = ( event.which ) ? event.which : event.keyCode;
        var key = String.fromCharCode(keyCode).toLowerCase();

        if ( this.playing )
        {
            if ( keyCode == event.DOM_VK_SPACE )
                this.play();
            else if ( keyCode == event.DOM_VK_RIGHT || key == 'd' )
                this.paddlePos('+10');
            else if ( keyCode == event.DOM_VK_LEFT || key == 'a' )
                this.paddlePos('-10');
        }
    };

    Bkout.prototype.keyup = function( event )
    {

    };

    Bkout.prototype.paddlePos = function( x )
    {
        if ( x )
        {
            if ( typeof x == 'string' )
            {
                if ( x.substr(0, 1) == '+' )
                    x = parseInt(this.paddle.style.left) + parseInt( x.substr(1) );
                else if ( x.substr(0, 1) == '-' )
                    x = parseInt(this.paddle.style.left) - parseInt( x.substr(1) );
                else
                    x = ( this.game.clientWidth - this.paddle.clientWidth ) / 2;
            }
        }
        else
            x = ( this.game.clientWidth - this.paddle.clientWidth ) / 2;

        if ( this.ball.stack )
            this.ballPos(x + ( this.paddle.clientWidth - this.ball.clientWidth ) / 2, this.paddle.offsetTop - this.ball.clientHeight - 2);

        this.paddle.style.top = ( this.game.clientHeight - this.paddle.clientHeight * 3 ).toString() + 'px';
        this.paddle.style.left = x.toString() + 'px';
    };

    Bkout.prototype.ballPos = function( x, y )
    {
        if ( !( x || y ) )
        {
            this.ball.stack = true;

            x = parseInt(this.paddle.style.left) + ( this.paddle.clientWidth - this.ball.clientWidth ) / 2;
            y = parseInt(this.paddle.style.top) - this.ball.clientHeight - 2;
        }

        // if ( this.debug )
        //     console.info('Move to (' + x + ', ' + y + ')');

        this.ball.style.top = y.toString() + 'px';
        this.ball.style.left = x.toString() + 'px';
    };

    Bkout.prototype.nextMove = function()
    {
        var x = this.ball.offsetLeft + ( 10 * Math.cos(this.ball.angleX) );
        var y = this.ball.offsetTop + ( 10 * Math.sin(this.ball.angleY) );

        return [x, y];
    };

    Bkout.prototype.ballMove = function()
    {
        if ( this.running )
        {
            if ( this.ballAngle() )
            {
                var nextMove = this.nextMove();
                this.ballPos(nextMove[0], nextMove[1]);
            }
        }
    };

    Bkout.prototype.ballAngle = function()
    {
        var crash = this.crash();

        if ( crash )
        {
            var where  = crash[0];
            var type   = crash[1];
            var coords = crash[2];

            if ( where == 'paddle' )
            {
                if ( type == Bkout.CRASH_BOTTOMRIGHT )
                    this.ball.angleX = this.ball.angleY = Math.atan( ( coords[2] - coords[3] ) / ( coords[0] - coords[1] ) );
                if ( type == Bkout.CRASH_BOTTOMLEFT )
                    this.ball.angleX = this.ball.angleY = Math.PI - Math.atan( ( coords[2] - coords[3] ) / ( coords[1] - coords[0] ) );
                if ( type == Bkout.CRASH_TOPRIGHT )
                    this.ball.angleX = this.ball.angleY = ( Math.PI + Math.PI / 2 ) + Math.atan( ( coords[0] - coords[1] ) / ( coords[3] - coords[2] ) );
                if ( type == Bkout.CRASH_TOPLEFT )
                    this.ball.angleX = this.ball.angleY = ( Math.PI + Math.PI / 2 ) - Math.atan( ( coords[1] - coords[0] ) / ( coords[3] - coords[2] ) );
                if ( type == Bkout.CRASH_BOTTOM )
                    this.ball.angleY *= -1;
                if ( type == Bkout.CRASH_RIGHT )
                    this.ball.angleX *= -1;
            }
            else if ( where == 'paddle' )
            {

            }
        }

        return true;
    };

    Bkout.prototype.crash = function()
    {
        var nextMove = this.nextMove();
        var x = nextMove[0], y = nextMove[1];

        var objects = {
            paddle : [this.paddle.offsetLeft, this.paddle.offsetTop]
        };

        for ( var i in objects )
        {
            var objectX = objects[i][0];
            var objectY = objects[i][1];

            if ( Math.distance(this.ball.offsetLeft, this.ball.offsetTop, objectX, objectY) < 100 )
                return [i, this.crashType(this.ball.offsetLeft, this.ball.offsetTop, objectX, objectY), [this.ball.offsetLeft, this.ball.offsetTop, objectX, objectY]];
            else if ( Math.distance(objectX, objectY, this.ball.offsetLeft, this.ball.offsetTop) < 100 )
                return [i, this.crashType(objectX, objectY, this.ball.offsetLeft, this.ball.offsetTop), [objectX, objectY, this.ball.offsetLeft, this.ball.offsetTop]];
        }

        return false;
    };

    Bkout.prototype.crashType = function( x1, y1, x2, y2 )
    {
        if ( x1 > x2 && y1 > y2 )
            return Bkout.CRASH_BOTTOMRIGHT;
        if ( x1 < x2 && y1 > y2 )
            return Bkout.CRASH_BOTTOMLEFT;
        if ( x1 > x2 && y1 < y2 )
            return Bkout.CRASH_TOPRIGHT;
        if ( x1 < x2 && y1 < y2 )
            return Bkout.CRASH_TOPLEFT;
        if ( y1 = y2 )
            return Bkout.CRASH_BOTTOM;
        if ( x1 = x2 )
            return Bkout.CRASH_RIGHT;

        return false;
    };

    Bkout.prototype.mainLoop = function()
    {
        if ( this.running )
        {
            var $this = this;

            this.ballMove();
            this.loop = setTimeout(function() { $this.mainLoop(); }, this.ball.velocity);
        }
    };

    Bkout.prototype.start = function( level )
    {
        if ( this.debug )
            console.log('New game. Good luck.');

        if ( typeof this.lifes == 'undefined' )
            this.lifes = Bkout.lifes;

        if ( typeof this.points == 'undefined' )
            this.points = Bkout.points;

        this.level = level || Bkout.level;

        if ( typeof Bkout.levels[this.level] == 'undefined' )
            this.level = Bkout.level;

        this.map = Bkout.levels[this.level];
        this.ball.velocity = 50 * ( this.level + 1 );
        this.playing = true;

        this.writeStats();
        this.createBricks();
        this.paddlePos();
        this.ballPos();
    };

    Bkout.prototype.createBricks = function()
    {
        var lines = this.map.split('\n');

        this.mapWidth = lines[0].length;
        this.mapHeight = lines.length;

        for ( var x = 0; x < this.mapWidth; x++ )
        {
            for ( var y = 0; y < this.mapHeight; y++ )
            {
                if ( typeof lines[y] != 'undefined' && typeof lines[y][x] != 'undefined' && lines[y][x] != ' ' )
                {
                    var type = Bkout.Brick.NORMAL;

                    if ( lines[y][x] == '#' )
                        type = Bkout.Brick.NORMAL;

                    var borderRight = false;
                    var borderBottom = false;

                    if ( typeof lines[y] == 'undefined' || typeof lines[y][x + 1] == 'undefined' || lines[y][x + 1] == ' ' )
                        borderRight = true;
                    if ( typeof lines[y + 1] == 'undefined' || typeof lines[y + 1][x] == 'undefined' || lines[y + 1][x] == ' ' )
                        borderBottom = true;

                    var x1 = ( x * Bkout.Brick.width ) + ( ( this.game.clientWidth - ( this.mapWidth * Bkout.Brick.width ) ) / 2 ) + x;
                    var y1 = ( y * Bkout.Brick.height ) + Bkout.Brick.height + y;

                    this.game.appendChild(
                        Bkout.Brick(
                            type, x1, y1,
                            {
                                'borderRight' : borderRight,
                                'borderBottom' : borderBottom
                            }
                        ).brick
                    );
                }
            }
        }
    };

    Bkout.prototype.play = function()
    {
        if ( this.running )
            this.pause();
        else if ( this.ball.stack )
            this.throwBall();
        else
        {
            if ( this.debug )
                console.log('Resume.');

            this.running = true;
            this.mainLoop();
        }
    };

    Bkout.prototype.pause = function()
    {
        if ( this.debug )
            console.log('Pause.');

        this.running = false;

        if ( this.loop )
        {
            clearTimeout(this.loop);
            delete this.loop;
        }
    };

    Bkout.prototype.throwBall = function()
    {
        var reverse = parseInt( Math.random() * 2 );
        var angle = ( reverse ) ? Math.PI + Math.PI / 4 : 2 * Math.PI - Math.PI / 4;

        if ( this.debug )
            console.log( 'Ball throw. Starting angle = ' + angle.toString() );

        this.running = true;
        this.ball.stack = false;
        this.ball.angleX = this.ball.angleY = angle;
        this.mainLoop();
    };

    Bkout.prototype.writeStats = function()
    {
        if ( this.playing )
        {
            this.stats.level.innerHTML = this.level.toString();
            this.stats.lifes.innerHTML = this.lifes.toString();
            this.stats.points.innerHTML = this.points.toString();
        }
        else
        {
            this.stats.level.innerHTML = Bkout.level;
            this.stats.lifes.innerHTML = Bkout.lifes;
            this.stats.points.innerHTML = Bkout.points;
        }
    };

    Bkout.Brick = function( type, x, y, options )
    {
        return ( this instanceof Bkout.Brick )
            ? this.__init__(type, x, y, options)
            : new Bkout.Brick(type, x, y, options);
    }

    Bkout.Brick.NORMAL = 0;
    Bkout.Brick.INNER = 1;
    Bkout.Brick.INNERRIGHT = 2;
    Bkout.Brick.INNERBOTTOM = 3;

    Bkout.Brick.width = 32;
    Bkout.Brick.height = 16;

    Bkout.Brick.prototype.__init__ = function( type, x, y, options )
    {
        this.brick = document.createElement('div');
        this.options = options || {
            borderRight  : true,
            borderBottom : true
        };
        this.brick.type = type;
        this.brick.x = x;
        this.brick.y = y;
        this.style();
    };

    Bkout.Brick.prototype.style = function()
    {
        this.brick.style.width = Bkout.Brick.width.toString() + 'px';
        this.brick.style.height = Bkout.Brick.height.toString() + 'px';
        this.brick.style.position = 'absolute';
        this.brick.style.top = this.brick.y.toString() + 'px';
        this.brick.style.left = this.brick.x.toString() + 'px';

        if ( this.brick.type == Bkout.Brick.NORMAL )
        {
            this.brick.style.backgroundColor = '#ddd';
            this.brick.style.borderRight = ( this.options.borderRight ) ? '1px solid #aaa' : '1px dotted #666';
            this.brick.style.borderBottom = ( this.options.borderBottom ) ? '1px solid #aaa' : '1px dotted #666';
        }
    };
})();