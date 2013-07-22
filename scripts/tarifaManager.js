$(document).ready(function () {
    var manager = new tarifaManager();
    manager.setupUI('li.proposta');
});

function tarifaManager() {
    var PROPOSTA = "opcao";
    var TARIFAREDUCAO = "tarifaReducao";

    this.propostas;

    this.setupUI = function (selector) {
        var manager = this;
        this.propostas = $(selector);
        $('input', selector).button().click(function () {
            var selecionadas = manager.getPropostasSelecionadas();
            manager.updateUI(selecionadas[0], selecionadas[1]);
        });

        var TITULO = "title";
        $('label', selector).each(function () {
            var tarifaReducao = $(this).attr(TARIFAREDUCAO);
            var dica = $("span span", this);
            dica.text(dica.text().replace("\{0\}", Math.abs(tarifaReducao)));
        });
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

    // Retorna um vetor de 2 dimensões. A primeira dimensão é uma de opções 
    //   selecionadas. A segunda dimensão é a soma dos selecionados.
    this.getPropostasSelecionadas = function () {
        var selecionadas = [];
        var propostas = [];
        var soma = 0;
        
        $('.ui-state-active', this.propostas).each(function (a, el) {
            propostas.push($(el).attr(PROPOSTA));
            soma += Number( $(el).attr(TARIFAREDUCAO) );
        });

        selecionadas.push(propostas);
        selecionadas.push(soma);

        return selecionadas;
    }

    this.updateUI = function (opcoes, soma) {
        var tarifa = formatnum(2.85 - soma);

        var urlParam = generateFacebookShareLink(opcoes);
        $("#linkShare").attr("href", urlParam);
        $("#tarifaFinal").html(tarifa);
        var shareMeta = $("#shareTitle");
        shareMeta.attr("content", shareMeta.attr("content").replace("\{0\}", tarifa));

        var cId = this.getUserid();
        stat(cId, opcoes.join(","));
    }

    function formatnum(num) {
        if (num<0)
            return "0.00";
        else
            return num.toFixed(2).toString();
    }

    function generateFacebookShareLink(ops) {
        var paramPropostab64 = btoa(ops.join(","));

        var urlBase = "http://matehackers.github.io/tarifa-teste/index.html?";
        var url = urlBase + "p=" + paramPropostab64;
        var urlUriEncoded = encodeURIComponent(url);
        var finalUrl = "https://www.facebook.com/sharer/sharer.php?u=" + urlUriEncoded;
        cons(finalUrl + " em " + url);
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