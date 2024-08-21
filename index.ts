// y = x*a + b
type Point = {
    x: number
    y: number
};


function rotate(angle: number, point: Point): Point {
    const rad = Math.PI*angle/180;
    return {x: Math.cos(rad)*point.x-Math.sin(rad)*point.y, y:Math.sin(rad)*point.x+Math.cos(rad)*point.y};
}

class Line {
    name: string
    p1: Point
    p2: Point
    a: number
    b: number
    c: number
    dist: number
    constructor(name: string, d: number, a: number, l: number) {
        this.name = name
        this.p1 = rotate(a, {x: l/2, y: d});
        this.p2 = rotate(a, {x: -l/2, y: d});
        this.dist = d
        this.a = this.p1.y-this.p2.y
        this.b = this.p2.x-this.p1.x
        this.c = this.p1.x*this.p2.y-this.p2.x*this.p1.y
    }
    distance(x: number, y: number): number {
        const sign = Math.sign((this.a*x+this.b*y+this.c)*this.c)
        return sign*(Math.abs(this.a*x+this.b*y+this.c)/Math.sqrt(this.a**2+this.b**2))/this.dist-1}
}
function strokeLine(ctx: CanvasRenderingContext2D, dist: number, angle: number, width: number) {
   ctx.beginPath();
   ctx.moveTo(0, dist);
   ctx.lineTo(ctx.canvas.width, dist);
   ctx.stroke();
}

function render(ctx: CanvasRenderingContext2D, mouseX: number, mouseY: number) {
   ctx.reset()
   ctx.fillStyle = "#fff";
   ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   const center: Point = {x: ctx.canvas.width/2, y: ctx.canvas.height/2};
   const width = 3000;
   const dist = 70;
   var axis = [new Line("player1", dist, 0, width), new Line("player2", dist, 120, width), new Line("player3", dist, 240, width)];


   axis.forEach((ax, index) => {
    ctx.strokeStyle = '#888';
    ctx.setLineDash([15, 5]);
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(ax.p1.x+center.x, ax.p1.y+center.y);
    ctx.lineTo(ax.p2.x+center.x, ax.p2.y+center.y);
    ctx.stroke();

    ctx.beginPath()
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText(ax.name+": "+ax.distance(mouseX-center.x, mouseY-center.y).toFixed(2),10,20*(1+index));
    console.log("Mouse x: "+(mouseX-center.x));
    console.log("Mouse y: "+(mouseY-center.y));
   });

   ctx.beginPath()
   ctx.setLineDash([]);
   ctx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI);
   ctx.fillStyle = "#f00";
   ctx.fill();
}

(() => {
    const canv = document.getElementById("triangle") as (HTMLCanvasElement | null);
    if(canv === null) {
        throw new Error("No canvasss");
    }
    canv.width = 400;
    canv.height = 400;
    const ctx = canv.getContext("2d");
    if(ctx === null) {
        throw new Error("Context not supported");
    }

    window.addEventListener('mousemove', (e: MouseEvent) => {
        var rect = canv.getBoundingClientRect();
        render(ctx, e.offsetX-rect.x, e.offsetY-rect.y);
    });
    console.log(ctx);
})()
console.log("Heey");
