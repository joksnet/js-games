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
    var userAgent = navigator.userAgent.toLowerCase();

    jGame.Browser = {
        /**
         * Version del Navegador
         */
        version : ( userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [] )[1],

        /**
         * True si es el Navegador actual, False de la contrario.
         */
        safari  : /webkit/.test( userAgent ),
        opera   : /opera/.test( userAgent ),
        msie    : /msie/.test( userAgent ) && !( /opera/.test( userAgent ) ),
        mozilla : /mozilla/.test( userAgent ) && !( /(compatible|webkit)/.test( userAgent ) )
    };
})();