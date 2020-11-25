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
