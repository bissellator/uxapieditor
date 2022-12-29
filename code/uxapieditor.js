
function returnObj(path) {
  if (typeof(window.sessionStorage.token) != 'undefined') {
    var obj = $.ajax({
      url: uxapihost + path,
      async: false,
      type:'GET',
      dataType: 'text',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + window.sessionStorage.token)
      },
      success: function(text){
  			  if(typeof(text.error) != 'undefined') {
            console.log(text.error)
            return text.error
  				}
  				else {
            return text
  				}
      },
      error: function(err) {
          //console.log(err)
      }
  	});
    return JSON.parse(obj.responseText)

  }
  else {
  var obj =   $.ajax({
      url: uxapihost + path,
      async: false,
      type:'GET',
      dataType: 'text',
      success: function(text){
          if(typeof(text.error) != 'undefined') {
            // console.log(text.error)
            return text.error
          }
          else {
            return text
          }
      },
      error: function(err) {
          // console.log(err)
      }
    });
    return JSON.parse(obj.responseText)
  }
}

function listObjects(path, listOptions, format) {
  var msg = ""
  if (typeof(format) == 'undefined') {format = 'list'}
  if (typeof(listOptions) == 'undefined' || typeof(path) =='undefined' || typeof(listOptions) != 'object') {
    msg = msg + '<p>Please provide path and listOptions (see <a href="https://github.com/bissellator/uxapieditor/blob/main/README.md" target="_blank">README</A>)'
    return msg;
  }
  else {
    var obj = returnObj(path)
    if (obj.error) {return obj.error}
    var basepath = path.split('?')[0]
    var ref = getRef(basepath)
    var contract = getContract()
    var fieldclasses = getFormats(contract, ref)

    var divhead  = `<div class="uxapitiles">`
    if (format == 'tiles') {

      if (typeof(obj.object) != 'undefined') {
        msg = msg + divhead
        msg = msg + renderTile(obj, listOptions)
      }
      else {
        msg = msg + divhead
        for (var i = 0; i < obj.objects.length; i++) {
          if (parseInt((i+1)/4) == ((i)/4) && i > 0) {
              console.log(parseInt(i/4) +" "+ (i/4))
              msg = msg + "</div>" + divhead
            }
            msg = msg + renderTile(obj.objects[i], listOptions)
          }
        }
      msg = msg + "</div>"
    }
    else {
      if (typeof(obj.object) != 'undefined') {
        msg = msg + renderList(obj, listOptions, fieldclasses)
      }
      else {
        for (var i = 0; i < obj.objects.length; i++) {
          msg = msg + renderList(obj.objects[i], listOptions, fieldclasses)
      }
    }
  }
  }
  return msg
}

