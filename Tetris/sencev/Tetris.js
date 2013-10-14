if ( !console.firebug )
{
    var console = {};
    var names = ["log","debug","info","warn","error","assert","dir","dirxml","group","groupEnd","time","timeEnd","count","trace","profile","profileEnd"];
    for ( var i = 0; i < names.length; i++ )
        console[names[i]] = function(){};
}

var Tetris =
{
    config:
    {
        numRows     : 22,
        numColumns  : 11,
        brickMargin : 4,
        blockSize   : 20,
        startSpeed  : 400,
        container   : 'tetris'
    },

    bricks:
    [
        /* I */ [ [ [1], [1], [1], [1] ], [ [1, 1, 1, 1] ] ],
        /* J */ [ [ [0, 1], [0, 1], [1, 1] ], [ [1], [1, 1, 1] ], [ [1, 1], [1], [1] ], [ [1, 1, 1], [0, 0, 1] ] ],
        /* L */ [ [ [1], [1], [1, 1] ], [ [1, 1, 1], [1] ], [ [1, 1], [0, 1], [0, 1] ], [ [0, 0, 1], [1, 1, 1] ] ],
        /* O */ [ [ [1,1], [1,1] ] ],
        /* S */ [ [ [0, 1, 1], [1, 1] ], [ [1], [1, 1], [0, 1] ] ],
        /* T */ [ [ [0, 1], [1, 1, 1] ], [ [1], [1, 1], [1] ], [ [1, 1, 1], [0, 1] ], [ [0, 1], [1, 1], [0, 1] ] ],
        /* Z */ [ [ [1, 1], [0, 1, 1] ], [ [0, 1], [1, 1], [1] ] ]
    ],

    map          : [],
    bricksRel    : ['I', 'J', 'L', 'O', 'S', 'T', 'Z'],
    collector    : [],
    linesCrashed : [],
    logs         : [],
    state        : 0,

    init: function()
    {
        this.log('Tetris started. Good Luck!', true);

        this.startTime = new Date().getTime();
        this.state = 1;

        for ( var rI = 0; rI < this.config.numRows; rI++ )
        {
            if ( !this.map[rI] )
                this.map[rI] = [];

            for ( var cI = 0; cI < this.config.numColumns; cI++ )
                this.map[rI][cI] = 0;
        }

        this.start();
    },

    elementsMap: [],

    showMap: function()
    {
        this.removeMap();

        for ( var mapY = 0, lenY = this.map.length; mapY < lenY; mapY++ )
        {
            for ( var mapX = 0, lenX = this.map[mapY].length; mapX < lenX; mapX++ )
            {
                var mapBlock = document.createElement('div');
                    mapBlock.className = 'mapBlock';

                    mapBlock.style.top = ( mapY * 20 ) + 'px';
                    mapBlock.style.left = ( mapX * 20 ) + 'px';

                if ( this.map[mapY][mapX] === 1 )
                    mapBlock.className += ' mapBusy';

                else if ( this.map[mapY][mapX] === 0 )
                    mapBlock.className += ' mapFree';

                var span = document.createElement('span');
                    span.appendChild(
                        document.createTextNode(mapY + ' - ' + mapX)
                    );

                mapBlock.appendChild(span);

                $(this.config.container).appendChild(mapBlock);

                Tetris.elementsMap.push(mapBlock);
            }
        }
    },

    removeMap: function()
    {
        for ( var i = 0, len = this.elementsMap.length; i < len; i++ )
            this.elementsMap[i].parentNode.removeChild(this.elementsMap[i]);

        this.elementsMap = [];
    },

    stop: function()
    {
        clearTimeout(this.timer);
        this.log('Tetris stoped', true);
    },

    start: function()
    {
        this.level      = 0;
        this.points     = 0;
        this.lines      = 0;
        this.brickCount = 0
        this.speed      = this.config.startSpeed;
        this.cBrick     = this.genBrick(this.lib.getRand(this));
        this.state      = 1;

        var bricksContainer = $(this.config.container);

        while ( bricksContainer.firstChild )
            bricksContainer.firstChild.parentNode.removeChild(bricksContainer.firstChild);

        this.pushBrick();
        this.nextBrick();
    },

    nextBrick: function( )
    {
        var nextBricksContainer = $('next-brick');

        while ( nextBricksContainer.firstChild )
            nextBricksContainer.firstChild.parentNode.removeChild(nextBricksContainer.firstChild);

        this.nBrick = this.genBrick(this.lib.getRand(this));

        for ( var i = 0, len = this.nBrick.blocks.length; i < len; i++ )
        {
            var block = this.nBrick.blocks[i];
                block.posX += this.config.blockSize;

            if ( this.nBrick.brickId != 0 )
                block.posY += this.config.blockSize;
            else
                block.posX += this.config.blockSize;

            nextBricksContainer.appendChild(this.createBlock(block));
        }

    },

    pushBrick: function( )
    {
        this.cBrick.width = this.lib.getBrickWidth(this, this.cBrick);

        var posX = (this.config.numColumns * Tetris.config.blockSize - this.cBrick.width) / 2;

        if ( posX % Tetris.config.blockSize != 0 )
            posX = posX + ( posX % Tetris.config.blockSize) - Tetris.config.blockSize;

        this.cBrick.posX = posX;
        this.cBrick.posY = 0;

        for ( var i = 0, len = this.cBrick.blocks.length; i < len; i++ )
        {
            var block = this.cBrick.blocks[i];
                block.posX += posX

            this.cBrick.elements[i] = this.createBlock(block);

            $(this.config.container).appendChild(this.cBrick.elements[i]);
        }

        var positions = this.getBlocksPos(this.cBrick);
        var busys = this.mapQuery(positions);

        if ( busys.length > 0 )
        {
            clearInterval(this.timer);
            this.state = 0;
            console.info('Game Over');
        }
        else
        {
            this.timer = setTimeout(function()
            {
                Tetris.moveBrick();
            }, this.speed);

            if ( this.brickCount == 0 )
                this.endTime = new Date().getTime() - this.startTime;

            this.brickCount++;
        }
    },

    appendBrick: function()
    {

        this.cBrick = this.nBrick;

        clearTimeout(this.timer);

        this.pushBrick();
        this.nextBrick();
    },

    moveBrick: function( accelerate )
    {
        if ( this.state === 1 )
        {
            if ( !accelerate )
            {
                clearTimeout(this.timer);
                this.timer = setTimeout(function()
                {
                    Tetris.moveBrick();
                }, this.speed);
            }

            this.cBrick.toBottom();
        }
    },

    removeBlock: function( mapY, mapX )
    {
        this.map[mapY][mapX] = 0;
        var blockElement = $('block.posY' + mapY  + '-posX' + mapX );
        this.lib.fadeBlockRemove(this, blockElement, 10);
    },

    blocksRemovedCount : 0,

    blockRemoved: function()
    {
        this.blocksRemovedCount++;

        if ( this.blocksRemovedCount == this.config.numColumns )
        {
            this.blocksRemovedCount = 0;

            for ( var i = 0, len = this.linesCrashed.length; i < len; i++ )
            {
                for ( var mapY = this.linesCrashed[i] - 1; mapY >= 0; mapY-- )
                {
                    for ( var mapX = 0, length = this.map[mapY].length; mapX < length; mapX++ )
                    {
                        if ( this.map[mapY][mapX] === 1 )
                        {
                            var blockElement = $('block.posY' + mapY  + '-posX' + mapX);
                                //blockElement.style.background = '#777';
                            if ( blockElement )
                            {
                                blockElement.style.top = (parseInt(blockElement.style.top) + 20 ) + 'px';
                                blockElement.setAttribute('id', 'block.posY' + ( mapY + 1 ) + '-posX' + mapX);
                            }
                            this.map[mapY][mapX] = 0;
                            this.map[mapY + 1][mapX] = 1;
                        }
                    }
                }
            }

            console.info('row removed.');
        }
    },

    stack: function()
    {
        for ( var mapY = 0, lines = []; mapY < this.map.length; mapY++ )
        {
            var cCount = 0;

            for ( var mapX = 0; mapX < this.map[mapY].length; mapX++ )
            {
                if ( this.map[mapY][mapX] === 1 )
                    cCount++;
            }

            if ( cCount == this.map[mapY].length )
            {
                for ( var mapX = 0; mapX < this.map[mapY].length; mapX++ )
                    this.removeBlock(mapY, mapX);

                lines.push(mapY);
            }
        }

        this.linesCrashed = lines;

        var lLen = lines.length;
        var score = (this.cBrick.soft + 1) * 4;

        if ( lLen > 0 )
        {
            this.lines += lLen;
            score      += ((this.level + lLen) / 4 + this.cBrick.soft) * lLen * 20;

            console.info(lLen + ' Lines crashed, +' + score + ' points at level ' + this.level);
        }

        this.points += score;

        $('points').firstChild.nodeValue = this.points;

        this.appendBrick();
    },

    genBrick: function( brickId )
    {
        var brick =
        {
            brickId  : brickId,
            rotation : 0,
            blocks   : [],
            elements : [],
            soft     : 0,

            render   : function()
            {
                for ( var i = 0, len = this.elements.length; i < len; i++ )
                {
                    this.elements[i].style.top  = this.blocks[i].posY + 'px';
                    this.elements[i].style.left = this.blocks[i].posX + 'px';
                }
            },

            rotate   : function( notSetRotation )
            {
                if ( Tetris.state !== 1 )
                    return;

                var positions = Tetris.getBlocksPos(this);
                    Tetris.freeMap(positions);

                if ( !notSetRotation )
                {
                    var maxRotation = Tetris.bricks[this.brickId].length;

                    if ( this.rotation + 1 < maxRotation )
                        this.rotation++;
                    else
                        this.rotation = 0;
                }

                var brickMap = Tetris.bricks[this.brickId][this.rotation];

                var i = 0;
                for ( var rowI = 0, len = brickMap.length, blockY = 0; rowI < len; rowI++ )
                {
                    for ( var columnI = 0, length = brickMap[rowI].length, blockX = 0; columnI < length; columnI++ )
                    {
                        if ( brickMap[rowI][columnI] )
                        {
                            this.blocks[i].posX = blockX + this.posX;
                            this.blocks[i].posY = blockY + this.posY;
                            i++;
                        }

                        blockX += Tetris.config.blockSize;
                    }
                    blockY += Tetris.config.blockSize;
                }

                var newPositions = Tetris.getBlocksPos(this);
                var busys = Tetris.mapQuery(newPositions);

                if ( busys.length == 0 && Tetris.isMapPosition(newPositions) )
                {
                    Tetris.busyMap(newPositions);
                    this.render();
                }
                else
                {
                    var maxRotation = Tetris.bricks[this.brickId].length;

                    if ( this.rotation - 1 >= 0 )
                        this.rotation = this.rotation - 1;
                    else if ( maxRotation - 1 >= 0 )
                        this.rotation = maxRotation - 1;
                    else
                        this.rotation = 0;

                    this.rotate(true);
                }

                this.width = Tetris.lib.getBrickWidth(Tetris, this) - this.posX;
            },

            toLeft   : function()
            {
                if ( Tetris.state !== 1 )
                    return;

                var positions = Tetris.getBlocksPos(this);
                    Tetris.freeMap(positions);

                var newPositions = Tetris.lib.getNewPositions(positions, 'X--');
                var busys = Tetris.mapQuery(newPositions);

                    Tetris.busyMap(positions);

                if ( busys.length == 0 && Tetris.isMapPosition(newPositions) )
                {
                    Tetris.freeMap(positions);

                    this.posX -= Tetris.config.blockSize;

                    for ( var i = 0, len = this.blocks.length; i < len; i++ )
                        this.blocks[i].posX -= Tetris.config.blockSize;

                    var newPos = Tetris.getBlocksPos(this);
                    Tetris.busyMap(newPos);

                    this.render();
                }
            },

            toRight  : function()
            {
                if ( Tetris.state !== 1 )
                    return;

                var positions = Tetris.getBlocksPos(this);
                    Tetris.freeMap(positions);

                var newPositions = Tetris.lib.getNewPositions(positions, 'X++');
                var busys = Tetris.mapQuery(newPositions);

                Tetris.busyMap(positions);

                if ( busys.length == 0 && Tetris.isMapPosition(newPositions) )
                {
                    Tetris.freeMap(positions);

                    this.posX += Tetris.config.blockSize;

                    for ( var i = 0, len = this.blocks.length; i < len; i++ )
                        this.blocks[i].posX += Tetris.config.blockSize;

                    var newPos = Tetris.getBlocksPos(this);
                    Tetris.busyMap(newPos);

                    this.render();
                }
            },

            toBottom : function( accelerate )
            {
                if ( Tetris.state !== 1 )
                    return;

                var positions = Tetris.getBlocksPos(this);
                    Tetris.freeMap(positions);

                var newPositions = Tetris.lib.getNewPositions(positions, 'Y++');

                var busys = Tetris.mapQuery(newPositions);

                Tetris.busyMap(positions);

                if ( busys.length == 0 && Tetris.isMapPosition(newPositions) )
                {
                    Tetris.freeMap(positions);

                    this.posY += Tetris.config.blockSize;

                    for ( var i = 0, len = this.blocks.length, blocksPosY = []; i < len; i++ )
                         this.blocks[i].posY += Tetris.config.blockSize;

                    if ( accelerate )
                    {
                        this.soft++;
                        Tetris.moveBrick(true);
                    }

                    var newPos = Tetris.getBlocksPos(this);
                        Tetris.busyMap(newPos);

                    this.render();
                }
                else
                {
                    for ( var i = 0, len = this.elements.length; i < len; i++ )
                        this.elements[i].setAttribute('id', 'block.posY' + positions[i].iY + '-posX' + positions[i].iX);

                    Tetris.stack();
                }
            }
        };

        var brickMap = this.bricks[brickId][0];

        for ( var rowI = 0, len = brickMap.length, blockY = 0; rowI < len; rowI++ )
        {
            for ( var columnI = 0, length = brickMap[rowI].length, blockX = 0; columnI < length; columnI++ )
            {
                if ( brickMap[rowI][columnI] )
                {
                    brick.blocks.push({
                        brickId : brickId,
                           posY : blockY,
                           posX : blockX
                    });
                }

                blockX += Tetris.config.blockSize;
            }
            blockY += Tetris.config.blockSize;
        }

        return brick;
    },

    getBlocksPos: function( brick )
    {
        for ( var i = 0, len = brick.blocks.length, positions = []; i < len; i++ )
        {
            var blockPosIndexX = ( brick.blocks[i].posX / Tetris.config.blockSize );
            var blockPosIndexY = ( brick.blocks[i].posY / Tetris.config.blockSize );

            positions.push({'iX':blockPosIndexX, 'iY':blockPosIndexY});
        }

        return positions;
    },

    isMapPosition: function( positions )
    {
        for ( var i = 0, len = positions.length; i < len; i++ )
        {
            if ( typeof this.map[positions[i].iY] == 'undefined' || typeof this.map[positions[i].iY][positions[i].iX] == 'undefined' )
                return false;
        }

        return true;
    },

    busyMap: function( positions )
    {
        for ( var i = 0, len = positions.length; i < len; i++ )
        {
            if ( this.map[positions[i].iY] && this.map[positions[i].iY][positions[i].iX] === 0 )
                 this.map[positions[i].iY][positions[i].iX] = 1;
        }
    },

    freeMap: function( positions )
    {
        for ( var i = 0, len = positions.length; i < len; i++ )
        {
            if ( this.map[positions[i].iY] && this.map[positions[i].iY][positions[i].iX] )
                 this.map[positions[i].iY][positions[i].iX] = 0;
        }
    },

    mapQuery: function( positions )
    {
        var busys = [];

        for ( var i = 0, len = positions.length; i < len; i++ )
        {
            if ( this.map[positions[i].iY] && this.map[positions[i].iY][positions[i].iX] === 1 )
                busys.push(i);
        }

        return busys;
    },

    createBlock: function( block )
    {
        return this.lib.createElementBlock(this, block)
    },

    log: function( log, show, notPush )
    {
        if ( window.console && show )
            console.info(log);

        if ( !notPush )
            this.logs.push(log);
    },

    lib:
    {
        getRand: function( self )
        {
            var rnd  = function() { return Math.floor(Math.random() * self.bricks.length) };
            var rand = rnd();

            if ( self.collector.indexOf(rand) )
            {
                rand = rnd();
                while( self.collector.indexOf(rand) != -1 )
                    rand = rnd();
            }

            self.collector.push(rand);

            if ( self.collector.length > self.config.brickMargin )
                self.collector.shift();

            return rand;
        },

        createElementBlock: function( self, block )
        {
            var attribute = document.createAttribute('class');
                attribute.nodeValue = 'block brick-' + self.bricksRel[block.brickId];

            var blockDiv = document.createElement('div');
                blockDiv.setAttributeNode(attribute);

                blockDiv.posY = block.posY;
                blockDiv.posX = block.posX;

                blockDiv.style.top  = blockDiv.posY + 'px';
                blockDiv.style.left = blockDiv.posX + 'px';

            return blockDiv;
        },

        getBrickWidth: function( self, brick )
        {
            for ( var i = 0, len = brick.blocks.length, maxXs = []; i < len; i++ )
                maxXs.push(brick.blocks[i].posX + self.config.blockSize);

            var width = Math.max.apply(null, maxXs);

            return width;
        },

        getNewPositions: function( positions, sence )
        {
            for ( var i = 0, len = positions.length, newPos = []; i < len; i++ )
            {
                switch ( sence )
                {
                    case 'Y++':
                        newPos[i] = {'iY' : positions[i].iY + 1, 'iX' : positions[i].iX }
                    break;
                    case 'X++':
                        newPos[i] = {'iY' : positions[i].iY, 'iX' : positions[i].iX + 1 }
                    break;
                    case 'X--':
                        newPos[i] = {'iY' : positions[i].iY, 'iX' : positions[i].iX - 1 }
                }
            }

            return newPos;
        },

        fadeBlockRemove: function( self, block, to, private )
        {
            if ( !private )
            {
                block.tmpOpacity = 100;
                setTimeout(function()
                {
                    self.lib.fadeBlockRemove(self, block, to, true);
                }, 10);
            }
            else if ( private && block.tmpOpacity > to )
            {
                block.tmpOpacity -= 10;
                setTimeout(function()
                {
                    self.lib.fadeBlockRemove(self, block, to, true);
                }, 10);
            }
            else if ( private && block.tmpOpacity <= to )
            {
                block.parentNode.removeChild(block);
                Tetris.blockRemoved();
            }

            if ( block )
                block.style.opacity = ( block.tmpOpacity / 100 );
        }
    }
};

