export class PolygonDrawer {
    private readonly canvas: HTMLCanvasElement
    private readonly ctx: CanvasRenderingContext2D
    private points: { x: number; y: number }[] = []
    private isDrawing = false
    private readonly onComplete?: (points: { x: number; y: number }[]) => void
    private readonly onCountPoint?: (points: { x: number; y: number }[]) => void

    constructor(
        canvas: HTMLCanvasElement,
        onComplete?: (points: { x: number; y: number }[]) => void,
        onCountPoint?: (points: { x: number; y: number }[]) => void
    ) {
        this.canvas = canvas
        const ctx = this.canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas context not found')
        this.ctx = ctx
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

    private redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.points.length === 0) return

        this.ctx.beginPath()
        this.ctx.moveTo(this.points[0].x, this.points[0].y)
        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y)
        }
        // Nối liền điểm cuối về điểm đầu để đóng đa giác
        if (this.points.length > 2) {
            this.ctx.lineTo(this.points[0].x, this.points[0].y)
        }
        this.ctx.strokeStyle = 'white'
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Vẽ các điểm
        for (const p of this.points) {
            this.ctx.beginPath()
            this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
            this.ctx.fillStyle = 'green'
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

    showFullScreenAlert(element , message: string) {
        const overlay = document.createElement('div')
        overlay.className =
            "fixed inset-0 bg-opacity-60 flex items-center justify-center z-[9999]"

        const box = document.createElement('div')
        box.className =
            "bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center transform transition-all scale-100"
        box.innerHTML = `
        <div class="text-2xl font-bold mb-4">${message}</div>
        <button class="px-4 py-2 rounded-lg font-semibold">
            Đóng
        </button>
    `

        // Nút đóng
        const button = box.querySelector('button')
        button?.addEventListener('click', () => {
            overlay.remove()
        })

        overlay.appendChild(box)
        element.value.appendChild(overlay)
    }


}
