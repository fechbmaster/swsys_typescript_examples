const canvasWidth = 600, canvasHeight = 400;
interface ShapeFactory {
    label: string;
    handleMouseDown(x: number, y: number);
    handleMouseUp(x: number, y: number);
    handleMouseMove(x: number, y: number);
}
interface Shape {
    readonly id: number;
    draw(ctx: CanvasRenderingContext2D, marked: boolean);
    getShapeType(): string;
}
class Point2D {
    constructor(readonly x: number, readonly y: number) {}
}
class AbstractShape {
    private static counter: number = 0;
    readonly id: number;
    constructor(readonly pre_id?: number) {
        if(pre_id)
            this.id = pre_id;
        else
            this.id = AbstractShape.counter++;
    }
}
abstract class AbstractFactory<T extends Shape> {
    private from: Point2D;
    private tmpTo: Point2D;
    private tmpShape: T;

    constructor(readonly shapeManager: ShapeManager) {}

    abstract createShape(from: Point2D, to: Point2D): T;

    handleMouseDown(x: number, y: number) {
        this.from = new Point2D(x, y);
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
        }
        this.shapeManager.addShape(this.createShape(this.from, new Point2D(x,y)));
        this.from = undefined;

    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x,y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x,y));
            this.shapeManager.addShape(this.tmpShape);
        }
    }

}
class Line extends AbstractShape implements Shape {
    constructor(readonly from: Point2D, readonly to: Point2D, readonly pre_id?: number){
        super(pre_id);
    }

    draw(ctx: CanvasRenderingContext2D, marked: boolean) {
        ctx.beginPath();
        if (marked)
            ctx.strokeStyle = 'blue';
        else
            ctx.strokeStyle = 'black';
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();
    }

    getShapeType() {
        return "Line";
    }

}
class LineFactory extends  AbstractFactory<Line> implements ShapeFactory {

    public label: string = "Linie";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Line {
        return new Line(from, to);
    }

}
class Circle extends AbstractShape implements Shape {
    constructor(readonly center: Point2D, readonly radius: number, readonly pre_id?: number){
        super(pre_id);
    }
    draw(ctx: CanvasRenderingContext2D, marked: boolean) {
        ctx.beginPath();
        if (marked)
            ctx.strokeStyle = 'blue';
        else
            ctx.strokeStyle = 'black';
        ctx.arc(this.center.x,this.center.y,this.radius,0,2*Math.PI);
        ctx.stroke();
    }
    getShapeType() {
        return "Circle";
    }
}
class CircleFactory extends AbstractFactory<Circle> implements ShapeFactory{
    public label: string = "Kreis";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Circle {
        return new Circle(from, CircleFactory.computeRadius(from, to.x, to.y));
    }

    private static computeRadius(from: Point2D, x: number, y: number): number {
        const xDiff = (from.x - x),
            yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
}
class Rectangle extends AbstractShape implements Shape {
    constructor(readonly from: Point2D, readonly to: Point2D, readonly pre_id?: number) {
        super(pre_id);
    }

    draw(ctx: CanvasRenderingContext2D, marked: boolean) {
        ctx.beginPath();
        if (marked)
            ctx.strokeStyle = 'blue';
        else
            ctx.strokeStyle = 'black';
        ctx.strokeRect(this.from.x, this.from.y,
            this.to.x - this.from.x, this.to.y - this.from.y);
        ctx.stroke();
    }
    getShapeType() {
        return "Rectangle";
    }
}
class RectangleFactory extends AbstractFactory<Rectangle> implements ShapeFactory{
    public label: string = "Rechteck";
    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Rectangle {
        return new Rectangle(from, to);
    }
}
class Triangle extends AbstractShape implements Shape {

