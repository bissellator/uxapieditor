# uxapieditor
This is a javascript library of functions built to use to speed app development on the UXAPI API-as-a-Service

The library assumes you have an access token stored in `window.sessionStorage.token`

### Configuration
Three variables need to be defined:

* uxapihost: the host of your API (e.g. api.finch.uxapi.io)
* clientID: the clientID which you can find in your Remote Dashboard on [UXAPI.io/dashboard](https://uxapi.io/dashboard)
* clientSecret: the secret which is also on the [remote dashboard](https://uxapi.io/dashboard)


### `returnObj(path)`
Returns the JSON object from the API

Example:  
`var bloglist = returnObj('/v1/blogs')`

This performs a simple GET against the API and returns response as a JSON object.  If things are behaving properly, it should follow the [UXAPI Standards](https://uxapi.io/articles/6f51ee20-1b99-11ed-9fed-4d4f74c3731b/Our-API-Standards) format which is what allows for the reusability of the rest of the code.  `returnObj()` is used by most of the other functions in this library.


### `listObjects(path, listOptions, format)`
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

### `refreshToken()`
Uses the `window.sessionStorage.refresh` to get a new `access_token` and `refresh_token` and, if it fails, returns the login page from the API.  It's good practice to include this on any page where you want people to be authorized.

#### `uxapilogin()`
Displays the login form from the `uxapihost` which then redirects back to the same page with an `authorization code` which is exchanged for an `access_token` which is THEN stored in the `window.sessionStorage.token`
