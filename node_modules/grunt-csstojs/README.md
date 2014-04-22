# grunt-CSStoJS

> A grunt task that transforms your CSS into a JavaScript string

## Example

Input:
```css
.test {
  background-image: url("test.jpg");
  background-repeat: no-repeat;
  overflow: hidden;
}
#test2 {
  background: url('hello.jpg');
}
```

Output
```js
var CSSString = ".test{background-image: url('test.jpg');background-repeat:no-repeat;overflow:hidden;}#test2{background:url('hello.jpg');}"
```

## Why?

Useful for 3:rd party JavaScript deployments where you want to avoid serving multiple requests to seperate CSS files. You can easily just create the Stylesheet dynamically with JavaScript on the fly instead:

```js
var style = document.createElement('style');
style.type = 'text/css';
if (style.styleSheet) {
  style.styleSheet.cssText = KVFeedCSS;
} else {
  style.appendChild(document.createTextNode(CSSString));
}
document.body.appendChild(style);
```


## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-CSStoJS --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-CSStoJS');
```

## The "CSStoJS" task

### Overview
In your project's Gruntfile, add a section named `CSStoJS` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  CSStoJS: {
    options: {},
    files: {
      'style.css.js': ['src/1.css', 'src/2.css'],
    },
  },
});
```

### Options

#### options.varName
Type: `String`
Default value: `'CSSString'`

A string value that is used as the variable name where the CSS string is stored.

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  CSStoJS: {
    options: {},
    files: {
      'style.css.js': ['src/1.css', 'src/2.css'],
    },
  },
});
```

#### Custom Options

```js
grunt.initConfig({
  CSStoJS: {
    options: {
      varName: 'myCSSString',
    },
    files: {
      'style.css.js': ['src/1.css', 'src/2.css'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
