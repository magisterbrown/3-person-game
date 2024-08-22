"use strict";
function rotate(angle, point) {
    const rad = Math.PI * angle / 180;
    return { x: Math.cos(rad) * point.x - Math.sin(rad) * point.y, y: Math.sin(rad) * point.x + Math.cos(rad) * point.y };
}
function isValid(imp) {
    return imp.p1 > -1 && imp.p2 > -1 && imp.p3 > -1;
}
function cmp(a, b) {
    if (Math.abs(a - b) < 0.03)
        return 0;
    else if (a > b)
        return 1;
    return -1;
}
function dominations(imp, sol) {
    let anyd = false;
    for (let i = 0; i < sol.length; i++) {
        const domn = cmp(imp.p1, sol[i].p1) + cmp(imp.p2, sol[i].p2) + cmp(imp.p3, sol[i].p3);
        if (domn < 0)
            return -1;
        anyd = anyd || domn > 0;
    }
    if (anyd)
        return 1;
    return 0;
}
class Line {
    constructor(name, d, a, l) {
        this.name = name;
        this.p1 = rotate(a, { x: l / 2, y: d });
        this.p2 = rotate(a, { x: -l / 2, y: d });
        this.dist = d;
        this.a = this.p1.y - this.p2.y;
        this.b = this.p2.x - this.p1.x;
        this.c = this.p1.x * this.p2.y - this.p2.x * this.p1.y;
    }
    distance(x, y) {
        const sign = Math.sign((this.a * x + this.b * y + this.c) * this.c);
        return sign * (Math.abs(this.a * x + this.b * y + this.c) / Math.sqrt(this.a ** 2 + this.b ** 2)) / this.dist - 1;
    }
    getX(y) {
        return (-this.c - this.b * y) / this.a;
    }
}
function strokeLine(ctx, dist, angle, width) {
    ctx.beginPath();
    ctx.moveTo(0, dist);
    ctx.lineTo(ctx.canvas.width, dist);
    ctx.stroke();
}
function render(ctx, mouseX, mouseY) {
    ctx.reset();
    const center = { x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 };
    const width = 3000;
    const dist = 70;
    var axis = [new Line("player1", dist, 0, width), new Line("player2", dist, 120, width), new Line("player3", dist, 240, width)];
    const background = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
    const selector = document.getElementById("nsol");
    if (selector === null)
        throw new Error("selector not detected");
    var drawP = [];
    var sol = [];
    switch (selector.value) {
        case "1": {
            drawP.push({ x: mouseX, y: mouseY });
            sol.push({ p1: axis[0].distance(mouseX - center.x, mouseY - center.y), p2: axis[1].distance(mouseX - center.x, mouseY - center.y), p3: axis[2].distance(mouseX - center.x, mouseY - center.y) });
            break;
        }
        case "2": {
            const xp1 = axis[1].getX(mouseY - center.y);
            const xp2 = axis[2].getX(mouseY - center.y);
            drawP.push({ x: xp1 + center.x, y: mouseY });
            drawP.push({ x: xp2 + center.x, y: mouseY });
            sol.push({ p1: axis[0].distance(xp1, mouseY - center.y + 1), p2: axis[1].distance(xp1, mouseY - center.y + 1), p3: axis[2].distance(xp1, mouseY - center.y + 1) });
            sol.push({ p1: axis[0].distance(xp2, mouseY - center.y - 1), p2: axis[1].distance(xp2, mouseY - center.y - 1), p3: axis[2].distance(xp2, mouseY - center.y - 1) });
            break;
        }
        case "3": {
            drawP.push({ x: center.x, y: center.y + axis[0].dist });
            const yp = -axis[0].dist / 2;
            const xp1 = axis[1].getX(yp);
            const xp2 = axis[2].getX(yp);
            drawP.push({ x: center.x + xp1, y: center.y + yp });
            drawP.push({ x: center.x + xp2, y: center.y + yp });
            sol.push({ p1: axis[0].distance(0, axis[0].dist - 1), p2: axis[1].distance(0, axis[0].dist - 1), p3: axis[2].distance(0, axis[0].dist - 1) });
            sol.push({ p1: axis[0].distance(xp1, yp + 1), p2: axis[1].distance(xp1, yp + 1), p3: axis[2].distance(xp1, yp + 1) });
            sol.push({ p1: axis[0].distance(xp2, yp - 1), p2: axis[1].distance(xp2, yp - 1), p3: axis[2].distance(xp2, yp - 1) });
            break;
        }
    }
    for (let i = 0; i < background.data.length; i += 4) {
        const xp = Math.floor((i % (ctx.canvas.width * 4)) / 4);
        const yp = Math.floor(i / (ctx.canvas.width * 4));
        const pix = { p1: axis[0].distance(xp - center.x, yp - center.y), p2: axis[1].distance(xp - center.x, yp - center.y), p3: axis[2].distance(xp - center.x, yp - center.y) };
        background.data[i] = 255;
        background.data[i + 1] = 255;
        background.data[i + 2] = 255;
        background.data[i + 3] = 255;
        if (isValid(pix)) {
            if (dominations(pix, sol) > 0 || !isValid(sol[0]))
                background.data[i + 2] = 100;
            else if (dominations(pix, sol) < 0)
                background.data[i] = 255;
            else if (dominations(pix, sol) == 0)
                background.data[i + 1] = 100;
        }
    }
    ctx.putImageData(background, 0, 0);
    axis.forEach((ax, index) => {
        ctx.strokeStyle = '#888';
        ctx.setLineDash([15, 5]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ax.p1.x + center.x, ax.p1.y + center.y);
        ctx.lineTo(ax.p2.x + center.x, ax.p2.y + center.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText(ax.name + ": " + ax.distance(mouseX - center.x, mouseY - center.y).toFixed(2), 10, 20 * (1 + index));
        console.log("Mouse x: " + (mouseX - center.x));
        console.log("Mouse y: " + (mouseY - center.y));
    });
    drawP.forEach((pt) => {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(pt.x, pt.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#f00";
        ctx.fill();
    });
}
(() => {
    const canv = document.getElementById("triangle");
    if (canv === null) {
        throw new Error("No canvasss");
    }
    canv.width = 400;
    canv.height = 400;
    const ctx = canv.getContext("2d");
    if (ctx === null) {
        throw new Error("Context not supported");
    }
    window.addEventListener('mousemove', (e) => {
        var rect = canv.getBoundingClientRect();
        console.log(rect.x);
        render(ctx, e.offsetX, e.offsetY);
    });
    console.log(ctx);
})();
console.log("Heey");
