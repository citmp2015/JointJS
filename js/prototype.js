var graph = new joint.dia.Graph();

var paper = new joint.dia.Paper({
    el: $('#paper'),
    gridSize: 1,
    model: graph,
    snapLinks: true,
    linkPinning: false,
    embeddingMode: true,
    validateEmbedding: function(childView, parentView) {
        return parentView.model instanceof flink.Coupled;
    },
    validateConnection: function(sourceView, sourceMagnet, targetView, targetMagnet) {
        return sourceMagnet != targetMagnet;
    }
});

var connect = function(source, sourcePort, target, targetPort) {
    var link = new flink.Link({
        source: { id: source.id, selector: source.getPortSelector(sourcePort) },
        target: { id: target.id, selector: target.getPortSelector(targetPort) }
    });
    link.addTo(graph).reparent();
};

var c1 = new flink.Coupled({
    position: { x: 230, y: 150 },
    size: { width: 300, height: 300 },
    inPorts: ['in'],
    outPorts: ['out 1','out 2']
});

var a1 = new flink.Atomic({
    position: { x: 360, y: 360 },
    inPorts: ['xy'],
    outPorts: ['x','y']
});

var a2 = new flink.Atomic({
    position: { x: 50, y: 260 },
    outPorts: ['out']
});

var a3 = new flink.Atomic({
    position: { x: 650, y: 150 },
    size: { width: 100, height: 300 },
    inPorts: ['a','b']
});

graph.addCells([c1, a1, a2, a3]);

c1.embed(a1);

connect(a2,'out',c1,'in');
connect(c1,'in',a1,'xy');
connect(a1,'x',c1,'out 1');
connect(a1,'y',c1,'out 2');
connect(c1,'out 1',a3,'a');
connect(c1,'out 2',a3,'b');

/* rounded corners */

_.each([c1,a1,a2,a3], function(element) {
    element.attr({ '.body': { 'rx': 6, 'ry': 6 }});
});

/* custom highlighting */

var highlighter = V('circle', {
    'r': 14,
    'stroke': '#ff7e5d',
    'stroke-width': '6px',
    'fill': 'transparent',
    'pointer-events': 'none'
});

paper.off('cell:highlight cell:unhighlight').on({

    'cell:highlight': function(cellView, el, opt) {

        if (opt.embedding) {
            V(el).addClass('highlighted-parent');
        }

        if (opt.connecting) {
            var bbox = V(el).bbox(false, paper.viewport);
            highlighter.translate(bbox.x + 10, bbox.y + 10, { absolute: true });
            V(paper.viewport).append(highlighter);
        }
    },

    'cell:unhighlight': function(cellView, el, opt) {

        if (opt.embedding) {
            V(el).removeClass('highlighted-parent');
        }

        if (opt.connecting) {
            highlighter.remove();
        }
    }
});

function createSimple(inCnt, outCnt, label) {
    var portsIn = _.range(inCnt).map(function (a) {
        return "IN" + a;
    });
    var portsOut = _.range(outCnt).map(function (a) {
        return "OUT" + a;
    });
    return new flink.Atomic({
        position: {x: 0, y: 0},
        inPorts: portsIn,
        outPorts: portsOut,
        attrs: {
            '.label': {text: label}
        }
    })
}

cellTypes = {
    'input': function () {
        return createSimple(0, 1, 'Input')
    },
    'map': function () {
        return createSimple(1, 1, 'Map')
    },
    'filter': function () {
        return createSimple(1, 1, 'Filter')
    },
    'join': function () {
        return createSimple(2, 1, 'Join')
    },
    'sink': function () {
        return createSimple(1, 0, 'Sink')
    }
};

$('.creator').on('click', function (evt) {
    var type = $(evt.target).data('type');
    newCell = cellTypes[type]();
    graph.addCell(newCell);
});

$('.jsonout').on('click', function () {
    console.log(JSON.stringify(graph.toJSON()));
});

$('.clear').on('click', function () {
    graph.clear();
});