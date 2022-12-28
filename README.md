# uxapieditor
This is a javascript library of functions built to use to speed app development on the UXAPI API-as-a-Service

The library assumes you have an access token stored in window.sessionStorage.token

# `returnObj` -- get an Object from the API

Example:  
`var bloglist = returnObj('/v1/blogs')`