    constructor(readonly p1: Point2D, readonly p2: Point2D, readonly p3: Point2D, readonly pre_id?: number) {
        super(pre_id);
    }
    draw(ctx: CanvasRenderingContext2D, marked: boolean) {
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
    }
    getShapeType() {
        return "Triangle";
    }
}
class TriangleFactory implements ShapeFactory{
    public label: string = "Dreieck";

    private from: Point2D;
    private tmpTo: Point2D;
    private tmpLine: Line;
    private thirdPoint: Point2D;
    private tmpShape: Triangle;

    constructor(readonly shapeManager: ShapeManager) {}

    handleMouseDown(x: number, y: number) {
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            this.shapeManager.addShape(
                new Triangle(this.from, this.tmpTo, new Point2D(x,y)));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        } else {
            this.from = new Point2D(x, y);
        }
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x,y);
            this.thirdPoint = new Point2D(x,y);
            this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape(this.tmpShape);
        }
    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }

        if (this.tmpShape) { // second point already defined, update temp triangle
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x,y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape(this.tmpShape);
            }
        } else { // no second point fixed, update tmp line
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x,y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
                }
                // adds a new temp line
                this.tmpLine = new Line(this.from, this.tmpTo);
                this.shapeManager.addShape(this.tmpLine);
            }
        }
    }
}

class Selector implements ShapeFactory{
    public label: string = "Auswählen";

    private currentShape: Shape;
    readonly radius: number = 20;

    constructor(readonly shapeManager: ShapeManager) {}

    handleMouseDown(x: number, y: number) {
        this.shapeManager.selectShape();
    }

    handleMouseUp(x: number, y: number) {

    }

    handleMouseMove(x: number, y: number) {
        for (let id in this.shapeManager.getShapes() ){
            let tmpShape: Shape = this.shapeManager.getShapes()[id];
            if (tmpShape instanceof Line) {
                let line: Line = tmpShape;
                let gotHit: boolean = this.calculateCircleLineIntersection(x,y,line.from, line.to);
                this.shapeManager.setShapeMarked(line,gotHit);
            }
            if (tmpShape instanceof Triangle) {
                let triangle: Triangle = tmpShape;
                let paths: [[Point2D, Point2D],[Point2D, Point2D],[Point2D, Point2D]];
                paths = [[triangle.p1, triangle.p2],[triangle.p2,triangle.p3], [triangle.p3,triangle.p1]];
                for (let i = 0; i < paths.length; i++) {
                    let path: [Point2D, Point2D] = paths[i];
                    var gotHit: boolean = this.calculateCircleLineIntersection(x,y,path[0],path[1]);
                    if(gotHit) break;
                }
                this.shapeManager.setShapeMarked(triangle,gotHit);
            }
            if (tmpShape instanceof Rectangle) {
                let rectangle: Rectangle = tmpShape;
                let paths: [[Point2D, Point2D],[Point2D, Point2D],[Point2D, Point2D],[Point2D, Point2D]];
                // Right Down Corner
                let rdc = new Point2D(rectangle.to.x,rectangle.from.y);
                // Left Upper Corner
                let luc = new Point2D(rectangle.from.x,rectangle.to.y);
                paths = [[rectangle.from, rdc],[rdc,rectangle.to], [rectangle.to,luc], [luc, rectangle.from]];
                for (let i = 0; i < paths.length; i++) {
                    let path: [Point2D, Point2D] = paths[i];
                    var gotHit: boolean = this.calculateCircleLineIntersection(x,y,path[0],path[1]);
                    if(gotHit) break;
                }
                this.shapeManager.setShapeMarked(rectangle,gotHit);
            }
            if (tmpShape instanceof Circle) {
                let circle: Circle = tmpShape;
                let gotHit: boolean = this.calculateCircleToCircleCollision(x,y,circle.center,circle.radius);
                this.shapeManager.setShapeMarked(circle,gotHit);
            }
        }
    }

