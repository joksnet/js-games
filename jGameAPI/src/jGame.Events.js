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
    jGame.Events = {

        /**
         * Asigna un evento a un elemento. Si la funcion devuelve False, se
         * cancela la propagacion del evento.
         *
         * @param element object
         * @param string type
         * @param function callback
         */
        add : function( object, type, callback )
        {
            var bind = function( event )
            {
                if ( callback.call( object, event ) === false )
                {
                    if ( event.stopPropagation )
                    {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    else
                        event.returnValue = !( event.cancelBubble = true );
                }
            };

            if ( object.addEventListener )
                object.addEventListener( type, bind, false );
            else
                object.attachEvent( 'on' + type, bind );
        },

        /**
         * Remueve el evento del objecto.
         *
         * @param element object
         * @param string type
         * @param function callback
         */
        remove : function( object, type, callback )
        {
            if ( object.detachEvent )
                object.detachEvent( 'on' + type, callback );
            else
                object.removeEventListener( type, callback, false );
        }
    };
})();