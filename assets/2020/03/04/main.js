// set up sliders
let nSlider = $('#nSlider'),
    nLabel = $('#nLabel'),
    lambdaSlider = $('#lambdaSlider'),
    lambdaLabel = $('#lambdaLabel');
let n = 10, lambda = 1;

nSlider.on('change', function () {
    n = parseInt(this.value);
    nLabel.html(n);
});
lambdaSlider.on('change', function () {
    lambda = parseInt(this.value);
    lambdaLabel.html(lambda);
});

nSlider.val(n); 
lambdaSlider.val(lambda);
nSlider.trigger('change');
lambdaSlider.trigger('change');

function makeSVG(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
}

function p(x, y) {
    return { 'x': x, 'y': y };
}

// parameters
let HEIGHT = 400;
let WIDTH = 400;

let XMAX = 10;
let YMAX = 10;
let XMIN = -10;
let YMIN = -10;

svg = $('.cartesian').attr({
    height: HEIGHT,
    width: WIDTH
});

// x and y axes
yAxis = svg.append(makeSVG('line', {
    x1: WIDTH / 2,
    x2: WIDTH / 2,
    y1: 0,
    y2: HEIGHT
}));
svg.append(yAxis);

xAxis = svg.append(makeSVG('line', {
    x1: 0,
    x2: WIDTH,
    y1: HEIGHT / 2,
    y2: HEIGHT / 2
}));nSlider.val()

svg.append(xAxis);

function makeData(n, xmin, xmax, ymin, ymax) {
    data = [];
    for (let i = 0; i < n; i++) {
        let x = xmin + i * (xmax - xmin) / n,
            y = 3 * Math.sin(x / 3);
        data.push(p(x, y));
    }

    return data;
}

function transformPoint(pt) {
    let xScale = WIDTH / (XMAX - XMIN);
    let yScale = HEIGHT / (YMAX - YMIN);
    let xTrans = xScale * (-XMIN + pt.x);
    let yTrans = yScale * (-YMIN + pt.y);

    return {
        'x': xTrans,
        'y': yTrans
    };
}

function makePoint(pt) {
    let xScale = WIDTH / (XMAX - XMIN);
    let yScale = HEIGHT / (YMAX - YMIN);
    let xTrans = xScale * (-XMIN + pt.x);
    let yTrans = yScale * (-YMIN + pt.y);

    return makeSVG('circle', {
        'r': 3,
        'transform': `translate(${xTrans}, ${yTrans})`
    });
}

class BestFitView {
    constructor() {
        this.lines = {};
        this.points = [];
    }

    addLine(i, j, pi, pj) {
        let pi2 = transformPoint(pi),
            pj2 = transformPoint(pj);
        let line = makeSVG('line', {
            'x1': pi2.x,
            'y1': pi2.y,
            'x2': pj2.x,
            'y2': pj2.y
        });

        svg.append(line);

        if (!(i in this.lines)) {
            this.lines[i] = {};
        }
        this.lines[i][j] = line;
    }

    deleteLine(i, j) {
        if (this.lines[i] && this.lines[i][j]) {
            this.lines[i][j].remove();
            delete this.lines[i][j];
        }
    }

    addPoint(i, p) {
        let p2 = transformPoint(p),
            el = makeSVG('circle', {
                'r': 3,
                'cx': p2.x,
                'cy': p2.y
            });

        svg.append(el);

        this.points[i] = p;
    }

    deletePoint(i) {
        if (this.points[i]) {
            this.points[i].remove();
            delete this.points[i];
        }
    }

    notify(event) {
        if (event.type === "add") {
            // deletion of a line
            this.addLine(event.i, event.j, event.pi, event.pj);
        } else if (event.type === "delete") {
            // addition of a line
            this.deleteLine(event.i, event.j);
        } else if (event.type === "addPoint") {
            this.addPoint(event.i, event.p);
        } else if (event.type === "deletePoint") {
            this.deletePoint(event.i);
        }
    }
}

