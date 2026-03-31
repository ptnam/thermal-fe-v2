type Range = {
  points: { x: number; y: number }[]
  strokeStyle: string
  fillStyle: string
}

export class PolygonDrawer {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private points: { x: number; y: number }[] = [];
  private ranges: Range[] = []
  private isDrawing = false
  private readonly onComplete?: (points: { x: number; y: number }[]) => void
  private readonly onCountPoint?: (points: { x: number; y: number }[]) => void
  private readonly strokeStyle: string
  private readonly fillStyle: string

  constructor(
    canvas: HTMLCanvasElement,
    onComplete?: (points: { x: number; y: number }[]) => void,
    onCountPoint?: (points: { x: number; y: number }[]) => void,
    strokeStyle: string = 'white',
    fillStyle: string = 'green',
  ) {
    this.canvas = canvas
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not found')
    this.ctx = ctx
    this.strokeStyle = strokeStyle
    this.fillStyle = fillStyle
    this.onComplete = onComplete
    this.onCountPoint = onCountPoint

    this.handleClick = this.handleClick.bind(this)
    this.handleDblClick = this.handleDblClick.bind(this)
  }

  start() {
    this.isDrawing = true
    this.points = []
    this.canvas.addEventListener('click', this.handleClick)
    this.canvas.addEventListener('dblclick', this.handleDblClick)
  }

  stop() {
    this.isDrawing = false
    this.canvas.removeEventListener('click', this.handleClick)
    this.canvas.removeEventListener('dblclick', this.handleDblClick)
  }

  loadRanges(ranges: Range[]) {
    this.ranges = ranges || []
    this.redraw()
  }

  private handleClick(e: MouseEvent) {
    if (!this.isDrawing) return
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    this.points.push({x, y})
    this?.onCountPoint && this.onCountPoint(this.points);
    this.redraw()
  }

  private handleDblClick() {
    if (this.points.length > 2) {
      this.finishPolygon()
    }
  }

  private clearLastPoint()
  {
    this.points.pop()
    this?.onCountPoint && this.onCountPoint(this.points);
    this.redraw();
  }

  private redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 🔹 Vẽ các polygon đã load
    for (const range of this.ranges) {
      if (range && !range.points.length) continue

      this.ctx.beginPath()
      this.ctx.moveTo(range.points[0].x, range.points[0].y)

      for (let i = 1; i < range.points.length; i++) {
        this.ctx.lineTo(range.points[i].x, range.points[i].y)
      }

      if (range.points.length > 2) {
        this.ctx.closePath()
      }

      this.ctx.strokeStyle = range.strokeStyle
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      this.ctx.fillStyle = range.fillStyle

      // vẽ điểm
      for (const p of range.points) {
        this.ctx.beginPath()
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        this.ctx.fillStyle = range.fillStyle
        this.ctx.fill()
      }
    }

    // 🔹 Vẽ polygon đang vẽ (this.points)
    if (this.points.length === 0) return

    this.ctx.beginPath()
    this.ctx.moveTo(this.points[0].x, this.points[0].y)

    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y)
    }

    if (this.points.length > 2) {
      this.ctx.lineTo(this.points[0].x, this.points[0].y)
    }

    this.ctx.strokeStyle = this.strokeStyle
    this.ctx.lineWidth = 2
    this.ctx.stroke()

    for (const p of this.points) {
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      this.ctx.fillStyle = this.fillStyle
      this.ctx.fill()
    }
  }

  private finishPolygon() {
    this.ctx.closePath()
    this.ctx.fillStyle = 'rgba(255,0,0,0.3)'
    this.ctx.fill()
    this.ctx.stroke()

    this.stop()
    this.onComplete?.(this.points)
  }

  removeAllPoint() {
    this.points = []
    this.ranges = []
    this.onCountPoint?.([])
    this.redraw()
  }

  removePoint() {
    this.points = []
    this.onCountPoint?.([])
    this.redraw()
  }

  isConvex(): boolean {
    const n = this.points.length
    if (n < 3) return false

    let sign = 0
    for (let i = 0; i < n; i++) {
      const p0 = this.points[i]
      const p1 = this.points[(i + 1) % n]
      const p2 = this.points[(i + 2) % n]

      const dx1 = p1.x - p0.x
      const dy1 = p1.y - p0.y
      const dx2 = p2.x - p1.x
      const dy2 = p2.y - p1.y

      // Cross product z-component
      const cross = dx1 * dy2 - dy1 * dx2

      if (cross !== 0) {
        if (sign === 0) {
          sign = cross > 0 ? 1 : -1
        } else if ((cross > 0 ? 1 : -1) !== sign) {
          return false
        }
      }
    }
    return true
  }

  showFullScreenAlert(element, message: string, callBack = null) {
    const overlay = document.createElement('div')
    overlay.className =
      "fixed inset-0 bg-opacity-60 flex items-center justify-center z-[9999]"

    const box = document.createElement('div')
    box.className =
      "rounded-xl shadow-lg p-6 max-w-md w-full bg-[#1E293B] text-center transform transition-all scale-100"
    box.innerHTML = `
        <div class="text-2xl font-bold mb-4">${message}</div>
        <button class="px-4 py-2 rounded-lg font-semibold">
            Đóng
        </button>
    `
    const button = box.querySelector('button')
    button?.addEventListener('click', () => {
      overlay.remove()
      if (callBack) {
        callBack()
      }
    })

    overlay.appendChild(box)
    element.value.appendChild(overlay)
  }


}
