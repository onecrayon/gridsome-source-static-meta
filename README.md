# gridsome-source-static-meta

This is a Gridsome source plugin that converts values in JSON and/or YAML files into keys on the global GraphQL `metaData` query.

What this means in practice is that you can define standard metadata (like `siteName` or `siteUrl`) along with custom keys in static JSON or YAML files, and have the values automatically available via standard GraphQL queries. *Most projects will not need this.* However, if for whatever reason you wish to define static metaData without modifying the `gridsome.config.js` file, this is an easy method.

## Guidelines (read before using!)

When authoring your JSON or YAML metadata files, you must observe the following guidelines:

- All files must have root-level key/value mappings
- Arrays cannot mix types
- Arrays of objects must include all possible keys in the first object in the array (using non-`null` values)
- Identical keys in separate files may behave in strange ways; it is best to keep all of your settings in a single file, or at minimum avoid duplicate root-level keys across files.

Failing to observe the above guidlines may result in data in your JSON/YAML files being ignored and missing from GraphQL (see below for why).

**Changes to your JSON files will require restarting the server.** Gridsome is not currently setup to allow live updating the `metaData` GraphQL data.

## Install

- `yarn add gridsome-source-static-meta`
- `npm install gridsome-source-static-meta`

## Usage

```js
module.exports = {
  plugins: [
    {
      use: 'gridsome-source-static-meta',
      options: {
        path: 'settings/*.json'
      }
    }
  ]
}
```

## Options

#### path

- Type: `string` *required*

Where to look for files. Should be a glob path.

## Possible reasons for missing data in GraphQL

Depending on how you format your files, **you may lose data** due to the way Gridsome constructs GraphQL types. Please keep the following in mind:

- You cannot mix data types in arrays, and an array's type is determined by the first element in the array. This means that if you have an array of objects, **the first object must include all possible keys** (subsequent objects can leave optional keys out, if you wish).
    - The first object in an array must use non-`null` values for all keys (null keys will be ignored). E.g., if you have an empty string key, your JSON would look like: `"stringKey": ""`. (For subsequent objects you can omit the key, and the GraphQL data will include a `null` value.)
- All JSON or YAML files formatted with a root-level arrays will be silently ignored (e.g. if the first character in your JSON file is `[` or `-` in your YAML file, it will be ignored). A key/value mapping is required for all files.
- Identical keys in separate files will behave as follows (execution order is *not* guaranteed):
    - Arrays will concatenate (probably poorly, given the restrictions above)
    - Objects will update (adding or overwriting keys as necessary)
    - All other data types will be overwritten
