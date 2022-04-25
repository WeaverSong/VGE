const html: {[index: string]: any} = new Proxy({
    style: (input) => {

        let style = document.createElement('style');

        if (typeof(input) === "string") {
            style.innerHTML =  input;
            return style;
        }

        let output = "";

        for (let ikey in input) {
            let styles = input[ikey];
            output += ikey + "{";
            for (let skey in styles) {
                output += skey + ":" + styles[skey] + ";";
            }
            output += "}";
        }
        style.innerHTML = output;
        return style;
    }
}, {
    get: (target, name) => {

        if (target[name] !== undefined) return target[name];

        return function (...args) {
            let ele = document.createElement(<string>name)

            if (typeof(args[0]) === "object") {
                let props = args.splice(0, 1)[0];

                for (let key in props) {

                    if (key === "attributes") {
                        for (key in props.attributes) {
                            ele.setAttribute(key, props.attributes[key]);
                        };
                    } else if (key === "style") {
                        for (key in props.style) {
                            ele.style[key] = props.style[key];
                        }
                    } else if (key === "eventListeners") {
                        for (key in props.eventListeners) {
                            ele.addEventListener(key, props.eventListeners[key]);
                        }
                    } else {
                        ele[key] = props[key];
                    }

                }
            };

            args.forEach(i => {
                if (typeof(i) === "string" || typeof(i) === "boolean" || typeof(i) === "number") ele.textContent += i;
                else if (i) ele.appendChild(i);
            });

            return ele;
        }
    }
});