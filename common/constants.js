global.CONST = {
  URL_WS: 'https://mobiledesa.supervielle.com.ar/backendsvcs-dmz/svc', //DESA
  URL_WS_EMP: 'https://mobiledesa.supervielle.com.ar/mbe-dmz/svc', //DESA EMPRESAS
  WS: [
    {
      codigo: '1',
      header: '',
      request: {
        "deviceId":"JBDEVICE0",
        "nombre":"superviellemb"
      }
    },
    {
      codigo: '4',
      request: {
        "usuario":"maxito",
        "password":"Info1212",
        "idDisp":"JBDEVICE0",
        "zona":"Buenos Aires"
      }
    }
  ],
  WS_EMP: [
    {
      codigo: '1',
      header: '',
      request: {
        "deviceId":"JBDEVICE0",
        "nombre":"superviellemb"
      }
    },
    {
      codigo: '3',
      header: '',
      request: {
        "cuil":"20230144983",
        "usuario":"framirez",
        "clave":"Info1212",
        "id_dispositivo":"JBDEVICE0",
        "zona":"Buenos Aires"
      }
    }
  ],
  MONGO_CLIENT: require('mongodb').MongoClient,
  MONGO_URL: 'mongodb://localhost:27017/Supervielle_bot'
}
