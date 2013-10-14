/*
 * jGame - JavaScript Game Library
 *
 * Copyright (c) 2008 Juan M Martinez
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Id$
 */
(function()
{
    jGame.Sprite = {
        /**
         * Almacena todas las Sprites creadas a lo largo de la ejecucion.
         */
        sprites : [],

        /**
         * Mantiene el numero de Sprites creadas.
         */
        length : 0
    };

    /**
     * Clase base para objetos visibles del juego.
     */
    jGame.Sprite.Sprite = function()
    {
        this.rect = new jGame.Rect();

        /**
         * Si no lo vacio se mantiene en el tiempo las funciones de una Sprite
         * a otra.
         */
        this.collidefn = [];
        this.collidefnLimits = [];

        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.overflow = 'hidden';

        /**
         * Eliminar esta linea, hay que hacer Superficies y agregar los Sprites
         * en una.
         */
        document.getElementsByTagName('body')[0].appendChild( this.element );

        /**
         * Almaceno la Sprite
         */
        jGame.Sprite.sprites[jGame.Sprite.length] = this;
        jGame.Sprite.length++;
    };

    jGame.Sprite.Sprite.extend({
        /**
         * Contiene el elemento del objeto.
         */
        element : null,

        /**
         * Contiene un nodo Image() de JavaScript.
         */
        image : null,

        /**
         * Contiene la informacion de su posicion y tamanio. Es una
         * instancia de jGame.Rect().
         */
        rect : null,

        /**
         * Mayor diferencia entre profundidades de Sprites para que se toquen.
         * Cuanto mas bajo sea el numero, menos pueden colisionar.
         *
         * Por ejemplo, si una Sprite esta en zIndex=10 y la otra en zIndex=15,
         * si el zIndexDiff de la esta en movimiento en de 5 o mas, van a
         * chocar.
         */
        zIndexDiff : 1000000,

        /**
         * Valor de la profundidad. Empiezan todos los Sprites en una misma
         * capa. Para cambiarlo a otra capa, solo hace falta cambiarle este
         * valor.
         */
        zIndex : 0,

        /**
         * Contiene si la Sprite fue destruida y esta libre para volver a
         * utilizarze.
         */
        destroyed : false,

        /**
         * True si el Sprite puede colisionar con otros, False de lo contrario.
         */
        collides : false,

        /**
         * Si esta en true, quiere decir que deja que otros colisionen contra
         * el. De lo contrario no es mas que un fantasta, un fondo, nadie.
         */
        collidesTo : true,

        /**
         * Coleccion con las funciones que debe ejecutar al colisionar.
         */
        collidefn : [],

        /**
         * Coleccion de funciones a ejecutar cuando colisiona contra los limites
         * establecidos.
         */
        collidefnLimits : [],

        /**
         * True si el Sprite se comporta rebotando, False de lo contrario.
         */
        bounces : false,

        /**
         * Limites. Son utilizados para limitar al Sprite a moverse en un
         * perimetro dado. Si esta en null, no es tenido en cuenta.
         */
        xmin : null, /* Limite inferior horizontal */
        xmax : null, /* Limite superior horizontal */
        ymin : null, /* Limite inferior vertical */
        ymax : null, /* Limite superior vertical */

        /**
         * Angulos
         */
        angle  : 0,
        anglex : 0, /* Angulo horizontal */
        angley : 0, /* Angulo vertical */

        /**
         * Velocidades
         */
        speed  : 0,
        speedx : 0, /* Velocidad horizontal */
        speedy : 0, /* Velocidad vertical */

        /**
         * Este es el metodo que hay que sobre-escribir, llamado en
         * la actualizacion de jGame.Sprite.Group.update().
         */
        update : function()
        {
            this.element.style.width = this.rect.w.toString() + 'px';
            this.element.style.height = this.rect.h.toString() + 'px';

            this.element.style.left = this.rect.x.toString() + 'px';
            this.element.style.top = this.rect.y.toString() + 'px';

            return this;
        },

        /**
         * Muestro el elemento.
         *
         * @return jGame.Sprite.Sprite
         */
        show : function()
        {
            this.element.style
                .visibility = 'visible';

            return this;
        },

        /**
         * Oculto el elemento.
         *
         * @return jGame.Sprite.Sprite
         */
        hide : function()
        {
            this.element.style
                .visibility = 'hidden';

            return this;
        },

        /**
         * Elimina el elemetro y lo deja libre para se ocupado por el proximo.
         *
         * @return jGame.Sprite.Sprite
         */
        destroy : function()
        {
            // this.hide();
            this.element.parentNode.removeChild( this.element );
            this.destroyed = true;

            return this;
        },

        /**
         * Asigna un evento a ejecutarse cuando la Sprite colisione contra
         * algunos de los limites impuestos.
         *
         * @param function fn
         * @return jGame.Sprite.Sprite
         */
        collideLimits : function( fn )
        {
            this.collidefnLimits.push( fn );

            return this;
        },

        /**
         * Asigna un evento a ejecutarse cuando la Sprite colisione.
         *
         * @param function fn
         * @return jGame.Sprite.Sprite
         */
        collide : function( fn )
        {
            this.collidefn.push( fn );

            return this;
        },

        /**
         * Devuelve True si esta Sprite colisiona con la pasada como parametro,
         * y False de cualquier otra manera.
         *
         * @param jGame.Sprite.Sprite sprite
         * @return boolean
         */
        collideWith : function( sprite )
        {
            if ( !( this.collides ) )
                return false;

            /**
             * No comparo si colisiona con si mismo.
             */
            if ( sprite == this )
                return false;

            /**
             * Tampoco lo comparo contra los Sprites destruidos.
             */
            if ( sprite.destroyed )
                return false;

            /**
             * Hay que ver si la otra Sprite se deja ser colisionada.
             */
            if ( !( sprite.collidesTo ) )
                return false;

            /**
             * La profundidad entre ambos Sprites tiene que ser menor a la
             * mayor diferencia que puede tener.
             */
            if ( Math.abs( sprite.zIndex - this.zIndex ) > this.zIndexDiff )
                return false;

            var isCollide = this.rect.collide(sprite.rect);

            /**
             * Si colisiona, llamo a todas las funciones, pasandole como
             * parametro this esta misma Sprite, y como primer argumento contra
             * la cual colisiono.
             */
            if ( isCollide )
            {
                for ( var i = 0, l = this.collidefn.length; i < l; i++ )
                {
                    this.collidefn[i].call(this, sprite);
                }
            }

            return isCollide;
        },

        /**
         * Verifica si el Sprite en cuestion colisiona con alguno de todos los
         * demas Sprites creados hasta el momento.
         *
         * @return list
         */
        collideGlobal : function()
        {
            if ( !( this.collides ) )
                return [];

            var crashed = [];

            for ( var i = 0; i < jGame.Sprite.length; i++ )
            {
                var current = jGame.Sprite.sprites[i];

                if ( this.collideWith(current) )
                    crashed.push(current);
            }

            return crashed;
        },

        /**
         * Retorna una lista de Sprites del grupo pasado como parametro, que
         * colisionan con este Sprite.
         *
         * @param jGame.Sprite.Group group
         * @return list
         */
        collideGroup : function( group )
        {
            if ( !( this.collides ) )
                return [];

            var crashed = [];

            group.each(function( current )
            {
                if ( this.collideWith(current) )
                    crashed.push(current);
            });

            return crashed;
        },

        /**
         * Mueve el elemento a la posicion dada. Si dicha posicion sobrepasa
         * los limites, es posicionado sobre el perimetro.
         *
         * @param int x
         * @param int y
         * @return jGame.Sprite.Sprite
         */
        move : function( x, y )
        {
            if ( this.xmax && x > this.xmax - this.rect.w )
                x = this.xmax - this.rect.w;
            else if ( this.xmin && x < this.xmin )
                x = this.xmin;

            if ( this.ymax && y > this.ymax - this.rect.h )
                y = this.ymax - this.rect.h;
            else if ( this.ymin && y < this.ymin )
                y = this.ymin;

            this.rect.move(x, y);

            if ( this.collides )
                this.collideGlobal();

            return this;
        },

        /**
         * Asigna los limites horizontales y verticales de la Sprite.
         *
         * @param list xlimit
         * @param list ylimit
         * @return jGame.Sprite.Sprite
         */
        setLimits : function( xlimit, ylimit )
        {
            this.xmin = xlimit[0];
            this.xmax = xlimit[1];

            this.ymin = ylimit[0];
            this.ymax = ylimit[1];

            if ( this.rect.x < this.xmin )
                this.setX( this.xmin );
            else if ( this.rect.x + this.rect.w > this.xmax )
                this.setX( this.xmax );

            if ( this.rect.y < this.ymin )
                this.setY( this.ymin );
            else if ( this.rect.y + this.rect.h > this.ymax )
                this.setY( this.ymax );

            return this;
        },

        /**
         * Asgina el angulo horizontal y vetical.
         *
         * @param int x
         * @param int y
         * @return jGame.Sprite.Sprite
         */
        setDirection : function( x, y )
        {
            this.angle = -1;
            this.anglex = x;
            this.angley = y;

            this.speedx = this.anglex * this.speed;
            this.speedy = this.angley * this.speed;

            return this;
        },

        /**
         * Asigna un angulo radial del objeto.
         *
         * @param int angle
         * @return jGame.Sprite.Sprite
         */
        setAngle : function( angle )
        {
            var a = ( angle % 360 );

            if ( a < 0 )
                a = 360 + a;

            this.angle = a;
            this.anglex = ( Math.sin(Math.PI * a / 180 ) );
            this.angley = ( Math.cos(Math.PI * a / 180 ) );

            this.speedx = this.anglex * this.speed;
            this.speedy = this.angley * this.speed;

            return this;
        },

        /**
         * Velocidad de movimiento. Si esta se le pasa cero, el Sprite no se
         * mueve.
         *
         * @param int speed
         * @return jGame.Sprite.Sprite
         */
        setSpeed : function( speed )
        {
            this.speed = speed;
            this.speedx = this.anglex * speed;
            this.speedy = this.angley * speed;

            return this;
        },

        /**
         * Cargo y muestro la imagen en el elemento del Sprite.
         *
         * @param string src
         * @param list size
         * @return jGame.Sprite.Sprite
         */
        setImage : function( src, size )
        {
            /**
             * Cargo la imagen.
             */
            this.image = jGame.Image.load(src);

            if ( size )
            {
                this.rect.w = size[0];
                this.rect.h = size[1];
            }

            /**
             * Seteo la imagen en el elemento.
             */
            this.element.style.backgroundImage = 'url(' + this.image.src + ')';
            this.element.style.backgroundRepeat = 'no-repeat';

            /**
             * Esto se seteara en el proximo update() si es necesario.
             *
             * this.element.style.width = this.rect.w.toString() + 'px';
             * this.element.style.height = this.rect.h.toString() + 'px';
             */

            return this;
        },

        toString : function()
        {
            return '<Sprite>';
        }
    });

    /**
     * Extiende el uso del Sprite para poder utilizar frames.
     */
    jGame.Sprite.SpriteTile = function( src, size, frames )
    {
        /**
         * Llamo al constructor del parent
         */
        jGame.Sprite.SpriteTile.parentConstructor.call(this);

        this.setImage(src, size);
        this.frames = frames;
    };

    jGame.Sprite.SpriteTile.extend({
        /**
         * Frame seleccionado
         */
        frame : [0, 0],

        /**
         * Cantidad de frames que tiene la animacion, tanto en forma horizontal
         * como vertical.
         */
        frames : [1, 1],

        /**
         * Muestra el frame (x;y)
         *
         * @param int x
         * @param int y
         * @return jGame.Sprite.SpriteTile
         */
        setFrame : function( x, y )
        {
            if ( x > this.frames[0] ) x = 0;
            if ( y > this.frames[1] ) y = 0;

            this.frame = [x, y];
            this.element.style.backgroundPosition = '-' + ( x * this.rect.w ).toString() + 'px '
                                                  + '-' + ( y * this.rect.h ).toString() + 'px';

            return this;
        },

        toString : function()
        {
            return '<SpriteTile>';
        }
    }, jGame.Sprite.Sprite);

    /**
     * Sprite utilizada para hace animaciones en base a una SpriteTile con todos
     * los frames.
     */
    jGame.Sprite.SpriteAnimation = function( src, size, frames )
    {
        /**
         * Llamo al constructor de jGame.Sprite.SpriteTile
         */
        jGame.Sprite.SpriteAnimation.parentConstructor.call(this, src, size, frames);
    };

    jGame.Sprite.SpriteAnimation.extend({
        /**
         * Animacion actual en proceso
         */
        animation : null,

        /**
         * Cantidad de veces a repetir la animacion actual
         */
        animationTimes : -1,

        /**
         * Cantidad de veces que ya se repitio la animacion actual
         */
        animationTimesCurrent : 0,

        /**
         * Cuando se termine de ejecutar la animacion actual, si esta funcion
         * esta seteada se ejecuta.
         */
        animationStop : null,

        /**
         * Listado de animaciones activas, teniendo el nombre como key.
         */
        animations : {},

        /**
         * Agrega una animacion nueva asignandole un nombre, un serie de
         * frames entre los que tiene que reproducir la animacion, y los tiempos
         * entre dichos frames.
         *
         * @param string name
         * @param list frames
         * @param list time
         * @return jGame.Sprite.SpriteAnimation
         */
        appendAnimation : function( name, frames, times )
        {
            this.animations[name] = {
                frames  : [],
                length  : frames.length,
                current : 0
            };

            for ( var i in frames )
            {
                this.animations[name].frames.push({
                    frame : frames[i],
                    time  : ( times && times[i] ) ? times[i] : 50,

                    /**
                     * Para practicidad los agrego individualmente.
                     */
                    x : frames[i][0],
                    y : frames[i][1]
                });
            }

            return this;
        },

        /**
         * Ejecuta una animacion la cantidad de veces pasadas en el segundo
         * parametro. Si se le pasa -1 (que es el default), se reproduce para
         * siempre.
         *
         * @param string name
         * @param optional int times
         * @return jGame.Sprite.SpriteAnimation
         */
        animate : function( name, times )
        {
            this.animation = name;
            this.animationTimes = times || -1;
            this.animationTimesCurrent = 0;
            this.animateLoop();

            return this;
        },

        /**
         * Bucle principal encargado de reproducir la animacion.
         */
        animateLoop : function()
        {
            if ( !( this.animation ) )
                return;

            this.animationTimesCurrent++;

            var animation = this.animations[this.animation];
            var self = this;

            this.setFrame(
                animation.frames[animation.current].x,
                animation.frames[animation.current].y
            );

            if ( this.animationTimes != -1 && ( this.animationTimesCurrent - 1 ) / animation.length >= this.animationTimes )
                return this.animateStop();

            setTimeout(function()
            {
                self.animateLoop.call(self);
            }, animation.frames[animation.current].time);

            animation.current++;

            if ( animation.current >= animation.length )
                animation.current = 0;
        },

        /**
         * Si no se le pasa el argunmento fn, para la actual animacion
         * ejecutando el evento correspondiente. De lo contrario setea la
         * funcion a ser llamada cuando el evento actual, o siguiente si es que
         * no hay ninguno ejecutandose, finalice.
         *
         * @param optional function fn
         * @return jGame.Sprite.SpriteAnimation
         */
        animateStop : function( fn )
        {
            if ( fn )
                this.animationStop = fn;
            else
            {
                this.animations[this.animation].current = 0;

                this.animation = null;
                this.animationTimes = -1;
                this.animationTimesCurrent = 0;

                if ( this.animationStop )
                    this.animationStop.call(this);

                this.animationStop = null;
            }

            return this;
        },

        toString : function()
        {
            return '<SpriteAnimation>';
        }
    }, jGame.Sprite.SpriteTile);

    /**
     * Contenedor para muchas jGame.Sprite.Sprite.
     *
     * @param list sprites
     */
    jGame.Sprite.Group = function( sprites )
    {
        if ( sprites )
            this.add(sprites);
    };

    jGame.Sprite.Group.extend({
        /**
         * Lista con todos los jGame.Sprite.Sprite de este grupo.
         */
        sprites : [],

        /**
         * Agrega varios Sprites a la coleccion.
         *
         * @param list sprites
         * @return jGame.Sprite.Group
         */
        add : function( sprites )
        {
            for ( var sprite in sprites )
                if ( !( this.has(sprites[sprite]) ) )
                    this.sprites.push(sprites[sprite]);

            return this;
        },

        /**
         * Remueve varios Sprites de la coleccion.
         *
         * @param list sprites
         * @return jGame.Sprite.Group
         */
        remove : function( sprites )
        {
            for ( var sprite in this.sprites )
                for ( var toRemove in sprites )
                    if ( sprites[toRemove] === this.sprites[sprite] )
                        this.sprites[sprite] = null;

            return this;
        },

        /**
         * Dado un Sprite, devuelve True si existe en la coleccion.
         * False otra manera.
         *
         * @param jGame.Sprite.Sprite sprite
         * @return boolean
         */
        has : function( sprite )
        {
            for ( var sprite in this.sprites )
                if ( sprite === this.sprites[sprite] )
                    return true;

            return false;
        },

        /**
         * Acutaliza todos los Sprites del grupo a la vez.
         *
         * @return jGame.Sprite.Group
         */
        update : function()
        {
            //for ( var sprite in this.sprites )
            //    sprite.update();

            this.each(function( s )
            {
                s.update();
            });

            return this;
        },

        /**
         * Vacia el grupo.
         *
         * @return jGame.Sprite.Group
         */
        empty : function()
        {
            if ( this.sprites )
                this.sprites = [];

            return this;
        },

        toString : function()
        {
            return '<Sprite Group (' + this.sprites.length + ')>';
        },

        /**
         * Ejecuta la funcion argumento por cada Sprite en el grupo.
         *
         * @param function fn
         * @return jGame.Sprite.Group
         */
        each : function( fn )
        {
            var i = 0, length = this.sprites.length;

            for ( var value = this.sprites[0];
                i < length && fn.call( this, value, i ) !== false; value = this.sprites[++i] ) {}

            return this;
        },

        /**
         * Devuelve el primer Sprite en el grupo.
         *
         * @return jGame.Sprite.Sprite
         */
        first : function()
        {
            if ( this.sprites.length > 0 )
                return this.sprites[0];
            else
                return false;
        },

        /**
         * Devuelve el ultimo Sprite en el grupo.
         *
         * @return jGame.Sprite.Sprite
         */
        last : function()
        {
            if ( this.sprites.length > 0 )
                return this.sprites[this.sprites.length - 1];
            else
                return false;
        }
    });
})();