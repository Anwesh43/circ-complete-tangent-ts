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
        return Math.min(1 / n, ScaleUtil.divideScale(scale, i, n)) * n 
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

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}