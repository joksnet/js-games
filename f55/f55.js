
(function()
{
    $ = function( element )
    {
        return {
            element : function()
            {
                return element;
            },

            show : function()
            {
                this.css({
                    display : 'block'
                });
            },

            hide : function()
            {
                this.css({
                    display : 'none'
                });
            },

            css : function( styles )
            {
                for ( var i in styles )
                    element.style[i] = styles[i];

                return this;
            },

            append : function( elm )
            {
                if ( typeof elm.element == 'function' )
                    elm = elm.element();

                if ( elm.nodeType )
                    element.appendChild(elm);

                return this;
            },

            appendTo : function( elm )
            {
                if ( typeof elm.element == 'function' )
                    elm = elm.element();

                if ( elm.nodeType )
                    elm.appendChild(element);

                return this;
            },

            remove : function( elm )
            {
                if ( typeof elm.element == 'function' )
                    elm = elm.element();

                if ( elm.nodeType )
                    element.removeChild(elm);

                return this;
            },

            id : function( id )
            {
                element.id = id;
                return this;
            },

            html : function( content )
            {
                element.innerHTML = content;
                return this;
            },

            events : {
                add : function( type, handler, data )
                {
                    if ( element.addEventListener )
                        element.addEventListener(type, function( event ) { handler.apply(data, [this, event]); }, false);
                    else if ( element.attachEvent )
                        element.attachEvent('on' + type, function( event ) { handler.apply(data, [this, event]); });
                },

                remove : function( type, handler )
                {
                    // if ( element.removeEventListener )
                    //     element.removeEventListener(type, handler, false);
                    // else if ( element.detachEvent )
                    //     element.detachEvent('on' + type, handler);
                }
            },

            click : function( fn, data )
            {
                this.events.add(
                    'click', fn, data || this
                );

                return this;
            }
        };
    };

    $.random = function( min, max )
    {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    $.request = function( type, url, data, success, error )
    {
        var xhr = window.XMLHttpRequest
            ? new window.XMLHttpRequest()
            : new window.ActiveXObject('Microsoft.XMLHTTP');

        xhr.open(type, url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onreadystatechange = function()
        {
            if ( xhr && xhr.readyState === 4 )
            {
                if ( xhr.status === 200 )
                    success(xhr.responseText);
                else error();
            }
        };

        if ( 'POST' == type )
            xhr.send(data);
        else
            xhr.send(null);

        return xhr;
    };

    F55 = function( element )
    {
        this.element = element;
        this.init();
    };

    F55.prototype = {
        element : null,

        field : null,

        ball : null,
        exit : null,

        mirrows : {},
        mirrowsCount : 0,
        mirrowsControl : null,

        paused : true,

        speed : 150,

        level : -1,
        levelControl : null,

        timer : null,
        time : 0,
        timeControl : null,

        init : function()
        {
            this.initField();
            this.initControls();
        },

        initField : function()
        {
            this.ball = new F55.Sprite.Ball();
            this.exit = new F55.Sprite.Exit();

            this.field = $(document.createElement('div'))
            .css({
                    border : '2px solid #AAA',
                    position : 'absolute',
                    width : '360px', height : '360px',
                    left : '12px', top : '12px'
            })
            .append(
                $(document.createElement('div'))
                .css({
                    width : '100%', height : '100%'
                })
                .click(function( obj, event )
                {
                    if ( this.paused )
                        return;

                    var x = Math.floor(event.layerX / 12);
                    var y = Math.floor(event.layerY / 12);

                    if ( x > 29 ) return;
                    if ( y > 29 ) return;

                    var hash = x + ':' + y;

                    if ( hash in this.mirrows )
                        this.mirrows[hash].turn();
                    else
                    {
                        this.mirrowsCount++;
                        this.mirrowsControl.html(this.mirrowsCount);

                        this.mirrows[hash] = new F55.Sprite.Mirrow(x, y);
                        this.mirrows[hash]
                            .show()
                            .element()
                            .appendTo(this.field);
                    }
                }, this)
            )
            .append(this.ball.element())
            .append(this.exit.element())
            .appendTo(this.element);
        },

        initControls : function()
        {
            this.levelControl = $(document.createElement('label'))
                .css({
                    display : 'block',
                    textAlign : 'center'
                })
                .html('level 0');

            this.timeControl = $(document.createElement('label'))
                .css({
                    display : 'block',
                    textAlign : 'center'
                })
                .html('00:00');

            this.mirrowsControl = $(document.createElement('label'))
                .css({
                    display : 'block',
                    textAlign : 'center'
                })
                .html('0');

            $(document.createElement('div'))
            .css({
                border : '2px solid #AAA',
                position : 'absolute',
                width : '96px', height : '360px',
                left : '384px', top : '12px'
            })
            .append(
                $(document.createElement('button'))
                .html('play/pause')
                .click(function()
                {
                    if ( false == this.paused )
                    {
                        this.paused = true;

                        if ( this.timer )
                        {
                            clearInterval(this.timer);
                            this.timer = null;
                        }
                    }
                    else
                    {
                        this.paused = false;

                        if ( !( this.timer ) )
                        {
                            this.timer = setInterval((function( self )
                            {
                                return function()
                                {
                                    if ( self.paused )
                                        return;

                                    self.time++;

                                    var mins = Math.floor( self.time / 60 );
                                    var secs = self.time - ( mins * 60 );

                                    self.timeControl.html(
                                        ( mins.toString().length == 1 ? '0' + mins : mins ) + ':' +
                                        ( secs.toString().length == 1 ? '0' + secs : secs )
                                    );
                                };
                            })(this), 1000);
                        }

                        if ( this.level == -1 )
                            this.next();

                        this.loop();
                    }
                }, this)
            )
            .append(this.levelControl)
            .append(this.timeControl)
            .append(this.mirrowsControl)
            .appendTo(this.element);
        },

        loop : function()
        {
            for ( var hash in this.mirrows )
                this.mirrows[hash].active(false);

            if ( this.ball.initilized() )
            {
                var move = this.ball.show().move();
                var hash = this.ball.x() + ':'
                         + this.ball.y();

                if ( hash in this.mirrows )
                {
                    var mirrow = this.mirrows[hash];
                    var turn = mirrow.deduce(
                        this.ball.dir()
                    );

                    this.ball.hide()
                        .turn(turn);
                }

                else if ( hash == this.exit.x() + ':' + this.exit.y() )
                {
                    this.paused = true;
                    this.next();

                    return;
                }

                if ( move )
                    this.ball.show().move();
            }

            if ( !( this.paused ) )
                setTimeout((function( self ) { return function() { self.loop.apply(self); }; })(this), this.speed);
        },

        next : function()
        {
            this.speed -= Math.ceil( this.speed / 10 );

            if ( this.speed < 50 )
                this.speed = 50;

            this.level++;
            this.levelControl.html('level ' + this.level);

            for ( var hash in this.mirrows )
            {
                this.field.remove(
                    this.mirrows[hash].element()
                );
            }

            this.mirrows = {};

            // this.ball.show().random();
            // this.exit.show().random();

            this.load();
        },

        load : function()
        {
            $.request('GET', 'f55' + this.level + '.txt', null, (function( self )
            {
                return function( response )
                {
                    var lines = response.split('\n');

                    for ( var y in lines )
                    {
                        var line = lines[y];

                        if ( line == '                              ' )
                            continue;

                        for ( var x in line )
                        {
                            if ( line[x] == ' ' )
                                continue;

                            var cont = false;

                            switch ( line[x] )
                            {
                                case 'T':
                                    if ( !( cont ) )
                                    {
                                        self.ball.turn('top');
                                        cont = true;
                                    }

                                case 'R':
                                    if ( !( cont ) )
                                    {
                                        self.ball.turn('right');
                                        cont = true;
                                    }
                                case 'B':
                                    if ( !( cont ) )
                                    {
                                        self.ball.turn('bottom');
                                        cont = true;
                                    }
                                case 'L':
                                    if ( !( cont ) )
                                    {
                                        self.ball.turn('left');
                                        cont = true;
                                    }

                                    self.ball
                                        .show()
                                        .pos(x, y);
                                    break;

                                case 'E':
                                    cont = true;

                                    self.exit
                                        .show()
                                        .pos(x, y);

                                    break;
                            }

                            if ( cont )
                                continue;

                            var hash = x + ':' + y;

                            if ( !( hash in self.mirrows ) )
                            {
                                self.mirrows[hash] = new F55.Sprite.Mirrow(x, y);
                                self.mirrows[hash]
                                    .show()
                                    .element()
                                    .appendTo(self.field);
                            }

                            self.mirrows[hash]
                                .change(line[x]);
                        }
                    }

                    self.paused = false;
                    self.loop();
                };
            })(this), (function( self )
            {
                return function()
                {
                    self.over();
                };
            })(this));
        },

        over : function()
        {
            this.paused = true;

            for ( var hash in this.mirrows )
            {
                this.field.remove(
                    this.mirrows[hash].element()
                );
            }

            this.mirrows = {};

            this.ball.hide();
            this.exit.hide();

            alert('Game Over');
        }
    };

    F55.Sprite = function( id, spriteX, spriteY, x, y )
    {
        var element =
            $(document.createElement('div'))
            .id(id)
            .css({
                position : 'absolute',
                width : '12px', height : '12px',
                left : ( x * 12 ) + 'px', top : ( y * 12 ) + 'px',
                background : 'url(f55.png) no-repeat -' + ( spriteX * 12 ) + 'px -' + ( spriteY * 12 ) + 'px',
                display : 'none'
            });

        return {
            element : function()
            {
                return element;
            },

            x : function( newX )
            {
                if ( undefined !== newX )
                {
                    x = parseInt(newX);

                    element.css({
                        left : ( x * 12 ) + 'px'
                    });
                }

                return x;
            },

            y : function( newY )
            {
                if ( undefined !== newY )
                {
                    y = parseInt(newY);

                    element.css({
                        top : ( y * 12 ) + 'px'
                    });
                }

                return y;
            },

            change : function( spriteX, spriteY )
            {
                element.css({
                    background : 'url(f55.png) no-repeat -' + ( spriteX * 12 ) + 'px -' + ( spriteY * 12 ) + 'px'
                });

                return this;
            }
        };
    };

    F55.Sprite.Ball = function()
    {
        var fn = {
            sprite : new F55.Sprite('ball', 4, 0, -1, -1),

            direction : ['top', 'right', 'bottom', 'left'][$.random(0, 3)],

            initilized : function()
            {
                return this.sprite.x() >= 0 && this.sprite.y() >= 0;
            },

            element : function()
            {
                return this.sprite.element();
            },

            show : function()
            {
                this.sprite
                    .element()
                    .show();

                return this;
            },

            hide : function()
            {
                this.sprite
                    .element()
                    .hide();

                return this;
            },

            active : function()
            {
                return this.sprite.element().element().style.display == 'block';
            },

            x : function()
            {
                return this.sprite.x();
            },

            y : function()
            {
                return this.sprite.y();
            },

            pos : function( x, y )
            {
                this.sprite.x(x);
                this.sprite.y(y);
            },

            random : function()
            {
                this.sprite.x($.random(0, 29));
                this.sprite.y($.random(0, 29));
            },

            move : function()
            {
                var move = false;

                switch ( this.direction )
                {
                    case 'top':
                        var next = this.sprite.y() - 1;

                        if ( !( 0 > next ) )
                            this.sprite.y(next);
                        else
                        {
                            this.turn('bottom');
                            //this.move();
                            move = true;
                        }
                        break;

                    case 'right':
                        var next = this.sprite.x() + 1;

                        if ( !( 29 < next ) )
                            this.sprite.x(next);
                        else
                        {
                            this.turn('left');
                            //this.move();
                            move = true;
                        }
                        break;

                    case 'bottom':
                        var next = this.sprite.y() + 1;

                        if ( !( 29 < next ) )
                            this.sprite.y(next);
                        else
                        {
                            this.turn('top');
                            //this.move();
                            move = true;
                        }
                        break;

                    case 'left':
                        var next = this.sprite.x() - 1;

                        if ( !( 0 > next ) )
                            this.sprite.x(next);
                        else
                        {
                            this.turn('right');
                            //this.move();
                            move = true;
                        }
                        break;
                }

                return move;
            },

            turn : function( dir )
            {
                this.direction = dir;
                //this.move();
            },

            dir : function()
            {
                return this.direction;
            }
        };

        return fn;
    };

    F55.Sprite.Exit = function()
    {
        return {
            sprite : new F55.Sprite('exit', 4, 1, -1, -1),

            initilized : function()
            {
                return this.sprite.x() >= 0 && this.sprite.y() >= 0;
            },

            element : function()
            {
                return this.sprite.element();
            },

            show : function()
            {
                this.sprite.element().show();
                return this;
            },

            hide : function()
            {
                this.sprite.element().hide();
                return this;
            },

            x : function()
            {
                return this.sprite.x();
            },

            y : function()
            {
                return this.sprite.y();
            },

            pos : function( x, y )
            {
                this.sprite.x(x);
                this.sprite.y(y);
            },

            random : function()
            {
                this.sprite.x($.random(0, 29));
                this.sprite.y($.random(0, 29));
            }
        };
    };

    F55.Sprite.Mirrow = function( x, y )
    {
        var sprites = [
            [[0, 0], [1, 0], [1, 1], [0, 1]],
            [[2, 0], [3, 0], [3, 1], [2, 1]]
        ];

        var fn = {
            activated : 0,
            current : 0,

            sprite : new F55.Sprite('m[' + x + ':' + y + ']', sprites[0][0][0], sprites[0][0][1], x, y),

            element : function()
            {
                return this.sprite.element();
            },

            show : function()
            {
                this.sprite.element().show();
                return this;
            },

            hide : function()
            {
                this.sprite.element().hide();
                return this;
            },

            turn : function()
            {
                this.current++;

                if ( this.current >= sprites[this.activated].length )
                    this.current = 0;

                this.sprite.change(
                    sprites[this.activated][this.current][0],
                    sprites[this.activated][this.current][1]
                );
            },

            change : function( i )
            {
                this.current = parseInt(i);

                if ( this.current < 0 ) this.current = 0;
                if ( this.current >= sprites[this.activated].length )
                    this.current = 0;

                this.sprite.change(
                    sprites[this.activated][this.current][0],
                    sprites[this.activated][this.current][1]
                );
            },

            active : function( bool )
            {
                this.activated = ( bool ) ? 1 : 0;
                this.sprite.change(
                    sprites[this.activated][this.current][0],
                    sprites[this.activated][this.current][1]
                );
            },

            deduce : function( dir )
            {
                var turn = '';

                switch ( this.current )
                {
                    case 0:
                        if ( dir == 'top' ) turn = 'right';
                        if ( dir == 'right' ) turn = 'left';
                        if ( dir == 'bottom' ) turn = 'top';
                        if ( dir == 'left' ) turn = 'bottom';

                        if ( dir == 'top' || dir == 'left' )
                            this.active(true);
                        break;

                    case 1:
                        if ( dir == 'top' ) turn = 'left';
                        if ( dir == 'right' ) turn = 'bottom';
                        if ( dir == 'bottom' ) turn = 'top';
                        if ( dir == 'left' ) turn = 'right';

                        if ( dir == 'top' || dir == 'right' )
                            this.active(true);
                        break;

                    case 2:
                        if ( dir == 'top' ) turn = 'bottom';
                        if ( dir == 'right' ) turn = 'top';
                        if ( dir == 'bottom' ) turn = 'left';
                        if ( dir == 'left' ) turn = 'right';

                        if ( dir == 'right' || dir == 'bottom' )
                            this.active(true);
                        break;

                    case 3:
                        if ( dir == 'top' ) turn = 'bottom';
                        if ( dir == 'right' ) turn = 'left';
                        if ( dir == 'bottom' ) turn = 'right';
                        if ( dir == 'left' ) turn = 'top';

                        if ( dir == 'bottom' || dir == 'left' )
                            this.active(true);
                        break;
                }

                return turn;
            }
        };

        fn.sprite.element().click(function()
        {
            // this.mirrowsCount++;
            // this.mirrowsControl.html(this.mirrowsCount);

            this.turn();
        }, fn);

        return fn;
    };
})();