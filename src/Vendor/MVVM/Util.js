export function getValue(vm, property) {
    let value = vm;

    property.split('.').forEach(element => {
        value = value[element];
    });

    return value;
}

export function setValue(vm, property, newValue) {
    let val = vm;

    const properties = property.split('.');

    properties.forEach((k, i) => {
        if (i < properties.length - 1) {
            val = val[k];
        } else {
            val[k] = newValue;
        }
    });
}