function editObjects(path) {
  var resp = ""
  var basepath = path.split('?')[0]
  var list = returnObj(path)
  if (typeof(list.objects) != 'undefined') {

    if (typeof(fieldclasses) == 'undefined') {
      if (typeof(contractpath) == 'undefined') {
        var pathels = path.split('/')
        contractpath = ''
        for (var i =1; i <pathels.length; i ++) {
          if(pathels[i].match(/^.{8}[-]/) != null) {
            pathels[i] = '{' + pathels[i-1] + 'Id}'
          }
          contractpath = contractpath + '/' + pathels[i]
        }
      }
      var contract = getContract()
      if(typeof contract.paths[contractpath] != 'undefined') {
        if(typeof contract.paths[contractpath].post != 'undefined') {
          var ref = contract.paths[contractpath].post.requestBody.content["application/json"].schema["$ref"]
          var refObj = resolver(contract, ref)
            fieldclasses = getFormats(contract, ref)
          }
        }
      }
    for (var i =0; i < list.objects.length; i++) {
      var objectID = list.objects[i].objectID
      resp = resp + `<hr /><span class="clickable" onclick="delObj('` + basepath + `/` + objectID +`', '`+ list.objects[i].objectID +`')">&#128465; Delete</span><Br />`
      var respmsg = `<form id="form-`+ objectID + `"><table border=0>`
      var text = list.objects[i]
      var object = text
      for (const [key, value] of Object.entries(object.object)) {
        var fieldclass="uxapi-textarea"
        var fieldvalue = ""
        var fieldlabel = key
        if (typeof(fieldclasses[key]) != 'undefined') {
          if(typeof(fieldclasses[key].class) != 'undefined') {
            fieldclass = fieldclasses[key].class
          }
          else {fieldclass="uxapi-textarea"}
          if (typeof(fieldclasses[key].value) != 'undefined') {
            fieldvalue = fieldclasses[key].value
          }
          if (typeof(fieldclasses[key].label) != 'undefined') {
            fieldlabel = fieldclasses[key].label
          }
        }
        if (fieldclasses[key].type == 'select') {
          respmsg = respmsg + "<tr><td>" + fieldlabel + `</td>
            <td><select class="`+fieldclass+`" id="`+ key + `" onchange="saveObject('` + objectID + `', '` + basepath + `/` + objectID + `', 'PUT')">`
            respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
          for (var e =0; e < fieldclasses[key].options.length; e++) {
            var selected = ''
            if (fieldclasses[key].options[e] == value) {selected = 'selected'}
            respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `" ` + selected +`>` + fieldclasses[key].options[e] + `</option>`
          }
          respmsg = respmsg + `</select></td></tr>`
        }
        else if (fieldclasses[key].type == 'boolean') {
          respmsg = respmsg + "<tr><td>" + fieldlabel + `</td>
            <td><select class="`+fieldclass+`" id="`+ key + `" onchange="saveObject('` + objectID + `', '` + basepath + `/` + objectID + `', 'PUT')">`
            respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
          for (var e =0; e < fieldclasses[key].options.length; e++) {
            var selected = ''
            if (fieldclasses[key].options[e] == value) {selected = 'selected'}
            respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `" ` + selected +`>` + fieldclasses[key].options[e] + `</option>`
          }
          respmsg = respmsg + `</select></td></tr>`
        }
        else if (fieldclasses[key].class == 'uxapi-image') {
          respmsg = respmsg + `<tr><td>` + fieldlabel + `</td>`
          respmsg = respmsg + `<td>
            <img src="` + value + `" class="uxapi-image" id="`+key+`.form-` + objectID +`"><br/>
            <input type="file" onchange="encodeImageFileAsBase64(this, 'form-` + objectID + `', '` + key + `');saveObject('` + objectID + `', '` + basepath + `/` + objectID + `', 'PUT')" />
            <textarea id="`+key+`" style="visibility:hidden;height:0px;width:0px">`+ value + `</textarea>
            </td></tr>`
        }
        else {
          respmsg = respmsg + "<tr><td>" + key + `</td><td><textarea class="` + fieldclass + `" id="`+ key + `" onchange="saveObject('` + objectID + `', '` + basepath + `/` + objectID + `', 'PUT')">` + value + `</textarea></td></tr>`
        }
      }
      respmsg = respmsg + `</table></form><Br />`
      var sublink = ''
      if (typeof(subCollection) != 'undefined' && typeof(subCollectionTarget) != 'undefined') {
        var subpath = path.split('?')[0] + `/` + objectID + `/` + subCollection
        sublink = `<div onclick="document.getElementById('`+ subCollectionTarget + `').innerHTML= editObjects('`+ subpath + `', '`+subLabel+`')">` + subCollection + `</div>`
      }
      resp = resp+respmsg + sublink
    }
  }
  return resp + postObjectForm(basepath)
}