    calculateCircleLineIntersection(cx: number, cy: number, p1: Point2D, p2: Point2D): boolean {

        let p1_dis = new Point2D(p1.x - cx, p1.y - cy);
        let p2_dis = new Point2D(p2.x - cx, p2.y - cy);

        let a = (p2_dis.x - p1_dis.x)*(p2_dis.x-p1_dis.x) + (p2_dis.y - p1_dis.y) * (p2_dis.y - p1_dis.y);
        let b = 2*(p1_dis.x*(p2_dis.x -p1_dis.x) + p1_dis.y*(p2_dis.y - p1_dis.y));
        let c = p1_dis.x*p1_dis.x + p1_dis.y*p1_dis.y - this.radius * this.radius;

        let disc = b*b - 4*a*c;
        if(disc < 0) return false;
        let sqrtdisc = Math.sqrt(disc);

        let t1 = (-b - sqrtdisc)/(2*a);
        let t2 = (-b + sqrtdisc)/(2*a);
        if(t1 >= 0 && t1 <= 1) return true;
        if(t2 >= 0 && t2 <= 1) return true;

        return false;
    }

    calculateCircleToCircleCollision(cx: number, cy: number, c2: Point2D, circleRadius: number) {
        let c1 = new Point2D(cx,cy);
        let d = Math.sqrt( (c2.x-c1.x) * (c2.x-c1.x) + (c2.y-c1.y) * (c2.y -c1.y));
        // must be outside to select just the line
        if ((d < (this.radius + circleRadius)) && (d >= Math.abs(this.radius - circleRadius))) return true;
        return false;
    }
}

class RemoveShape implements Shape {
    constructor(readonly id: number){
    };

    draw(ctx: CanvasRenderingContext2D, marked: boolean) {
    }

    getShapeType() {
        return "RemoveShape";
    }
}

class MoveFactory implements ShapeFactory {
    public label: string = "Verschieben";

    private from: Point2D;

    constructor(readonly shapeManager: ShapeManager) {}

    handleMouseDown(x: number, y: number) {
        this.from = new Point2D(x,y);
    }

    handleMouseUp(x: number, y: number) {
        this.from = null;
    }

    handleMouseMove(x: number, y: number) {
        if (this.from) {
            let delta: Point2D = new Point2D(x - this.from.x, y - this.from.y);
            this.shapeManager.moveShape(delta);
            this.from = new Point2D(x, y);
        }
    }
}

class Shapes {
}

class ToolArea {
    private selectedShape: ShapeFactory = undefined;
    constructor(shapesSelector: ShapeFactory[], menue: Element) {
        const domElms = [];
        shapesSelector.forEach(sl => {
            const domSelElement = document.createElement("li");
            domSelElement.innerText = sl.label;
            menue.appendChild(domSelElement);
            domElms.push(domSelElement);

            domSelElement.addEventListener("click", () => {
                selectFactory.call(this, sl, domSelElement);
            });
        });

        function selectFactory(sl: ShapeFactory, domElm: HTMLElement) {
            // remove class from all elements
            for (let j = 0; j < domElms.length; j++) {
                domElms[j].classList.remove("marked");
            }
            this.selectedShape = sl;
            // add class to the one that is selected currently
            domElm.classList.add("marked");
        }

        const selectButton = document.createElement("button");

    }

    getSelectedShape(): ShapeFactory {
        return this.selectedShape;
    }

}

interface ShapeManager {
    addShape(shape: Shape, redraw?: boolean): this;
    removeShape(shape: Shape, redraw?: boolean): this;
    removeShapeWithId(id: number, redraw?: boolean): this;
    getShapes(): { [p: number]: Shape };
    selectShape(): this;
    setShapeMarked(shape: Shape, marked: boolean);
    getCTX(): CanvasRenderingContext2D;
    moveShape(to: Point2D): this;
}
class Canvas implements ShapeManager {
    private ctx: CanvasRenderingContext2D;
    private shapes: {[p: number]: Shape} = {};
    private marked:  {[p: number]: boolean} = {};
    private selectedShapeID: number = null;

