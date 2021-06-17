var express = require('express');
var router = express.Router();
var constants = require('../common/constants');
var rp = require('request-promise');
var jsonfile = require('jsonfile')
var file = './data/log.json';
var token;
var DATABASE = require('../app');
var exports = module.exports = {};

/** INACTIVE SET **/
var failStart = 0;
var failEnd = 0;
var h = 0;
var m = 0;
var s = 0;

/** SLACK **/
var Slack = require('node-slack');
var slack = new Slack('https://hooks.slack.com/services/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', {});


function _sendMessage(message) {
    slack.send({
        text: message,
        channel: '#supervielle-devs',
        username: 'Supervielle-status-bot'
    });
};

function _clear() {
    failStart = 0;
    failEnd = 0;
    h = 0;
    m = 0;
    s = 0;
};

function _getTime(diff) {
    h = Math.floor(diff / 1000 / 60 / 60);
    m = Math.round((Math.floor(diff / 60000) % 60), 2);
    s = Math.round(((diff / 1000) % 60), 2);
    var aux = h.toString() + ":" + m.toString() + ":" + s.toString();
    _clear();
    return aux;
};


function _insert(col, entity) {
    CONST.MONGO_CLIENT.connect(CONST.MONGO_URL, function(err, db) {
        if (err) {
            console.log("ERROR en conexión a la DB.");
        } else {
            var dbase = db.db('Supervielle_bot');
            dbase.collection(col).insertOne(entity, function(err, success) {
                if (err) {
                    console.log("INSERT incorrecto en la DB.");
                } else {
                    console.log("INSERT correcto en la DB.");
                }
                db.close();
            });
        }
    });
};

module.exports = {
    init: function() {
        _request(1, 0)
            .then((response) => {
                _insert("bot_log", {
                    service: '1',
                    block: 'THEN',
                    status: response.codigo,
                    description: response.descripcion,
                    time: new Date().toLocaleString()
                });
                if (!!response.token && response.token != '') {
                    token = response.token;
                    return _request(4, 1)
                        .then((resp) => {
                            if (resp.codigo == 'CERR' || resp.codigo == 'ERR') {
                                if (failStart == 0) {
                                    _sendMessage("Status (WS-4) - FAIL: " + resp.codigo + " - " + resp.descripcion);
                                    failStart = new Date().getTime();
                                }
                            } else if (resp.codigo == 'OK' && failStart > 0) {
                                failEnd = new Date().getTime();
                                var diff = failEnd - failStart;
                                _sendMessage("Status (WS-4) - OK: " + resp.codigo + " - " + resp.descripcion);
                                _sendMessage("Status (WS-4) - Tiempo de inactividad: " + _getTime(diff));
                                _insert("bot_inactive", {
                                  service: '4',
                                  inactive: _getTime(diff),
                                  hour: new Date().getHours(),
                                  time: new Date().toLocaleString()
                                });
                            }
                            _insert("bot_log", {
                                service: '4',
                                block: 'THEN',
                                status: resp.codigo,
                                description: resp.descripcion,
                                time: new Date().toLocaleString()
                            });
                        })
                        .catch((err) => {
                            _sendMessage("Status (WS-4): " + err.codigo + " - " + err.descripcion);
                            _insert("bot_log", {
                                service: '4',
                                block: 'CATCH',
                                status: err.codigo,
                                description: err.descripcion,
                                time: new Date().toLocaleString()
                            });
                        });
                }
            })
            .catch((error) => {
                _sendMessage("Status (WS-1): " + error.codigo + " - " + error.descripcion);
                _insert("bot_log", {
                    service: '1',
                    block: 'CATCH',
                    status: error.codigo,
                    description: error.descripcion,
                    time: new Date().toLocaleString()
                });
            });
    },
    router: router
}

function _request(CODEWS, indexConstWS) {
    var url = CONST.URL_WS + "/" + CODEWS;
    console.log('URL_WS:', url);
    var headers = {
        name: 'content-type',
        value: 'application/json'
    }

    if (!!token) {
        headers.token = token;
    }

    var options = {
        method: 'POST',
        uri: url,
        headers: headers,
        body: CONST.WS[indexConstWS].request,
        json: true
    };
    return rp(options)
        .then(function(response) {
            return response;
        });
}
