function returnObj(path) {
    if (typeof(sessionStorage.token) != 'undefined') {
      refreshToken()
    var obj = $.ajax({
      url: uxapihost + path,
      async: false,
      type:'GET',
      dataType: 'text',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.token)
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
    msg = msg + `<p>Available fields are<br /><pre>`
    var tmp = getFormats(getContract(), getRef(path, pathToContractpath(path)))
    for (const [key, value] of Object.entries(tmp)) {
      msg = msg + key + `\n`
    }
    msg = msg + `</pre></p><p>JSON object expects the following<br /><pre>
{
  title: 'fieldname',
  blurb: 'filedname',
  img: 'fieldname',
  link: 'localhost/somelink/{fieldname}/index.html?pathvar?{fieldname}'
}
</pre></p>`
    return msg;
  }
  else {
    var obj = returnObj(path)
    if (obj.error) {return obj.error}
    var basepath = path.split('?')[0]
    var ref = getRef(basepath)
    var contract = getContract()
    var fieldclasses = getFormats(contract, ref)

    var divhead  = `<div class="uxapigridcontainer">`
    if (format == 'tiles') {
      if (typeof(obj.object) != 'undefined') {
        msg = msg + divhead
        msg = msg + renderTile(obj, listOptions)
      }
      else {
        msg = msg + divhead
        for (var i = 0; i < obj.objects.length; i++) {
            msg = msg + renderTile(obj.objects[i], listOptions)
          }
        }
      msg = msg + "</div>"
    }
    else if (format == 'buttons') {
      if (typeof(obj.object) != 'undefined') {
        msg = msg + divhead
        msg = msg + renderButton(obj, listOptions)
      }
      else {
        msg = msg + divhead
        for (var i = 0; i < obj.objects.length; i++) {
            msg = msg + renderButton(obj.objects[i], listOptions)
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
  var contractpath = ''
    var pathels = path.split('/')
    contractpath = pathToContractpath(path)
    var contract = getContract()
    if(typeof contract.paths[contractpath] != 'undefined') {
      if(typeof contract.paths[contractpath].post != 'undefined') {
        var ref = contract.paths[contractpath].post.requestBody.content["application/json"].schema["$ref"]
        var refObj = resolver(contract, ref)
        fieldclasses = getFormats(contract, ref)
      }
      else if (typeof(contract.paths[contractpath].get) != 'undefined') {
        var ref = contract.paths[contractpath].get.responses['200'].content["application/json"].schema["$ref"]
        var refObj = resolver(contract, ref)
        fieldclasses = getFormats(contract, refObj.properties.object['$ref'])
      }
    }
    if (typeof(list.objects) != 'undefined') {
      for (var i =0; i < list.objects.length; i++) {
        var objectID = list.objects[i].objectID
        resp = resp + `<hr /><span class="clickable" onclick="delObject('` + basepath + `/` + objectID +`', '`+ list.objects[i].objectID +`')">&#128465; Delete</span><Br />`
        var respmsg = `<div id="` + objectID +`"><form id="form-`+ objectID + `"><table border=0>`
        var text = list.objects[i].object
        var object = text
        for (const [key, value] of Object.entries(object)) {
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
          if (typeof(fieldclasses[key].type) == 'undefined') {
            fieldclasses[key].type = 'text'
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
        respmsg = respmsg + `</table></form><Br /></div>`
        resp = resp+respmsg
      }
    }
  return resp
}

function editObject(path, formatstr) {
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
      if(typeof contract.paths[contractpath].get != 'undefined') {
        var ref = contract.paths[contractpath].get.responses["200"].content["application/json"].schema["$ref"]
        var refObj = resolver(contract, ref)
        if (typeof(refObj.properties.objects) != 'undefined') {
          if (typeof(refObj.properties.objects.type) != 'undefined') {
            if (refObj.properties.objects.type == 'array') {
              ref = refObj.properties.objects.items['$ref']
              var refObj = resolver(contract, ref)
              if (typeof(refObj.properties.object) != 'undefined') {
                if (typeof(refObj.properties.object['$ref']) != 'undefined') {
                  ref = refObj.properties.object['$ref']
                }
              }
            }
          }
        }

        if (typeof(refObj.properties.object) != 'undefined') {
          if (typeof(refObj.properties.object['$ref']) != 'undefined') {
            ref = refObj.properties.object['$ref']
          }
        }

          fieldclasses = getFormats(contract, ref)

        }
      }
    }
    var object = returnObj(path)
    if (typeof(object.objects) != 'undefined') {
      msg = "Use editObjects(path) for now... (that's with an s)"
      return msg
    }
    if (typeof(object.error) != 'undefined') {
      return object.error
    }
    if (formatstr == 'raw') {
      for (const [key, value] of Object.entries(fieldclasses)) {
        fieldclasses[key].class = 'uxapi-textarea'
      }
    }
    return renderEditObj(path, fieldclasses, object)
}

function renderEditObj(path, fieldclasses, object) {
  var basepath = path.split('?')[0]
  var objectID = object.objectID
  var respmsg = `<span class="clickable" onclick="delObject('` + basepath + `/` +`', '`+ objectID +`')">&#128465; Delete</span><Br />`
  respmsg = respmsg + `<form id="form-`+ objectID + `"><table border=0>`
  for (const [key, value] of Object.entries(fieldclasses)) {
    var fieldclass="uxapitextarea"
    var fieldvalue = ""
    var fieldlabel = key
    if (typeof(object.object[key]) == 'undefined') {
      fieldclasses[key] = {
        class: "uxapi-text"
      }
    }
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
      respmsg = respmsg + "<tr><td valign=top><b>" + fieldlabel + `</b></td>
        <td><select class="`+fieldclass+`" id="`+ key + `" onchange="saveObject('` + objectID + `', '` + basepath + `', 'PUT')">`
        respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
      for (var e =0; e < fieldclasses[key].options.length; e++) {
        var selected = ''
        if (fieldclasses[key].options[e] == object.object[key]) {selected = 'selected'}
        respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `" ` + selected +`>` + fieldclasses[key].options[e] + `</option>`
      }
      respmsg = respmsg + `</select></td></tr>`
    }
    else if (fieldclasses[key].type == 'boolean') {
      respmsg = respmsg + "<tr><td valign=top><B>" + fieldlabel + `</B></td>
        <td><select class="`+fieldclass+`" id="`+ key + `" onchange="saveObject('` + objectID + `', '` + basepath + `', 'PUT')">`
        respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `">` + fieldclasses[key].options[e] + `</option>`
      for (var e =0; e < fieldclasses[key].options.length; e++) {
        var selected = ''
        if (fieldclasses[key].options[e] == value) {selected = 'selected'}
        respmsg = respmsg + `<option value="` + fieldclasses[key].options[e] + `" ` + selected +`>` + fieldclasses[key].options[e] + `</option>`
      }
      respmsg = respmsg + `</select></td></tr>`
    }
    else if (fieldclasses[key].class == 'uxapi-image') {
      respmsg = respmsg + `<tr><td valign=top><B>` + fieldlabel + `</B></td>`
      respmsg = respmsg + `<td>
        <img src="` + object.object[key] + `" class="uxapi-image" id="`+key+`.form-` + objectID +`"><br/>
        <input type="file" onchange="encodeImageFileAsBase64(this, 'form-` + objectID + `', '` + key + `');saveObject('` + objectID + `', '` + basepath + `', 'PUT')" />
        <textarea id="`+key+`" style="visibility:hidden;height:0px;width:0px">`+ object.object[key] + `</textarea>
        </td></tr>`
    }
    else {
      respmsg = respmsg + "<tr><td valign=top><B>" + fieldlabel + `</b></td><td><textarea class="`+fieldclass+`" id="`+ key + `" onchange="saveObject('` + objectID + `', '` + basepath  + `', 'PUT')">` + object.object[key] + `</textarea></td>`
    }
  }
  respmsg = respmsg + `</table><p type="button" class="clickable" onclick="saveObject('` + objectID + `', '` + path + `', 'PUT')" value='Save'>Save</p></form>`
  var tmp = editObjects(basepath + '/' + getSubCollections(basepath))
  if (typeof(tmp) != 'undefined' && tmp.length > 0) {
    respmsg = respmsg + `<p style="border-top:solid; border-bottom:solid #000"><B>Items in Subcollection ` + getSubCollections(basepath) + `</b></p>`
    respmsg = respmsg + tmp
  }
  respmsg = respmsg + postObjectForm(basepath + '/' + getSubCollections(basepath))

  return respmsg

}

function postObjectForm(path, fieldclasses) {
  var pathels = path.split('/')
  contractpath = ''
  for (var i =1; i <pathels.length; i ++) {
    if(pathels[i].match(/^.{8}[-]/) != null) {
      pathels[i] = '{' + pathels[i-1] + 'Id}'
    }
    contractpath = contractpath + '/' + pathels[i]
  }
  objectID = btoa(makeid())
  var respmsg = `<div id="` + objectID + `"><form id="form-` + objectID + `"><B>Add a new ` + pathels[pathels.length-1] + `</B><table border=0>`
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
          respmsg = respmsg + `<tr><td>` + fieldlabel + `</td>
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
            <textarea id="`+key+`" style="visibility:hidden !important; height:0px;width:0px;" hidden></textarea>
            </td></tr>`
        }
        else {
          respmsg = respmsg + `<tr><td>` + fieldlabel + `</td><td><textarea class="`+fieldclass+`" id="`+ key + `">`+ fieldvalue + `</textarea></td></tr>`
        }
      }
      respmsg = respmsg + `</table><p style="	cursor: pointer;border: 1px solid;padding: 10px; box-shadow: 5px 10px #888888;width:100px" onclick="saveObject('` + objectID + `', '` + path + `', 'POST')" value='Post New'>Post New</p></form></div>`
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
      payload[elname] = eval(elname + `.getData()`)
    }
    else if (elname.length > 1) {
      payload[document.getElementById('form-' + objectID).elements[i].id] = document.getElementById('form-' + objectID).elements[i].value
    }
  }
  var respObj = putObject(path, payload, method)
  if (method == 'POST') {
    respObj = JSON.parse(respObj.responseText)
    if (typeof(respObj.objectID) != 'undefined') {
      var resp = editObject(path + '/' + respObj.objectID)
      resp = resp + postObjectForm(path)
      document.getElementById(objectID).innerHTML = resp
    }
  }
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
      xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.token)
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

