/**
 * @author Juan M Martinez <joksnet@gmail.com>
 * @license General Public License
 */
var CacoRPG;

(function()
{
    function $()
    {
        var elements = new Array();

        for ( var i = 0, l = arguments.length; i < l; i++ )
        {
            var element = arguments[i];

            if ( typeof element == 'string' )
                element = document.getElementById(element);

            if ( arguments.length == 1 )
                return element;

            elements.push(element);
        }

        return elements;
    };

    function $new( tag, properties, context )
    {
        var element = document.createElementNS('http://www.w3.org/1999/xhtml', tag);

        for ( var property in properties )
            element[property] = properties[property];

        if ( context )
            $(context).appendChild( element );

        return element;
    };

    CacoRPG = function( div )
    {
        return this instanceof CacoRPG
            ? this.__init__(div)
            : new CacoRPG(div);
    };

    CacoRPG.prototype = {

        div : null,

        __init__ : function( div )
        {
            this.div = $(div);
            this.divGame = $new('div', { className : 'Game' }, this.div);

            if ( this.debug )
                console.log('CacoRPG initialized.');

            this.running = false;
            this.playing = false;

            this.style();
        },

        style : function()
        {
            this.div.style.position = 'absolute';
            this.div.style.top = this.div.style.right = this.div.style.bottom = this.div.style.left = '10px';
            this.div.style.border = '1px solid red';
            this.div.style.backgroundColor = 'black';
        }

    };
})();