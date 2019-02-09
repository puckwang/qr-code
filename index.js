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
    },
    borderSize: 15
}

class QrCodeRender {

    constructor() {
        this._stage = null;
        this._layer = null;
        this._qrCodeData = null;
        this._qrCodeSize = null;
        this._shapeSize = null;
        this._styleOptions = {}
        this._qrCodeOptions = {};
        this._canvasOffset = 0;
        this._canvasSize = 0;
    }

    _setQrCode(text) {
        let qrcode = QRCode.create(text, this._qrCodeOptions);
        this._qrCodeSize = qrcode.modules.size;
        this._qrCodeData = qrcode.modules.data;
        this._shapeSize = Math.floor((this._styleOptions.size - this._styleOptions.borderSize * 2) / this._qrCodeSize);
        this._canvasSize = this._shapeSize * this._qrCodeSize + this._styleOptions.borderSize * 2;
        this._canvasOffset = (this._styleOptions.size - this._canvasSize) / 2 + this._styleOptions.borderSize;
    }

    _drawShape(style) {
        let self = this;
        let shapeConfig = {
            sceneFunc: function (context, shape) {
                for (let c = 0; c < self._qrCodeSize; c++) {
                    for (let r = 0; r < self._qrCodeSize; r++) {
                        if (self._qrCodeData[c * self._qrCodeSize + r] === 1) {
                            let x = r * self._shapeSize + self._canvasOffset,
                                y = c * self._shapeSize + self._canvasOffset;

                            switch (self._styleOptions.shape.toLowerCase()) {
                                case 'rect': // Rect
                                    drawRect(context, x, y);
                                    break;
                                case 'roundedrect': // RoundedRect
                                    drawRoundedRect(context, x, y, self._shapeSize / 3);
                                    break;
                                case 'leaf': // Leaf
                                    drawLeaf(context, x, y, self._shapeSize / 8, self._shapeSize / 2);
                                    break;
                                case 'circle': // Circle
                                    drawCircle(context, x, y, self._shapeSize / 2);
                                    break;
                                case 'mergeroundedrect': // MergeRoundedRect
                                    drawMergeRoundedRect(context, x, y, self._shapeSize / 3, r, c);
                                    break;
                                default:
                                    drawRect(context, x, y);
                                    break;
                            }

                            context.fillShape(shape);
                        }
                    }
                }
            },
        };

        Object.assign(shapeConfig, style);

        self._layer.add(new Konva.Shape(shapeConfig));

        function drawRect(context, x, y) {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + self._shapeSize, y);
            context.lineTo(x + self._shapeSize, y + self._shapeSize);
            context.lineTo(x, y + self._shapeSize);
            context.closePath();
        }

        function drawRoundedRect(context, x, y, r) {
            context.beginPath();
            context.moveTo(x + self._shapeSize / 2, y);
            context.lineTo(x + self._shapeSize - r, y);
            drawRoundedAngle(context, x, y, r, 0);
            context.lineTo(x + self._shapeSize, y + self._shapeSize / 2);
            drawRoundedAngle(context, x, y, r, 1);
            context.lineTo(x + r, y + self._shapeSize);
            drawRoundedAngle(context, x, y, r, 2);
            context.lineTo(x, y + r);
            drawRoundedAngle(context, x, y, r, 3);
            context.lineTo(x + self._shapeSize / 2, y);
            context.closePath();
        }

        function drawLeaf(context, x, y, r1, r2) {
            context.beginPath();
            context.moveTo(x + self._shapeSize / 2, y);
            context.lineTo(x + self._shapeSize - r1, y);
            drawRoundedAngle(context, x, y, r1, 0);
            context.lineTo(x + self._shapeSize, y + self._shapeSize / 2);
            drawRoundedAngle(context, x, y, r2, 1);
            context.lineTo(x + r1, y + self._shapeSize);
            drawRoundedAngle(context, x, y, r1, 2);
            context.lineTo(x, y + r2);
            drawRoundedAngle(context, x, y, r2, 3);
            context.lineTo(x + self._shapeSize / 2, y);
            context.closePath();
        }

        function drawCircle(context, x, y, r) {
            context.beginPath();
            context.arc(x + r, y + r, r, 0, 2 * Math.PI);
            context.closePath();
        }

        /**
         * 方向依照順時針正方形右上:0 右下:1 左下:2 左上:3
         * @param context
         * @param startX
         * @param startY
         * @param r
         * @param direction
         */
        function drawRoundedAngle(context, startX, startY, r, direction) {
            switch (direction) {
                case 0:
                    context.arc(startX + self._shapeSize - r, startY + r, r, 1.5 * Math.PI, 0);
                    break;
                case 1:
                    context.arc(startX + self._shapeSize - r, startY + self._shapeSize - r, r, 0, 0.5 * Math.PI);
                    break;
                case 2:
                    context.arc(startX + r, startY + self._shapeSize - r, r, 0.5 * Math.PI, 1 * Math.PI);
                    break;
                case 3:
                    context.arc(startX + r, startY + r, r, 1 * Math.PI, 1.5 * Math.PI);
                    break;
            }
        }

