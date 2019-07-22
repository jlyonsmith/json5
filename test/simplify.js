const assert = require('assert')
const JSON5 = require('../lib')

require('tap').mochaGlobals()

const t = require('tap')

t.test('simplify(node)', t => {
    t.test('non-nodes', t => {
        t.strictSame(JSON5.simplify(10), 10, 'leaves non-objects')
        t.strictSame(JSON5.simplify({}), {}, 'leaves empty objects')
        t.strictSame(JSON5.simplify({value: 10}), {value: 10}, 'leaves object without type property')
        t.strictSame(JSON5.simplify({type: 10}), {type: 10}, 'leaves object without value property')
        t.strictSame(JSON5.simplify([1,2,3]), [1,2,3], 'leaves arrays')
        t.end()
    })

    t.test('scalars', t => {
        t.strictSame(JSON5.simplify({type: 'null', value: null}), null, 'simplifies null')
        t.strictSame(JSON5.simplify({type: 'boolean', value: true}), true, 'simplifies boolean')
        t.strictSame(JSON5.simplify({type: 'numeric', value: -1.2}), -1.2, 'simplifies numbers')
        t.strictSame(JSON5.simplify({type: 'string', value: 'abc'}), 'abc', 'simplifies strings')
        t.end()
    })

    t.test('objects', t => {
        t.strictSame(JSON5.simplify({type: 'object', value: {a: {type: 'numeric', value: 1}}}), {a:1}, 'simplifies single node')
        t.strictSame(JSON5.simplify({type: 'object', value: {abc: {type: 'numeric', value: 1}, def: {type: 'numeric', value: 2}}}), {abc:1,def:2}, 'simplifies multiple properties')
        t.strictSame(JSON5.simplify({type: 'object', value: {a: {type: 'object', value: {b: {type: 'numeric', value: 2}}}}}), {a:{b:2}}, 'simplifies nested objects')
        t.end()
    })

    t.test('arrays', t => {
        t.strictSame(JSON5.simplify({type: 'array', value: []}), [], 'simplifies empty arrays')
        t.strictSame(JSON5.simplify({type: 'array', value: [{type: 'numeric', value: 1}]}), [1], 'simplifies array values')
        t.strictSame(JSON5.simplify({type: 'array', value: [{type: 'numeric', value: 1}, {type: 'numeric', value: 2}]}), [1,2], 'simplifies multiple array values')
        t.strictSame(JSON5.simplify({type: 'array', value: [{type: 'numeric', value: 1}, {type: 'array', value: [{type: 'numeric', value: 2}]}]}), [1,[2]], 'simplifies nested arrays')
        t.end()
     })

    t.test('errors', t => {
        t.throws(() => {
            let node = {type: 'object', value: {}}
            node.value.a = node
            JSON5.simplify(node)
        }, TypeError, 'does not parse circular reference in object')

        t.throws(() => {
            let node = {type: 'array', value: []}
            node.value[0] = node
            JSON5.simplify(node)
        }, TypeError, 'does not parse circular reference in array')
        t.end()
    })
    t.end()
})
