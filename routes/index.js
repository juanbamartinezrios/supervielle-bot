var express = require('express');
var router = express.Router();
var DATABASE = require('../app');
var constants = require('../common/constants');
var labels = ["9", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
var leyendOff = "Off";
var dataOff = [];
dataOff.length = 0;
var ticks = [60, 50, 40, 30, 20, 10, 5, 2, 0];
var options = {
    scales: {
      xAxes: [{
          stacked: false,
      }],
      yAxes: [{
        ticks: {
          autoSkip: false,
          min: ticks[ticks.length - 1],
          max: ticks[0]
        },
        afterBuildTicks: function(scale) {
          scale.ticks = ticks;
          return;
        },
        beforeUpdate: function(oScale) {
          return;
        }
      }]
    }
  };

function _find(col, service, dateIni, res) {
    console.log("Fecha a buscar: ", dateIni);
    dataOff = [];
    dataOff.length = 0;
    var filter = {
        service: service,
        time: {
            $gt: dateIni + " 09:00:00",
            $lt: dateIni + " 18:59:59"
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
                    for (var i = 0; i <= 9; i++) {
                        dataOff.push({ h: 0, m: 0, s: 0 });
                    }
                    docs.forEach(function(doc) {
                        switch (doc.hour) {
                            case 9:
                                dataOff[0].h = dataOff[0].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[0].m = dataOff[0].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[0].s = dataOff[0].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                            case 10:
                                dataOff[1].h = dataOff[1].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[1].m = dataOff[1].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[1].s = dataOff[1].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                            case 11:
                                dataOff[2].h = dataOff[2].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[2].m = dataOff[2].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[2].s = dataOff[2].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                            case 12:
                                dataOff[3].h = dataOff[3].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[3].m = dataOff[3].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[3].s = dataOff[3].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                            case 13:
                                dataOff[4].h = dataOff[4].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[4].m = dataOff[4].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[4].s = dataOff[4].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                            case 14:
                                dataOff[5].h = dataOff[5].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[5].m = dataOff[5].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[5].s = dataOff[5].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                            case 15:
                                dataOff[6].h = dataOff[6].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[6].m = dataOff[6].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[6].s = dataOff[6].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                            case 16:
                                dataOff[7].h = dataOff[7].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[7].m = dataOff[7].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[7].s = dataOff[7].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                            case 17:
                                dataOff[8].h = dataOff[8].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[8].m = dataOff[8].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[8].s = dataOff[8].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                            case 18:
                                dataOff[9].h = dataOff[9].h + _countTime(_splitTime(doc.inactive), 0);
                                dataOff[9].m = dataOff[9].m + _countTime(_splitTime(doc.inactive), 1);
                                dataOff[9].s = dataOff[9].s + _countTime(_splitTime(doc.inactive), 2);
                                break;
                        }
                    });
                    _getMinutes(dataOff);
                    var aux = [];
                    for (var i = 0; i < dataOff.length; i++) {
                        console.log("Hora: " + (i).toString() + " - Inactividad: ", dataOff[i]);
                        aux.push(dataOff[i].m);
                    }
                    var titleGraph = "Tiempo de inactividad (mm:ss): " + dateIni;
                    res.render('index', { titleGraph: titleGraph, labels: labels, leyendOff: leyendOff, dataOff: aux, options: options });
                }
                db.close();
            });
        }
    });
}

function _getMinutes(data) {
    data.forEach(function(d) {
        if (d.h > 0) {
            d.m = d.m + (d.h * 60);
            d.h = 0;
        }
        if (d.s > 0) {
            d.m = d.m + (d.s / 60);
            d.s = 0;
        }
        d.m = d.m.toFixed(2);
        // Posiblemente, tambien delete.s ya que se guarda todo en m:s
        delete d.h;
    });
};

function _splitTime(total) {
    var t = total;
    var aux = t.split(":");
    var split = [];
    aux.forEach(function(t) {
        split.push(parseInt(t));
    });
    return split;
};

function _countTime(timeSplit, pos) {
    return timeSplit[pos];
};

/* GET home page. */
router.get('/', function(req, res, next) {
    var date = new Date();
    dataOff.length = 0;
    initGraph(date, res);
});

router.get('/filter/:fechaInicio', function(req, res, next) {
    let params = req.params;
    let startDate = params.fechaInicio;
    startDate = new Date(parseInt(startDate));
    initGraph(startDate, res);
});

function initGraph(startDate, res) {
    var from = _formatDate(startDate);
    var hour = new Date(startDate).getHours();
    var counter = 0;
    _find("bot_inactive", "4", from, res);
};

function _formatDate(fecha) {
    var date = new Date(fecha);
    var month = date.getMonth() + 1;
    var today = date.getFullYear() + "-" + month + "-" + date.getDate();
    return today;
}

module.exports = router;
