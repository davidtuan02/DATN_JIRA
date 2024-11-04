var hSession = "";
var cert_rawData;
var cert_SNB;
var sign_Data = "test ky";
var hash_Data = convertBase64ToHexa("McHAx0h6LEJoEVxJMf6JHJVUZ1g=");
var sign_Signature;
var verify_Signature;
var LibList_MACOS = "viettel-ca_v6.dylib;viettel-ca_v5.dylib;viettel-ca_v4.dylib";
var LibList_WIN = "viettel-ca_v6.dll;viettel-ca_v5.dll;viettel-ca_v4.dll;viettel-ca_v2.dll";
var domain = "http://127.0.0.1:14007/";
// Create Base64 Object
var Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
    var t = "";
    var n, r, i, s, o, u, a;
    var f = 0;
    e = Base64._utf8_encode(e);
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      s = n >> 2;
      o = (n & 3) << 4 | r >> 4;
      u = (r & 15) << 2 | i >> 6;
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64
      } else if (isNaN(i)) {
        a = 64
      }
      t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
    }
    return t
  }, decode: function (e) {
    var t = "";
    var n, r, i;
    var s, o, u, a;
    var f = 0;
    e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (f < e.length) {
      s = this._keyStr.indexOf(e.charAt(f++));
      o = this._keyStr.indexOf(e.charAt(f++));
      u = this._keyStr.indexOf(e.charAt(f++));
      a = this._keyStr.indexOf(e.charAt(f++));
      n = s << 2 | o >> 4;
      r = (o & 15) << 4 | u >> 2;
      i = (u & 3) << 6 | a;
      t = t + String.fromCharCode(n);
      if (u != 64) {
        t = t + String.fromCharCode(r)
      }
      if (a != 64) {
        t = t + String.fromCharCode(i)
      }
    }
    t = Base64._utf8_decode(t);
    return t
  }, _utf8_encode: function (e) {
    e = e.replace(/\r\n/g, "\n");
    var t = "";
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r)
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode(r >> 6 | 192);
        t += String.fromCharCode(r & 63 | 128)
      } else {
        t += String.fromCharCode(r >> 12 | 224);
        t += String.fromCharCode(r >> 6 & 63 | 128);
        t += String.fromCharCode(r & 63 | 128)
      }
    }
    return t
  }, _utf8_decode: function (e) {
    var t = "";
    var n = 0;
    var r = c1 = c2 = 0;
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
        n++
      } else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1);
        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
        n += 2
      } else {
        c2 = e.charCodeAt(n + 1);
        c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        n += 3
      }
    }
    return t
  }
}

// var forge = require('node-forge');

function showErrMsg_CMS(code) {
  switch (code) {
    case '100100':
      // alert('Lỗi: Không có chứng thư số.');
      return false;
      break;
    case '100101':
      // alert('Lỗi: Tương tác SignPlugin.');
      return false;
      break;
    case '100102':
    case '100202':
      // alert('Lỗi: Chứng thư số không hợp lệ hoặc không có quyền sử dụng. Vui lòng F5 lại trình duyệt và thử lại');
      return false;
      break;
    case '100103':
    case '100205':
    case '100303':
      // alert('Lỗi: Session không hợp lệ');
      return false;
      break;
    case '100104':
      // alert('Lỗi: Chứng thư số hết hạn');
      return false;
      break;
    case '100200':
      // alert('Lỗi: Dữ liệu không hợp lệ');
      return false;
      break;
    case '100201':
      // alert('Lỗi: Không tìm thấy chứng thư số');
      return false;
      break;
    case '100203':
      // alert('Lỗi: Lỗi trong quá trình ký');
      return false;
      break;
    case '100204':
      // alert('Lỗi: Lỗi bộ nhớ không đủ');
      return false;
      break;
    case '100300':
      // alert('Lỗi: Chữ ký không đúng định dạng');
      return false;
      break;
    case '100301':
      // alert('Lỗi: Phân tích chứng thư số');
      return false;
      break;
    case '100302':
      // alert('Lỗi: Chữ ký không hợp lệ');
      return false;
      break;
    default:
      // alert('Lỗi: ' + code);
      return false;
      break;
  }
}

