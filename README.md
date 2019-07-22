# JSON5 – JSON for Humans

This project is a fork of [JSON5](https://www.npmjs.com/package/json5). See that project for the base documentation.

This fork adds the ability to parse the JSON5 into a *node tree* that includes type, line and column information on each element of the JSON5 text.  This is useful for applications that do further semantic processing on the JSON5 and want to report error locations back to the user. You can also `simplify` a node tree back down into plain Javascript objects.

## Details

JSON5 adds features to JSON that make it more enjoyable to use JSON for data and script files that are edited by humans.

The `JSON5.parse` method is great when you just want to read or write JSON5 with only basic syntax error checking.  However, this is not ideal when using JSON5 as a storage format for more complicated data. This is because the line, type and offset information generated during the parsing of the JSON5 file is lost which means you cannot give helpful error messages to your users.  Basically, `JSON5.parse` only provides a check for valid JSON5, no for valid application content.

This library adds an additional parsing mode to help when doing application level validation of JSON5. Use it by making calling `JSON5.parse("...", {wantNodes: true})`.  This will generate an object with **nodes** instead of just plain Javascript object.

Each *node* object consists of the following properties:

```json5
{
  type: "object|array|null|string|numeric|boolean|null",
  value: [...]|{...}|"..."|true|false|999|null,
  line: 999,
  column: 999,
}
```

In addition, this library provides a `JSON5.simplify()` method. If you pass this method a node tree, it will simplify it back into a plain Javascript object, stripping out the node information.  Any nodes in the node tree that do not have `type` and `value` properties will be copied over verbatim, including their child properties.

## Examples

Let's say you use the JSON5 format to store an array of items for you application. For your application data to be valid, the items in the array must all be strings and must all be in ascending order.  You read in a valid JSON5 file into an object and start going through the array.  You find an entry that is out of order.  Unfortunately, with the basic `JSON5.parse` method you can no longer tell the user what line the error occurs on because you do not have that information.  But with the file parsed into nodes, you can now display a line and column information to your users so that they can find and fix the problem.

Here is an example of the node treed for the following simple JSON5 document:

```json5
{
  // A comment
  a: 1,
  b: {
    c: 2,
    d: 3
  },
  e:[1, 2]
}
```

Calling `JSON5.parse(..., { wantNodes: true })` on this generates:

```json5
{
  "type": "object",
  "value": {
    "a": {
      "type": "numeric",
      "value": 1,
      "line": 3,
      "column": 6
    },
    "b": {
      "type": "object",
      "value": {
        "c": {
          "type": "numeric",
          "value": 2,
          "line": 5,
          "column": 8
        },
        "d": {
          "type": "numeric",
          "value": 3,
          "line": 6,
          "column": 8
        }
      },
      "line": 4,
      "column": 6
    },
    "e": {
      "type": "array",
      "value": [
        {
          "type": "numeric",
          "value": 1,
          "line": 8,
          "column": 6
        },
        {
          "type": "numeric",
          "value": 2,
          "line": 8,
          "column": 9
        }
      ],
      "line": 8,
      "column": 5
    }
  },
  "line": 1,
  "column": 1
}
```

As you can see, this is quite a bit more verbose, but accessing the data is really just a matter of using the `.value` properties.  For example, if you put the results of the `parse()` call in a variable called `obj`, then instead of `obj.a.c` to get the value `2`, you would use `obj.value.a.value.c`.

Calling `JSON5.simplify` on the above node tree will return an object matching the original plain Javascript object.

## Future Things

- The nodes should include the JSON5 comments so that they can be manipulated. Would need to differentiate end-of-line comments vs. full line comments probably.
- If we support pulling comments into nodes, then it will could be possible to "round-trip" the JSON5 to a node tree and back again preserving comments. We would need a special version of `stringify` to do this.
