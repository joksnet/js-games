(function()
{
    function $()
    {
        var elements = new Array();

        for ( var i = 0, l = arguments.length; i < l; i++ )
        {
            var element = arguments[i];

            if ( typeof element == 'string' )
                element = document.getElementById(element);

            if ( arguments.length == 1 )
                return element;

            elements.push(element);
        }

        return elements;
    };

    function $new( tag, properties, context )
    {
        var element = document.createElementNS('http://www.w3.org/1999/xhtml', tag);

        for ( var property in properties )
            element[property] = properties[property];

        if ( context )
            $(context).appendChild( element );

        return element;
    };

    function $date( seconds )
    {
        var minutes = parseInt( seconds / 60 );

        if ( minutes > 0 )
            seconds -= minutes * 60;

        if ( minutes.toString().length == 1 ) minutes = '0' + minutes;
        if ( seconds.toString().length == 1 ) seconds = '0' + seconds;

        return minutes + ':' + seconds;
    };

    /**
     * Clase que crea un juego estilo Reversi
     *
     * @author Juan M Martinez <joksnet@gmail.com>
     * @license General Public License
     * @param div [ string || element ]
     */
    BlackAndWhite = function( div )
    {
        return this instanceof BlackAndWhite
            ? this.__init__(div)
            : new BlackAndWhite(div);
    };

    BlackAndWhite.prototype = {

        /**
         * @var Element
         */
        div : null,

        /**
         * @var Element
         */
        divGame : null,

        /**
         * @var Element
         */
        divControls : null,

        /**
         * Si es true, se loguearan en la consola los eventos; y tirara las
         * excepciones sobre la consola.
         *
         * @var Boolean
         */
        debug : ( typeof console != 'undefined' ),

        /**
         * Configuraciones generales del juego
         *
         * @var Dictionary
         */
        config : {

            /**
             * Valor de bloques por cada lado, siempre es un cuadrado
             *
             * @var Integer
             */
            size : 8,

            /**
             * Valor de alto y ancho de cada pieza
             *
             * @var Integer
             */
            sizePiece : 58,

            /**
             * Almacena los controles con sus respectivas opciones.
             *
             * element => El mismo elemento
             * label   => Nombre de la etiqueta
             * type    => Tipo de control [ input || button || span ]
             * text    => Texto de los botones, solo para los buttons
             * default => Valor default, unicamente para los inputs y span
             * size    => Tamano del control, unicamente para los inputs
             * css     => Le aplica CSS al control
             * action  => Sobre que accion actual
             * bind    => A que funcion de este control llamar cuando suceda
             *            la accion
             *
             * @var Dictionary
             */
            controls : {

                newGame : {
                    type   : 'link',
                    text   : 'New Game',
                    action : 'click',
                    bind   : 'newGame'
                },

                pause : {
                    type   : 'link',
                    text   : 'Pause',
                    action : 'click',
                    bind   : 'pause'
                },

                /**
                 * size : {
                 *     label   : 'Size',
                 *     type    : 'input',
                 *     default : 8,
                 *     size    : 4,
                 *     css     : {
                 *         textAlgin : 'right'
                 *     },
                 *     action  : 'change',
                 *     bind    : 'setSize'
                 * },
                 */

                time : {
                    label   : 'Time',
                    type    : 'span',
                    default : '00:00'
                },

                clear : {
                    type   : 'link',
                    text   : 'Clear',
                    action : 'click',
                    bind   : 'clear'
                }
            }
        },

        /**
         * @var Boolean
         */
        running : false,

        /**
         * @var Boolean
         */
        playing : false,

        /**
         * El tiempo de juego, en segundos.
         *
         * @var Integer
         */
        seconds : 0,

        /**
         * Constructor
         *
         * @param div [ string || element ]
         * @return BlackAndWhite
         */
        __init__ : function( div )
        {
            this.div = $(div);
            this.divGame = $new('div', { className : 'Game' }, this.div);
            this.divControls = $new('div', { className : 'Controls' }, this.div);

            if ( this.debug )
                console.log('BlackAndWhite initialized.');

            this.running = false;
            this.playing = false;

            this.createControls();
            this.newGame();
            this.style();
        },

        /**
         * Estila los elementos del juego, aplicandole ancho y alto
         */
        style : function()
        {
            this.div.className = ( this.div.className.length > 0 ) ? ( ( this.div.className.indexOf('BlackAndWhite') == -1 ) ? this.div.className + ' BlackAndWhite' : this.div.className ) : 'BlackAndWhite';

            if ( this.running )
                this.divGame.style.width = this.divGame.style.height = ( this.config.size * this.config.sizePiece ).toString() + 'px';
        },

        /**
         * Crea los controles en base a this.options.controls que debe ser un
         * diccionario con el nombre del control como key y las opciones como
         * value.
         */
        createControls : function()
        {
            var dl = $new('dl', {}, this.divControls);

            for ( var i in this.config.controls )
            {
                var control = this.config.controls[i];

                if ( control['label'] )
                {
                    var dt = $new('dt', {}, dl);
                    var dtLabel = $new('label', { 'for' : i }, dt);
                        dtLabel.setAttribute('for', i);
                        dtLabel.innerHTML = control['label'];

                    var conteiner = $new('dd', {}, dl);
                }
                else
                    var conteiner = $new('dd', {}, dl)

                var self = this;
                var e = null;

                if ( 'action' in control && 'bind' in control )
                {
                    var action = control['action'].toString();
                    var bind = control['bind'].toString();
                }

                switch ( control['type'] )
                {
                    case 'input':
                        if ( control.element )
                            e = control.element;
                        else
                        {
                            control.element = e = $new('input', {
                                type  : 'text',
                                value : control['default'],
                                name  : i, id : i,
                                size  : control['size'] || 0
                            }, conteiner);
                        }

                        break;

                    case 'button':
                        if ( control.element )
                            e = control.element;
                        else
                        {
                            control.element = e = $new('input', {
                                type  : 'button',
                                value : control['text'],
                                name  : i, id : i
                            }, conteiner);
                        }

                        break;

                    case 'link':
                        if ( control.element )
                            e = control.element;
                        else
                        {
                            control.element = e = $new('a', {
                                name  : i, id : i,
                                href  : 'javascript:void(0);'
                            }, conteiner);
                            e.innerHTML = control['text'];
                        }

                        break;

                    case 'span':
                        if ( control.element )
                            e = control.element;
                        else
                        {
                            control.element = e = $new('span', {
                                name  : i, id : i
                            }, conteiner);
                        }

                        e.innerHTML = control['default'];
                        break;
                }

                if ( e != undefined )
                {
                    if ( 'css' in control )
                        for ( var c in control['css'] )
                            e.style[c] = control['css'][c];

                    if ( action != undefined )
                    {
                        e.addEventListener(action, function( event )
                        {
                            var element = event.target;

                            var actionName = action;
                            var elementId = element.id;

                            var control = self.config.controls[elementId];
                            var actionName = control.action;
                            var fn = control.bind;

                            if ( self.debug )
                                console.log('Event [' + actionName + '] trigger on [' + elementId + '] control. '
                                          + 'Executing [' + fn + '] function.');

                            if ( fn in self )
                                self[fn]( event );
                        }, false );
                    }
                }
            }
        },

        /**
         * Crea las piezas dentro del tablero inicial, colocando 4 fichas
         * predeterminadamente en el centro.
         */
        createPieces : function()
        {
            var centerCoords0 = ( ( this.config.size / 2 ) - 1 ) * this.config.sizePiece;
            var centerCoords1 = centerCoords0 + this.config.sizePiece;
            var centerImages = ['fx', 'ie', 'ie', 'fx'], centerImage = 0;

            for ( var i = 0, x = 0, y = 0, l = ( this.config.size * this.config.size ); i < l; i++ )
            {
                if ( i > 0 && i % this.config.size == 0 ) { x = 0; y += this.config.sizePiece; }

                var piece = $new('div', { id : 'pos' + i }, this.divGame);
                    piece.style.width = piece.style.height = ( this.config.sizePiece ).toString() + 'px';
                    piece.style.left = ( x ).toString() + 'px';
                    piece.style.top = ( y ).toString() + 'px';

                // console.log('( ' + x + ', ' + y + ' )');

                if ( ( y == centerCoords0 || y == centerCoords1 ) && ( x == centerCoords0 || x == centerCoords1 ) )
                    piece.style.backgroundImage = "url('img/" + centerImages[centerImage++] + ".gif');";

                x += this.config.sizePiece;
            }
        },

        /**
         * Limpia el tablero
         */
        clear : function( event )
        {
            if ( typeof event != 'undefined' )
                if ( this.running )
                    if ( !( confirm('Your game will be destroyed. Continue ?') ) )
                        return;

            if ( !( this.playing ) )
            {
                this.pause();
                this.config.controls.pause.element.value = this.config.controls.pause.text;
            }

            this.running = false;
            this.playing = false;

            this.divGame.innerHTML = '';
            this.timeEnd();
        },

        /**
         * Comienza un nuevo juego
         */
        newGame : function()
        {
            if ( this.running )
                if ( !( confirm('Your game will be restarted. Continue ?') ) )
                    return;

            this.clear();

            if ( this.debug )
                console.log('New game started. Good luck.');

            this.running = true;
            this.playing = true;

            this.createPieces();
            this.style();

            // Empieza a contar el tiempo...
            this.time();
        },

        /**
         * Pausa el juego
         */
        pause : function( event )
        {
            if ( this.running )
            {
                if ( this.playing )
                {
                    if ( typeof event != 'undefined' )
                        event.target.value = 'Resume';

                    this.playing = false;

                    if ( this.debug )
                        console.log('Game paused.');
                }
                else
                {
                    if ( typeof event != 'undefined' )
                        event.target.value = 'Pause';

                    this.playing = true;

                    if ( this.debug )
                        console.log('Game resume.');
                }
            }
        },

        /**
         * Cambia el tamano del tablero. Esta relacionado con el control size.
         */
        setSize : function( size )
        {
            if ( size instanceof Event )
                size = size.target.value;

            if ( size && !( isNaN(size) ) && size > 3 && size % 2 == 0 )
            {
                if ( this.running )
                    if ( !( confirm('Your game will be restarted. Continue ?') ) )
                        return;

                this.config.size = size;

                if ( this.config.controls.size.element )
                    this.config.controls.size.element.value = size;

                if ( this.debug )
                    console.log('Size changed; Now [' + size + '] is the new size.');

                this.newGame();
            }
            else if ( this.config.controls.size.element )
                this.config.controls.size.element.value = this.config.size;
        },

        time : function()
        {
            var self = this;

            if ( this.running && this.playing )
                this.config.controls.time.element.innerHTML = $date( ++this.seconds );

            setTimeout(function() { self.time(); }, 1000);
        },

        timeEnd : function()
        {
            this.seconds = 0;
            this.config.controls.time.element.innerHTML = this.config.controls.time.default;
        }
    };
})();