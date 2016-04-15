var router = require('koa-router')({
  // prefix: '/i'
});


router.use(function *(next) {
  console.log('index path: %s', this.path);
  yield next;
});

router.get('/', function *(next) {
  console.log('in index');
  console.log(typeof this.request.query, this.request.query);
  this.body = 'OK';
});

router.get('/market/mall', function *(next) {
  console.log('in mall');
  this.body = 'Mall';
});

router.get('/userx/:id', function *(next) {
  console.log('in user');
  this.redirect('/user/id-' + this.params.id);
});

router.post('/login', function *(next) {
  console.log('body:', this.request.body);
  this.body = this.request.body;
});

router.get('/session', function *(next) {
  var n = this.session.views || 0;
  this.session.views = ++n;
  this.body = n + ' views';
});

module.exports = router;