function showErrMsg_Docs(code) {
  switch (code) {
    case '100101':
    case '100201':
    case '100301':
    case '101002':
    case '101102':
      // alert('Lỗi: Chép file.');
      return false;
      break;
    case '100102':
    case '100202':
    case '100302':
      // alert('Lỗi: Tài liệu bị mã hóa, không thể ký');
      return false;
      break;
    case '100103':
    case '100203':
    case '100303':
    case '100701':
    case '100802':
      // alert('Lỗi: Không tìm thấy chứng thư số để ký');
      return false;
      break;
    case '100104':
    case '100204':
    case '100304':
    case '100803':
      // alert('Lỗi: Chứng thư số bị lỗi, không thể ký');
      return false;
      break;
    case '100105':
    case '100205':
    case '100305':
    case '100804':
      // alert('Lỗi: Chứng thư số không hợp lệ hoặc không có quyền sử dụng. Vui lòng F5 lại trình duyệt và thử lại');
      return false;
      break;
    case '100106':
    case '100206':
    case '100306':
    case '101003':
    case '101103':
      // alert('Lỗi: Đọc file');
      return false;
      break;
    case '100107':
    case '100207':
    case '100307':
    case '100805':
      // alert('Lỗi: Lỗi trong quá trình ký');
      return false;
      break;
    case '100400':
    case '100401':
      // alert('Lỗi: Định dạng file không hỗ trợ');
      return false;
      break;
    case '100402':
      // alert('Lỗi: Tên file quá dài');
      return false;
      break;
    case '100403':
      // alert('Lỗi: Kích thước file quá lớn');
      return false;
      break;
    case '100404':
      // alert('Lỗi: Chưa thiết lập link upload');
      return false;
      break;
    case '100405':
    case '100406':
    case '100407':
    case '100408':
    case '101004':
    case '101104':
      // alert('Lỗi: Lỗi trong quá trình upload file');
      return false;
      break;
    case '100600':
      // alert('Lỗi: Hủy chọn file');
      return false;
      break;
    case '100601':
      // alert('Lỗi: Hủy lưu file');
      return false;
      break;
    case '100500':
    case '101001':
    case '101101':
    case '101301':
      // alert('Lỗi: Input file');
      return false;
      break;
    case '100501':
      // alert('Lỗi: Output file');
      return false;
      break;
    case '100502':
    case '100700':
    case '100800':
    case '101000':
    case '101100':
    case '101200':
    case '101300':
      // alert('Lỗi: Session không hợp lệ');
      return false;
      break;
    case '100801':
      // alert('Lỗi: Dữ liệu XML không đúng định dạng');
      return false;
      break;
    case '100502':
      // alert('Lỗi: Session không hợp lệ');
      return false;
      break;
    case '101201':
      // alert('Lỗi: Định dạng thời gian không đúng');
      return false;
      break;
    default:
      // alert('Lỗi: ' + code);
      return false;
      break;
  }
}

function initPlugin(comp) {
  //=================>>Check OS<<=================
  var OSName = "Unknown";
  if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OSName = "Windows 8";
  if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OSName = "Windows 7";
  if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OSName = "Windows Vista";
  if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OSName = "Windows XP";
  if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OSName = "Windows 2000";
  if (window.navigator.userAgent.indexOf("Mac") != -1) OSName = "Mac/iOS";
  if (window.navigator.userAgent.indexOf("X11") != -1) OSName = "UNIX";
  if (window.navigator.userAgent.indexOf("Linux") != -1) OSName = "Linux";
  //=================>>Check OS<<=================

  var xmlhttp;
  var response = "";
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {// code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      response = xmlhttp.responseText;
      // //alert("res = " + response);

      if (response != "") {
        hSession = response;

        getCertifcate(comp);

        return;
      }
      if (response == "") {
        // alert("Vui lòng Kiểm tra:\n" +
        //   "- Cài đặt Token manager của USB Token, Sign Plugin, cắm USB Token vào máy và bấm F5 để thử lại\n" +
        //   "Nếu chưa được kiểm tra thêm:\n" +
        //   "- Truy cập link http://127.0.0.1:14007/getSession có truy cập được không\n" +
        //   "- Kiểm tra phần mềm Plugin 'signplugin_viettel-ca_v5.exe' có bật không?" +
        //   "- Kiểm tra có nhiều phiên bản Plugin đang bật hay không? Chỉ giữ lại phiên bản mới nhất, phiên bản cũ gỡ ra hoặc không bật?");
        return;
      }
    }
  }
  xmlhttp.onerror = function (e) {
    console.log(e.message);
    // alert("Vui lòng Kiểm tra:\n" +
    //   "- Cài đặt Token manager của USB Token, Sign Plugin, cắm USB Token vào máy và bấm F5 để thử lại\n" +
    //   "Nếu chưa được kiểm tra thêm:\n" +
    //   "- Truy cập link http://127.0.0.1:14007/getSession có truy cập được không\n" +
    //   "- Kiểm tra phần mềm Plugin 'signplugin_viettel-ca_v5.exe' có bật không?" +
    //   "- Kiểm tra có nhiều phiên bản Plugin đang bật hay không? Chỉ giữ lại phiên bản mới nhất, phiên bản cũ gỡ ra hoặc không bật?\n"+
    //   "Error: " + e.message);
    return;
  };
  xmlhttp.open("POST", domain + "getSession", true);
  if (OSName == "Mac/iOS") {
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("liblist=" + LibList_MACOS);
  } else if ((OSName == "UNIX") || (OSName == "Linux")) {
    // alert("Not Support");
  } else {
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("liblist=" + LibList_WIN);
    //xmlhttp.send();
  }
}

