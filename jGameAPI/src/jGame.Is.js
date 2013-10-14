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
    jGame.Is = {
        /**
         * Devuelve true si value esta vacio.
         */
        empty : function( value )
        {
            return value === null || value === undefined || value === '';
        },

        /**
         * Devuelve true si value es una matriz.
         */
        array : function( value )
        {
            return value && typeof value.length == 'number' && typeof value.splice == 'function';
        },

        /**
         * Devuelve true si value es una fecha.
         */
        date : function( value )
        {
            return value && typeof value.getFullYear == 'function';
        }
    };
})();