        /**
         * 方向依照順時針正方形右上:0 右下:1 左下:2 左上:3
         */
        function checkIsAngle(r, c, direction) {
            switch (direction) {
                case 0:
                    r++;
                    return r === self._qrCodeSize || !self._qrCodeData[c * self._qrCodeSize + r];
                case 1:
                    c++;
                    return c === self._qrCodeSize || !self._qrCodeData[c * self._qrCodeSize + r];
                case 2:
                    r--;
                    return r < 0 || !self._qrCodeData[c * self._qrCodeSize + r];
                case 3:
                    c--;
                    return c < 0|| !self._qrCodeData[c * self._qrCodeSize + r];
            }
        }
    }

    _drawRectShape(style) {
        for (let c = 0; c < this._qrCodeSize; c++) {
            for (let r = 0; r < this._qrCodeSize; r++) {
                if (this._qrCodeData[c * this._qrCodeSize + r] === 1) {
                    let x = r * this._shapeSize, y = c * this._shapeSize;
                    let rectConfig = {
                        x: x,
                        y: y,
                        width: this._shapeSize,
                        height: this._shapeSize,
                    };

                    if (this._styleOptions.fillType.toLowerCase() !== 'fillrandom') {
                        Object.assign(rectConfig, style);
                    } else {
                        Object.assign(rectConfig, {fill: this._styleOptions.fills[Math.floor(Math.random() * this._styleOptions.fills.length)]});
                    }

                    this._layer.add(new Konva.Rect(rectConfig));

                }
            }
        }
    }

    _drawQrCode() {
        switch (this._styleOptions.fillType.toLowerCase()) {
            case 'fill':
                this._drawShape({fill: this._styleOptions.fill});
                break;
            case 'lineargradient': // linear Gradient
                if (this._styleOptions.fillGradient.type.toLowerCase() === 'single') {
                    this._drawShape({
                        fillLinearGradientStartPoint: this._styleOptions.fillGradient.startPoint,
                        fillLinearGradientEndPoint: this._styleOptions.fillGradient.endPoint,
                        fillLinearGradientColorStops: this._styleOptions.fillGradient.colorStops
                    });
                } else {
                    this._drawRectShape({
                        fillLinearGradientStartPoint: this._styleOptions.fillGradient.startPoint,
                        fillLinearGradientEndPoint: this._styleOptions.fillGradient.endPoint,
                        fillLinearGradientColorStops: this._styleOptions.fillGradient.colorStops
                    });
                }
                break;
            case 'circkegradient': // circle Gradient
                if (styleOptions.fillGradient.type.toLowerCase() === 'single') {
                    this._drawShape({
                        fillRadialGradientStartPoint: this._styleOptions.fillGradient.startPoint,
                        fillRadialGradientStartRadius: this._styleOptions.fillGradient.startRadius,
                        fillRadialGradientEndPoint: this._styleOptions.fillGradient.endPoint,
                        fillRadialGradientEndRadius: this._styleOptions.fillGradient.endRadius,
                        fillRadialGradientColorStops: this._styleOptions.fillGradient.colorStops
                    });
                } else {
                    this._drawRectShape({
                        fillRadialGradientStartPoint: this._styleOptions.fillGradient.startPoint,
                        fillRadialGradientStartRadius: this._styleOptions.fillGradient.startRadius,
                        fillRadialGradientEndPoint: this._styleOptions.fillGradient.endPoint,
                        fillRadialGradientEndRadius: this._styleOptions.fillGradient.endRadius,
                        fillRadialGradientColorStops: this._styleOptions.fillGradient.colorStops
                    });
                }
                break;
            case 'fillrandom':
                this._drawRectShape();
                break;
            default:
                this._drawShape({fill: this._styleOptions.fill});
                break;
        }
        this._stage.add(this._layer);
    }

    _createBackground(element) {
        this._stage = new Konva.Stage({
            container: element,
            width: this._styleOptions.size,
            height: this._styleOptions.size
        });

        this._layer = new Konva.Layer();

        let bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: this._styleOptions.size,
            height: this._styleOptions.size,
            fill: this._styleOptions.backgroundColor,
        });

        this._layer.add(bg);
    }

    _importOptions(options) {
        if (typeof options !== "undefined") {
            options = new Object(options);

            if (options.hasOwnProperty('qrCodeOptions')) {
                this._qrCodeOptions = options.qrCodeOptions;
            }

            if (options.hasOwnProperty('styleOptions')) {
                this._styleOptions = options.styleOptions;
            }
        }

        this._styleOptions = Object.assign(defaultOptions, this._styleOptions);
    }

    create(element, text, options) {
        this._importOptions(options);
        this._setQrCode(text);
        this._createBackground(element);
        this._drawQrCode();
    }

    download(name, pixelRatio = 3) {
        let dataURL = this._stage.toDataURL({pixelRatio});

        let link = document.createElement('a');
        link.download = name;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default QrCodeRender;