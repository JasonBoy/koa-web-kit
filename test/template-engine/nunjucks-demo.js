'use strict';

const nunjucks = require('nunjucks');

//render html
const res = nunjucks.render('demo.html', { title: 'hello' });
// console.log(res);

//render async
nunjucks.render('demo.html', function(err, res) {
  // console.log(res);
});

//render string
const strRes = nunjucks.renderString('<a>{{ link }}</a>', {link: 'xxx'});
// console.log(strRes);


// pre-compiled template
const template = nunjucks.compile('Hello {{ username }}');
console.log(template.render({ username: 'jason' }));
console.log(template.render({ username: 'jason2' }));