class BestFitModel {
    constructor() {
        this.data = [];
        this.listeners = [];
        this.coeffs = {};
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    notify(event) {
        for (let listener of this.listeners) {
            listener.notify(event);
        }
    }

    addPoint(i, p) {
        this.data[i] = p;
        this.notify({
            'type': 'addPoint',
            'i': i,
            'p': p
        });
    }

    deletePoint(i) {
        delete this.data[i];
        this.notify({
            'type': 'deletePoint',
            'i': i
        });
    }

    addLine(i, j) {
        let coeffs = this.bestFitLine(i, j);
        coeffs['active'] = true;

        if (!(i in this.coeffs)) {
            this.coeffs[i] = {};
        }
        this.coeffs[i][j] = coeffs;

        this.notify({
            'type': 'add',
            'i': i,
            'j': j,
            'pi': {
                'x': this.data[i].x,
                'y': coeffs['alpha'] + coeffs['beta'] * this.data[i].x
            },
            'pj': {
                'x': this.data[j].x,
                'y': coeffs['alpha'] + coeffs['beta'] * this.data[j].x
            }
        });

        return this.coeffs[i][j];
    }

    clearPoints() {
        for (let i of Object.keys(this.data)) {
            this.deletePoint(i);
        }
    }

    clearLines() {
        for (let i of Object.keys(this.coeffs)) {
            for (let j of Object.keys(this.coeffs[i])) {
                this.deleteLine(i, j);
            }
        }
    }

    deleteLine(i, j) {
        if (this.coeffs[i] && this.coeffs[i][j]) {
            this.coeffs[i][j]['active'] = false;

            this.notify({
                'type': 'delete',
                'i': i,
                'j': j
            });
        }
    }

    bestFitLine(i, j) {
        if (this.coeffs[i] && this.coeffs[i][j]) {
            return this.coeffs[i][j];
        }

        let len = i - j + 1;

        // compute average of xs and ys
        let yBar = 0,
            xBar = 0;
        for (let k = j; k < i; k++) {
            xBar += this.data[k].x;
            yBar += this.data[k].y;
        }
        xBar /= parseFloat(len);
        yBar /= parseFloat(len);

        // compute beta numerator and denominator
        let betaHatNum = 0,
            betaHatDenom = 0;
        for (let k = j; k < i - 1; k++) {
            betaHatNum += (this.data[k].x - xBar) * (this.data[k].y - yBar);

            let d = this.data[k].x - xBar;
            betaHatDenom += d * d;
        }
        betaHatNum;
        betaHatDenom;

        // compute slope and intercept
        let betaHat = betaHatNum / betaHatDenom,
            alpha = yBar - betaHat * xBar;

        // compute mean squared error
        let mse = 0;
        for (let k = j; k < i; k++) {
            let resid = (this.data[k].y - (alpha + betaHat * this.data[k].x));
            mse += resid * resid;
        }
        if (len != 0) {
            mse /= len;
        }

        return {
            'alpha': alpha,
            'beta': betaHat,
            'mse': mse
        }
    }

    cost() {
        let total = 0;
        for (let i of Object.keys(this.coeffs)) {
            for (let j of Object.keys(this.coeffs[i])) {
                total += this.coeffs[i][j]['mse'];
            }
        }

        return total;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getLineSegments(prev, i) {
    let splits = [i];
    while (i >= 1) {
        i = prev[i];
        splits.push(i);
    }
    splits.push(0);
    return splits.reverse();
}

async function segmentedLeastSquares(model, lambda) {
    // Base case: OPT(0) = 0
    let m = [0, 0],
        prev = [0, 0];

    for (let i = 1; i < data.length; i++) {
        let optValue = Infinity;
        let optJ = 0;

        for (let j = 1; j < i; j++) {
            // find the minimum
            let bestFit = model.bestFitLine(i, j);
            if (optValue > m[j] + bestFit['mse'] + lambda) {
                optValue = m[j] + bestFit['mse'] + lambda;
                optJ = j;
            }

            await sleep(100);
        }

        prev.push(optJ);
        // compute new best lines
        let splits = getLineSegments(prev, i);
        model.clearLines();
        for (let k = 0; k < splits.length - 1; k++) {
            let j = splits[k], i = splits[k + 1];
            if (i == j) {
                continue;
            }
            model.addLine(i, j);
            // Base case: OPT(0) = 0
            let m = [0, 0],
                prev = [0, 0];
        }
        m.push(optValue);
    }
}

let model = new BestFitModel();
let view = new BestFitView();
model.addListener(view);

function main(n, lambda) {
    model.clearPoints();

    data = makeData(n, XMIN, XMAX, YMIN, YMAX);
    data.sort(function (p, q) {
        return p.x > q.x;
    });

    // append data
    for (let i = 0; i < data.length; i++) {
        model.addPoint(i, data[i]);
    }

    segmentedLeastSquares(model, 0.1);
}

let fitBtn = $('#btnFit');
fitBtn.on('click', function() {
    main(n, lambda);
});