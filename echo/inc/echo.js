(function() {
/**
 * echo joksnet
 * Copyright (C) 2008 Juan M Martinez
 * http://bundleweb.com.ar
 */

Game = function( id )
{
    return this instanceof Game
        ? this.init(id)
        : new Game(id);
}

Game.prototype = {

    /**
     * Contiene el div principal en donde se dibuja el juego.
     *
     * @var element
     */
    div : null,

    /**
     * Contiene la imagen que va a ir cambiando para ir jugando.
     *
     * @var element
     */
    img : null,

    /**
     * Constructor
     */
    init : function( id )
    {
        this.img = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');
        this.img.src = 'img/SimonBaseLow.png';
        this.img.alt = '';

        this.div = document.getElementById(id);
        this.div.appendChild(this.img);

        this.createMap();
    },

    createMap : function()
    {
        var areaGreen = document.createElementNS('http://www.w3.org/1999/xhtml', 'area');
            areaGreen.shape = 'polygon';
            areaGreen.coords = '195,5,195,100,185,100,145,115,120,135,105,160,100,185,100,195,5,195,5,185,15,135,40,85,70,50,115,20,160,10,195,5';
            areaGreen.href = 'http://google.com/';

        var map = document.createElementNS('http://www.w3.org/1999/xhtml', 'map');
            map.id = 'game';
            map.name = 'game';
            map.appendChild(areaGreen);

        this.img.setAttribute('usemap', '#game');
        this.div.appendChild(map);
    }
};

})();