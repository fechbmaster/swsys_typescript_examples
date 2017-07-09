var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var canvasWidth = 600, canvasHeight = 400;
var Point2D = (function () {
    function Point2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point2D;
}());
var AbstractShape = (function () {
    function AbstractShape() {
        this.id = AbstractShape.counter++;
    }
    return AbstractShape;
}());
AbstractShape.counter = 0;
var AbstractFactory = (function () {
    function AbstractFactory(shapeManager) {
        this.shapeManager = shapeManager;
    }
    AbstractFactory.prototype.handleMouseDown = function (x, y) {
        this.from = new Point2D(x, y);
    };
    AbstractFactory.prototype.handleMouseUp = function (x, y) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
        }
        this.shapeManager.addShape(this.createShape(this.from, new Point2D(x, y)));
        this.from = undefined;
    };
    AbstractFactory.prototype.handleMouseMove = function (x, y) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x, y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x, y));
            this.shapeManager.addShape(this.tmpShape);
        }
    };
    return AbstractFactory;
}());
var Line = (function (_super) {
    __extends(Line, _super);
    function Line(from, to) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.to = to;
        return _this;
    }
    Line.prototype.draw = function (ctx, marked) {
        ctx.beginPath();
        if (marked)
            ctx.strokeStyle = 'blue';
        else
            ctx.strokeStyle = 'black';
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();
    };
    return Line;
}(AbstractShape));
var LineFactory = (function (_super) {
    __extends(LineFactory, _super);
    function LineFactory(shapeManager) {
        var _this = _super.call(this, shapeManager) || this;
        _this.label = "Linie";
        return _this;
    }
    LineFactory.prototype.createShape = function (from, to) {
        return new Line(from, to);
    };
    return LineFactory;
}(AbstractFactory));
var Circle = (function (_super) {
    __extends(Circle, _super);
    function Circle(center, radius) {
        var _this = _super.call(this) || this;
        _this.center = center;
        _this.radius = radius;
        return _this;
    }
    Circle.prototype.draw = function (ctx, marked) {
        ctx.beginPath();
        if (marked)
            ctx.strokeStyle = 'blue';
        else
            ctx.strokeStyle = 'black';
        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
    };
    return Circle;
}(AbstractShape));
var CircleFactory = (function (_super) {
    __extends(CircleFactory, _super);
    function CircleFactory(shapeManager) {
        var _this = _super.call(this, shapeManager) || this;
        _this.label = "Kreis";
        return _this;
    }
    CircleFactory.prototype.createShape = function (from, to) {
        return new Circle(from, CircleFactory.computeRadius(from, to.x, to.y));
    };
    CircleFactory.computeRadius = function (from, x, y) {
        var xDiff = (from.x - x), yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    };
    return CircleFactory;
}(AbstractFactory));
var Rectangle = (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(from, to) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.to = to;
        return _this;
    }
    Rectangle.prototype.draw = function (ctx, marked) {
        ctx.beginPath();
        if (marked)
            ctx.strokeStyle = 'blue';
        else
            ctx.strokeStyle = 'black';
        ctx.strokeRect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);
        ctx.stroke();
    };
    return Rectangle;
}(AbstractShape));
var RectangleFactory = (function (_super) {
    __extends(RectangleFactory, _super);
    function RectangleFactory(shapeManager) {
        var _this = _super.call(this, shapeManager) || this;
        _this.label = "Rechteck";
        return _this;
    }
    RectangleFactory.prototype.createShape = function (from, to) {
        return new Rectangle(from, to);
    };
    return RectangleFactory;
}(AbstractFactory));
var Triangle = (function (_super) {
    __extends(Triangle, _super);
    function Triangle(p1, p2, p3) {
        var _this = _super.call(this) || this;
        _this.p1 = p1;
        _this.p2 = p2;
        _this.p3 = p3;
        return _this;
    }
    Triangle.prototype.draw = function (ctx, marked) {
        ctx.beginPath();
        if (marked)
            ctx.strokeStyle = 'blue';
        else
            ctx.strokeStyle = 'black';
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();
    };
    return Triangle;
}(AbstractShape));
var TriangleFactory = (function () {
    function TriangleFactory(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = "Dreieck";
    }
    TriangleFactory.prototype.handleMouseDown = function (x, y) {
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            this.shapeManager.addShape(new Triangle(this.from, this.tmpTo, new Point2D(x, y)));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        }
        else {
            this.from = new Point2D(x, y);
        }
    };
    TriangleFactory.prototype.handleMouseUp = function (x, y) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x, y);
            this.thirdPoint = new Point2D(x, y);
            this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape(this.tmpShape);
        }
    };
    TriangleFactory.prototype.handleMouseMove = function (x, y) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (this.tmpShape) {
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x, y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape(this.tmpShape);
            }
        }
        else {
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x, y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
                }
                // adds a new temp line
                this.tmpLine = new Line(this.from, this.tmpTo);
                this.shapeManager.addShape(this.tmpLine);
            }
        }
    };
    return TriangleFactory;
}());
var Selector = (function () {
    function Selector(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = "Auswählen";
        this.radius = 20;
    }
    Selector.prototype.handleMouseDown = function (x, y) {
        this.shapeManager.selectShape();
    };
    Selector.prototype.handleMouseUp = function (x, y) {
    };
    Selector.prototype.handleMouseMove = function (x, y) {
        for (var id in this.shapeManager.getShapes()) {
            var tmpShape = this.shapeManager.getShapes()[id];
            if (tmpShape instanceof Line) {
                var line = tmpShape;
                var gotHit_1 = this.calculateCircleLineIntersection(x, y, line.from, line.to);
                this.shapeManager.setShapeMarked(line, gotHit_1);
            }
            if (tmpShape instanceof Triangle) {
                var triangle = tmpShape;
                var paths = void 0;
                paths = [[triangle.p1, triangle.p2], [triangle.p2, triangle.p3], [triangle.p3, triangle.p1]];
                for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];
                    var gotHit = this.calculateCircleLineIntersection(x, y, path[0], path[1]);
                    if (gotHit)
                        break;
                }
                this.shapeManager.setShapeMarked(triangle, gotHit);
            }
            if (tmpShape instanceof Rectangle) {
                var rectangle = tmpShape;
                var paths = void 0;
                // Right Down Corner
                var rdc = new Point2D(rectangle.to.x, rectangle.from.y);
                // Left Upper Corner
                var luc = new Point2D(rectangle.from.x, rectangle.to.y);
                paths = [[rectangle.from, rdc], [rdc, rectangle.to], [rectangle.to, luc], [luc, rectangle.from]];
                for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];
                    var gotHit = this.calculateCircleLineIntersection(x, y, path[0], path[1]);
                    if (gotHit)
                        break;
                }
                this.shapeManager.setShapeMarked(rectangle, gotHit);
            }
            if (tmpShape instanceof Circle) {
                var circle = tmpShape;
                var gotHit_2 = this.calculateCircleToCircleCollision(x, y, circle.center, circle.radius);
                this.shapeManager.setShapeMarked(circle, gotHit_2);
            }
        }
    };
    Selector.prototype.calculateCircleLineIntersection = function (cx, cy, p1, p2) {
        var p1_dis = new Point2D(p1.x - cx, p1.y - cy);
        var p2_dis = new Point2D(p2.x - cx, p2.y - cy);
        var a = (p2_dis.x - p1_dis.x) * (p2_dis.x - p1_dis.x) + (p2_dis.y - p1_dis.y) * (p2_dis.y - p1_dis.y);
        var b = 2 * (p1_dis.x * (p2_dis.x - p1_dis.x) + p1_dis.y * (p2_dis.y - p1_dis.y));
        var c = p1_dis.x * p1_dis.x + p1_dis.y * p1_dis.y - this.radius * this.radius;
        var disc = b * b - 4 * a * c;
        if (disc < 0)
            return false;
        var sqrtdisc = Math.sqrt(disc);
        var t1 = (-b - sqrtdisc) / (2 * a);
        var t2 = (-b + sqrtdisc) / (2 * a);
        if (t1 >= 0 && t1 <= 1)
            return true;
        if (t2 >= 0 && t2 <= 1)
            return true;
        return false;
    };
    Selector.prototype.calculateCircleToCircleCollision = function (cx, cy, c2, circleRadius) {
        var c1 = new Point2D(cx, cy);
        var d = Math.sqrt((c2.x - c1.x) * (c2.x - c1.x) + (c2.y - c1.y) * (c2.y - c1.y));
        // must be outside to select just the line
        if ((d < (this.radius + circleRadius)) && (d >= Math.abs(this.radius - circleRadius)))
            return true;
        return false;
    };
    return Selector;
}());
var Shapes = (function () {
    function Shapes() {
    }
    return Shapes;
}());
var ToolArea = (function () {
    function ToolArea(shapesSelector, menue) {
        var _this = this;
        this.selectedShape = undefined;
        var domElms = [];
        shapesSelector.forEach(function (sl) {
            var domSelElement = document.createElement("li");
            domSelElement.innerText = sl.label;
            menue.appendChild(domSelElement);
            domElms.push(domSelElement);
            domSelElement.addEventListener("click", function () {
                selectFactory.call(_this, sl, domSelElement);
            });
        });
        function selectFactory(sl, domElm) {
            // remove class from all elements
            for (var j = 0; j < domElms.length; j++) {
                domElms[j].classList.remove("marked");
            }
            this.selectedShape = sl;
            // add class to the one that is selected currently
            domElm.classList.add("marked");
        }
        var selectButton = document.createElement("button");
    }
    ToolArea.prototype.getSelectedShape = function () {
        return this.selectedShape;
    };
    return ToolArea;
}());
var Canvas = (function () {
    function Canvas(canvasDomElement, toolarea, deleteButton) {
        var _this = this;
        this.shapes = {};
        this.marked = {};
        this.selectedShapeID = null;
        deleteButton.addEventListener("click", function (d) {
            if (_this.selectedShapeID !== null) {
                return _this.removeShapeWithId(_this.selectedShapeID, true);
                ;
            }
            window.alert("No shapes selected yet!");
        });
        this.ctx = canvasDomElement.getContext("2d");
        canvasDomElement.addEventListener("mousemove", createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown", createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup", createMouseHandler("handleMouseUp"));
        function createMouseHandler(methodName) {
            return function (e) {
                e = e || window.event;
                if ('object' === typeof e) {
                    var btnCode = e.button, x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop, ss = toolarea.getSelectedShape();
                    // if left mouse button is pressed,
                    // and if a tool is selected, do something
                    if (e.button === 0 && ss) {
                        var m = ss[methodName];
                        // This in the shapeFactory should be the factory itself.
                        m.call(ss, x, y);
                    }
                }
            };
        }
        function deleteSelectedShape() {
        }
    }
    Canvas.prototype.draw = function () {
        // TODO: it there a better way to reset the canvas?
        this.ctx.beginPath();
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.ctx.stroke();
        // draw shapes
        this.ctx.fillStyle = 'black';
        for (var id in this.shapes) {
            if (Number(id) === this.selectedShapeID) {
                var tmp = this.shapes[id];
                if (tmp instanceof Line) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(tmp.from.x - 5, tmp.from.y - 5, 10, 10);
                    this.ctx.strokeRect(tmp.to.x - 5, tmp.to.y - 5, 10, 10);
                    this.ctx.stroke();
                }
                if (tmp instanceof Rectangle) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(tmp.from.x - 5, tmp.from.y - 5, 10, 10);
                    this.ctx.strokeRect(tmp.to.x - 5, tmp.to.y - 5, 10, 10);
                    this.ctx.strokeRect(tmp.to.x - 5, tmp.from.y - 5, 10, 10);
                    this.ctx.strokeRect(tmp.from.x - 5, tmp.to.y - 5, 10, 10);
                    this.ctx.stroke();
                }
                if (tmp instanceof Triangle) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(tmp.p1.x - 5, tmp.p1.y - 5, 10, 10);
                    this.ctx.strokeRect(tmp.p2.x - 5, tmp.p2.y - 5, 10, 10);
                    this.ctx.strokeRect(tmp.p3.x - 5, tmp.p3.y - 5, 10, 10);
                    this.ctx.stroke();
                }
                if (tmp instanceof Circle) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(tmp.center.x - tmp.radius - 5, tmp.center.y - 5, 10, 10);
                    this.ctx.strokeRect(tmp.center.x + tmp.radius - 5, tmp.center.y - 5, 10, 10);
                    this.ctx.strokeRect(tmp.center.x - 5, tmp.center.y + tmp.radius - 5, 10, 10);
                    this.ctx.strokeRect(tmp.center.x - 5, tmp.center.y - tmp.radius - 5, 10, 10);
                    this.ctx.stroke();
                }
            }
            this.shapes[id].draw(this.ctx, this.marked[id]);
        }
        return this;
    };
    Canvas.prototype.addShape = function (shape, redraw) {
        if (redraw === void 0) { redraw = true; }
        this.shapes[shape.id] = shape;
        this.marked[shape.id] = false;
        return redraw ? this.draw() : this;
    };
    Canvas.prototype.getShapes = function () {
        return this.shapes;
    };
    Canvas.prototype.removeShape = function (shape, redraw) {
        if (redraw === void 0) { redraw = true; }
        var id = shape.id;
        delete this.shapes[id];
        delete this.marked[id];
        return redraw ? this.draw() : this;
    };
    Canvas.prototype.removeShapeWithId = function (id, redraw) {
        if (redraw === void 0) { redraw = true; }
        delete this.shapes[id];
        delete this.marked[id];
        return redraw ? this.draw() : this;
    };
    // Getter and Setter
    Canvas.prototype.selectShape = function () {
        var sth_marked = false;
        var tmp_id = this.selectedShapeID;
        for (var id in this.marked) {
            // Search for all
            if (this.marked[id]) {
                sth_marked = true;
                // Get out of function if selectedShape initially gets set
                if (tmp_id === null) {
                    this.selectedShapeID = Number(id);
                    return this.draw();
                }
                else {
                    // search for next elements
                    for (var id_n in this.marked) {
                        if (this.marked[id_n] && Number(id_n) > tmp_id) {
                            this.selectedShapeID = Number(id_n);
                            return this.draw();
                        }
                    }
                    // no next elements found ...
                    // search for previous elements
                    for (var id_p in this.marked) {
                        if (this.marked[id_p] && Number(id_p) < tmp_id) {
                            this.selectedShapeID = Number(id_p);
                            return this.draw();
                        }
                    }
                    // no previous elements found ...
                    // id stays the same
                }
            }
        }
        // if no shape is marked set selected Shape null
        if (!sth_marked)
            this.selectedShapeID = null;
        return this.draw();
    };
    Canvas.prototype.setShapeMarked = function (shape, marked) {
        this.marked[shape.id] = marked;
        this.draw();
    };
    Canvas.prototype.getCTX = function () {
        return this.ctx;
    };
    return Canvas;
}());
function init() {
    var canvasDomElm = document.getElementById("drawArea");
    var menu = document.getElementsByClassName("tools");
    var deleteButton = document.getElementById("deleteButton");
    // Problem here: Factories needs a way to create new Shapes, so they
    // have to call a method of the canvas.
    // The canvas on the other side wants to call the event methods
    // on the toolbar, because the toolbar knows what tool is currently
    // selected.
    // Anyway, we do not want the two to have references on each other
    var canvas;
    var sm = {
        addShape: function (s, rd) {
            return canvas.addShape(s, rd);
        },
        removeShape: function (s, rd) {
            return canvas.removeShape(s, rd);
        },
        removeShapeWithId: function (id, rd) {
            return canvas.removeShapeWithId(id, rd);
        },
        getShapes: function () {
            return canvas.getShapes();
        },
        getCTX: function () {
            return canvas.getCTX();
        },
        setShapeMarked: function (s, m) {
            return canvas.setShapeMarked(s, m);
        },
        selectShape: function () {
            return canvas.selectShape();
        }
    };
    var shapesSelector = [
        new LineFactory(sm),
        new CircleFactory(sm),
        new RectangleFactory(sm),
        new TriangleFactory(sm),
        new Selector(sm)
    ];
    var toolArea = new ToolArea(shapesSelector, menu[0]);
    canvas = new Canvas(canvasDomElm, toolArea, deleteButton);
    canvas.draw();
}