    constructor(canvasDomElement: HTMLCanvasElement,
                toolarea: ToolArea, deleteButton: HTMLButtonElement, private textarea: HTMLTextAreaElement,
                timeMachine: HTMLButtonElement) {
        deleteButton.addEventListener("click", d => {
            if(this.selectedShapeID !== null) {
                return this.removeShapeWithId(this.selectedShapeID, true);
            }
            window.alert("No shapes selected yet!");
        });

        timeMachine.addEventListener("click", d => {
            this.reset();
            let shapeArray: Shape[] = [];
            for (let line of textarea.value.split("\n")) {
                if (line) {
                    let tmpShape;
                    let tmpJSONShape = JSON.parse(line);
                    for (let key in tmpJSONShape ) {
                        if (key === "Line") {
                            tmpShape = new Line(new Point2D(tmpJSONShape[key].from.x, tmpJSONShape[key].from.y),
                                new Point2D(tmpJSONShape[key].to.x, tmpJSONShape[key].to.y), tmpJSONShape[key].id);
                        }
                        if(key === "Circle") {
                            tmpShape = new Circle(new Point2D(tmpJSONShape[key].center.x, tmpJSONShape[key].center.y),
                                tmpJSONShape[key].radius, tmpJSONShape[key].id);
                        }
                        if(key === "Rectangle") {
                            tmpShape = new Rectangle(new Point2D(tmpJSONShape[key].from.x, tmpJSONShape[key].from.y),
                                new Point2D(tmpJSONShape[key].to.x, tmpJSONShape[key].to.y), tmpJSONShape[key].id);
                        }
                        if(key === "Triangle") {
                            tmpShape = new Triangle(new Point2D(tmpJSONShape[key].p1.x, tmpJSONShape[key].p1.y),
                                new Point2D(tmpJSONShape[key].p2.x, tmpJSONShape[key].p2.y),
                                new Point2D(tmpJSONShape[key].p3.x, tmpJSONShape[key].p3.y) , tmpJSONShape[key].id);
                        }
                        if(key === "RemoveShape") {
                            tmpShape = new RemoveShape(tmpJSONShape[key].id);
                        }
                    }
                    shapeArray.push(tmpShape);
                }
            }
            this.performAction(shapeArray);
            textarea.value = "";
        });

        this.ctx = canvasDomElement.getContext("2d");
        canvasDomElement.addEventListener("mousemove",
            createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown",
            createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup",
            createMouseHandler("handleMouseUp"));

        function createMouseHandler(methodName: string) {
            return function (e) {
                e = e || window.event;

                if ('object' === typeof e) {
                    const btnCode = e.button,
                        x = e.pageX - this.offsetLeft,
                        y = e.pageY - this.offsetTop,
                        ss = toolarea.getSelectedShape();
                    // if left mouse button is pressed,
                    // and if a tool is selected, do something
                    if (e.button === 0 && ss) {
                        const m = ss[methodName];
                        // This in the shapeFactory should be the factory itself.
                        m.call(ss, x, y);
                    }
                }
            }
        }

        function deleteSelectedShape() {

        }
    }

