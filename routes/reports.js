var express = require('express');
var router = express.Router();
var documents = [];
/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log('pending');
  var titleGraph = "Log Report";
  res.render('reports', { titleGraph: titleGraph});
});

var DATABASE = require('../app');
var constants = require('../common/constants');
var dataOff = [];
var dataOn = [];

function _findLog(col, status, service, dateIni, dateEnd, res){
  var filter = {
    status: status,
    service: service,
    time: {
      $gt: dateIni+" 00:00:00",
      $lt: dateEnd+" 18:59:59"
    }
  };
  CONST.MONGO_CLIENT.connect(CONST.MONGO_URL, function(err, db) {
      if (err) {
          console.log("ERROR en conexión a la DB.");
      } else {
          var dbase = db.db('Supervielle_bot');
          dbase.collection(col).find(filter).toArray(function(err, docs) {
              if (err) {
                  console.log("ERROR find documents with this filter: ", filter);
              } else {
                  documents = docs;
                  var titleGraph = "Reporte desde " + dateIni + " hasta " + dateEnd;
                  res.render('reports', { titleGraph: titleGraph, documents: documents});
                  console.log("Busco registros: ",documents.length," con este filtro: ",filter);
              }
              db.close();
            });
      }
  });
}

function _parseDate(date) {
  var theyear = date.getFullYear();
  var themonth = date.getMonth() + 1;
  var thetoday = date.getDate();
  thetoday = thetoday < 10 ? "0"+thetoday : thetoday;
  strDate = theyear + "-" + themonth + "-" + thetoday;
  return strDate;
}

router.get('/filter/:fechaInicio/:fechaFin', function(req, res, next) {
  let params = req.params;
  let startDate = params.fechaInicio;
  let endDate = params.fechaFin;
  startDate = new Date(parseInt(startDate));
  endDate = new Date(parseInt(endDate));
  _findLog("bot_log", "OK", "4", _parseDate(startDate), _parseDate(endDate), res);
});

module.exports = router;
