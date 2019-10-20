var Express = require('express');
var Tags = require('../Validator.js').Tags;
var async = require('async');
var mysql = require('mysql');

var router = Express.Router({caseSensitive: true});

router.baseURL = '/Prss';

router.get('/', function(req, res) {
   var email = !req.session.isAdmin() && req.session.email;
   var prefixNotAdmin = (req.session && !req.session.isAdmin()) 
    && req.query.email;
   var adminEmail = req.session.isAdmin() && req.query.email;
   var vld = req.validator;
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;
   var newArr = [];

   var handler = function(err, prsArr) {
      if(email){
         Object.keys(prsArr).forEach(function(key) {
            if(prsArr[key].email === email){
               prsArr[key].whenRegistered = prsArr[key].whenRegistered 
                && prsArr[key].whenRegistered.getTime();
               prsArr[key].termsAccepted = prsArr[key].termsAccepted 
                && prsArr[key].termsAccepted.getTime();
               newArr = [prsArr[key]];
            }
         });
      res.json(newArr);
      }
      else if (!err && admin){
         res.json(prsArr);
      }
   cnn.release();
   };

   if (prefixNotAdmin){
     prefixNotAdmin =
     cnn.chkQry('select id, email from Person where lower(email)' + 
      ' like lower(?)', [prefixNotAdmin+'%'], handler);
   }
   else if (email){
     cnn.chkQry('select id, email from Person where email = ?', 
      [email], handler);
   }
   else if (adminEmail){
     cnn.chkQry('select id, email from Person where lower(email)' + 
      ' like lower(?)', [adminEmail+'%'], handler);
   }
   else{
     cnn.chkQry('select id, email from Person', null, handler);
   }
});

router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   if (admin && !body.password)
      body.password = "*";                       // Blocking password
   body.whenRegistered = new Date();

   async.waterfall([
   function(cb) { // Check properties and search for Email duplicates
     if (vld.hasFields(body, ["email", "password", "role", "lastName"], cb) &&
         vld.chain(body.role === 0 || admin || !(body.role), Tags.noPermission)
         .chain(body.termsAccepted || admin, Tags.noTerms)
         .check(body.role >= 0, Tags.badValue, ["role"], cb) &&
         vld.chain(body.email, Tags.missingField, ["email"])
         .chain(!('lastName' in body) || body.lastName, 
         Tags.missingField, ["lastName"])
         .chain(body.password, Tags.missingField, ["password"])
         .chain('role' in body, Tags.missingField, ["role"])
         .check(body.role === 0 || body.role, 
         Tags.missingField, ["role"], cb)) {
           cnn.chkQry('select * from Person where email = ?', [body.email], cb)
      }
   },
   function(existingPrss, fields, cb) {  // If no duplicates, insert new Person
     if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
       if (!(body.termsAccepted = body.termsAccepted && new Date())){
         body.termsAccepted = null;
       }
       body.whenRegistered = new Date();
       cnn.chkQry('insert into Person set ?', body, cb);
     }
   },
   function(result, fields, cb) { // Return location of inserted Person
     res.location(router.baseURL + '/' + result.insertId).end();
     cb();
   }],
   function(err) {
     cnn.release();
   });
});

router.put('/:id', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;
   var id = parseInt(req.params.id);

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.params.id, cb) &&
           vld.chain((!('role' in body) || body.role === 0) || admin
            && (body.role === 0 || body.role === 1), Tags.badValue, ['role'])
            .chain(!('termsAccepted' in body), 
             Tags.forbiddenField, ['termsAccepted'])
            .chain(!('password' in body) || body.password, 
             Tags.badValue, ['password'])
            .chain(!('whenRegistered' in body), 
             Tags.forbiddenField, ['whenRegistered'])
            .hasValidPrssFields(body, ["password", "firstName","lastName"], 
             admin, cb)) {
        cnn.chkQry('select * from Person where id = ?', [id], cb);
      }
   },
   function(result, fields, cb) {
      if (vld.check(result.length, Tags.notFound, null, cb) &&
            vld.check(!('password' in body) || body.oldPassword === 
             result[0].password || admin,
            Tags.oldPwdMismatch, null, cb)) {
         if (Object.keys(body).length) {
            if ("oldPassword" in body) {
               delete body.oldPassword;
            }
            cnn.chkQry('update Person set ? where id = ?', [body, id], cb);
         }
         else {
            cb();
         }
      }
   }],
   function(err) {
     if (!err) {
        res.status(200).end();
     }
     cnn.release();
   })
});

router.get('/:id', function(req, res) {
   var vld = req.validator;
   var id = parseInt(req.params.id);

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.params.id, cb))
         req.cnn.chkQry('select * from Person where id = ?', [id], cb);
   },
   function(prsArr, fields, cb) {
      if (vld.check(prsArr.length, Tags.notFound, null, cb)) {
         console.log(prsArr);
         prsArr[0].whenRegistered = prsArr[0].whenRegistered 
          && prsArr[0].whenRegistered.getTime();
         prsArr[0].termsAccepted = prsArr[0].termsAccepted 
          && prsArr[0].termsAccepted.getTime();
         delete prsArr[0].password;
         res.json(prsArr);
         //res.status(200).end();
         cb();
      }
   }],
   function(err) {
      req.cnn.release();
   });
});

router.delete('/:id', function(req, res) {
   var vld = req.validator;
   var id = parseInt(req.params.id);

   async.waterfall([
   function(cb) {
      if (vld.checkAdmin(cb)) {
        req.cnn.chkQry('select * from Person where id = ?', [id], cb);
     }
   },
   function(prsArr, fields, cb) {
      if (vld.check(prsArr.length, Tags.notFound, null, cb)) {
        req.cnn.chkQry('DELETE from Person where id = ?', [id], cb);
      }
   }],
   function(err) {
      if (!err) {
        res.status(200).end();
      }
      req.cnn.release();
   });
});

module.exports = router;
