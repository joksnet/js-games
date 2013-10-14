/**
 * Puzzle Game Ajax.
 *
 * @author Juan Manuel Martinez <joksnet@gmail.com>
 * @date 2007-11-28
 */
(function(){

jPuzzle15.Ajax = function( url, parameters, events, options )
{
    return ( this instanceof jPuzzle15.Ajax )
        ? this.__init__(url, parameters, events, options)
        : new jPuzzle15.Ajax(url, parameters, events, options);
}

jPuzzle15.Ajax.prototype.extend = jPuzzle15.Ajax.extend = jPuzzle15.extend;

jPuzzle15.Ajax.prototype.extend({
    __init__ : function( url, parameters, events, options )
    {
        this.headers = { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/javascript, text/html, application/json, application/xml, text/xml, */*' }
        this.options = {
            'url'          : url,
            'parameters'   : parameters,
            'events'       : events,
            'method'       : 'post',
            'asynchronous' : true,
            'contentType'  : 'application/x-www-form-urlencoded',
            'encoding'     : 'utf-8',
            'responseType' : 'json'
        }
        this.events = {
            'onUninitialized' : function() {},
            'onLoading'       : function() {},
            'onLoaded'        : function() {},
            'onInteractive'   : function() {},
            'onComplete'      : function() {},
            'onError'         : function() {}
        }

        this.url = url;
        this.parameters = parameters;
        this.transport = jPuzzle15.Ajax.getTransport();
        this.responses = { 'text' : null, 'xml' : null, 'json' : null };
        this.complete = false;

        for ( var property in options )
            this.options[property] = options[property];

        for ( var property in events )
            this.events[property] = events[property];
    },

    setHeader    : function( name, value ) { this.headers[name] = value; return this; },
    setOption    : function( name, value ) { this.options[name] = value; return this; },
    setParameter : function( name, value ) { this.parameters[name] = value; return this; },
    setEvent     : function( name, value ) { this.events[name] = value; return this; },

    request : function()
    {
        var params = jPuzzle15.Ajax.toQueryString(this.parameters);

        if ( this.options.method == 'get' )
            this.url += ( this.url.test('?') ? '&' : '?' ) + params;
        else if ( /Konqueror|Safari|KHTML/.test(navigator.userAgent) )
            params += '&_=';

        try {
            var $this = this;

            this.transport.open(
                this.options.method.toUpperCase(),
                this.url,
                this.options.asynchronous
            );

            this.transport.onreadystatechange = function()
            {
                var readyState = -1;

                try {
                    readyState = $this.transport.readyState;
                }
                catch ( e ) {}

                if ( readyState > jPuzzle15.Ajax.XML_READY_STATE_LOADING )
                {
                    var events = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
                    var state = events[readyState];

                    switch ( readyState )
                    {
                        case jPuzzle15.Ajax.XML_READY_STATE_COMPLETED:
                            $this.complete = true;

                            $this.responses.text = $this.transport.responseText;
                            $this.responses.xml = $this.transport.responseXML;
                            $this.responses.json = (function ()
                            {
                                try {
                                    return ( $this.getHeader('Content-Type').search('json') )
                                        ? eval('(' + $this.transport.responseText + ')')
                                        : null;
                                }
                                catch ( e ) { return null; }
                            })();

                            $this.events['onComplete']($this.responses[$this.options.responseType]);
                            $this.transport.onreadystatechange = function() {}
                            break;
                        default:
                            $this.events['on' + state]();
                            break;
                    }
                }
            };
            this.requestHeaders();

            this.body = ( this.options.method == 'post' ) ? ( this.options.postBody || params ) : null;
            this.transport.send(this.body);
        }
        catch ( e ) {}

        return this;
    },

    requestHeaders : function()
    {
        if ( this.options.method == 'post' )
        {
            this.headers['Content-type'] = this.options.contentType +
                ( this.options.encoding ? '; charset=' + this.options.encoding : '' );
        }

        for ( var name in this.headers )
            this.transport.setRequestHeader(name, this.headers[name]);

        return this;
    },

    getHeader : function( name )
    {
        try {
            return this.transport.getResponseHeader(name);
        }
        catch ( e ) { return null; }
    }
});

jPuzzle15.Ajax.extend({
    XML_READY_STATE_UNINITIALIZED : 0,
    XML_READY_STATE_LOADING       : 1,
    XML_READY_STATE_LOADED        : 2,
    XML_READY_STATE_INTERACTIVE   : 3,
    XML_READY_STATE_COMPLETED     : 4,

    getTransport : function()
    {
        var transport = null;
        var ACTIVE_X_IE_CANDIDATES = [
            "MSXML2.xmlHttpObject.5.0",
            "MSXML2.xmlHttpObject.4.0",
            "MSXML2.xmlHttpObject.3.0",
            "MSXML2.XMLHTTP",
            "MICROSOFT.xmlHttpObject.1.0",
            "MICROSOFT.xmlHttpObject.1",
            "MICROSOFT.XMLHTTP"
        ]

        if ( typeof XMLHttpRequest != 'undefined' )
            transport = new XMLHttpRequest();
        else if ( typeof ActiveXObject != 'undefined' )
        {
            for ( var i = 0; i < ACTIVE_X_IE_CANDIDATES.length; i++ )
            {
                var candidate = ACTIVE_X_IE_CANDIDATES[i];

                try {
                    transport = new ActiveXObject(candidate);
                    break;
                }
                catch ( e ) {}
            }
        }

        return transport;
    },

    toQueryString : function( source )
    {
        var queryString = [];

        for ( var property in source )
        {
            queryString.push(
                  encodeURIComponent(property) + '='
                + encodeURIComponent(source[property])
            );
        }

        return queryString.join('&');
    }
});

})();