var express = require('express'),
	app = express.createServer();

var util = require('util');

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.bodyParser());
app.use(require('stylus').middleware({src: __dirname + '/public'}));
app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('index.jade');
});

function capitalize(word) { return word.substr(0,1).toUpperCase() + word.substr(1); }

var languages = {us: [], uk: []};
function loadTranslations() {
	delete require.cache[require.resolve('./replacements')];
	var replacements = require('./replacements').replacements;
	for (var i = 0; i < replacements.length; i++) {
		languages.us[i*2] = [new RegExp('\\b' + capitalize(replacements[i][0]) + '\\b', 'g'),
				             capitalize(replacements[i][1])];
		languages.us[i*2+1] = [new RegExp('\\b' + replacements[i][0] + '\\b', 'g'),
				     		   replacements[i][1]];
		languages.uk[i*2] = [new RegExp('\\b' + capitalize(replacements[i][1]) + '\\b', 'g'),
				   			 capitalize(replacements[i][0])];
		languages.uk[i*2+1] = [new RegExp('\\b' + replacements[i][1] + '\\b', 'g'),
				     		   replacements[i][0]];
	}
}
loadTranslations();
setInterval(loadTranslations, 5000); // reload so we catch changes to replacements.js

app.post('/api/translate', function(req, res) {
	var text = req.body.text;
	var replacements = languages[req.body.language];
	for (var i = 0; i < replacements.length; i++) {
		text = text.replace(replacements[i][0], replacements[i][1]);
	}
	res.json({seq: parseInt(req.body.seq), translation: text});
});

app.listen(process.env.PORT || 8000);