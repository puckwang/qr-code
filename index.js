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

class QrCodeRender {
    _stage = null;
    _layer = null;
    _qrCodeData = null;
    _qrCodeSize = null;
    _shapeSize = null;
    _styleOptions = {}
    _qrCodeOptions = {};

    _setQrCode(text) {
        let qrcode = QRCode.create(text, this._qrCodeOptions);
        this._qrCodeSize = qrcode.modules.size;
        this._qrCodeData = qrcode.modules.data;
        this._shapeSize = Math.floor(this._styleOptions.size / this._qrCodeSize);
        this._styleOptions.size = this._shapeSize * this._qrCodeSize;
    }

    _drawShape(style) {
        let self = this;
        let shapeConfig = {
            sceneFunc: function (context, shape) {
                for (let c = 0; c < self._qrCodeSize; c++) {
                    for (let r = 0; r < self._qrCodeSize; r++) {
                        if (self._qrCodeData[c * self._qrCodeSize + r] === 1) {
                            let x = r * self._shapeSize, y = c * self._shapeSize;

                            switch (self._styleOptions.shape.toLowerCase()) {
                                case 'rect': // Rect
                                    drawRect(context,x, y);
                                    break;
                                case 'roundedrect': // RoundedRect
                                    RoundedRect(context, x, y, self._shapeSize / 3);
                                    break;
                                case 'circle': // Circle
                                    drawCircle(context, x, y, self._shapeSize / 2);
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

        self._layer.add(new Konva.Shape(shapeConfig));

        function drawRect(context, x, y) {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + self._shapeSize, y);
            context.lineTo(x + self._shapeSize, y + self._shapeSize);
            context.lineTo(x, y + self._shapeSize);
            context.closePath();
        }

        function RoundedRect(context, x, y, r) {
            context.beginPath();
            context.moveTo(x + self._shapeSize / 2, y);
            context.lineTo(x + self._shapeSize - r, y);
            context.arc(x + self._shapeSize - r, y + r, r, 1.5 * Math.PI, 0);
            context.lineTo(x + self._shapeSize, y + self._shapeSize / 2);
            context.arc(x + self._shapeSize - r, y + self._shapeSize - r, r, 0, 0.5 * Math.PI);
            context.lineTo(x + r, y + self._shapeSize);
            context.arc(x + r, y + self._shapeSize - r, r, 0.5 * Math.PI, 1 * Math.PI);
            context.lineTo(x, y + r);
            context.arc(x + r, y + r, r, 1 * Math.PI, 1.5 * Math.PI, );
            context.lineTo(x + self._shapeSize / 2, y);
            context.closePath();
        }

        function drawCircle(context, x, y, r) {
            context.beginPath();
            context.arc(x + r, y + r, r, 0, 2 * Math.PI);
            context.closePath();
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
        switch(this._styleOptions.fillType.toLowerCase()) {
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

    create(element, text, options) {
        if (typeof options !== "undefined") {
            options = new Object(options);

            if (options.hasOwnProperty('_qrCodeOptions')) {
                this._qrCodeOptions = options._qrCodeOptions;
            }

            if (options.hasOwnProperty('_styleOptions')) {
                this._styleOptions = options._styleOptions;
            }
        }
        this._styleOptions = Object.assign(defaultOptions, this._styleOptions);

        this._setQrCode(text);
        this._createBackground(element);
        this._drawQrCode();

        this._stage.add(this._layer);
    }
}

export default QrCodeRender;