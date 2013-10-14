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
    jGame.Keyboard = {

        /**
         * Lista de teclas para chequear cuando se presionan.
         */
        keys : {},

        /**
         * La ultima tecla presionada.
         */
        last : -1,

        /**
         * El caracter representativo de la ultima tecla presionada.
         */
        lastKey : null,

        /**
         * Almacena el historial de teclas presionadas.
         */
        history : [],

        /**
         * Diferentes opciones.
         */
        options : {

            /**
             * Habilita o deshabilita el historial de teclas.
             */
            history : false,

            /**
             * Setea en que evento se ejecuta los callback.
             */
            callTrigger : 'up'
        },

        /**
         * Inicializa la utilizacion del teclado.
         */
        init : function()
        {
            jGame.Events.add(document, 'keyup', function( event ) { jGame.Keyboard.keyEvent( 'up', event ); });
            jGame.Events.add(document, 'keydown', function( event ) { jGame.Keyboard.keyEvent( 'down', event ); });
        },

        /**
         * Agrega una tecla a la mira y llama a la funcion callback cuando dicha
         * tecla se presione. El parametro de la funcion es opcional. Si se le
         * pasa un array como primer parametro, devuelve un diccionario con cada
         * instancia.
         *
         * @param int key
         * @param function callback
         * @return jGame.Keyboard.Key
         */
        add : function( key, callback )
        {
            if ( key.constructor == Array )
            {
                var keys = {};

                for ( var i in key )
                    keys[key[i]] = this.keys[key[i]] = new jGame.Keyboard.Key(key[i], callback);

                return keys;
            }
            else
            {
                return this.keys[key] = new jGame.Keyboard.Key(key, callback);
            }
        },

        /**
         * Remueve la tecla de la lista en la mira.
         *
         * @param int key
         */
        remove : function( key )
        {
            if ( key in this.keys )
                delete this.keys[key];
        },

        /**
         * Devuelve la tecla presionada en el evento.
         *
         * @param event event
         * @return int
         */
        getKey : function( event )
        {
            return ( event.which ) ? event.which : event.keyCode;
        },

        /**
         * Verifica si la tecla presionada esta en la mira, y llama a la funcion
         * de evento de dicha tecla.
         *
         * @param event event
         */
        keyEvent : function( type, event )
        {
            var keyCode = this.getKey(event);
            var key = String.fromCharCode(keyCode).toLowerCase();

            if ( keyCode in this.keys )
            {
                if ( this.options.history && type == 'down' )
                    this.history.unshift( keyCode );

                this.last    = keyCode;
                this.lastKey = key;

                this.keys[keyCode].pressed = ( type == 'down' );

                if ( type == this.options.callTrigger )
                    this.keys[keyCode].keyEvent( event );
            }
        }
    };

    /**
     * Cada tecla en la mira.
     *
     * @param int key
     * @param function callback
     */
    jGame.Keyboard.Key = function( key, callback )
    {
        this.key = key;
        this.callback = callback;
    };

    jGame.Keyboard.Key.extend({

        /**
         * La tecla en la mira.
         */
        key : -1,

        /**
         * Funcion para llamar cada vez que se presiona esta tecla.
         */
        callback : null,

        /**
         * El ulitmo evento ocurrido.
         */
        event : null,

        /**
         * Almacena si la tecla se encuentra presionada.
         */
        pressed : false,

        /**
         * Se ejecuta cuando la tecla en cuestion es presionada, se llama a su
         * funcion callback.
         *
         * @param event event
         * @return jGame.Keyboard.Key
         */
        keyEvent : function( event )
        {
            this.event = event;

            if ( this.callback )
                this.callback.call(this, event);

            return this;
        },

        /**
         * Devuelve si la tecla se encuentra presionada.
         *
         * @return boolean;
         */
        isPressed : function()
        {
            return this.pressed;
        }
    });
})();