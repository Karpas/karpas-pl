
"use strict";

var page = {};

page.Doughnut = function () {
    var jquery = new Chart($(".skill.jquery")[0].getContext("2d")).Doughnut([
        {
            value: 90,
            color:"#c26f35"
        },
        {
            value : 10,
            color : "#ecf0f1"
        }
    ]);
    var javascript = new Chart($(".skill.javascript")[0].getContext("2d")).Doughnut([
        {
            value: 70,
            color:"#c26f35"
        },
        {
            value : 30,
            color : "#ecf0f1"
        }
    ]);
    var backbone = new Chart($(".skill.backbone")[0].getContext("2d")).Doughnut([
        {
            value: 70,
            color:"#c26f35"
        },
        {
            value : 30,
            color : "#ecf0f1"
        }
    ]);

    var msnet = new Chart($(".skill.msnet")[0].getContext("2d")).Doughnut([
        {
            value: 90,
            color:"#c26f35"
        },
        {
            value : 10,
            color : "#ecf0f1"
        }
    ]);
    var wcf = new Chart($(".skill.wcf")[0].getContext("2d")).Doughnut([
        {
            value: 80,
            color:"#c26f35"
        },
        {
            value : 20,
            color : "#ecf0f1"
        }
    ]);
    var ef = new Chart($(".skill.ef")[0].getContext("2d")).Doughnut([
        {
            value: 70,
            color:"#c26f35"
        },
        {
            value : 30,
            color : "#ecf0f1"
        }
    ]);
    var mssql = new Chart($(".skill.mssql")[0].getContext("2d")).Doughnut([
        {
            value: 80,
            color:"#c26f35"
        },
        {
            value : 20,
            color : "#ecf0f1"
        }
    ]);
    var postgresql = new Chart($(".skill.postgresql")[0].getContext("2d")).Doughnut([
        {
            value: 70,
            color:"#c26f35"
        },
        {
            value : 30,
            color : "#ecf0f1"
        }
    ]);
};


page.init = function () {
    this.Doughnut();

        var map_canvas = $(".map")[0];
        var map_options = {
          center: new google.maps.LatLng(51.7700, 19.4590),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(map_canvas, map_options)
}
