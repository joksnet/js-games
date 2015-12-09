/*!
 * Electric Goat
 */

var G = {};

// {{{
G.Main = function(id, name) {
	this.element = document.getElementById(id);
	this.name = name || window.location.search.substr(1) || 'electric-goat';

	this.element.querySelector('h1').innerHTML = this.name;

	this.timer = new G.Timer(this.element.querySelector('.time'));

	this.parser = new G.Parser();
	this.writer = new G.Typewriter(this.element.querySelector('.history'));
	this.comder = new G.Comder(this, this);

	this.inventory = new G.Inventory(this.element.querySelector('.inventory'));
	this.actionbox = new G.ActionBox(this.element.querySelector('.actions'));

	this.load('intro');
};

G.Main.prototype.clear = function() {
	this.timer.clear();
	this.writer.clear();
	this.actionbox.clear();
};

G.Main.prototype.load = function(scene) {
	function _load(source) {
		var result = this.parser.parse(source);

		this.clear();
		this.writer.write(result[0]);
		this.comder.execAST(result[1]);
	}

	(new G.File(this.name + '/' + scene)).load(_load.bind(this));
};

G.Main.prototype.item = function(name, value) {
	this.inventory.set(name, value);
};

G.Main.prototype.iteminc = function(name, value) {
	this.inventory.inc(name, value);
};

G.Main.prototype.action = function(name, time, action) {
	var args = Array.slice(arguments, 3);

	function _action() {
		if (typeof action === 'function') {
			this.comder.execFn(action, args);
		} else {
			this.comder.exec(action, args);
		}
	}

	function _progress() {
		function _tick(tick) {
			this.actionbox.progress(name, time - tick, time);
		}

		this.timer.add(time, _tick.bind(this), _action.bind(this));
	};

	if (time === 0) {
		this.actionbox.add(name, _action.bind(this));
	} else {
		this.actionbox.add(name, _progress.bind(this));
	}
};

G.Main.prototype.actioncond = function(cond, name, time, action) {
	var items = this.parser.parseCond(cond),
	    args = Array.slice(arguments, 4);

	function _action() {
		for (item in items) {
			this.comder.exec('iteminc', [item, items[item] * -1]);
		}
		this.comder.exec(action, args);

		if (!this.inventory.hasItems(items)) {
			this.actionbox.remove(name);
		}
	}

	if (this.inventory.hasItems(items)) {
		this.action(name, time, _action.bind(this));
	};
};

G.Main.prototype.chance = function(prob, action) {
	var args = Array.slice(arguments, 2),
	    rand = Math.floor(Math.random() * 100);

	if (rand < prob) {
		this.comder.exec(action, args);
	};
};
// }}}

// {{{
G.Timer = function(element, speed) {
	this.element = element;
	this.element.innerHTML = '0:00';

	this.hooks = [];

	this.time = 0;
	this.speed = speed || 1000;
	this.interval = setInterval(G.Timer.prototype.tick.bind(this), this.speed);
};

G.Timer.prototype.add = function(ticks, tick, end) {
	this.hooks.push([ticks, tick, end]);
};

G.Timer.prototype.clear = function() {
	this.hooks = [];
};

G.Timer.prototype.tick = function() {
	this.time++;

	this.hooks.forEach(function(hook, index, hooks) {
		hook[1](
			hook[0] // ticks restantes
		);

		if (hook[0]-- === 0) {
			hook[2]();

			delete hooks[index]; // hay que usar delete en vez de hacer
			                     // `hooks.pop(index)` porque si se presionan
			                     // dos acciones al mismo tiempo, va a quedar
			                     // el mismo indice.
		}
	});

	this.element.innerHTML = this.format();
};

G.Timer.prototype.format = function() {
	var maj = Math.floor(this.time / 60),
	    min = this.time - (maj * 60);

	if (min < 10) {
		min = '0' + min.toString();
	}

	return maj.toString() + ':' + min.toString();
};
// }}}

// {{{
G.File = function(name) {
	this.name = name;
	this.text = null;
};

G.File.prototype.load = function(callback) {
	if (this.text !== null) {
		callback(this.text);
		return;
	}

	var xhr;

	function _load() {
		if (xhr.status === 200) {
			callback(this.text = xhr.responseText);
		} else {
			callback(xhr.statusText);
		}
	}

	xhr = new XMLHttpRequest();
	xhr.onload = _load.bind(this);
	xhr.open('GET', 'src/' + this.name + '.txt');
	xhr.send();
};
// }}}

// {{{
G.Parser = function() {
	this.regexp = /<([a-z]+)(?: (.*?))?>/gm;
};

G.Parser.prototype.lex = function(source) {
	var matches, ast = [], args;

	while (matches = this.regexp.exec(source)) {
		args = matches[2];
		if (args !== undefined) {
			args = this.lexArgs(args);
		}
		ast.push([matches[1], args]);
	}

	return ast;
};

