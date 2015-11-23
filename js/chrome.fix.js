// # see https://groups.google.com/forum/#!topic/jointjs/qIKIiJCEClI

SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function (toElement) {
        return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
    };