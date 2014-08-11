"use strict";

var app = angular.module("hbase-dataflow-app");

app.constant('Sample1', {
  "tables": [{
    "name": "Message",
    "rows": [{
      "key": "12345-5fc38314-e290-ae5da5fc375d",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "Hi Lars, ...",
              "timestamp": 1407761431418
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }, {
      "key": "12345-725aae5f-d72e-f90f3f070419",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "Welcome, and ...",
              "timestamp": 1407761473880
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }, {
      "key": "12345-cc6775b3-f249-c6dd2b1a7467",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "To Whom It ...",
              "timestamp": 1407761577975
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }, {
      "key": "12345-dcbee495-6d5e-6ed48124632c",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "Hi, how are ...",
              "timestamp": 1407761612286
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }]
  }],
  "operations": [{
    "title": "Send first message",
    "type": 0,
    "tableName": "Message",
    "rows": [{
      "key": "12345-5fc38314-e290-ae5da5fc375d",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "Hi Lars, ...",
              "timestamp": 1407761431418
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }]
  }, {
    "title": "Send second message",
    "type": 0,
    "tableName": "Message",
    "rows": [{
      "key": "12345-725aae5f-d72e-f90f3f070419",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "Welcome, and ...",
              "timestamp": 1407761473880
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }]
  }, {
    "title": "Send third message",
    "type": 0,
    "tableName": "Message",
    "rows": [{
      "key": "12345-cc6775b3-f249-c6dd2b1a7467",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "To Whom It ...",
              "timestamp": 1407761577975
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }]
  }, {
    "title": "Send fourth message",
    "type": 0,
    "tableName": "Message",
    "rows": [{
      "key": "12345-dcbee495-6d5e-6ed48124632c",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "Hi, how are ...",
              "timestamp": 1407761612286
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }]
  }, {
    "title": "Retrieve User 12345's messages",
    "type": 2,
    "tableName": "Message",
    "rows": [{
      "key": "12345-5fc38314-e290-ae5da5fc375d",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "Hi Lars, ...",
              "timestamp": 1407761431418
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }, {
      "key": "12345-725aae5f-d72e-f90f3f070419",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "Welcome, and ...",
              "timestamp": 1407761473880
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }, {
      "key": "12345-cc6775b3-f249-c6dd2b1a7467",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "To Whom It ...",
              "timestamp": 1407761577975
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }, {
      "key": "12345-dcbee495-6d5e-6ed48124632c",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "Hi, how are ...",
              "timestamp": 1407761612286
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }]
  }, {
    "title": "Retrieve specific message",
    "type": 2,
    "tableName": "Message",
    "rows": [{
      "key": "12345-cc6775b3-f249-c6dd2b1a7467",
      "families": [{
        "name": "data",
        "columns": [{
          "name": "msg",
          "values": [{
              "value": "To Whom It ...",
              "timestamp": 1407761577975
            },
            null, null
          ],
          "versions": 3
        }]
      }]
    }]
  }]
});