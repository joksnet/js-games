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
    jGame.Time = {
        /**
         * Numero de microsegundos al llamar a la funcion jGame.Time.init().
         */
        ticks : 0,

        /**
         * Inicializa el manejo del tiempo.
         */
        init : function()
        {
            jGame.Time.ticks = jGame.Time.now();
        },

        /**
         * Devuelve el numero en microsegundos desde que fue llamada la
         * funcion jGame.Time.init(). Antes de ser llamada, devuelve cero.
         *
         * @return int
         */
        getTicks : function()
        {
            if ( jGame.Time.ticks > 0 )
                return jGame.Time.now() - jGame.Time.ticks;
            else
                return 0;
        },

        /**
         * Devuelve los microsegundos actuales desde "Unix epoch".
         *
         * @return int
         */
        now : function()
        {
            return (new Date()).getTime();
        },

        /**
         * Genera una pausa por el numero de microsegundos dados.
         *
         * @param int millis
         */
        wait : function( millis )
        {
            var date = (new Date()).getTime();
            var dateCurrent = null;

            do { dateCurrent = (new Date()).getTime(); }
            while ( dateCurrent - date < millis );
        }
    };
})();