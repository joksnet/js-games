/**
 * Puzzle Game.
 *
 * @author Juan Manuel Martinez <joksnet@gmail.com>
 * @date 2007-11-28
 */
(function(){

jPuzzle15 = function( div, time, moves, mosaic, scores, levels, controls )
{
    return ( this instanceof jPuzzle15 )
        ? this.__init__(div, time, moves, mosaic, scores, levels, controls)
        : new jPuzzle15(div, time, moves, mosaic, scores, levels, controls);
};

jPuzzle15.extend = jPuzzle15.prototype.extend = function( source )
{
    for ( var property in source )
        this[property] = source[property];
}

function $( id ) { return document.getElementById(id); }
function $new( tag, context ) { var e = document.createElement(tag); if ( context ) context.appendChild(e); return e; }
function $rand( min, max ) { return Math.floor(Math.random() * (max - min + 1) + min); }

jPuzzle15.prototype.extend({
    version : '0.1',

    div     : null,
    time    : null,
    moves   : null,
    mosaic  : null,

    scores  : null,
    scoresD : {},

    level   : 0,
    levels  : null,
    levelsD : {},

    map     : {},

    running : false,
    playing : false,

    secs    : 0,
    movesC  : 0,

    options : {
        ajaxFile     : 'inc/jPuzzle15.php', // PHP jPuzzle

        divWidth     : 4,                   // number of pieces horizontal
        divHeight    : 4,                   // number of pieces vertical

        pieceWidth   : 64,                  // piece width in px
        pieceHeight  : 64,                  // piece height in px
        pieceSpacing : 6,                   // spacing between pieces
    },

    __init__ : function( div, time, moves, mosaic, scores, levels, controls )
    {
        var $this = this;

        for ( var i in controls )
            $(controls[i]).addEventListener('click', function() { $this.control(this); }, true);

        this.div = $(div);
        this.time = $(time);
        this.moves = $(moves);
        this.mosaic = $(mosaic);
        this.scores = $(scores);
        this.levels = $(levels);

        if ( this.mosaic )
        {
            var form = $new('form', this.mosaic);
                form.action = 'mosaic.php';
                form.method = 'post';
                form.enctype = 'multipart/form-data';
                form.addEventListener('submit', function()
                {
                    var divWidth = $new('input', this);
                        divWidth.type = 'hidden';
                        divWidth.name = 'divWidth';
                        divWidth.value = $this.options.divWidth;

                    var divHeight = $new('input', this);
                        divHeight.type = 'hidden';
                        divHeight.name = 'divHeight';
                        divHeight.value = $this.options.divHeight;
                }, true);

            var label = $new('label', form);
                label.setAttribute('for', 'name');

            $new('span', label).innerHTML = 'Name';

            var mosaic = $new('input', label);
                mosaic.type = 'text';
                mosaic.name = 'name';
                mosaic.size = '30';

            $new('br', form);

            var label = $new('label', form);
                label.setAttribute('for', 'mosaic');

            $new('span', label).innerHTML = 'Image';

            var mosaic = $new('input', label);
                mosaic.type = 'file';
                mosaic.name = 'mosaic';

            $new('br', form);

            var label = $new('label', form);
                label.setAttribute('for', 'submit');

            $new('span', label).innerHTML = '';

            var submit = $new('input', label);
                submit.type = 'submit';
                submit.value = 'Upload Mosaic';

            var div = $new('pre', form);
                div.innerHTML = 'format   : jpg\nsize 5x5 : 320x320\nsize 4x4 : 256x256\nsize 3x3 : 192x192';
        }

        this.getLevels();
        this.getScores();

        this.size4x4();
    },

    control : function( control )
    {
        if ( typeof control != 'undefined' )
        {
            var fn = control.id || '';

            if ( fn.length > 0 )
                this[fn]();
        }
    },

    size : function( w, h )
    {
        this.level = 0;
        this.options.divWidth = w;
        this.options.divHeight = h;
        this.div.className = 'size' + this.options.divWidth + 'x' + this.options.divHeight;

        var scores = this.scores.getElementsByTagName('tr');

        for ( var i in scores )
        {
            if ( typeof scores[i] != 'undefined' && scores[i].tagName && scores[i].parentNode.tagName.toLowerCase() == 'tbody' )
            {
                if ( scores[i].className == this.div.className )
                    scores[i].style.display = '';
                else
                    scores[i].style.display = 'none';
            }
        }

        var levels = this.levels.getElementsByTagName('li');

        for ( var i in levels )
        {
            if ( typeof levels[i] != 'undefined' && levels[i].tagName )
            {
                if ( levels[i].className == this.div.className )
                    levels[i].style.display = '';
                else
                    levels[i].style.display = 'none';
            }
        }
    },

    size5x5 : function() { this.size(5, 5); this.solve(); },
    size4x4 : function() { this.size(4, 4); this.solve(); },
    size3x3 : function() { this.size(3, 3); this.solve(); },

    clear : function()
    {
        this.secs = 0;
        this.movesC = 0;

        this.running = false;
        this.playing = false;

        this.div.innerHTML = '';
        this.time.innerHTML = '00:00';
        this.moves.innerHTML = '0';

        this.map = {};

        for ( var i = 0, l = ( this.options.divWidth * this.options.divHeight ); i < l; i++ )
            this.map[i] = null;
    },

    timer : function()
    {
        if ( this.running )
        {
            var $this = this;

            this.secs++;
            this.time.innerHTML = jPuzzle15.formatTime(this.secs);

            setTimeout(function() { $this.timer(); }, 1000);
        }
    },

    play : function()
    {
        if ( this.running )
            return;

        if ( !( this.playing ) )
            this.shuffle();

        this.running = true;
        this.playing = true;

        this.timer();
    },

    pause : function()
    {
        this.running = false;
    },

    solve : function()
    {
        this.clear();

        for ( var i = 0, l = ( this.options.divWidth * this.options.divHeight ) - 1; i < l; i++ )
            this.piecePos( this.pieceCreate(i), i );
    },

    shuffle : function()
    {
        this.clear();

        var map = {};
        var pos, piece;

        for ( var i = 0, l = ( this.options.divWidth * this.options.divHeight ) - 1; i < l; i++ )
        {
            do {
                pos = $rand(0, l);
            } while ( typeof map[pos] != 'undefined' );

            map[pos] = true;
            piece = this.pieceCreate(i);

            this.piecePos( piece, pos );
        }
    },

    pieceCreate : function( n )
    {
        var $this = this;
        var element = $new('a', this.div);
            element.id = 'p' + n.toString();
            element.i = n;
            element.addEventListener('click', function() { $this.move(this); }, true);

        if ( this.level > 0 )
            element.style.background = 'url(levels/level' + this.level + '/p' + n.toString() + '.jpg);';
        else
            $new('span', element).innerHTML = ( n + 1 ).toString();

        return element;
    },

    piecePos : function( piece, pos )
    {
        if ( this.map[pos] === null )
        {
            var x = ( pos + 1 ) % this.options.divWidth;
            var y = parseInt(pos / this.options.divHeight);

            if ( x == 0 ) x = this.options.divWidth;

            if ( typeof piece.pos != 'undefined' )
                this.map[piece.pos] = null;

            this.map[pos] = piece;

            piece.pos = pos;
            piece.style.left = ( ( x - 1 ) * ( this.options.pieceWidth + this.options.pieceSpacing + 1 ) + this.options.pieceSpacing ).toString() + 'px';
            piece.style.top = ( y * ( this.options.pieceHeight + this.options.pieceSpacing ) + this.options.pieceSpacing ).toString() + 'px';

            if ( pos == piece.i )
            {
                piece.setAttribute('class', 'ok');

                if ( this.running )
                    this.checkWin();
            }
            else
                piece.removeAttribute('class');
        }
    },

    move : function( piece )
    {
        if ( this.running )
        {
            var moveTo = this.canMoveTo(piece);

            if ( moveTo !== false )
            {
                this.piecePos(piece, moveTo);

                this.movesC++;
                this.moves.innerHTML = this.movesC;
            }
        }
    },

    canMoveTo : function( piece )
    {
        var pos = piece.pos;
        var tries = [pos - this.options.divWidth, pos + 1, pos + this.options.divWidth, pos - 1];

        for ( var i in tries )
            if ( this.map[tries[i]] === null )
                return tries[i];

        return false;
    },

    checkWin : function()
    {
        var cantForWin = ( this.options.divWidth * this.options.divHeight ) - 1;
        var cantFound = 0;

        for ( var i in this.map )
        {
            if ( this.map[i] !== null )
            {
                if ( this.map[i].i == this.map[i].pos )
                    cantFound++;
                else
                    break;
            }
        }

        if ( cantFound == cantForWin )
        {
            this.running = false;
            this.playing = false;

            var yourName = prompt('You Win in ' + jPuzzle15.formatTime(this.secs)
                + ' width ' + this.movesC + ' moves'
                + ', please enter your name for the record.');

            if ( yourName != null && yourName.length > 0 )
            {
                var $this = this;

                jPuzzle15.Ajax(this.options.ajaxFile,
                {
                    add   : 1,
                    name  : yourName,
                    board : this.options.divWidth + 'x' + this.options.divHeight,
                    time  : this.secs,
                    moves : this.movesC,
                    level : this.level
                },
                {
                    onComplete : function( response )
                    {
                        $this.scoresD = response;
                        $this.writeScores();
                    }
                }).request();
            }

            this.clear();
        }
    },

    getLevels : function()
    {
        var $this = this;

        jPuzzle15.Ajax('inc/jPuzzle15Levels.php', {},
        {
            onComplete : function( response )
            {
                $this.levelsD = response;
                $this.writeLevels();
            }
        }).request();
    },

    writeLevels : function()
    {
        var $this = this;
        var currentBoard = 'size' + this.options.divWidth + 'x' + this.options.divHeight;

        for ( var i in this.levelsD )
        {
            var li = $new('li', this.levels);
                li.className = 'size' + this.levelsD[i]['board'];

            var a = $new('a', li);
                a.level = this.levelsD[i]['level'];
                a.addEventListener('click', function() { $this.level = this.level; $this.solve(); }, true);

            var img = $new('img', a);
                img.src = 'levels/level' + this.levelsD[i]['level'] + '/orig.jpg';
                img.width = '64';
                img.height = '64';

            $new('span', li).innerHTML = this.levelsD[i]['name'];

            if ( li.className != currentBoard )
                li.style.display = 'none';
        }
    },

    getScores : function()
    {
        var $this = this;

        jPuzzle15.Ajax(this.options.ajaxFile, {},
        {
            onComplete : function( response )
            {
                $this.scoresD = response;
                $this.writeScores();
            }
        }).request();
    },

    writeScores : function()
    {
        var currentBoard = 'size' + this.options.divWidth + 'x' + this.options.divHeight;
        var scoresTimes = this.scoresD.times;
        var scoresMoves = this.scoresD.moves;

        this.scores.innerHTML = '';

        var createTable = function( where, className, content, what, currentBoard )
        {
            var n = {};

            var table = $new('table', where);
                table.className = className;

            var head = $new('tr', $new('thead', table) );
            var body = $new('tbody', table);

            $new('th', head).innerHTML = '#';
            $new('th', head).innerHTML = 'Name';
            // $new('th', head).innerHTML = 'Board';
            $new('th', head).innerHTML = what.substr(0, 1).toUpperCase() + what.substr(1);
            $new('th', head).innerHTML = 'Level';

            for ( var i in content )
            {
                var tr = $new('tr', body);
                    tr.className = 'size' + content[i]['board'];

                if ( tr.className != currentBoard )
                    tr.style.display = 'none';

                if ( typeof n[tr.className] == 'undefined' )
                    n[tr.className] = 0;

                n[tr.className]++;

                $new('td', tr).innerHTML = n[tr.className];
                $new('td', tr).innerHTML = content[i]['name'];
                // $new('td', tr).innerHTML = content[i]['board'];

                if ( what == 'time' )
                    $new('td', tr).innerHTML = jPuzzle15.formatTime(content[i][what]);
                else
                    $new('td', tr).innerHTML = content[i][what];

                $new('td', tr).innerHTML = content[i]['lname'];
            }
        };

        createTable(this.scores, 'left', scoresTimes, 'time', currentBoard);
        createTable(this.scores, 'right', scoresMoves, 'moves', currentBoard);
    }
});

jPuzzle15.extend({
    formatTime : function( secs )
    {
        var mins = 0;

        if ( secs > 60 ) { mins = parseInt(secs / 60); secs -= 60 * mins; }
        if ( secs == 60 ) { mins++; secs = 0; }

        if ( mins.toString().length == 1 ) mins = '0' + mins;
        if ( secs.toString().length == 1 ) secs = '0' + secs;

        return mins + ':' + secs;
    }
});

})();