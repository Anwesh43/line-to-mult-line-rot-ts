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

class LineToMultRotStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
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
        const stage : LineToMultRotStage = new LineToMultRotStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += updateValue(this.scale, this.dir, 1, lines)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb) {
        if (this.dir == 0) {
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
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (!this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LTMRNode {
    state : State = new State()
    prev : LTMRNode
    next : LTMRNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new LTMRNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawLTMRNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : LTMRNode {
        var curr : LTMRNode = this.prev
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

class LineToMultRot {
    root : LTMRNode = new LTMRNode(0)
    curr : LTMRNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
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
    ltmr : LineToMultRot = new LineToMultRot()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.ltmr.draw(context)
    }

    handleTap(cb : Function) {
        this.ltmr.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.ltmr.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
