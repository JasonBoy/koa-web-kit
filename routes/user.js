const router = require('koa-router')({
  prefix: '/user'
});

router.get('/', function *() {
  console.log('in user');
  this.body = 'USER';
});

router.get('/:id', function *() {
  this.body = this.params.id;
  console.log(this.params);
});

module.exports = router;