# uxapieditor
This is a javascript library of functions built to use to speed app development on the [UXAPI API-as-a-Service](https://uxapi.io)


## Configuration
Three variables need to be defined:

* uxapihost: the host of your API (e.g. api.finch.uxapi.io)
* clientID: the clientID which you can find in your Remote Dashboard on [UXAPI.io/dashboard](https://uxapi.io/dashboard)
* clientSecret: the secret which is also on the [remote dashboard](https://uxapi.io/dashboard)

#### Formatting
The library outputs with CSS classes from the `uxapi.css` file, also included in this repo. This allows you to modify the style as needed for your own project.

#### Editor
The rich editor for the `markdown` format used by UXAPI uses ckeditor.  There is a prebuilt ckeditor in this project, but be aware that this is only for ease-of-use and you should consider making your own build and, depending on your usage, getting a license.

Because I'm not very good at includes, the editor needs an extra bit of code on each page where you're using markdown:

```
var ele = document.getElementsByClassName('editor');
for (var i=0; i< ele.length; i++ ) {
  ckEditor(ele[i].id);
}
```

This will instantiate an editor for each field that is rendered using Markdown. 

## Authentication
The library assumes you have an access token stored in `window.sessionStorage.token` which can be generated using standard OAuth flows, but we have a prebuilt process using the following functions:

#### `refreshToken()`
Uses the `window.sessionStorage.refresh` to get a new `access_token` and `refresh_token` and, if it fails, returns the login page from the API.  It's good practice to include this on any page where you want people to be authorized.

#### `uxapilogin()`
Displays the login form from the `uxapihost` which then redirects back to the same page with an `authorization code` which is exchanged for an `access_token` which is THEN stored in the `window.sessionStorage.token`


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
`document.write(listObjects()

---

#### `returnObj(path)`
Returns the JSON object from the API

Example:  
`var bloglist = returnObj('/v1/blogs')`

This performs a simple GET against the API and returns response as a JSON object.  If things are behaving properly, it should follow the [UXAPI Standards](https://uxapi.io/articles/6f51ee20-1b99-11ed-9fed-4d4f74c3731b/Our-API-Standards) format which is what allows for the reusability of the rest of the code.  `returnObj()` is used by most of the other functions in this library.

---

#### `delObject(path, objectLabel)`
Deletes the object located at the `path` -- this is used by the `editObject()` and `editObjects()` functions but can also be called directly.

Example:  
`delObject  ('/v1/blogs/81a3722e-4975-4cf7-8940-89859666b3f8', 'My Adventures in Amsterdam')`

`objectLabel` is optionally used to provide a human readable warning "you are going to delete {objectLabel}.." -- if an `objectLabel` is not provided the UUID for the `objectID` will be displayed.
