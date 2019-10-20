var Express = require('express');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Ssns';

router.get('/', function(req, res) {
   var body = [], ssn;

   if (req.validator.checkAdmin()) {
      for (var cookie in ssnUtil.sessions) {
         ssn = ssnUtil.sessions[cookie];
         body.push({cookie: cookie, prsId: ssn.id, loginTime: ssn.loginTime});
      }
      res.json(body);
      res.status(200).end();
   }
   req.cnn.release();
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
         cnn.chkQry('select * from Person where email = ?', 
          [req.body.email], cb);
   },
   function(result, fields, cb) {
      if (vld.check(result.length && result[0].password === 
          req.body.password, Tags.badLogin, null, cb)) {
         cookie = ssnUtil.makeSession(result[0], res);
         res.location(router.baseURL + '/' + cookie);
         res.status(200).end();
         cb();
       }
   }],
   function(err) {
      cnn.release();
   });

   // cnn.query('select * from Person where email = ?', [req.body.email],
   // function(err, result) {
   //    if (req.validator.check(result.length && result[0].password ===
   //     req.body.password, Tags.badLogin)) {
   //       cookie = ssnUtil.makeSession(result[0], res);
   //       res.location(router.baseURL + '/' + cookie).status(200).end();
   //    }
   //    cnn.release();
   // });
});

// DELETE ..../SSns/ff73647f737f7
router.delete('/:cookie', function(req, res) {
   var admin = req.session && req.session.isAdmin();
   if (req.validator.check(admin || req.params.cookie === 
       req.cookies[ssnUtil.cookieName], Tags.noPermission)) {
      ssnUtil.deleteSession(req.params.cookie);
      res.status(200).end();
   }
   req.cnn.release();
});

router.get('/:cookie', function(req, res) {
  //needs fixing
   var cookie = req.params.cookie;
   var vld = req.validator;
   var handler = function(err, prsArr) {
     if (!err){
      res.json(prsArr);
     }
     req.cnn.release();
   };

   if (vld.check(ssnUtil.sessions[cookie], Tags.notFound, null, handler) &&
       vld.checkPrsOK(ssnUtil.sessions[cookie].id, handler)) {
      res.json({cookie: cookie,
                prsId: ssnUtil.sessions[cookie].id,
                loginTime: req.session.loginTime});
      handler()
   }
});

module.exports = router;
