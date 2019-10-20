var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Query';

router.get('/', function(req, res) {
   var cnn = req.cnn;
   var login = req.session.id;
   var vld = req.validator;
   var admin = req.session && req.session.isAdmin();
   var query = 'select q.id, summary, whenMade, p.firstName, p.lastName, p.email, class, '+
   'project, professor, resolved, ' + 
   '(SELECT COUNT(id) AS pos FROM Query WHERE id <= q.id and resolved is null order by whenMade) as pos ' +
   'from Query q join Person p on ownerId = p.id';
   var name = req.query.name;
   var course = req.query.course;
   var project = req.query.project;
   var professor = req.query.professor;
   var resolved = req.query.resolved;
   var pos = req.query.pos;
   if (resolved) 
      query += (" and resolved is not NULL");
   else 
      query += (" and resolved is NULL");

   if (project) 
      query += (" and project LIKE '%" + project + "%'");
   if (course) 
      query += (" and class LIKE '%" + course + "%'");
   if (professor) 
      query += (" and professor LIKE '%" + professor + "%'");
   if (name) {
      query += (" and concat(p.firstName, ' ',  p.lastName) LIKE '%" + name + "%'");
   }
   if (pos) {
      query += (" and pos = " + pos)
   }
   if (!admin)
      query += (" and ownerId = " + login);
   query += (" order by whenMade, id");

   async.waterfall([
      function(cb) { 
         if (vld.check(req.session.id, Tags.noLogin, null, cb))
            cnn.chkQry(query, null, cb);
      },
      function(queries, fields, cb) { 
         res.json(queries);
         console.log(queries);
         cb();
      }],
      function(err){
         cnn.release();
      });
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var prsId = parseInt(req.session.id);
   var MAX_summary_LEN = 500;

   async.waterfall([
   function(cb) {
     if (vld.check(req.session.id, Tags.noLogin, null, cb)) {
        body.ownerId = prsId;
        body.whenMade = new Date();
        console.log(body);
        cnn.chkQry("insert into Query set ?", body, cb);
      }
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

router.put('/:queryId', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var queryId = parseInt(req.params.queryId);

   async.waterfall([ 
   function(cb) {
      console.log(body.summary);
      cnn.chkQry('select * from Query where id = ?', [queryId], cb);
   },
   function(queries, fields, cb) {
      if (vld.check(queries.length, Tags.notFound, null, cb) &&
          vld.checkPrsOK(queries[0].ownerId, cb)){
          console.log(body);
          console.log(queryId);
          if (body.resolved)
            body.resolved = new Date();
          cnn.chkQry("update Query set ? where id = ?",
          [body, queryId], cb)
      }
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      req.cnn.release();
   });
});

router.delete('/:queryId', function(req, res) {
   var vld = req.validator;
   var queryId = parseInt(req.params.queryId);
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Query where id = ?', [queryId], cb);
   },
   function(queries, fields, cb) {
      if (vld.check(queries.length, Tags.notFound, null, cb) &&
          vld.checkPrsOK(queries[0].ownerId, cb))
         cnn.chkQry('delete from Query where id = ?', [queryId], cb);
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});

router.get('/:queryId', function(req, res) {
   var vld = req.validator;
   var queryId = parseInt(req.params.queryId);
   console.log(queryId);

   async.waterfall([
   function(cb) {
      if (vld.check(req.session.id, Tags.noLogin, null, cb))
        req.cnn.chkQry('select q.id, ownerId, summary, whenMade, p.firstName, p.lastName, ' +
         'p.email, class, project, professor, resolved from Query q ' +
         'join Person p on ownerId = p.id and q.id = ?', [queryId],
         cb);
   },
   function(queries, fields, cb) {
      if (vld.check(queries.length, Tags.notFound, null, cb) 
         && vld.checkPrsOK(queries[0].ownerId, cb)){
         res.json(queries[0]);
         cb();
      }
   }],
   function(err) {
      req.cnn.release();
   });
});

module.exports = router;
