const w : number = window.innerWidth 
const h : number = window.innerHeight
const lines : number = 4 
const parts : number = lines + 3  
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const sizeFactor : number = 5.9 
const delay : number = 20 
const colors : Array<string> = [
    "#3F51B5",
    "#4CAF50",
    "#F44336",
    "#FF9800",
    "#2196F3"
]
const backColor : string = "#BDBDBD"
const gap : number = (2 * Math.PI) / lines 

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, r : number, scale : number) {
        context.beginPath()
        for (var i = 0; i <= 360 * scale; i++) {
            const x = r * Math.cos(i * (Math.PI / 180))
            const y = r * Math.sin(i * (Math.PI / 180))
            if (i == 0) {

            } else {
                context.lineTo(x, y)
            }
        }
        context.stroke()
    }

    static drawCircCompleteTangent(context : CanvasRenderingContext2D, scale : number) {
        const r : number = Math.min(w, h) / sizeFactor
        const sf : number = ScaleUtil.sinify(scale) 
        context.save()
        context.translate(w / 2, h / 2)
        DrawingUtil.drawCircle(context, r, ScaleUtil.divideScale(sf, 0, parts))
        for (var j = 0; j < lines; j++) {
            context.save()
            context.rotate(gap * j)
            DrawingUtil.drawLine(context, r, -r, r, -r + 2 * r * ScaleUtil.divideScale(sf, j, parts))
            context.restore()
        }        
        context.restore()
    }

    static drawCCTNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        DrawingUtil.drawCircCompleteTangent(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }

    update(cb : Function) {
        this.scale += this.dir * scGap 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)  
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class CCTNode {

    prev : CCTNode 
    next : CCTNode 
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new CCTNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawCCTNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : CCTNode {
        var curr : CCTNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
}

class CircCompleteTangent {

    curr : CCTNode = new CCTNode(0)
    dir : number = 1 

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    cct : CircCompleteTangent = new CircCompleteTangent()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.cct.draw(context)
    }

    handleTap(cb : Function) {
        this.cct.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.cct.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}