    draw(): this {
        // TODO: it there a better way to reset the canvas?
        this.ctx.beginPath();
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.ctx.stroke();

        // draw shapes
        this.ctx.fillStyle = 'black';
        for (let id in this.shapes) {
            if(Number(id) === this.selectedShapeID) {
                let tmp: Shape = this.shapes[id];
                if(tmp instanceof Line) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(tmp.from.x-5, tmp.from.y-5,
                        10, 10);
                    this.ctx.strokeRect(tmp.to.x-5, tmp.to.y-5,
                        10, 10);
                    this.ctx.stroke();
                }
                if (tmp instanceof Rectangle) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(tmp.from.x-5, tmp.from.y-5,
                        10, 10);
                    this.ctx.strokeRect(tmp.to.x-5, tmp.to.y-5,
                        10, 10);
                    this.ctx.strokeRect(tmp.to.x-5, tmp.from.y-5,
                        10, 10);
                    this.ctx.strokeRect(tmp.from.x-5, tmp.to.y-5,
                        10, 10);
                    this.ctx.stroke();
                }
                if (tmp instanceof Triangle) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(tmp.p1.x-5, tmp.p1.y-5,
                        10, 10);
                    this.ctx.strokeRect(tmp.p2.x-5, tmp.p2.y-5,
                        10, 10);
                    this.ctx.strokeRect(tmp.p3.x-5, tmp.p3.y-5,
                        10, 10);
                    this.ctx.stroke();
                }
                if (tmp instanceof Circle) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(tmp.center.x-tmp.radius-5, tmp.center.y-5,
                        10, 10);
                    this.ctx.strokeRect(tmp.center.x+tmp.radius-5, tmp.center.y-5,
                        10, 10);
                    this.ctx.strokeRect(tmp.center.x-5, tmp.center.y+tmp.radius-5,
                        10, 10);
                    this.ctx.strokeRect(tmp.center.x-5, tmp.center.y-tmp.radius-5,
                        10, 10);
                    this.ctx.stroke();
                }
            }
            this.shapes[id].draw(this.ctx, this.marked[id]);
        }
        return this;
    }

    addShape(shape: Shape, redraw: boolean = true): this {
        this.shapes[shape.id] = shape;
        this.marked[shape.id] = false;
        this.textarea.value += '{"' + shape.getShapeType() + '": ' + JSON.stringify(shape) + '}\n';
        return redraw ? this.draw() : this;
    }

    getShapes(): {[p: number]: Shape} {
        return this.shapes;
    }

    removeShape(shape: Shape, redraw: boolean = true): this {
        const id = shape.id;
        delete this.shapes[id];
        delete this.marked[id];
        let rmvShape: RemoveShape = new RemoveShape(shape.id);
        this.textarea.value += '{"' + rmvShape.getShapeType() + '": ' + JSON.stringify(rmvShape) + '}\n';
        return redraw ? this.draw() : this;
    }

    removeShapeWithId(id: number, redraw: boolean = true): this {
        delete this.shapes[id];
        delete this.marked[id];
        let rmvShape: RemoveShape = new RemoveShape(id);
        this.textarea.value += '{"' + rmvShape.getShapeType() + '": ' + JSON.stringify(rmvShape) + '}\n';
        return redraw ? this.draw() : this;
    }

    // Getter and Setter

    selectShape(): this{
        let sth_marked: boolean = false;
        let tmp_id = this.selectedShapeID;
        for (let id in this.marked) {
            // Search for all
            if (this.marked[id]) {
                sth_marked = true;
                // Get out of function if selectedShape initially gets set
                if (tmp_id === null) {this.selectedShapeID = Number(id); return this.draw();}
                else {
                    // search for next elements
                    for (let id_n in this.marked) {
                        if (this.marked[id_n] && Number(id_n) > tmp_id) {
                            this.selectedShapeID = Number(id_n);
                            return this.draw();
                        }
                    }
                    // no next elements found ...
                    // search for previous elements
                    for (let id_p in this.marked) {
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
        if (!sth_marked) this.selectedShapeID = null;
        return this.draw();
    }

    setShapeMarked(shape: Shape, marked: boolean) {
        this.marked[shape.id] = marked;
        this.draw();
    }

    getCTX(): CanvasRenderingContext2D {
        return this.ctx;
    }

    moveShape(delta: Point2D): this {
        let tmpShape: Shape = this.shapes[this.selectedShapeID];
        if(tmpShape === null)
            return;
        if (tmpShape instanceof Line) {
            let from: Point2D = new Point2D(delta.x + tmpShape.from.x, delta.y + tmpShape.from.y);
            let to: Point2D = new Point2D(delta.x + tmpShape.to.x, delta.y + tmpShape.to.y);
            this.removeShape(tmpShape, true);
            let newLine: Line = new Line(from, to);
            this.selectedShapeID = newLine.id;
            this.addShape(newLine, true);
        }
        if (tmpShape instanceof Triangle) {
            let p1: Point2D = new Point2D(delta.x + tmpShape.p1.x, delta.y + tmpShape.p1.y);
            let p2: Point2D = new Point2D(delta.x + tmpShape.p2.x, delta.y + tmpShape.p2.y);
            let p3: Point2D = new Point2D(delta.x + tmpShape.p3.x, delta.y + tmpShape.p3.y);
            this.removeShape(tmpShape, true);
            let newTri: Triangle = new Triangle(p1, p2, p3);
            this.selectedShapeID = newTri.id;
            this.addShape(newTri, true);
        }
        if (tmpShape instanceof Rectangle) {
            let from: Point2D = new Point2D(delta.x + tmpShape.from.x, delta.y + tmpShape.from.y);
            let to: Point2D = new Point2D(delta.x + tmpShape.to.x, delta.y + tmpShape.to.y);
            this.removeShape(tmpShape, true);
            let newRect: Rectangle = new Rectangle(from, to);
            this.selectedShapeID = newRect.id;
            this.addShape(newRect, true);
        }
        if (tmpShape instanceof Circle) {
            let center: Point2D = new Point2D(delta.x + tmpShape.center.x, delta.y + tmpShape.center.y);
            let radius = tmpShape.radius;
            this.removeShape(tmpShape, true);
            let newCirc: Circle = new Circle(center, radius);
            this.selectedShapeID = newCirc.id;
            this.addShape(newCirc, true);
        }
    }

    performAction(shapeList: Shape[]) {
        for (let shape of shapeList) {
            if (shape instanceof RemoveShape) {
                this.removeShapeWithId(shape.id);
            }
            else {
                this.addShape(shape);
            }
        }
    }

    reset() {
        this.shapes = {};
        this.draw();
    }

}

function init() {
    const canvasDomElm = document.getElementById("drawArea") as HTMLCanvasElement;
    const menu = document.getElementsByClassName("tools");
    const deleteButton = document.getElementById("deleteButton") as HTMLButtonElement;
    const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
    const timeTravelButton = document.getElementById("timeMachine") as HTMLButtonElement;
    // Problem here: Factories needs a way to create new Shapes, so they
    // have to call a method of the canvas.
    // The canvas on the other side wants to call the event methods
    // on the toolbar, because the toolbar knows what tool is currently
    // selected.
    // Anyway, we do not want the two to have references on each other
    let canvas: Canvas;
    const sm: ShapeManager = {
        addShape(s, rd) {
            return canvas.addShape(s,rd);
        },
        removeShape(s,rd) {
            return canvas.removeShape(s,rd);
        },
        removeShapeWithId(id, rd) {
            return canvas.removeShapeWithId(id, rd);
        },
        getShapes() {
            return canvas.getShapes();
        },
        getCTX() {
            return canvas.getCTX();
        },
        setShapeMarked(s,m) {
            return canvas.setShapeMarked(s,m);
        },
        selectShape() {
            return canvas.selectShape();
        },
        moveShape(p) {
            return canvas.moveShape(p);
        }

    };
    const shapesSelector: ShapeFactory[] = [
        new LineFactory(sm),
        new CircleFactory(sm),
        new RectangleFactory(sm),
        new TriangleFactory(sm),
        new Selector(sm),
        new MoveFactory(sm)
    ];
    const toolArea = new ToolArea(shapesSelector, menu[0]);
    canvas = new Canvas(canvasDomElm, toolArea, deleteButton, textarea, timeTravelButton);
    canvas.draw();
}