function getCertifcate(comp) {
  var ReqCert;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    ReqCert = new XMLHttpRequest();
  } else {// code for IE6, IE5
    ReqCert = new ActiveXObject("Microsoft.XMLHTTP");
  }
  ReqCert.onreadystatechange = function () {
    if (ReqCert.readyState == 4 && ReqCert.status == 200) {
      cert_rawData = ReqCert.responseText;
      // const certDer = forge.util.decode64(cert_rawData);
      // const cert = forge.pki.certificateFromAsn1(forge.asn1.fromDer(certDer));
      // console.log(cert)
      //get info of certificate
      if (cert_rawData == "" || cert_rawData == undefined || cert_rawData == null) {
      } else {
        //get serial number
        var ReqSNB;
        comp.getPublicKeyFromCertificate(cert_rawData).then(publicKey => {
          if (publicKey) {
            console.log(publicKey)
            comp.patchValueToForm("publicKey", btoa(publicKey))
          } else {
          }
        });
        getCertValidDate(comp);
        getCertExpireDate(comp);
        getCertCommonName(comp);
        getCertDN(comp);
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
          ReqSNB = new XMLHttpRequest();
        } else {// code for IE6, IE5
          ReqSNB = new ActiveXObject("Microsoft.XMLHTTP");
        }
        ReqSNB.onreadystatechange = function () {
          if (ReqSNB.readyState == 4 && ReqSNB.status == 200) {
            cert_SNB = ReqSNB.responseText;
            comp.patchValueToForm("serial", cert_SNB)
            // signData();
            signHash();
          }
        }
        ReqSNB.open("POST", domain + "getCertSNB", true);
        ReqSNB.send();
      }
    }
  }
  ReqCert.open("POST", domain + "getCertificate", true);
  ReqCert.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  ReqCert.send("sessionID=" + hSession);


}

function getCertValidDate(comp) {
  var ReqValidDate;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    ReqValidDate = new XMLHttpRequest();
  } else {// code for IE6, IE5
    ReqValidDate = new ActiveXObject("Microsoft.XMLHTTP");
  }
  ReqValidDate.onreadystatechange = function () {
    comp.patchValueToForm("effectiveDate", ReqValidDate.responseText)
  }
  ReqValidDate.open("POST", domain + "getCertValidDate", true);
  ReqValidDate.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  ReqValidDate.send();
}

function getCertExpireDate(comp) {
  var ReqExpireDate;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    ReqExpireDate = new XMLHttpRequest();
  } else {// code for IE6, IE5
    ReqExpireDate = new ActiveXObject("Microsoft.XMLHTTP");
  }
  ReqExpireDate.onreadystatechange = function () {
    comp.patchValueToForm("expiryDate", ReqExpireDate.responseText)
  }
  ReqExpireDate.open("POST", domain + "getCertExpireDate", true);
  ReqExpireDate.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  ReqExpireDate.send();
}

function getCertCommonName(comp) {
  var ReqCommonName;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    ReqCommonName = new XMLHttpRequest();
  } else {// code for IE6, IE5
    ReqCommonName = new ActiveXObject("Microsoft.XMLHTTP");
  }
  ReqCommonName.onreadystatechange = function () {
    console.log(ReqCommonName.responseText)
    let cks = "";
    cks = ReqCommonName.responseText.split("MST")[1].substring(1,15).replace("-", "")
    comp.patchValueToForm("digitalSignature", cks)
  }
  ReqCommonName.open("POST", domain + "getCertDN", true);
  ReqCommonName.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  ReqCommonName.send();
}

function getCertDN(comp) {
  var ReqDN;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    ReqDN = new XMLHttpRequest();
  } else {// code for IE6, IE5
    ReqDN = new ActiveXObject("Microsoft.XMLHTTP");
  }
  ReqDN.onreadystatechange = function () {
    comp.patchValueToForm("provider", ReqDN.responseText)
  }
  ReqDN.open("POST", domain + "getCertIssuer", true);
  ReqDN.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  ReqDN.send();
}

