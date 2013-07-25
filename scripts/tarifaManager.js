$(document).ready(function () {
    var manager = new tarifaManager();
    manager.setupUI('li.proposta');
});

function tarifaManager() {
    var PROPOSTA = "opcao";
    var TARIFAREDUCAO = "tarifaReducao";
    var manager = this;

    this.propostas;

    this.forbidden = [[9, 4]];

    this.setupUI = function (selector) {
        opcoesTotais = $.map($('li.proposta'), function (a) { return ($(a).attr('opcaox')); });
        var opcoesArranged = this.getRandomPermutation(opcoesTotais);
        var cId = this.getUserid();
        stat(cId, "start=" + opcoesArranged.join());
        for (var i = 1; i < opcoesArranged.length + 1; i++) {
            $('#propostasOrdenadas').append($("li[opcaox='" + opcoesArranged[i] + "']"));
        }

        this.propostas = $(selector);
        $('input', selector).removeAttr("checked");
        $('input', selector).button().removeAttr('disabled').click(function (event) {
            var selecionadas = manager.getPropostasSelecionadas();
            var forb = manager.checkForbidden(this);
            manager.updateUI(selecionadas[0], selecionadas[1]);
            stat(cId, selecionadas[0].join(","));
            //$(this).trigger('forbidden', [forb]);
            for (var i = 0; i < forb.length; i++) {
                var unOp = $("li[opcaox='" + forb[i] + "'] input:checked");
                $(unOp).click();
            }
        });
        //    .on('forbidden', function (event, forb) {
        //    for (var i = 0; i < forb.length; i++) {
        //        var unOp = $("li[opcaox='" + forb[i] + "'] input:checked");
        //        $(unOp).click();
        //    }
        //});


        var TITULO = "title";
        $('label', selector).each(function () {
            var tarifaReducao = $(this).attr(TARIFAREDUCAO);
            var dica = $("span span", this);
            dica.text(dica.text().replace("\{0\}", Math.abs(tarifaReducao)));
        });

        var urlParam = Base64.decode(window.location.search.substring(3));
        if (urlParam != "") {
            var optOld = urlParam.split(',');
            this.setPropostasSelecionadas(optOld);
        }

        var selecionadas = manager.getPropostasSelecionadas();
        manager.updateUI(selecionadas[0], selecionadas[1]);
    }

    this.getUserid = function () {
        var USERID = "userId";
        if (!$.cookie(USERID)) {
            var userIdRandom = Math.floor((Math.random() * Math.pow(10, 13) + 1));
            $.cookie(USERID, userIdRandom);
        }
        var cId = $.cookie(USERID);
        if (cId == null) {
            cId = 321;
        }
        return cId;
    }

    this.getRandomPermutation = function (set) {
        var PERMSETUP = "permSetup";
        var perm = [];
        if ($.cookie(PERMSETUP) && ($.cookie(PERMSETUP).length == set.length)) {
            perm = $.cookie(PERMSETUP).split(',');
        }
        if (perm.length == 0) {
            var t = set.length;
            for (var i = 0; i < t; i++) {
                var n1 = set[Math.floor(Math.random() * (set.length))];
                perm.push(n1);
                set.splice(set.indexOf(n1), 1);
            }
            $.cookie(PERMSETUP, perm.join());
        }
        return perm;
    }

    // Retorna um vetor de 2 dimensões. A primeira dimensão é uma de opções 
    //   selecionadas. A segunda dimensão é a soma dos selecionados.
    this.getPropostasSelecionadas = function () {
        var selecionadas = [];
        var propostas = ["0"];
        var soma = 0;
        //pppp = $('.ui-state-active').length;
        $(':checked', this.propostas).next().each(function (a, el) {
            propostas.push(Number($(el).attr(PROPOSTA)));
            soma += Number($(el).attr(TARIFAREDUCAO));
        });

        selecionadas.push(propostas.sort(function (a, b) { return a - b }));
        selecionadas.push(soma);

        return selecionadas;
    }

    this.setPropostasSelecionadas = function (selecionadas) {
        $.each(this.propostas, function (a, el) {
            if ($.inArray($(el).attr("opcaox"), selecionadas) != -1) {
                $('input', el).click();
            }
        });
    }

    this.updateUI = function (opcoes, soma) {
        var tarifa = formatnum(2.80 - soma);
        var manager = this;
        var urlParam = generateFacebookShareLink(opcoes);

	if (typeof history != 'undefined') {
	    history.pushState(null, null, '?f='+ generatePropostaParam(opcoes));
	}

        $("#linkShare").attr("href", urlParam).click(function () {
            stat(manager.getUserid(), "share");
        });
        $("#tarifaFinal").html(tarifa.replace(".", ","));
        var shareMeta = $("#shareTitle");
        shareMeta.attr("content", shareMeta.attr("content").replace("\{0\}", tarifa));

        var cId = this.getUserid();
    }

    this.checkForbidden = function (el) {
        var toExclude = [];
        var option = $(el).next().attr("opcao");
        for (var i = 0; i < manager.forbidden.length; i++) {
            var f = manager.forbidden[i].slice(0);
            var index = $.inArray(Number(option), f);
            if (index == -1)
                continue;
            f.splice(index, 1);
            for (var j = 0; j < f.length; j++) {
                toExclude.push(f[j]);
            }
        }
        return toExclude;
    }

    function formatnum(num) {
        if (num < 0)
            return "0.00";
        else
            return num.toFixed(2).toString();
    }

    function generatePropostaParam(ops) {
	return Base64.encode(ops.join(","));
	// return "http://matehackers.github.io/tarifapoa/?f=" + paramPropostab64;
    }

    function generateFacebookShareLink(ops) {
        var paramPropostab64 = generatePropostaParam(ops);
        var v = 2;

        var urlBase = "http://matehackers.github.io/tarifapoa/m/u/" + paramPropostab64 + ".html?";
        var url = urlBase;
        var urlUriEncoded = encodeURIComponent(url);
        var finalUrl = "https://www.facebook.com/sharer/sharer.php?u=" + urlUriEncoded;
        return finalUrl;
    }

    function stat(cId, ops) {
        var post = $('<img src="http://atlanta.inf.ufrgs.br/tarifa/api/stat/{0}/{1}/" style="width:0px;height:0px:"/>'
            .replace("\{0\}", cId)
            .replace("\{1\}", ops)
            );
    }
}

function cons(msg) {
    if (console) {
        console.log(msg);
    }
}

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    }
    ,

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }
}
var asd123 = 1;