function editObject(path, contractpath, fieldclasses) {
  var basepath = path.split('?')[0]

  if (typeof(fieldclasses) == 'undefined') {
    if (typeof(contractpath) == 'undefined') {
      var pathels = path.split('/')
      contractpath = ''
      for (var i =1; i <pathels.length; i ++) {
        if(pathels[i].match(/^.{8}[-]/) != null) {
          pathels[i] = '{' + pathels[i-1] + 'Id}'
        }
        contractpath = contractpath + '/' + pathels[i]
      }
    }
    console.log(contractpath)
    var contract = getContract()
    contract = JSON.parse(contract.responseText)
    console.log(contract)
    if(typeof contract.paths[contractpath] != 'undefined') {
      if(typeof contract.paths[contractpath].put != 'undefined') {
        var ref = contract.paths[contractpath].put.requestBody.content["application/json"].schema["$ref"]
        var refObj = resolver(contract, ref)
          fieldclasses = getFormats(contract, ref)
        }
      }
    }

  var object = returnObj(path)
//  var object = JSON.parse(text.responseText)
  var objectID = object.objectID
  var respmsg = `<form id="form-`+ objectID + `"><table border=0>`
  for (const [key, value] of Object.entries(object.object)) {
    var fieldclass="uxapitextarea"
    var fieldvalue = ""
    var fieldlabel = key
    if (typeof(fieldclasses[key]) != 'undefined') {
      if(typeof(fieldclasses[key].class) != 'undefined') {
        fieldclass = fieldclasses[key].class
      }
      else {fieldclass="uxapitextarea"}
      if (typeof(fieldclasses[key].value) != 'undefined') {
        fieldvalue = fieldclasses[key].value
      }
      if (typeof(fieldclasses[key].label) != 'undefined') {
        fieldlabel = fieldclasses[key].label
      }
    }

    if (fieldclasses[key].type == 'select') {
      respmsg = respmsg + "<tr><td>" + fieldlabel + `</td>
        <td><select class="`+fieldclass+`" id="`+ key + `" onchange="saveObject('` + objectID + `', '` + basepath + `/` + objectID + `', 'PUT')">`
        respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
      for (var e =0; e < fieldclasses[key].options.length; e++) {
        var selected = ''
        if (fieldclasses[key].options[e] == value) {selected = 'selected'}
        respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `" ` + selected +`>` + fieldclasses[key].options[e] + `</option>`
      }
      respmsg = respmsg + `</select></td></tr>`
    }
    else if (fieldclasses[key].type == 'boolean') {
      respmsg = respmsg + "<tr><td>" + fieldlabel + `</td>
        <td><select class="`+fieldclass+`" id="`+ key + `" onchange="saveObject('` + objectID + `', '` + basepath + `/` + objectID + `', 'PUT')">`
        respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
      for (var e =0; e < fieldclasses[key].options.length; e++) {
        var selected = ''
        if (fieldclasses[key].options[e] == value) {selected = 'selected'}
        respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `" ` + selected +`>` + fieldclasses[key].options[e] + `</option>`
      }
      respmsg = respmsg + `</select></td></tr>`
    }
    else if (fieldclasses[key].class == 'uxapi-image') {
      respmsg = respmsg + `<tr><td>` + fieldlabel + `</td>`
      respmsg = respmsg + `<td>
        <img src="` + value + `" class="uxapi-image" id="`+key+`.form-` + objectID +`"><br/>
        <input type="file" onchange="encodeImageFileAsBase64(this, 'form-` + objectID + `', '` + key + `');saveObject('` + objectID + `', '` + basepath + `/` + objectID + `', 'PUT')" />
        <textarea id="`+key+`" style="visibility:hidden;height:0px;width:0px">`+ value + `</textarea>
        </td></tr>`
    }
    else {
      respmsg = respmsg + "<tr><td>" + fieldlabel + `</td><td><textarea class="`+fieldclass+`" id="`+ key + `">` + value + `</textarea></td>`
    }
  }
  // respmsg = respmsg + `</table></form>`
  respmsg = respmsg + `</table><p type="button" class="clickable" onclick="saveObject('` + objectID + `', '` + path + `', 'PUT')" value='Save'>Save</p></form>`

  return respmsg
}

