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
    jGame.Image = {
        /**
         * Mantiene cache de todas las imagenes cargadas.
         */
        images : [],

        /**
         * Cantidad de imagenes cargadas.
         */
        length : 0,

        /**
         * Precarga una imagen. Si la imagen ya fue cargada, devuelve la
         * primera.
         *
         * @param string src
         * @return Image
         */
        load : function( src )
        {
            for ( var i = 0; i < jGame.Image.length; i++ )
            {
                if ( jGame.Image.images[i].src == src )
                {
                    return jGame.Image.images[i];
                }
            }

            jGame.Image.images[jGame.Image.length] = new Image();
            jGame.Image.images[jGame.Image.length].src = src;

            return jGame.Image.images[jGame.Image.length];
        }
    };
})();