var $ = function( id )
{
    return document.getElementById(id);
}

window.addEventListener('DOMContentLoaded', function( )
{
    $('start').addEventListener('click', function( event )
    {
        event.preventDefault();
        event.stopPropagation();

        if ( !Tetris.state )
        {
            Tetris.init.apply(Tetris, []);

            document.addEventListener('keypress', function( event )
            {

                switch ( event.keyCode )
                {
                    case event.DOM_VK_UP:
                            Tetris.cBrick.rotate();
                    break;

                    case event.DOM_VK_DOWN:
                            Tetris.cBrick.toBottom(true);
                    break;

                    case event.DOM_VK_LEFT:
                            Tetris.cBrick.toLeft();
                    break;

                    case event.DOM_VK_RIGHT:
                            Tetris.cBrick.toRight();
                    break;

                    case event.DOM_VK_SPACE:
                        alert('Todo: hard Drop');
                    break;
                }
            }, true);
        }
        else
        {
            Tetris.start();
        }

    }, true);

    $('stop').addEventListener('click', function(event)
    {
        event.preventDefault();
        event.stopPropagation();

        Tetris.stop();
    }, true);

    $('map-show').addEventListener('click', function(event)
    {
        event.preventDefault();
        event.stopPropagation();

        Tetris.showMap();
    }, true);


    $('map-hide').addEventListener('click', function(event)
    {
        event.preventDefault();
        event.stopPropagation();

        Tetris.removeMap();
    }, true);
}, true);