function base64_decode(stringBase64) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  var output = new Array();
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  var orig_input = stringBase64;
  stringBase64 = stringBase64.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  if (orig_input != stringBase64)
    // // alert("Warning! Characters outside Base64 range in input string ignored.");
    if (stringBase64.length % 4) {
      // // alert("Error: Input length is not a multiple of 4 bytes.");
      return "";
    }

  var j = 0;
  while (i < stringBase64.length) {

    enc1 = keyStr.indexOf(stringBase64.charAt(i++));
    enc2 = keyStr.indexOf(stringBase64.charAt(i++));
    enc3 = keyStr.indexOf(stringBase64.charAt(i++));
    enc4 = keyStr.indexOf(stringBase64.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output[j++] = chr1;
    if (enc3 != 64)
      output[j++] = chr2;
    if (enc4 != 64)
      output[j++] = chr3;
  }
  return output;
}

function dec2hex(d) {
  var hD = '0123456789ABCDEF';
  var h = hD.substr(d & 15, 1);
  while (d > 15) {
    d >>= 4;
    h = hD.substr(d & 15, 1) + h;
  }
  return h;
}

function convertBase64ToHexa(stringBase64) {
  var output = this.base64_decode(stringBase64);
  var separator = "";
  var hexText = "";
  for (i = 0; i < output.length; i++) {
    hexText = hexText + separator + (output[i] < 16 ? "0" : "") + this.dec2hex(output[i]);
  }
  return hexText;
}

function signHash() {
  var xmlhttp;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {// code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      sign_Signature = xmlhttp.responseText;
      if (sign_Signature == "" || sign_Signature == undefined || sign_Signature == null) {
        //get infomation error
        var ReqLastErr;
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
          ReqLastErr = new XMLHttpRequest();
        } else {// code for IE6, IE5
          ReqLastErr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        ReqLastErr.onreadystatechange = function () {
          if (ReqLastErr.readyState == 4 && ReqLastErr.status == 200) {
            // //alert("Error code = " +ReqLastErr.responseText);
            showErrMsg_CMS(ReqLastErr.responseText);
          }
        }
        ReqLastErr.open("POST", domain + "getLastErr", true);
        ReqLastErr.send();
      } else {
        // // alert("Test Plugin ký thành công");
      }
    }
  }
  xmlhttp.open("POST", domain + "signHash", true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send("sessionID=" + hSession + "&HashVal=" + hash_Data + "&HashOpt=0");
}

function signData() {

  var text = sign_Data;
  text = Base64.encode(text);

  var xmlhttp;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {// code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      sign_Signature = xmlhttp.responseText;
      if (sign_Signature == "" || sign_Signature == undefined || sign_Signature == null) {
        //get infomation error
        var ReqLastErr;
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
          ReqLastErr = new XMLHttpRequest();
        } else {// code for IE6, IE5
          ReqLastErr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        ReqLastErr.onreadystatechange = function () {
          if (ReqLastErr.readyState == 4 && ReqLastErr.status == 200) {
            // //alert("Error code = " +ReqLastErr.responseText);
            showErrMsg_CMS(ReqLastErr.responseText);
          }
        }
        ReqLastErr.open("POST", domain + "getLastErr", true);
        ReqLastErr.send();
      } else {
        verifySignature();
      }
    }
  }
  xmlhttp.open("POST", domain + "Sign", true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send("sessionID=" + hSession + "&inData=" + text);
}

function verifySignature() {
  var msg = sign_Data;
  var signature = sign_Signature;
  if (signature == "") {
    // // alert("Vui long nhap chu ky");
    return;
  }
  msg = Base64.encode(msg);
  var xmlhttp;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {// code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      verify_Signature = xmlhttp.responseText;
      if (verify_Signature == "" || verify_Signature == undefined || verify_Signature == null) {
        //get infomation error
        var ReqLastErr;
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
          ReqLastErr = new XMLHttpRequest();
        } else {// code for IE6, IE5
          ReqLastErr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        ReqLastErr.onreadystatechange = function () {
          if (ReqLastErr.readyState == 4 && ReqLastErr.status == 200) {
            // //alert("Error code = " +ReqLastErr.responseText);
            showErrMsg_CMS(ReqLastErr.responseText);
          }
        }
        ReqLastErr.open("POST", domain + "getLastErr", true);
        ReqLastErr.send();
      } else {

        // // alert("Test Plugin ký thành công");
      }
      ;
    }
  }
  xmlhttp.open("POST", domain + "Verify", true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send("sessionID=" + hSession + "&signature=" + signature + "&inData=" + msg);
}