G.Parser.prototype.lexArgs = function(source) {
	source += ' '; // hack para que encuentre el ultimo argumento con el mismo
	               // sistema que todos los anteriores.

	var args = [], i = 0, x = 0, l = source.length, g = false;

	for (; i < l; i++) {
		if (source[i] === '"') {
			g = !g;
		}
		if (source[i] === ' ' && !g) {
			if (source[x] === '"' && source[i-1] === '"') {
				args.push(source.substring(x+1, i-1));
			} else {
				args.push(parseFloat(source.substring(x, i)));
			}
			x = i+1;
		}
	}

	return args;
};

G.Parser.prototype.parse = function(source) {
	var text = source.replace(this.regexp, '').replace(/(\n){2,}/g, '\n\n'),
	    ast = this.lex(source);

	return [text, ast];
};

G.Parser.prototype.parseCond = function(cond) {
	var data = {};

	cond.split(',').forEach(function(item) {
		var kv = item.split('=');
		if (kv.length === 2) {
			data[kv[0]] = parseFloat(kv[1]);
		}
	});

	return data;
};
// }}}

// {{{
G.Comder = function(commands, context) {
	this.commands = commands || {};
	this.context = context;
};

G.Comder.prototype.execFn = function(fn, args) {
	fn.apply(this.context, args);
};

G.Comder.prototype.exec = function(name, args) {
	if (name in this.commands) {
		this.execFn(this.commands[name], args);
	}
};

G.Comder.prototype.execAST = function(ast) {
	var i = 0, l = ast.length;

	for (; i < l; i++) {
		if (ast[i][0] in this.commands) {
			this.exec(ast[i][0], ast[i][1]);
		}
	}
};
// }}}

// {{{
G.Typewriter = function(element, fps) {
	this.interval = undefined;
	this.element = element;
	this.delay = 1000 / (fps || 24);
};

G.Typewriter.prototype.clear = function() {
	this.element.innerHTML = '';

	if (this.interval) {
		clearInterval(this.interval);
	}
};

G.Typewriter.prototype.write = function(text) {
	var position = 0, element = this.element;

	function _write() {
		element.innerHTML += text[position];

		position++;
		if (position >= text.length) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
	}

	this.interval = setInterval(_write.bind(this), this.delay);
};
// }}}

// {{{
G.Inventory = function(element) {
	this.element = element;
};

G.Inventory.prototype._nodes = function(name) {
	var dt = this.element.querySelector('dt[title="' + name + '"]');

	if (dt === null) {
		return null;
	}

	return [dt, dt.nextSibling];
};

G.Inventory.prototype._create = function(name) {
	var nodes = [];

	nodes[0] = document.createElement('dt');
	nodes[1] = document.createElement('dd');

	nodes[0].innerHTML = name;
	nodes[0].title = name;

	this.element.appendChild(nodes[0]);
	this.element.appendChild(nodes[1]);

	return nodes;
};

G.Inventory.prototype.has = function(name) {
	return this._nodes(name) !== null;
};

G.Inventory.prototype.hasItems = function(items) {
	for (name in items) {
		if (this.get(name) < items[name]) {
			return false;
		}
	}

	return true;
};

G.Inventory.prototype.get = function(name) {
	var nodes = this._nodes(name);

	if (nodes !== null) {
		return parseFloat(nodes[1].innerHTML);
	}

	return null;
};

G.Inventory.prototype.set = function(name, value) {
	var nodes = this._nodes(name);

	if (nodes === null) {
		nodes = this._create(name);
	}

	nodes[1].innerHTML = parseFloat(value);
};

G.Inventory.prototype.inc = function(name, value) {
	var nodes = this._nodes(name);

	if (nodes === null) {
		nodes = this._create(name);
	}

	nodes[1].innerHTML = parseFloat(nodes[1].innerHTML || 0)
	                   + parseFloat(value || 1);
};
// }}}

// {{{
G.ActionBox = function(element) {
	this.element = element;
};

G.ActionBox.prototype._button = function(name) {
	return this.element.querySelector('button[title="' + name + '"]');
};

G.ActionBox.prototype._create = function(name) {
	var li, button = this._button(name);

	if (button === null) {
		button = document.createElement('button');
		button.innerHTML = name;
		button.title = name;

		li = document.createElement('li');
		li.appendChild(button);

		this.element.appendChild(li);
	}

	return button;
};

G.ActionBox.prototype.clear = function() {
	this.element.innerHTML = '';
};

G.ActionBox.prototype.has = function(name) {
	return this._button(name) !== null;
};

G.ActionBox.prototype.add = function(name, callback) {
	var button;

	button = this._create(name);
	button.addEventListener('click', callback);
};

G.ActionBox.prototype.remove = function(name) {
	var button = this._button(name);

	if (button === null) {
		return;
	}

	this.element.removeChild(button.parentNode);
};

G.ActionBox.prototype.progress = function(name, value, max) {
	var button = this._button(name), progress;

	if (button === null) {
		return;
	}

	progress = button.nextSibling;

	if (progress === null) {
		progress = document.createElement('progress');

		button.style.display = 'none';
		button.parentNode.appendChild(progress);
	}

	progress.value = value;
	progress.max = max;

	if (value === max) {
		progress.parentNode.removeChild(progress);
		button.style.display = 'block';
	}
};
// }}}
