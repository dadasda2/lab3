window.onload = function () {
    /* variables
    shipSide	- размер палубы
    user.field 	- игровое поле пользователя
    comp.field 	- игровое поле компьютера
    user.fieldX,
    user.fieldY	- координаты игрового поля пользователя
    comp.fieldX,
    comp.fieldY	- координаты игрового поля компьютера

    0 - пустое место
    1 - палуба корабля
    2 - клетка рядом с кораблём
    3 - обстрелянная клетка
    4 - попадание в палубу
    */

    'use strict';

    function Field(field) {

        this.fieldSide = 330,

            this.shipSide = 33,


            this.shipsData = [
                '',
                [4, 'fourdeck'],
                [3, 'tripledeck'],
                [2, 'doubledeck'],
                [1, 'singledeck']
            ],

            this.field = field;


        this.fieldX = field.getBoundingClientRect().top + window.pageYOffset;
        this.fieldY = field.getBoundingClientRect().left + window.pageXOffset;
        this.fieldRight = this.fieldY + this.fieldSide;
        this.fieldBtm = this.fieldX + this.fieldSide;


        this.squadron = [];
    }

    Field.prototype.randomLocationShips = function () {


        this.matrix = createMatrix();

        for (var i = 1, length = this.shipsData.length; i < length; i++) {


            var decks = this.shipsData[i][0];
            for (var j = 0; j < i; j++) {

                var fc = this.getCoordinatesDecks(decks);


                fc.decks = decks,

                    fc.shipname = this.shipsData[i][1] + String(j + 1);


                var ship = new Ships(this, fc);

                ship.createShip();
            }
        }

        var mes = {
            type: "Ships",
            content: this.matrix
        };
        ws.send(JSON.stringify(mes));

        var mes = {
            type: "WhoFirst",
            content: ""
        };

        ws.send(JSON.stringify(mes));

    };

    Field.prototype.getCoordinatesDecks = function (decks) {


        var kx = getRandom(1),
            ky = (kx == 0) ? 1 : 0,
            x, y;


        if (kx == 0) {
            x = getRandom(9);
            y = getRandom(10 - decks);
        } else {
            x = getRandom(10 - decks);
            y = getRandom(9);
        }


        var result = this.checkLocationShip(x, y, kx, ky, decks);

        if (!result) return this.getCoordinatesDecks(decks);


        var obj = {
            x: x,
            y: y,
            kx: kx,
            ky: ky
        };
        return obj;
    };

    Field.prototype.checkLocationShip = function (x, y, kx, ky, decks) {

        var fromX, toX, fromY, toY;


        fromX = (x == 0) ? x : x - 1;


        if (x + kx * decks == 10 && kx == 1) toX = x + kx * decks;


        else if (x + kx * decks < 10 && kx == 1) toX = x + kx * decks + 1;

        else if (x == 9 && kx == 0) toX = x + 1;

        else if (x < 9 && kx == 0) toX = x + 2;


        fromY = (y == 0) ? y : y - 1;
        if (y + ky * decks == 10 && ky == 1) toY = y + ky * decks;
        else if (y + ky * decks < 10 && ky == 1) toY = y + ky * decks + 1;
        else if (y == 9 && ky == 0) toY = y + 1;
        else if (y < 9 && ky == 0) toY = y + 2;


        if (toX === undefined || toY === undefined) return false;

        for (var i = fromX; i < toX; i++) {
            for (var j = fromY; j < toY; j++) {
                if (this.matrix[i][j] == 1) return false;
            }
        }
        return true;
    };

    Field.prototype.cleanField = function () {

        var parent = this.field,


            id = parent.getAttribute('id'),

            divs = document.querySelectorAll('#' + id + ' > div');


        [].forEach.call(divs, function (el) {
            parent.removeChild(el);
        });

        this.squadron.length = 0;
    };


    var userfield = getElement('field_user'),
        compfield = getElement('field_comp'),
        comp;

    var user = new Field(getElement('field_user'));


    function Ships(player, fc) {

        this.player = player;

        this.shipname = fc.shipname;

        this.decks = fc.decks;

        this.x0 = fc.x;

        this.y0 = fc.y;

        this.kx = fc.kx;
        this.ky = fc.ky;

        this.hits = 0;

        this.matrix = [];
    }

    Ships.prototype.createShip = function () {
        var k = 0,
            x = this.x0,
            y = this.y0,
            kx = this.kx,
            ky = this.ky,
            decks = this.decks,
            player = this.player;


        while (k < decks) {


            player.matrix[x + k * kx][y + k * ky] = 1;

            this.matrix.push([x + k * kx, y + k * ky]);
            k++;
        }


        player.squadron.push(this);

        if (player == user) this.showShip();


        if (user.squadron.length == 10) {
            getElement('play').setAttribute('data-hidden', 'false');
        }
    };

    Ships.prototype.showShip = function () {

        var div = document.createElement('div'),

            dir = (this.kx == 1) ? ' vertical' : '',

            classname = this.shipname.slice(0, -1),
            player = this.player;


        div.setAttribute('id', this.shipname);

        div.className = 'ship ' + classname + dir;


        div.style.cssText = 'left:' + (this.y0 * player.shipSide) + 'px; top:' + (this.x0 * player.shipSide) + 'px;';
        player.field.appendChild(div);
    };


    getElement('type_placement').addEventListener('click', function (e) {

        var el = e.target;
        if (el.tagName != 'SPAN') return;

        getElement('play').setAttribute('data-hidden', true);

        user.cleanField();

        var type = el.getAttribute('data-target'),


            typeGeneration = {
                'random': function () {


                    user.randomLocationShips();
                }
            };


        typeGeneration[type]();
    });

    let ws = new WebSocket(`ws://${window.location.host}/ws`);

    let wf;
    var tmpcords;
    document.querySelector('.field-comp').setAttribute('data-hidden', false);
    comp = new Field(compfield);
    comp.squadron.length = 10;
    document.querySelector('.field-comp').setAttribute('data-hidden', true);
    ws.onmessage = async (r) => {
        if (JSON.parse(r.data).type === "Ships") {
            console.log("onmessage " + r.data);
            comp.matrix = JSON.parse(r.data).content;
            console.log("comp matrix " + comp.matrix);
        } else {
            if (JSON.parse(r.data).type === "WhoFirst") {
                wf = r.data;
                console.log("rnd = " + wf + " " + typeof wf);
            }
        }
    };

    getElement('play').addEventListener('click', function (e) {


        getElement('instruction').setAttribute('data-hidden', true);


        document.querySelector('.field-comp').setAttribute('data-hidden', false);


        getElement('play').setAttribute('data-hidden', true);

        getElement('text_top').innerHTML = 'Морской бой между эскадрами';


        userfield.startGame = true;


        Controller.battle.init();
    });


    var Controller = (function () {

        var player, enemy, self, coords, text,
            srvText = getElement('text_btm'),
            tm = 0;


        var battle = {

            init: function () {
                self = this;


                console.log("wf = " + wf);
                player = (JSON.parse(wf).content === "0") ? user : comp;

                enemy = (player === user) ? comp : user;


                if (player === user) {


                    compfield.addEventListener('click', self.shoot);


                    self.showServiseText('Вы стреляете первым.');
                } else {

                    self.showServiseText('Первым стреляет компьютер.');

                    ws.onmessage = async (r) => {
                        if (JSON.parse(r.data).type === "Shot") {
                            tmpcords = JSON.parse(r.data).content;
                            console.log("tmpcoords " + tmpcords);
                            self.shoot();
                        }
                    }
                }
            },

            shoot: function (e) {


                if (e !== undefined) {

                    if (e.which != 1) return false;

                    coords = self.transformCoordinates(e, enemy);
                    let mes = {
                        type: "Shot",
                        content: coords
                    };
                    ws.send(JSON.stringify(mes))
                } else {


                    coords = tmpcords;

                    console.log("coords " + coords);
                }


                var val = enemy.matrix[coords.x][coords.y];
                switch (val) {

                    case 0:

                        self.showIcons(enemy, coords, 'dot');
                        enemy.matrix[coords.x][coords.y] = 3;


                        text = (player === user) ? 'Вы промахнулись. Стреляет компьютер.' : 'Компьютер промахнулся. Ваш выстрел.';
                        self.showServiseText(text);


                        player = (player === user) ? comp : user;
                        enemy = (player === user) ? comp : user;

                        if (player == comp) {

                            compfield.removeEventListener('click', self.shoot);


                            ws.onmessage = async (r) => {
                                if (JSON.parse(r.data).type === "Shot") {
                                    tmpcords = JSON.parse(r.data).content;
                                    console.log("tmpcoords " + tmpcords);
                                    self.shoot();
                                }
                            };
                        } else {

                            compfield.addEventListener('click', self.shoot);

                        }
                        break;


                    case 1:

                        enemy.matrix[coords.x][coords.y] = 4;

                        self.showIcons(enemy, coords, 'red-cross');

                        text = (player === user) ? 'Поздравляем! Вы попали. Ваш выстрел.' : 'Компьютер попал в ваш корабль. Выстрел компьютера';
                        self.showServiseText(text);


                        if (player === comp) {


                            ws.onmessage = async (r) => {
                                if (JSON.parse(r.data).type === "Shot") {
                                    tmpcords = JSON.parse(r.data).content;
                                    console.log("tmpcoords " + tmpcords);
                                    self.shoot();
                                }
                            }
                        }

                        break;
                    case 2:
                    case 3:
                    case 4:
                        text = 'По этим координатам вы уже стреляли!';
                        self.showServiseText(text);
                        break;
                }
            },

            showIcons: function (enemy, coords, iconClass) {

                var div = document.createElement('div');


                div.className = 'icon-field ' + iconClass;


                div.style.cssText = 'left:' + (coords.y * enemy.shipSide) + 'px; top:' + (coords.x * enemy.shipSide) + 'px;';

                enemy.field.appendChild(div);
            },

            checkCell: function () {

                var icons = enemy.field.querySelectorAll('.icon-field'),
                    flag = true;


                [].forEach.call(icons, function (el) {

                    var x = el.style.top.slice(0, -2) / comp.shipSide,
                        y = el.style.left.slice(0, -2) / comp.shipSide;


                    if (coords.x == x && coords.y == y) {


                        var isShaded = el.classList.contains('shaded-cell');

                        if (isShaded) {

                            el.parentNode.removeChild(el);


                            comp.matrix[coords.x][coords.y] = 0;
                        }
                        flag = false;
                    }
                });
                return flag;
            },

            deleteElementMatrix: function (array, obj) {
                for (var i = 0, lh = array.length; i < lh; i++) {


                    if (array[i][0] == obj.x && array[i][1] == obj.y) {
                        array.splice(i, 1);
                        break;
                    }
                }
            },

            resetTempShip: function () {


                comp.shootMatrixAround = [];
                comp.tempShip = {

                    totalHits: 0,


                    firstHit: {},
                    nextHit: {},


                    kx: 0,
                    ky: 0
                };
            },

            transformCoordinates: function (e, instance) {

                if (!Math.trunc) {
                    Math.trunc = function (v) {
                        v = +v;
                        return (v - v % 1) || (!isFinite(v) || v === 0 ? v : v < 0 ? -0 : 0);
                    };
                }


                var obj = {};


                obj.x = Math.trunc((e.pageY - instance.fieldX) / instance.shipSide),
                    obj.y = Math.trunc((e.pageX - instance.fieldY) / instance.shipSide);
                return obj;
            },


            showServiseText: function (text) {

                srvText.innerHTML = '';

                srvText.innerHTML = text;


            }
        };


        return ({
            battle: battle,
            init: battle.init
        });

    })();


    function getElement(id) {
        return document.getElementById(id);
    }

    function getRandom(n) {

        return Math.floor(Math.random() * (n + 1));
    }

    function createMatrix() {
        var x = 10, y = 10, arr = [10];
        for (var i = 0; i < x; i++) {
            arr[i] = [10];
            for (var j = 0; j < y; j++) {
                arr[i][j] = 0;
            }
        }
        return arr;
    }
}


;(function (ELEMENT) {
    ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
    ELEMENT.closest = ELEMENT.closest || function closest(selector) {
        if (!this) return null;
        if (this.matches(selector)) return this;
        if (!this.parentElement) {
            return null
        } else return this.parentElement.closest(selector)
    };
}(Element.prototype));