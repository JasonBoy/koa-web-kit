var Handlebars = require('handlebars');

Handlebars.registerHelper('link', function(text, url) {
  text = Handlebars.Utils.escapeExpression(text);
  url  = Handlebars.Utils.escapeExpression(url);

  var result = '<a href="' + url + '">' + text + '</a>';

  return new Handlebars.SafeString(result);
});
Handlebars.registerHelper('list', function(items, options) {
  var out = '<ul>';

  for(var i=0, l=items.length; i<l; i++) {
    out = out + '\n<li>' + options.fn(items[i]) + '</li>';
  }

  return out + '\n</ul>';
});


var template = '<h3>{{link title "http://a.com" }}</h3>\n' +
  '<section>{{#list people }}<a>{{ firstName }}{{ lastName }}</a>{{/list}}</section>'
  ;

var c = Handlebars.compile(template);

var context = {
  title: '<span>jason</span>',
  people: [
    {firstName: 'Yehuda', lastName: 'Katz'},
    {firstName: 'Carl', lastName: 'Lerche'},
    {firstName: 'Alan', lastName: 'Johnson'}
  ]
};

var result = c(context);

console.log(result);