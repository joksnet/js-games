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
    jGame.Rect = function( top, left, width, height )
    {
        this.x = left || 0;
        this.y = top || 0;

        this.w = width || 0;
        this.h = height || 0;

        if ( jGame.Rect.options.virtualProperties )
        {
            /**
             * Si tiene activada la utilizacion de propiedades virtuales, esta
             * funcion tiene que ser llamada al finalizar de actualizar
             * cualquiera de las propiedades principales.
             */
            this.virtual = function()
            {
                this.left = this.x;
                this.top = this.y;

                this.width = this.w;
                this.height = this.h;

                this.bottom = this.top + this.height;
                this.right  = this.left + this.width;

                this.size = [this.width, this.height];

                this.centerx = parseInt(this.width / 2);
                this.centery = parseInt(this.height / 2);
                this.center  = [this.centerx, this.centery];

                this.topleft     = [this.left, this.top];
                this.topright    = [this.right, this.top];
                this.bottomleft  = [this.left, this.bottom];
                this.bottomright = [this.right, this.bottom];

                this.midtop    = [this.centerx, this.top];
                this.midleft   = [this.left, this.centery];
                this.midbottom = [this.centerx, this.bottom];
                this.midright  = [this.right, this.centery];
            };

            this.virtual();
        }
    };

    jGame.Rect.options = {
        virtualProperties : true
    };

    jGame.Rect.extend({
        x : 0, y : 0,
        w : 0, h : 0,

        /**
         * Virtual Properties
         *
         * Son propiedades que facilitan la localizacion del objeto en un eje
         * de coordenadas. Todas las propiedades virtuales son creadas a partir
         * del ancho, alto, y la posicion.
         */

        top    : 0,
        left   : 0,

        width  : 0,
        height : 0,

        botom : 0,
        right : 0,

        size : [0, 0],

        centerx : 0,
        centery : 0,
        center  : [0, 0],

        topleft     : [0, 0],
        topright    : [0, 0],
        bottomleft  : [0, 0],
        bottomright : [0, 0],

        midtop    : [0, 0],
        midleft   : [0, 0],
        midbottom : [0, 0],
        midright  : [0, 0],

        /**
         * Mueve la posicion a (x;y) en un eje de coordenadas R2. Si estan
         * habilitados las propiedades virtuales, las actualiza.
         *
         * @param int x
         * @param int y
         * @return jGame.Rect
         */
        move : function( x, y )
        {
            this.x = x;
            this.y = y;

            if ( jGame.Rect.options.virtualProperties )
                this.virtual();

            return this;
        },

        /**
         * Asigna valores de posicion horizontal.
         *
         * @param int x
         * @return jGame.Rect
         */
        setX : function( x )
        {
            this.x = x;

            if ( jGame.Rect.options.virtualProperties )
                this.virtual();

            return this;
        },

        /**
         * Asigna valores de posicion vertical.
         *
         * @param int y
         * @return jGame.Rect
         */
        setY : function( y )
        {
            this.y = y;

            if ( jGame.Rect.options.virtualProperties )
                this.virtual();

            return this;
        },

        /**
         * Suma (x;y) a la posicion actual.
         *
         * @param int x
         * @param int y
         * @return jGame.Rect
         */
        sum : function( x, y )
        {
            this.x += x;
            this.y += y;

            if ( jGame.Rect.options.virtualProperties )
                this.virtual();

            return this;
        },

        /**
         * Resta (x;y) a la posicion actual.
         *
         * @param int x
         * @param int y
         * @return jGame.Rect
         */
        sub : function( x, y )
        {
            this.x -= x;
            this.y -= y;

            if ( jGame.Rect.options.virtualProperties )
                this.virtual();

            return this;
        },

        /**
         * Devuelve True si el argumento intersecta con este.
         *
         * @param jGame.Rect rect
         * @return boolean
         */
        collide : function( rect )
        {
            return jGame.Rect.intersect(this, rect);
        }
    });

    /**
     * Devuelve True si las "rectas" A y B se cruzan.
     *
     * @param jGame.Rect A
     * @param jGame.Rect B
     * @return boolean
     */
    jGame.Rect.intersect = function( A, B )
    {
        return ( ( A.x >= B.x && A.x < B.x + B.w ) ||
                 ( B.x >= A.x && B.x < A.x + A.w ) ) &&
               ( ( A.y >= B.y && A.y < B.y + B.h ) ||
                 ( B.y >= A.y && B.y < A.y + A.h ) );
    };
})();