const increase = 16;

var scvTetris =
{
    init: function( )
    {
        this.To = null;
        this.currentBlock = 0;
        this.allBlocks = [];
        this.next = 0;

        this.box = document.getElementById('box');

        this.numRowsAvailable = 30;

        this.speed = 100;

        this.listen();

        this.newBlock();



    },

    newBlock: function()
    {
        this.blockGenerate();
        this.start();
        this.generateNext();
        this.blockGenerate(true);
        this.rotation = 0;
    },

    generateNext: function()
    {
        this.next = lib.random(0, 6, [lib.random(0, 6), lib.random(0, 6)]);
    },

    blockGenerate: function( isPrev )
    {
        if ( !isPrev )
        {
            this.imagesNames = [];
            this.imageBlocks = [];
        }

        //document.getElementById("next-Images").innerHTML = '';

        // table, width, height
        var blocks = [
          [ 1, 5, 9, 13, [1, 4] ],
          [ 1, 2, 5, 6, [2, 2] ],
          [ 2, 3, 5, 6, [3, 2] ],
          [ 1, 2, 6, 7, [3, 2] ],
          [ 2, 5, 6, 7, [3, 2] ],
          [ 1, 2, 5, 9, [2, 3] ],
          [ 1, 2, 6, 10, [2, 3] ]
        ];


        this.currentBlock = this.next == 0 ? lib.random(0, 6, [lib.random(0, 6), lib.random(0, 6)]) : this.next;

        if ( !isPrev )
            this.allBlocks.push(this.currentBlock);

        var thisBlock = blocks[this.currentBlock];

        var imgName = lib.random(0, 1000, this.imagesNames);

        if ( !isPrev )
        {
            this.imagesNames.push(imgName);
            this.imageBlocks.blocksX = blocks[this.currentBlock][4][0];
            this.imageBlocks.blocksY = blocks[this.currentBlock][4][1];
        }

        for ( var i = 0, Block = blocks[this.currentBlock], length = Block.length; i < length && !isNaN(Block[i]) ; i++ )
        {
            var image = lib.createImage(imgName);

            var x = Math.floor(Block[i] / 4);
            var y = Math.floor(Block[i] % 4) - 1;

            image.style.top = ( x * increase ) + 'px';
            image.style.left = ( y * increase ) + 'px';

            image.scvX = x;
            image.scvY = y;

            if ( !isPrev )
            {
                this.box.appendChild(image);
                this.imageBlocks.push(image);
            }
            else
            {
                //document.getElementById("next-Images").appendChild(image);
            }
        }

        if ( !isPrev )
        {
            this.imageBlocks.Top = 1;
            this.imageBlocks.Left = 1;
        }
    },

    start: function( )
    {
        this.move();
    },

    move: function()
    {
        for ( var i = 0, length = this.imageBlocks.length; i < length; i++ )
        {
            var img = this.imageBlocks[i];
            img.style.top = ( ( this.imageBlocks.Top + img.scvX ) * increase ) + 'px';
            img.style.left = ( ( this.imageBlocks.Left + img.scvY ) * increase ) + 'px';
        }

        this.imageBlocks.Top++

        var operation = this.imageBlocks.Top + this.imageBlocks.blocksY;
        if ( operation <= this.numRowsAvailable )
        {
            var _this_ = this;

            this.To = setTimeout(function()
            {
                _this_.move();
            }, this.speed);
        }
        else
        {
            //this.numRowsAvailable -= this.imageBlocks.blocksY;
            this.newBlock();
        }
    },

    stop: function()
    {
        clearTimeout(this.To);
    },

    listen: function()
    {
        var _this_ = this;

        document.addEventListener('keypress', function( event )
        {
            var operation = _this_.imageBlocks.Left + _this_.imageBlocks.blocksX;

            switch ( event.keyCode )
            {
                case 40: // Down
                   _this_.speed = 1;
                break;
                case 39: // Right
                    if ( operation < 16 )
                        _this_.imageBlocks.Left++;
                break;
                case 37: // Left
                    if ( _this_.imageBlocks.Left > 0 )
                        _this_.imageBlocks.Left--;
                break;
                case 38: // Space
                    _this_.rotate()
                break;
            }

        }, true);

        document.addEventListener('keyup', function( event )
        {
            if ( event.keyCode == 40 )
                _this_.speed = 300;

        }, true);
    },

    rotate: function( )
    {
        var rotations =
        {
            //0: { 0:[1, ] }

        }

        var current = this.allBlocks[this.allBlocks.length - 1];

        for ( var i = 0, length = this.imageBlocks.length; i < length; i++ )
        {
            var img = this.imageBlocks[i];

            switch ( current )
            {
                case 0:
                //alert(this.rotation);
                    if ( this.rotation == 0 || this.rotation == 2 )
                    {
                        img.scvX = 1;
                        img.scvY = i;
                    }
                    else
                    {
                        img.scvX = i;
                        img.scvY = 0;
                    }
                break;

                case 2:
                    if ( this.rotation == 0 || this.rotation == 2 )
                    {
                        if ( i == 0 )
                        {
                            img.scvY = 0;
                            img.scvX = 0;
                        }
                        else if ( i == 1 )
                        {
                            img.scvX = 1;
                            img.scvY = 0;

                        }
                        else if ( i == 2 )
                        {
                            img.scvX = 2;
                            img.scvY = 1;
                        }
                        else if ( i == 3 )
                        {
                            img.scvx = 4;
                            img.scvY = 1;
                        }
                    }
                    else
                    {
                        if ( i == 0 )
                        {
                            img.scvY = 1;
                            img.scvX = 1;
                        }
                        else if ( i == 1 )
                        {
                            img.scvX = 2;
                            img.scvY = 1;
                        }
                        else if ( i == 2 )
                        {
                            img.scvX = 1;
                            img.scvY = 2;
                        }
                        else if ( i == 3 )
                        {
                            img.scvX = 2;
                            img.scvY = 0;
                        }
                    }
                break;

                case 4:
                    if ( this.rotation == 0 )
                    {

                    }
                break;
            }



            //img.scvX = img.scvX + 1;
            //img.scvY = img.scvY + 1;
        }
        this.rotation = this.rotation > 1 ? 0 : this.rotation + 1;
    }

}