function postObjectForm(path, contractpath, fieldclasses) {
  var tokenmsg = (refreshToken())
  if (typeof(tokenmsg) == 'string') {
    return tokenmsg
  }
  try {JSON.parse(tokenmsg); }catch {
  }
  if (typeof(contractpath) == 'undefined') {
    var pathels = path.split('/')
    contractpath = ''
    for (var i =1; i <pathels.length; i ++) {
      if(pathels[i].match(/^.{8}[-]/) != null) {
        pathels[i] = '{' + pathels[i-1] + 'Id}'
      }
      contractpath = contractpath + '/' + pathels[i]
    }
  }
  objectID = btoa(makeid())
  var respmsg = '<form id="form-' + objectID + '"><B>Add a new object</B><table border=0>'
  var contract = getContract()
  if(typeof contract.paths[contractpath] != 'undefined') {
    if(typeof contract.paths[contractpath].post != 'undefined') {
      var ref = contract.paths[contractpath].post.requestBody.content["application/json"].schema["$ref"]
      var refObj = resolver(contract, ref)
      if (typeof(fieldclasses) == 'undefined') {
        fieldclasses = getFormats(contract, ref)
      }
      for (const [key, value] of Object.entries(refObj.properties)) {
        var fieldclass="uxapi-textarea"
        var fieldvalue = ""
        var fieldlabel = key
        if (typeof(fieldclasses[key]) != 'undefined') {
          if(typeof(fieldclasses[key].class) != 'undefined') {
            fieldclass = fieldclasses[key].class
          }
          else {fieldclass="uxapitextarea"}
          if (typeof(fieldclasses[key].value) != 'undefined') {
            fieldvalue = fieldclasses[key].value
          }
          if (typeof(fieldclasses[key].label) != 'undefined') {
            fieldlabel = fieldclasses[key].label
          }
        }
        if (fieldclasses[key].class == 'uxapi-markdown') fieldclass = 'editor'
        if (fieldclasses[key].type == 'select') {
          respmsg = respmsg + "<tr><td>" + fieldlabel + `</td>
            <td><select class="`+fieldclass+`" id="`+ key + `">`
            respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
          for (var e =0; e < fieldclasses[key].options.length; e++) {
            respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
          }
          respmsg = respmsg + `</select></td></tr>`
        }
        else if (fieldclasses[key].type == 'boolean') {
          respmsg = respmsg + "<tr><td>" + fieldlabel + `</td>
            <td><select class="`+fieldclass+`" id="`+ key + `">`
            respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
          for (var e =0; e < fieldclasses[key].options.length; e++) {
            respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
          }
          respmsg = respmsg + `</select></td></tr>`
        }
        else if (fieldclasses[key].class == 'uxapi-image') {
          respmsg = respmsg + `<tr><td>` + fieldlabel + `</td>`
          respmsg = respmsg + `<td>
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7" class="uxapi-image" id="`+key+`.form-` + objectID + `"><br/>
            <input type="file" onchange="encodeImageFileAsBase64(this, 'form-` + objectID + `', '` + key + `')" />
            <textarea id="`+key+`" style="visiblity:hidden; height:0px;width:0px;" ></textarea>
            </td></tr>`
        }
        else {
          respmsg = respmsg + `<tr><td>` + fieldlabel + `</td><td><textarea class="`+fieldclass+`" id="`+ key + `">`+ fieldvalue + `</textarea></td></tr>`
        }
      }
      respmsg = respmsg + `</table><p style="	cursor: pointer;border: 1px solid;padding: 10px; box-shadow: 5px 10px #888888;width:100px" onclick="saveObject('` + objectID + `', '` + path + `', 'POST')" value='Post New'>Post New</p></form>`
      ckEditor()
      return respmsg
    }
  }
}

function saveObject(objectID, path, method) {
  console.log("saving " + path)
  var payload = {}
  for (var i =0; i < (document.getElementById('form-' + objectID).elements.length); i++) {
    var elname = document.getElementById('form-' + objectID).elements[i].id
    var elclass =document.getElementById('form-' + objectID).elements[i].className
    if(elclass == 'editor') {
      payload[elname] = editor.getData()
    }
    else if (elname.length > 1) {
      payload[document.getElementById('form-' + objectID).elements[i].id] = document.getElementById('form-' + objectID).elements[i].value
    }
  }
  putObject(path, payload, method)
}

