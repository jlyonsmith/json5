module.exports = function simplify (item) {
    const stack = []

    return serializeItem(item)

    function serializeItem (item) {
        if (typeof item === 'object' && item.hasOwnProperty('type') && item.hasOwnProperty('value')) {
            switch (item.type) {
            case 'null':
            case 'boolean':
            case 'numeric':
            case 'string':
                return item.value
            case 'object':
                return serializeObject(item.value)
            case 'array':
                return serializeArray(item.value)
            }
        }

        return item
    }

    function serializeObject (object) {
        if (stack.indexOf(object) >= 0) {
            throw TypeError('Simplifying circular structure')
        }

        stack.push(object)

        let newObject = {}

        for (const key of Object.keys(object)) {
            newObject[key] = serializeItem(object[key])
        }

        stack.pop()
        return newObject
    }

    function serializeArray (array) {
        if (stack.indexOf(array) >= 0) {
            throw TypeError('Simplifying circular structure')
        }

        stack.push(array)

        let newArray = []
        for (const item of array) {
            newArray.push(serializeItem(item))
        }

        stack.pop()
        return newArray
    }
}