function delObject(path, objectLabel) {
  var text = ''
  if (path.slice(-1) == '/') {path = path.substring(0, path.length - 1);}
  console.log(path)
  if (confirm("Are you sure you want to delete " + objectLabel +`? This will delete this item and any subcollections`) == true) {
//  if (confirm(text) == true) {
    return $.ajax({
      url: uxapihost + path,
      async: false,
      type:'DELETE',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.token)
      },
      success: function(text){
          if(typeof(text.error) != 'undefined') {
            console.log(text.error)
            postObjectCleanup( path, text )
            return text.error
          }
          else {
            try {
              postObjectCleanup( path, text )
            }catch {}
          }
      },
      error: function(err) {
          console.log(path, err)
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
    document.getElementById(form).elements[div].value = reader.result
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

function getContract(force) {
  if (typeof(window.sessionStorage.contract) != 'undefined' && force != 'force') {
    return JSON.parse(window.sessionStorage.contract)
  }
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
          window.sessionStorage.contract = text
        }
    },
    error: function(err) {
        console.log(err)
    }
  });
  return JSON.parse(contract.responseText)
}

function renderContract() {
  var msg  = ''
  var contract = getContract()
  msg = msg + `<h5>` +contract.info.title + `</h5>`
  msg = msg + `<p>` + contract.info.description + '<br>'
  msg = msg + `(<a href="` + uxapihost + `" target="_blank">OpenAPI Document</A>)</p>`
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

function getRef(path, contractpath) {
  if (typeof(contractpath) == 'undefined') {
    contractpath = pathToContractpath(path)
  }
  var contract = getContract()
  if(typeof contract.paths[contractpath] != 'undefined') {
    if(typeof contract.paths[contractpath].post != 'undefined') {
      var ref = contract.paths[contractpath].post.requestBody.content["application/json"].schema["$ref"]
      return ref
    }
    if(typeof contract.paths[contractpath].put != 'undefined') {
      var ref = contract.paths[contractpath].put.requestBody.content["application/json"].schema["$ref"]
      return ref
    }
  }
}

function pathToContractpath(path) {
var pathels = path.split('/')
var contractpath = ''
for (var i =1; i <pathels.length; i ++) {
  if(pathels[i].match(/^.{8}[-]/) != null) {
    pathels[i] = '{' + pathels[i-1] + 'Id}'
  }
  contractpath = contractpath + '/' + pathels[i]
}
return contractpath
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

function getSubCollections(path) {
  contract = getContract()
  var subcollections = []
  var pathels = path.split('/')
  contractpath = pathToContractpath(path)
  for (const [key, value] of Object.entries(contract.paths)) {
    var keyEls = key.split('/')
    var contractpathEls = contractpath.split('/')
    if (keyEls.length == contractpathEls.length + 1 && key.startsWith(contractpath) == true) {
      subcollections.push(keyEls[keyEls.length -1])
    }
  }
  return subcollections
}

function renderTile(obj, listOptions) {
  var msg = ''
  var imagestyle = ""
  var tileTemplate = `
  <div class="uxapigriditem clickable" onclick="location.href='fTILETARGET'">
      <img src="fTILEIMAGE" class="uxapi-image-thumb" style="fIMAGESTYLE" /><br/>
      <B>fTILETITLE</B><br/>
      fTILEBLURB
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
  if (typeof(listOptions.img) == 'undefined') {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"; imagestyle = "width:0px;height:0px"}catch{}}
  else if (listOptions.img == null) {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"; imagestyle = "width:0px;height:0px"}catch{}}
  else if (listOptions.img.length == 0) {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"; imagestyle = "width:0px;height:0px"}catch{}}
  if (obj.object[listOptions.img].length == 0 ) {try{obj.object[listOptions.img] = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7"; imagestyle = "width:0px;height:0px"}catch{}}
  tmp = tmp.replace(/fTILETITLE/g, obj.object[listOptions.title])
  tmp = tmp.replace(/fTILEBLURB/g, obj.object[listOptions.blurb])
  tmp = tmp.replace(/fTILEIMAGE/g, obj.object[listOptions.img])
  tmp = tmp.replace(/fIMAGESTYLE/g, imagestyle)
  tmp = tmp.replace(/fTILETARGET/g, link)
  msg = msg + tmp
  return msg
}

function renderButton(obj, listOptions) {
  var msg = ''
  var imagestyle = ""
  var buttonTemplate = `
  <div class="uxapibuttonitem clickable" onclick="location.href='fTILETARGET'">
      <span class="uxapibutton-inner" />fTILETITLE<span>
  </div>
  `

  var tmp = buttonTemplate;
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
  tmp = tmp.replace(/fTILETITLE/g, obj.object[listOptions.title])
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
  msg = msg  + `<span class="` + `">` + obj.object[listOptions.blurb] + `</span> <br style="clear: both;" /></p>`
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
          sessionStorage.token = text.access_token
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
    return ''
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
            sessionStorage.token = json.access_token
            window.sessionStorage.refresh = json.refresh_token
            window.location.href = window.location.href
          }
        }catch {
          console.log(text)
          var msg = `Something went wrong, please <a href=./login.html>try logging in again</a>`
          return msg
        }
        return;
      },
      error: function(err) {
        var msg = `Something went wrong, please <a href=./login.html>try logging in again</a>`
        return msg
        console.log(err)
        return;
      }
    });
    if (typeof(params.code) != 'undefined' && typeof(response) == 'undefined') { return "I think you have a bad auth code... up there... in the query params..."}
    return response
  }
}

function ckEditor(id) {
    ClassicEditor
      .create( document.querySelector( '#' + id ), {
//        plugin: ['Markdown', 'Base64UploadAdapter'],
//       licenseKey: '',
       config: { height: '800px', fontFamily: 'Arial, Helvetica, sans-serif'},
      } )
      .then( editor => {
        window[id] = editor;
      } )
      .catch( error => {
        console.error( 'Something went wrong with ckeditor' );
    //    console.error( 'Please, report the following error on https://github.com/ckeditor/ckeditor5/issues with the build id and the error stack trace:' );
        console.error( error );
  },
 );

}


function otpLogin(redir) {
  var queryparams = location.search
  queryparams = queryparams.substring(1)
  var tmp = queryparams.split('&')
  qp = {}
  for (var i =0; i < tmp.length; i++) {
    var tmp2 = tmp[i].split('=')
    qp[tmp2[0]] = tmp2[1]
  }
  var token = getTokenFromCode(qp.code)
  console.log(typeof(token))
  if (token == 'undefined') {
    sessionStorage.clear();
    return  `<Br /><h3>Something went wrong</h3><p>Sorry but the code provided did not work. Please return to the <a href="/dashboard">login page</a> and try again</p>`
  }
  else {
    window.location.href = redir
  }
}
function generateCode(div) {
  var token = login(clientID, clientSecret)
  token = window.sessionStorage.token
  sessionStorage.clear();
  console.log(token)
  var payload = {}
  payload.email = document.getElementById("userid").value;
  payload = JSON.stringify(payload)
  var path = uxapihost + '/v1/uxapi/requestotp'
  var response = $.ajax({
    url: path,
    async: false,
    type:'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: payload,
    beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer "+ token);
    },
    success: function(text){
        if(typeof(text.error) != 'undefined') {
          console.log(text.error)
        }
        else {
          var msg = `<h3>Email Sent</h3>`
          msg = msg + '<p>' + text.msg + '</p>'
          document.getElementById(div).innerHTML = msg
        }
    },
    error: function(err) {
        console.log(err)
    }
  });
}

function getTokenFromCode(code) {
  var payload = `grant_type=authorization_code&code=` + code
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
          return "error"
        }
        else {
          text = JSON.parse(text)
          window.sessionStorage.token = text.access_token
          window.sessionStorage.refresh = text.refresh_token
          return text.access_token
        }
    },
    error: function(err) {
        console.log(err)
    }
  });
  return window.sessionStorage.token;
}