function putObject(path, payload, method) {
  return $.ajax({
    url: uxapihost + path,
    async: false,
    type:method,
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify(payload),
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + window.sessionStorage.token)
    },
    success: function(text){
			  if(typeof(text.error) != 'undefined') {
          console.log(text.error)
          return text.error
				}
				else {
          try {
            postObjectCleanup( path, text )
          }catch {}
				}
    },
    error: function(err) {
        console.log(err)
    }
	});
}

function delObj(path, objectLabel) {
  var text = ''
  if (confirm("Are you sure you want to delete " + objectLabel) == true) {
//  if (confirm(text) == true) {
    return $.ajax({
      url: uxapihost + path,
      async: false,
      type:'DELETE',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + window.sessionStorage.token)
      },
      success: function(text){
  			  if(typeof(text.error) != 'undefined') {
            console.log(text.error)
            return text.error
  				}
  				else {
            try {
              postObjectCleanup( path, text )
            }catch {}
  				}
      },
      error: function(err) {
          console.log(err)
          try {
            postObjectCleanup( path, err )
          }catch {}

      }
  	});
  } else {
    text = "You canceled!";
  }
  alert(text)
  return
}

function encodeImageFileAsBase64(element, form, div) {
  let file = element.files[0];
  var filesize = (file.size / 1000000).toFixed(2)
  if(file.size > 1000000)  {alert("Your file should be less than 1MB, it is " + filesize + "MB"); return;}
  let reader = new FileReader();
  reader.onloadend = function() {
    document.getElementById(div + '.' + form).src = reader.result
//    document.getElementById(div).value = reader.result
    document.getElementById(form).elements[div].value = reader.result
//    console.log(reader.result)
  }
  reader.readAsDataURL(file);
}

function makeid() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 30; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getContract() {
  var contract = $.ajax({
    url: uxapihost,
    async: false,
    type:'GET',
    dataType: 'text',
    success: function(text){
			  if(typeof(text.error) != 'undefined') {
          console.log(text.error)
          return text.error
				}
				else {
          return text
				}
    },
    error: function(err) {
        console.log(err)
    }
	});
  return JSON.parse(contract.responseText)
}

function renderContract() {
  var msg = ""
  var contract = getContract()
  contract = JSON.parse(contract.responseText)
  msg = msg + `<h5>` +contract.info.title + `</h5>`
  msg = msg + `<p>` + contract.info.description + '</p>'
  var msg =  msg+ "<hr /><p>Here are your API objects:</p>"
  var paths = []
  for (const [key, value] of Object.entries(contract.paths)) {
    paths.push(key)
  }
  paths =paths.sort(function(a, b){
    let x = a.toLowerCase();
    let y = b.toLowerCase();
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
  });
  var tags = []
  var tag = ''
  for (var ii=0; ii < contract.tags.length; ii++) {
    msg = msg + `<hr style="border-top: 1px solid black;">`
    msg = msg + `<h3>` + contract.tags[ii].name + `</h3>`
    msg = msg + `<p>` + contract.tags[ii].description + `</p>`
    for (var i = 0;i< paths.length; i++) {
      try {
        if (contract.tags[ii].name == contract.paths[paths[i]].get.tags[0]) {
          for (const [key, value] of Object.entries(contract.paths[paths[i]])) {
            if (key != 'parameters') {
              msg = msg + `<BR /><hr style="border-top: 1px dashed black;"><p><span class="button` + key + `">` + key + `</span> ` + paths[i] + `</p>`
              msg = msg + `<p>` + contract.paths[paths[i]][key].description + `</p>`
              try{
                for (var [securitytype, securityvalue] of Object.entries(contract.paths[paths[i]][key].security[0])) {
                  msg = msg + `<p>Authorization: ` + securitytype + `</p>`
                }
              }catch{}
              if (typeof(contract.paths[paths[i]][key].requestBody) != 'undefined' ) {
                msg = msg + `<hr /><p><b>Request Body</b></p>`
                msg = msg + `<p>` + contract.paths[paths[i]][key].requestBody.description + `</p>`
                var ref = contract.paths[paths[i]][key].requestBody.content["application/json"].schema["$ref"]
                var refObj = renderObject(contract, ref)
                msg = msg + `<div class="codeblock">` + JSON.stringify(refObj, null, 2) + `</div>`
              }
              if (typeof(contract.paths[paths[i]][key].responses) != 'undefined' ) {
                msg = msg + `<hr /><p><b>Responses</b></p>`
                for (const [code, other] of Object.entries(contract.paths[paths[i]][key].responses)) {
                  msg = msg + `<p>` + code + `: ` + contract.paths[paths[i]][key].responses[code].description + `</p>`
                  var ref = contract.paths[paths[i]][key].responses[code].content["application/json"].schema["$ref"]
                  var refObj = renderObject(contract, ref)
                  msg = msg + `<div class="codeblock">` + JSON.stringify(refObj, null, 2) + `</div>`
                }
              }
            }
          }
        }
      }catch{}
    }
  }
  return msg
}

