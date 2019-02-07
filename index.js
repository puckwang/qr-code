import QRCode from 'qrcode'

const defaultOptions = {
    backgroundColor: "#FFFFFF",
    size: 300,
    fillType: "fill",
    fill: "#000000",
    fills: ["#000000", "#252525", "#3e3e3e", "#434343"],
    fillGradient: {
        type: 'single',
        startPoint: {x: 0, y: 0},
        startRadius: 0,
        endPoint: {x: 0, y: 0},
        endRadius: 0,
        colorStops: [0, 'red', 1, 'green']
    },
    shape: "rect",
    image: { // TODO
        src: "",
        x: 0,
        y: 0,
        width: 0,
        height: 0
    }
}

let stage, layer;
let qrCodeData, qrCodeSize, shapeSize;
let styleOptions = {}, qrCodeOptions = {};

function getQrCode(text) {
    let qrcode = QRCode.create(text, qrCodeOptions);
    qrCodeSize = qrcode.modules.size;
    qrCodeData = qrcode.modules.data;
    shapeSize = Math.floor(styleOptions.size / qrCodeSize);
    styleOptions.size = shapeSize * qrCodeSize;
}

function drawShape(style) {
    let shapeConfig = {
        sceneFunc: function (context, shape) {
            for (let c = 0; c < qrCodeSize; c++) {
                for (let r = 0; r < qrCodeSize; r++) {
                    if (qrCodeData[c * qrCodeSize + r] === 1) {
                        let x = r * shapeSize, y = c * shapeSize;

                        switch (styleOptions.shape.toLowerCase()) {
                            case 'rect': // Rect
                                drawRect(context,x, y);
                                break;
                            case 'roundedrect': // RoundedRect
                                RoundedRect(context, x, y, shapeSize / 3);
                                break;
                            case 'circle': // Circle
                                drawCircle(context, x, y, shapeSize / 2);
                                break;
                            default:
                                drawRect(context,x, y);
                                break;
                        }

                        context.fillShape(shape);
                    }
                }
            }
        },
    };

    Object.assign(shapeConfig, style);

    layer.add(new Konva.Shape(shapeConfig));

    function drawRect(context, x, y) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + shapeSize, y);
        context.lineTo(x + shapeSize, y + shapeSize);
        context.lineTo(x, y + shapeSize);
        context.closePath();
    }

    function RoundedRect(context, x, y, r) {
        context.beginPath();
        context.moveTo(x + shapeSize / 2, y);
        context.lineTo(x + shapeSize - r, y);
        context.arc(x + shapeSize - r, y + r, r, 1.5 * Math.PI, 0);
        context.lineTo(x + shapeSize, y + shapeSize / 2);
        context.arc(x + shapeSize - r, y + shapeSize - r, r, 0, 0.5 * Math.PI);
        context.lineTo(x + r, y + shapeSize);
        context.arc(x + r, y + shapeSize - r, r, 0.5 * Math.PI, 1 * Math.PI);
        context.lineTo(x, y + r);
        context.arc(x + r, y + r, r, 1 * Math.PI, 1.5 * Math.PI, );
        context.lineTo(x + shapeSize / 2, y);
        context.closePath();
    }

    function drawCircle(context, x, y, r) {
        context.beginPath();
        context.arc(x + r, y + r, r, 0, 2 * Math.PI);
        context.closePath();
    }
}

function drawRectShape(style) {
    for (let c = 0; c < qrCodeSize; c++) {
        for (let r = 0; r < qrCodeSize; r++) {
            if (qrCodeData[c * qrCodeSize + r] === 1) {
                let x = r * shapeSize, y = c * shapeSize;
                let rectConfig = {
                    x: x,
                    y: y,
                    width: shapeSize,
                    height: shapeSize,
                };

                if (styleOptions.fillType.toLowerCase() !== 'fillrandom') {
                    Object.assign(rectConfig, style);
                } else {
                    Object.assign(rectConfig, {fill: styleOptions.fills[Math.floor(Math.random() * styleOptions.fills.length)]});
                }

                layer.add(new Konva.Rect(rectConfig));

            }
        }
    }
}

function drawQrCode() {
    switch(styleOptions.fillType.toLowerCase()) {
        case 'fill':
            drawShape({fill: styleOptions.fill});
            break;
        case 'lineargradient': // linear Gradient
            if (styleOptions.fillGradient.type.toLowerCase() === 'single') {
                drawShape({
                    fillLinearGradientStartPoint: styleOptions.fillGradient.startPoint,
                    fillLinearGradientEndPoint: styleOptions.fillGradient.endPoint,
                    fillLinearGradientColorStops: styleOptions.fillGradient.colorStops
                });
            } else {
                drawRectShape({
                    fillLinearGradientStartPoint: styleOptions.fillGradient.startPoint,
                    fillLinearGradientEndPoint: styleOptions.fillGradient.endPoint,
                    fillLinearGradientColorStops: styleOptions.fillGradient.colorStops
                });
            }
            break;
        case 'circkegradient': // circle Gradient
            if (styleOptions.fillGradient.type.toLowerCase() === 'single') {
                drawShape({
                    fillRadialGradientStartPoint: styleOptions.fillGradient.startPoint,
                    fillRadialGradientStartRadius: styleOptions.fillGradient.startRadius,
                    fillRadialGradientEndPoint: styleOptions.fillGradient.endPoint,
                    fillRadialGradientEndRadius: styleOptions.fillGradient.endRadius,
                    fillRadialGradientColorStops: styleOptions.fillGradient.colorStops
                });
            } else {
                drawRectShape({
                    fillRadialGradientStartPoint: styleOptions.fillGradient.startPoint,
                    fillRadialGradientStartRadius: styleOptions.fillGradient.startRadius,
                    fillRadialGradientEndPoint: styleOptions.fillGradient.endPoint,
                    fillRadialGradientEndRadius: styleOptions.fillGradient.endRadius,
                    fillRadialGradientColorStops: styleOptions.fillGradient.colorStops
                });
            }
            break;
        case 'fillrandom':
            drawRectShape();
            break;
        default:
            drawShape({fill: styleOptions.fill});
            break;
    }
}

function createBackground(element) {
    stage = new Konva.Stage({
        container: element,
        width: styleOptions.size,
        height: styleOptions.size
    });

    layer = new Konva.Layer();

    let bg = new Konva.Rect({
        x: 0,
        y: 0,
        width: styleOptions.size,
        height: styleOptions.size,
        fill: styleOptions.backgroundColor,
    });

    layer.add(bg);
}

const QrCode = {
    create: function (element, text, options) {
        if (typeof options !== "undefined") {
            options = new Object(options);
            console.log(options);
            if (options.hasOwnProperty('qrCodeOptions')) {
                qrCodeOptions = options.qrCodeOptions;
            }

            if (options.hasOwnProperty('styleOptions')) {
                styleOptions = options.styleOptions;
            }
        }
        styleOptions = Object.assign(defaultOptions, styleOptions);

        getQrCode(text);
        createBackground(element);
        drawQrCode();

        stage.add(layer);
    }
}

export default QrCode;