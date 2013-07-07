$(document).ready(function () {
    var manager = new tarifaManager();
    manager.setupUI('li.proposta');
});

function tarifaManager() {
    this.propostas;
    this.setupUI = function (selector) {
        var manager = this;
        this.propostas = $(selector);
        $('input', selector).button().click(function () {
            var propostasSelecionadas = manager.getPropostasSelecionadas();
            manager.updateUI(propostasSelecionadas);
        });

        var TITULO = "title", TARIFA_REDUCAO = "tarifareducao";
        $('label', selector).each(function () {
            var titulo = $(this).attr(TITULO);
            var tarifaReducao = $(this).attr(TARIFA_REDUCAO);

            var dica = $("span span", this).text();

            $(this).attr(TITULO, titulo.replace("\{0\}", tarifaReducao));
            $("span span", this).text(dica.replace("\{0\}", tarifaReducao));
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
    this.getPropostasSelecionadas = function () {
        var propostasSelecionadas = [];
        var PROPOSTA = "opcao";
        $('.ui-state-active', this.propostas).each(function (a, el) {
            propostasSelecionadas.push($(el).attr(PROPOSTA));
        });
        return propostasSelecionadas;
    }
    this.calculaTarifa = function (opcoes) {
        var sum = 0;
        var TARIFAREDUCAO = "tarifaReducao";
        $('.ui-state-active').each(function (a, el) {
            sum += Number($(el).attr(TARIFAREDUCAO));
        });
        var tarifa = formatnum(2.85 - sum);
        return tarifa;
    }

    this.updateUI = function (opcoes) {
        var tarifa = this.calculaTarifa(opcoes);

        var urlParam = generateFacebookShareLink(opcoes);
        $("#linkShare").attr("href", urlParam);
        $("#tarifaFinal").html(tarifa);

        var cId = this.getUserid();
        stat(cId, opcoes.join(","));
    }

    function formatnum(num) {
        var cents = parseInt((num - parseInt(num)) * 100);
        var inteiro = parseInt(num - cents / 100);
        var zero = String(cents).length == 1 ? cents + '0' : cents;

        if (inteiro < 0 || cents < 0) {
            return "0,00";
        }

        return inteiro + ',' + cents;
    }

    function generateFacebookShareLink(ops) {
        var paramPropostab64 = btoa(ops.join(","));

        var urlBase = "http://matehackers.github.io/tarifa-teste/index.html?";
        var url = urlBase + "p=" + paramPropostab64;
        var urlUriEncoded = encodeURIComponent(url);
        var finalUrl = "https://www.facebook.com/sharer/sharer.php?u=" + urlUriEncoded;
        console.log(finalUrl + " em " + url);
        return finalUrl;
    }

    function stat(cId, ops) {
        var post = $('<img src="http://atlanta.inf.ufrgs.br/tarifa/api/stat/{0}/{1}/" style="width:0px;height:0px:"/>'
            .replace("\{0\}", cId)
            .replace("\{1\}", ops)
            );

    }
}
