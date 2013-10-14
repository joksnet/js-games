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
    jGame.Math = {

        /**
         * Obtiene un nuevo al azar entre el min y el max.
         *
         * @param int min
         * @param int max
         * @return float
         */
        random : function( min, max )
        {
            var rand = Math.floor(Math.random() * ( max - min + 1 ) + min );

            if ( typeof this.random.last == 'undefined' )
                jGame.Math.random.last = null;

            if ( this.random.last == rand  )
                return jGame.Math.random( min, max );

            return ( this.random.last = rand );
        }
    };
})();