var lib =
{
    random: function( min, max, exclude )
    {
        var rnd = Math.floor( Math.random() * ( max - min + 1 )) + min;

        if ( exclude instanceof Array && exclude.indexOf(rnd) != -1 )
            rnd = lib.random(min, max, exclude);

        return rnd
    },

    createImage: function( )
    {
        var image = document.createElement('img');
            image.setAttribute('src', './feed.png');

        return image;
    },

    createBlock: function( )
    {
        var image = document.createElement('img');
            image.setAttribute('src', './feed.png');

        return image;
    },
}

/*
var table = {};
var letras = 'abcdefghijklmnopqr';

for ( var i = 0; i < 16; i++ )
{
    var rango = [];

    for ( var x = 1; x <= 30; x++ )
        rango.push(x);

    table[letras[i]] = rango;
}
*/

var scvTetris1 =
{
    init: function( level )
    {
        this.box = document.getElementById('box');
        this.level = level;
        this.updateBlock();
        this.start();
    },

    updateBlock: function( )
    {
        this.block = lib.createBlock();
        this.block.X = 1;
        this.block.Y = this.level;
    },

    start: function( )
    {
        this.box.appendChild(this.block);
        this.position( );
    },

    position: function( )
    {
        this.block.style.top = ( this.block.X * 16 ) + 'px';

        this.block.style.left = ( ( this.block.Y + this.level ) * 16 ) + 'px';

        if ( this.block.X % 27 == 0 && this.level > 0 )
            this.block.Y++;

        else if ( this.level < 0 )
            this.block.Y++;

        this.block.X++;

        if ( this.block.X < 30 )
        {
            setTimeout(function()
            {
                scvTetris.position();
            }, 50);
        }
        else
        {
            this.init(this.level + 1);
        }

    }
}