function listPaths() {
  var msg = ""
  var contract = getContract()
  contract = JSON.parse(contract.responseText)
  msg = msg + `<h5>` +contract.info.title + `</h5>`
  msg = msg + `<p>` + contract.info.description + '</p>'
  var msg =  msg+ "<hr /><p>Here are your API objects:</p>"
  var paths = []
  for (const [key, value] of Object.entries(contract.paths)) {
    paths.push(key)
  }
  paths =paths.sort(function(a, b){
    let x = a.toLowerCase();
    let y = b.toLowerCase();
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
  });
  var tags = []
  var tag = ''
  for (var ii=0; ii < contract.tags.length; ii++) {
    msg = msg + `<hr style="border-top: 1px solid black;">`
    msg = msg + `<h3>` + contract.tags[ii].name + `</h3>`
    msg = msg + `<p>` + contract.tags[ii].description + `</p>`
    for (var i = 0;i< paths.length; i++) {
      try {
        if (contract.tags[ii].name == contract.paths[paths[i]].get.tags[0]) {
          msg = msg+ `<p class=clickable onclick="togglePathDiv('`+ paths[i] + `')">` + paths[i] + `</p><div id="` + paths[i] + `"></div>`
        }
      }catch (err){console.log(err)}
    }
  }
  return msg
}

function togglePathDiv(path) {
  if (document.getElementById(path).innerHTML == "" ) {
    document.getElementById(path).innerHTML = editObjects(path)
  }
  else {
    document.getElementById(path).innerHTML = ""
  }
}

function renderObject(contract, ref) {
  var msg = {}
  var schema = resolver(contract, ref)
  for (const [key, value] of Object.entries(schema.properties)) {
    if (typeof(schema.properties[key]['$ref']) != 'undefined') {
      if (typeof(schema.properties[key].type) == 'undefined') {
        msg[key] = {}
        msg[key] = renderObject(contract, schema.properties[key]['$ref'])
      }
    }
    if (schema.properties[key].type == 'string') {
      msg[key] = ''
      msg[key] = schema.properties[key].example
    }
    if(schema.properties[key].type == 'array') {
      msg[key] = []
      if (schema.properties[key].items['$ref'] != 'undefined') {
        var tmpobj = renderObject(contract, schema.properties[key].items['$ref'])
        msg[key][0] = tmpobj
      }
    }
  }
  return msg
}

