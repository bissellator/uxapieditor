# uxapieditor
This is a javascript library of functions built to use to speed app development on the [UXAPI API-as-a-Service](https://uxapi.io).  You can set up a demo environment for your API in literally about 5 minutes and then use these tools to start interacting with your API data and build simple, secure apps. 

## Configuration
I kind of suck at includes so, in this current iteration, you'll need to add a few scripts to your HTML:

```
<meta charset="utf-8">
<script src="https://code.jquery.com/jquery-3.6.1.min.js" crossorigin="anonymous"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js"></script>
<script type="text/javascript" src="uxapieditor/code/ckeditor/build/ckeditor.js"></script>
<script type="text/javascript" src="/js/config.js"></script>
<script type="text/javascript" src="uxapieditor/code/uxapieditor.js"></script>
<link rel="stylesheet" href="/uxapieditor/css/uxapi.css">
```

I currently use `config.js` (listed above) to define three variables:

* uxapihost: the host of your API (e.g. api.finch.uxapi.io)
* clientID: the clientID which you can find in your Remote Dashboard on [UXAPI.io/dashboard](https://uxapi.io/dashboard)
* clientSecret: the secret which is also on the [remote dashboard](https://uxapi.io/dashboard)

The file looks like this:

```
const uxapihost = "https://api.penguin.uxapi.io"
var clientID = 'zlun2lmrcvs9024o4fdtx6pgk06nb4ar'
var clientSecret = '1omvctlb5r9uwtdx'
```

Now you may be saying, "Hey! you put your client and secret in the config!" but honestly that client and secret can't do anything except log you in -- you'll need claims that give you write privileges to do anything.  See [UXAPI.io Design an API](https://uxapi.io/design-overview.html) and my blog posting on [Securing your Credentials](https://uxapi.io/articles/7f6ffe80-7c99-11ed-9740-7f7a4b5b5475/Securing-your-Credentials)

#### Formatting
The library outputs with CSS classes from the `uxapi.css` file, also included in this repo. This allows you to modify the style as needed for your own project.

#### Editor
The rich editor for the `markdown` format used by UXAPI uses ckeditor.  There is a prebuilt ckEditor in this project, but be aware that this is only for ease-of-use and you should consider making your own build and, depending on your usage, getting a license.

And again, because I'm not very good at includes, the editor needs an extra bit of code on each page where you're using markdown:

```
var ele = document.getElementsByClassName('editor');
for (var i=0; i< ele.length; i++ ) {
  ckEditor(ele[i].id);
}
```

This will instantiate an editor for each field that is rendered using Markdown. You should be able to just throw it at the bottom of your page.

## Authentication
The library assumes you have an access token stored in `window.sessionStorage.token` which can be generated using standard OAuth flows, but we have a prebuilt process using the following functions:

#### `refreshToken()`
Uses the `window.sessionStorage.refresh` to get a new `access_token` and `refresh_token` and, if it fails, returns the login page from the API. If it succeeds it returns an empty string.

It's good practice to include this on any page where you want people to be authorized but to add a capture to send the consumer to a proper login flow (see [Get a Token](https://uxapi.io/howto/get-a-token.html))

Example:  
```
var tokencheck = refreshToken()
if (tokencheck.length > 1) {document.location = '/login.html'}
```

## Basic API Object Rendering

#### `listObjects(path, listOptions, format)`
Return objects in a formatted block of HTML.

**path**  
A string such as `/v1/blogs/` for the API resource you want to display  

**listOptions:**  
A JSON object that tells the function what fields in the API object to use for the title, blurb, image and link.  If img is '' or null the template will substitute a single pixel spacer.

```
{
  title: 'fieldname',
  blurb: 'filedname',
  img: 'fieldname',
  link: 'localhost/somelink/{fieldname}/index.html?pathvar?{fieldname}'
}
```

Example:
```
document.write(listObjects('/v1/blogcategories', {
    title: 'blogcategoriesname',
    blurb: 'blurb',
    img: 'image',
    link: './mydetailpage.html?objectID={objectID}'
  }, 'tiles'))
  ```

  **format:**
`tiles` will return the results in a 4 column grid. `list` will return the results in a page of text with the image (if any) aligned right.  

---

#### `returnObj(path)`
Returns the JSON object from the API

Example:  
`var bloglist = returnObj('/v1/blogs')`

This performs a simple GET against the API and returns response as a JSON object.  If things are behaving properly, it should follow the [UXAPI Standards](https://uxapi.io/articles/6f51ee20-1b99-11ed-9fed-4d4f74c3731b/Our-API-Standards) format which is what allows for the reusability of the rest of the code.  `returnObj()` is used by most of the other functions in this library.

---

#### `postObjectForm(path)`
Returns an HTML form formatted based on the openAPI contract schemas.

The `postObjectForm()` function is tightly coupled to the UXAPI API Contract standards. It uses formats based on the API contract (see `getContract()`) to build a form based on the classes, types and options returned from the `getFormats()` function.

The object returned is an HTML div with a unique identifier (e.g. `<div id="MTVZYVJIeUtKM1dYWGFMN09sTkNCZFF4N1VzVVlq">`); as you add items to your collection, they will appear as editable objects within the same div.


#### `editObject(path)`
Returns an HTML form formatted based on the openAPI contarct schemas and populated with the object in the `path`. (Eventually this will automatically swtich between objects and collections but for now it's a single object)

Example:
`document.write(editObject('/v1/blogs/665d67e5-a501-430a-abcf-79722701be47'))`

This will return a form that auto-saves as you move focus from one field to another (bug: you need to press "save" when editing rich text fields.) Each field is contained in a div using the objectID as the div id (e.g. `<div id="665d67e5-a501-430a-abcf-79722701be47">`)


#### `delObject(path, objectLabel)`
Deletes the object located at the `path` -- this is used by the `editObject()` and `editObjects()` functions but can also be called directly.

Example:  
`delObject  ('/v1/blogs/81a3722e-4975-4cf7-8940-89859666b3f8', 'My Adventures in Amsterdam')`

`objectLabel` is optionally used to provide a human readable warning "you are going to delete {objectLabel}.." -- if an `objectLabel` is not provided the UUID for the `objectID` will be displayed.

#### `getContract()`
Returns the API contract from `uxapihost` as a JSON object.

All apis hosted on the UXAPI API-as-a-Service platform expose the OpenAPI contract at the root location (e.g. `https://api.recipes.uxapi.io/`).  The `getContract()` function reads the `uxapihost` variable, performs a `GET` and returns the contract as a JSON object.  It then stores that object in the session storage at `window.sessionStorage.contract` and, in future requests, returns the local, cached copy.

#### `getFormats(contract, ref)`
Returns a JSON object with formats consumed by the HTML form tools such as `postObjectForm()`

Example:   
`var formats = getFormats(getContract(), '#/components/schemas/blogcategories')`

Responds with:
```
{
	"blogcategoriesname": {
		"class": "uxapi-text"
	},
	"menuitem": {
		"class": "uxapi-radio",
		"type": "boolean",
		"options": ["true", "false"]
	},
	"dsiplayas": {
		"class": "uxapi-dropdown",
		"type": "select",
		"options": ["tiles", "list"]
	},
	"image": {
		"class": "uxapi-image"
	}
}
```

This is based on the openAPI schema:

```
"blogcategories": {
    "title": "The request and base object for categories",
    "type": "object",
    "properties": {
      "blogcategoriesname": {
        "type": "string",
        "format": "",
        "example": "Blogs",
        "minLength": 0,
        "maxLength": 255
      },
      "menuitem": {
        "type": "boolean",
        "format": "enum",
        "example": "yes",
        "minLength": 0,
        "maxLength": 255
      }
      "displayas": {
        "type": "string",
        "format": "enum",
        "example": "tiles",
        "minLength": 0,
        "maxLength": 255,
        "enum": [
          "tiles",
          "list"
        ]
      },
      "image": {
        "type": "string",
        "format": "image",
        "example": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
        "minLength": 0,
        "maxLength": 1000000
      }
    }
  }
```
