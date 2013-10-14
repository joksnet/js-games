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
    if ( window.jGame )
        _jGame = window.jGame;

    jGame = {
        /**
         * Numero de version de la libreria. Netamente a fin informativo.
         */
        version : '0.1',

        /**
         * Lista con las funciones en la mira que seran llamadas en cada vuelta
         * del bucle principal.
         */
        hooked : [],

        /**
         * Esta en true cuando el juego esta corriendo. Puede ser utilizado
         * para aplicar una pausa.
         */
        running : false,

        /**
         * Tiene un numero de intervalo devuelto por la funcion setTimeout(),
         * con este se puede para el bucle en cualquier momento.
         */
        interval : null,

        /**
         * Velocidad entre cada vuelta. La predeterminada es 40.
         */
        speed : 40,

        /**
         * Opciones generales
         */
        options : {

            /**
             * Si automaticamente se actualiza cada Sprite en el juego.
             */
            autoUpdate : true
        },

        /**
         * Instancia los elementos de la libreria.
         */
        init : function()
        {
            jGame.Time.init();
            jGame.Keyboard.init();
        },

        /**
         * Agrega a la mira una funcion. Esta funcion va ser llamada en cada
         * vuelta del bucle principal.
         *
         * @param function fn
         */
        hook : function( fn )
        {
            jGame.hooked[jGame.hooked.length] = fn;
        },

        /**
         * Quita de la mira una funcion agregada por jGame.hook(). Corre todos
         * los indices siguientes para atras.
         *
         * @param function fn
         */
        unhook : function( fn )
        {
            var found = false;

            for ( var i = 0, l = jGame.hooked.length; i < l; i++ )
            {
                if ( jGame.hooked[i] == fn )
                {
                    found = true;
                }
            }

            if ( found )
            {
                for ( var n = i; n < l - 1; n++ )
                {
                    jGame.hooked[n] = jGame.hooked[n + 1];
                    jGame.hooked.length--;
                }
            }
        },

        /**
         * Empieza la funcion!
         */
        start : function()
        {
            if ( !( this.running ) )
                jGame.running = true;

            jGame.loop();
        },

        /**
         * Para el bucle principal.
         */
        stop : function()
        {
            jGame.running = false;
        },

        /**
         * Modifica una opcion de jGame.
         *
         * @param string name
         * @param mixed value
         */
        set : function( name, value )
        {
            this.options[name] = value;
        },

        /**
         * Devuelve el valor de una opcion de jGame.
         *
         * @param string name
         * @return mixed
         */
        get : function( name )
        {
            if ( name in this.options )
                return this.options[name];

            return null;
        },

        /**
         * Bucle principal.
         */
        loop : function()
        {
            if ( !( jGame.running ) )
                return;

            /**
             * Vuelvo a llamar a esta misma funcion, haciendola recursiva.
             */
            self.inteval = setTimeout(function() { jGame.loop(); }, this.speed);

            for ( var i = 0; i < jGame.Sprite.length; i++ )
            {
                var sp = jGame.Sprite.sprites[i];

                /**
                 * No lo tengo en cuenta si esta destruido.
                 */
                if ( sp.destroyed )
                    continue;

                {
                    /**
                     * Muevo el elemento.
                     */
                    sp.rect.sum( sp.speedx, sp.speedy );
                }

                /**
                 * Solo si se movio de su posicion anterior.
                 */
                if ( ( sp.rect.x != sp.cx ) || ( sp.rect.y != sp.cy ) )
                {
                    var collidesLimitAny = false;
                    var collidesLimit = { xmin : false, xmax : false, ymin : false, ymax : false };

                    sp.cx = sp.rect.x;
                    sp.cy = sp.rect.y;

                    if ( ( sp.rect.x + sp.rect.w > sp.xmax ) && sp.anglex > 0 )
                    {
                        if ( sp.bounces )
                            sp.setDirection(-sp.anglex, sp.angley);
                        else
                        {
                            sp.rect.setX( sp.xmax - sp.rect.w );
                            sp.setDirection(0, sp.angley);
                        }

                        collidesLimitAny = true;
                        collidesLimit['xmax'] = true;
                    }
                    else if ( sp.rect.x <= sp.xmin && sp.anglex < 0 )
                    {
                        if ( sp.bounces )
                            sp.setDirection(-sp.anglex, sp.angley);
                        else
                        {
                            sp.rect.setX( sp.xmin );
                            sp.setDirection(0, sp.angley);
                        }

                        collidesLimitAny = true;
                        collidesLimit['xmin'] = true;
                    }

                    if ( ( sp.rect.y + sp.rect.h > sp.ymax ) && sp.angley > 0 )
                    {
                        if ( sp.bounces )
                            sp.setDirection(sp.anglex, -sp.angley);
                        else
                        {
                            sp.rect.setY( sp.ymax - sp.rect.h );
                            sp.setDirection(sp.anglex, 0);
                        }

                        collidesLimitAny = true;
                        collidesLimit['ymax'] = true;
                    }
                    else if ( sp.rect.y <= sp.ymin && sp.angley < 0 )
                    {
                        if ( sp.bounces )
                            sp.setDirection(sp.anglex, -sp.angley);
                        else
                        {
                            sp.rect.setY( sp.ymin );
                            sp.setDirection(sp.anglex, 0);
                        }

                        collidesLimitAny = true;
                        collidesLimit['ymin'] = true;
                    }

                    if ( collidesLimitAny )
                    {
                        for ( var i = 0, l = sp.collidefnLimits.length; i < l; i++ )
                        {
                            sp.collidefnLimits[i].call(sp, collidesLimit);
                        }
                    }
                }

                /**
                 * Si esta Sprite puede colisionar con otras, verifico la
                 * colision con todas las demas y ejecuto los correspondientes
                 * eventos.
                 */
                if ( sp.collides )
                    sp.collideGlobal();

                if ( this.options.autoUpdate )
                {
                    /**
                     * Actualizo el Sprite. Por default unicamente la posicion,
                     * pero si se hereda, quien sabe.
                     */
                    sp.update();
                }
            }

            /**
             * Llamamos a todas las funciones que pidieron ser llamadas en el
             * bucle principal.
             */
            for ( var i = 0, l = jGame.hooked.length; i < l; i++ )
            {
                jGame.hooked[i].call(jGame);
            }
        },

        /**
         * Asigna la velocidad de cada vuelta.
         *
         * @param int speed
         */
        setSpeed : function( speed )
        {
            this.speed = speed;
        }
    };

    /**
     * Extiende todas las funciones. Utilizada para poder extender una "Clase"
     * de otra. Le copia el constructor en parentConstructor y toda la
     * definicion en parent. Asi como tambien le copia todas las propiedades
     * y metodos.
     *
     * @param dictionary definition
     * @param optional function baseClass
     */
    Function.prototype.extend = function( definition, baseClass )
    {
        var inheritance = function() {};

        if ( baseClass )
            inheritance.prototype = baseClass.prototype;

        this.prototype = new inheritance();
        this.prototype.constructor = this;

        // for ( var property in baseClass.prototype )
        //     this.prototype[property] = baseClass.prototype[property];

        for ( var property in definition )
            this.prototype[property] = definition[property];

        if ( baseClass )
        {
            this.parent = baseClass.prototype;
            this.parentConstructor = baseClass;
        }
    };
})();