function resolver (contract, ref) {
  ref = ref.replace(/\//g, '"]["');
  ref = ref.replace('#"]', '');
  ref = 'contract' + ref + '"]';
  var myobj = eval(ref);
  return myobj;
}

function getRef(path,contractpath) {
  if (typeof(contractpath) == 'undefined') {
    var pathels = path.split('/')
    contractpath = ''
    for (var i =1; i <pathels.length; i ++) {
      if(pathels[i].match(/^.{8}[-]/) != null) {
        pathels[i] = '{' + pathels[i-1] + 'Id}'
      }
      contractpath = contractpath + '/' + pathels[i]
    }
  }
  var contract = getContract()
  if(typeof contract.paths[contractpath] != 'undefined') {
    if(typeof contract.paths[contractpath].post != 'undefined') {
      var ref = contract.paths[contractpath].post.requestBody.content["application/json"].schema["$ref"]
      return ref
    }
  }
}

function parseJWT(jwt) {
  // clean out whitespace
  jwt = jwt.replace(/\n/g, '')
  jwt = jwt.replace(/\ /g, '')

  // split and display token components
  jwt = jwt.split('.')
  var json = {}
  try {
    json.header = JSON.parse(atob(jwt[0]))
  }catch (err) {json.header = "The Header is not properly encoded\n\n" + err }

  try {
    json.body = JSON.parse(atob(jwt[1]))
  }catch (err) {json.body = "The Body is not properly encoded\n\n" + err }

  json.signature = jwt[2]

  return json;
}

function getFormats(contract, ref) {
  var msg = ""
  var refObj = (resolver(contract, ref))
  refObj = refObj.properties
  var pageclasses = {}
  for (const [key, value] of Object.entries(refObj)) {
    pageclasses[key] = {}
    if (refObj[key].type == 'string') {
      if (refObj[key].format == '') {
        pageclasses[key].class = 'uxapi-text'
      }
      else if (refObj[key].format == 'enum') {
        pageclasses[key].class = 'uxapi-dropdown'
        pageclasses[key].type = 'select'
        pageclasses[key].options = []
        try {
          pageclasses[key].options = refObj[key].enum
        }catch{}
      }
      else if (refObj[key].format == 'image') {
        pageclasses[key].class = 'uxapi-image'
      }
      else {
        pageclasses[key].class = 'uxapi-' + refObj[key].format
      }
    }
    if (refObj[key].type == 'boolean') {
      pageclasses[key].class = 'uxapi-radio'
      pageclasses[key].type = 'boolean'
      pageclasses[key].options = ["true", "false"]
    }
  }

return pageclasses
}

function renderTile(obj, listOptions) {
  var msg = ''
  console.log(obj)
  var tileTemplate = `
  <div class="uxapitile">
    <h3>fTILETITLE</h3>
    <ul style="list-style-type:none;padding:0;margin:0;" class="clickable">
      <li class="w3-padding-16" class="clickable" onclick="location.href='fTILETARGET'">
        <img src="fTILEIMAGE">
        <span>fTILEBLURB</span>
      </li>
    </ul>
  </div>
  `
  tileTemplate = `
  <div class="uxapitile" style="cursor:pointer" onclick="location.href='fTILETARGET'">
    <img src="fTILEIMAGE" alt="fTILETITLE" style="width:100%">
    <h3>fTILETITLE</h3>
    <p>fTILEBLURB</p>
  </div>
  `
  var tmp = tileTemplate;
  var link = listOptions.link
  for (const [key, value] of Object.entries(obj.object)) {
    var rE = '{' + key + '}'
    var rE2 = new RegExp(rE, 'g')
    link = link.replace(rE2, value)
  }
  if (link.includes('{objectID}') == true) {
    var rE = '{objectID}'
    var rE2 = new RegExp(rE, 'g')
    link = link.replace(rE2, obj.objectID)
  }
  if (typeof(listOptions.img) == 'undefined') {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"}catch{}}
  else if (listOptions.img == null) {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"}catch{}}
  else if (listOptions.img.length == 0) {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"}catch{}}
  if (obj.object[listOptions.img].length == 0 ) {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"}catch{}}
  tmp = tmp.replace(/fTILETITLE/g, obj.object[listOptions.title])
  tmp = tmp.replace(/fTILEBLURB/g, obj.object[listOptions.blurb])
  tmp = tmp.replace(/fTILEIMAGE/g, obj.object[listOptions.img])
  tmp = tmp.replace(/fTILETARGET/g, link)
  msg = msg + tmp
  return msg
}

function renderList(obj, listOptions, fieldclasses) {
  var msg = ''
  var link = listOptions.link
  for (const [key, value] of Object.entries(obj.object)) {
    var rE = '{' + key + '}'
    var rE2 = new RegExp(rE, 'g')
    link = link.replace(rE2, value)
  }
  if (link.includes('{objectID}') == true) {
    var rE = '{objectID}'
    var rE2 = new RegExp(rE, 'g')
    link = link.replace(rE2, obj.objectID)
  }
  if (typeof(listOptions.img) == 'undefined') {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"}catch{}}
  else if (listOptions.img == null) {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"}catch{}}
  else if (listOptions.img.length == 0) {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"}catch{}}
  if (obj.object[listOptions.img].length == 0 ) {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"}catch{}}
  msg = msg + `<p><a href="` + link + `"><b>` + obj.object[listOptions.title] + `</b></A><br/>`
  msg = msg + `<img src="` + obj.object[listOptions.img] + `" class='uxapilistimg'  alt="` + obj.object[listOptions.title] + `">`
  msg = msg  + `<span class="` + fieldclasses[listOptions.blurb].class + `">` + obj.object[listOptions.blurb] + `</span> <br style="clear: both;" /></p>`
  return msg
}

function refreshToken() {
  var payload = "grant_type=refresh_token&refresh_token=" + window.sessionStorage.refresh
  var response = $.ajax({
    url: uxapihost + '/v1/uxapi/tokens/create',
    async: false,
    type:'POST',
    dataType: 'text',
    data: payload,
    contentType: 'application/x-www-form-urlencoded',
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic "+ btoa(clientID + ':' + clientSecret));
    },
    success: function(text){
			  if(typeof(text.error) != 'undefined') {
          return("hi")
				}
				else {
          text = JSON.parse(text)
          window.sessionStorage.token = text.access_token
          window.sessionStorage.refresh = text.refresh_token
				}
    },
    error: function(err) {
      return err
        //console.log(err)
    }
	});
  var response = JSON.parse(response.responseText)
  if (typeof(response.error) != "undefined") {
    return uxapilogin()
  }
  else {
    return response
  }
}

function uxapilogin() {
  var params = {}
  var urlParams = new URLSearchParams(location.search);
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  if (typeof(params.code) == 'undefined') {
    var response = $.ajax({
      url: uxapihost + '/v1/uxapi/auth/login.html?client_id=' + clientID + '&redirect_uri=' + window.location.href,
      async: false,
      type: 'GET',
      success: function(text) {

      }
    });
    return response.responseText
  }
  else {
    var payload = "grant_type=authorization_code&code=" + params.code
    var respose = $.ajax({
      url: uxapihost + '/v1/uxapi/tokens/create',
      async: true,
      type:'POST',
      dataType: 'text',
      data: payload,
      contentType: 'x-www-form-urlencoded',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic "+ btoa(clientID + ':' + clientSecret));
      },
      success: function(text){
        try{
          var json = JSON.parse(text)
          if (typeof(json.access_token) != 'undefined') {
            window.sessionStorage.token = json.access_token
            window.sessionStorage.refresh = json.refresh_token
            window.location.href = '/admin/'
          }
        }catch {
          console.log(text)
          var msg = `Something went wrong, please <a href=./login.html>try logging in again</a>`
          document.getElementById("loginbox").innerHTML = msg
        }
        return;
      },
      error: function(err) {
        var msg = `Something went wrong, please <a href=./login.html>try logging in again</a>`
        document.getElementById("loginbox").innerHTML = msg
        console.log(err)
        return;
      }
    });
    return response
  }
}

function ckEditor() {
  ClassicEditor
    .create( document.querySelector( '.editor' ), {
      plugin: ['Markdown', 'Base64UploadAdapter'],
     licenseKey: '',
     config: { height: '800px', fontFamily: 'Arial, Helvetica, sans-serif'},
    } )
    .then( editor => {
      window.editor = editor;
    } )
    .catch( error => {
//      console.error( 'Something went wrong with ckeditor' );
  //    console.error( 'Please, report the following error on https://github.com/ckeditor/ckeditor5/issues with the build id and the error stack trace:' );
  //    console.warn( 'Build id: myzmd7eray8w-unt8fr6ckh47' );
  //    console.error( error );
    } );
  }