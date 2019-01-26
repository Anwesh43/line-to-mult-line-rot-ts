const nodes : number = 5
const lines : number = 4
const scGap : number = 0.05
const scDiv : number = 0.51
const strokeFactor : number = 90
const sizeFactor : number = 2.8
const foreColor : string = "#673AB7"
const backColor : string = "#BDBDBD"
const w : number = window.innerWidth
const h : number = window.innerHeight

const maxScale : Function = (scale : number, i : number, n : number) : number => {
  return Math.max(0, scale - i / n)
}
const divideScale : Function  = (scale : number, i : number, n : number) : number => {
    return Math.min(1/n, maxScale(scale, i, n)) * n
}
const scaleFactor : Function = (scale : number) : number => Math.floor(scale / scDiv)
const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    const k : number = scaleFactor(scale)
    return (1 - k) / a + k / b
}
const updateValue : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const drawVerToHorLine = (context : CanvasRenderingContext2D, i : number, size : number, scale : number) => {
    context.save()
    context.translate(0, size * i)
    context.beginPath()
    context.moveTo(0, size * scale)
    context.lineTo(0, size)
    context.stroke()
    context.beginPath()
    context.moveTo(0, size)
    context.lineTo(size * scale, size)
    context.stroke()
    context.restore()
}
const drawLTMRNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const gap : number = w / (nodes + 1)
    const size : number = gap / sizeFactor
    const ySize : number = size / lines
    context.strokeStyle = foreColor
    context.lineCap = 'round'
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.save()
    context.translate(gap * (i + 1), h / 2)
    context.rotate(Math.PI/2 * ( 1 - sc2))
    for (var j = 0; j < lines; j++) {
        drawVerToHorLine(context, j, ySize, divideScale(sc2, j, lines))
    }
    context.restore()
}
