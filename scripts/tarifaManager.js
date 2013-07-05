$(document).ready(function () {
    var manager = new tarifaManager();

    $('input.opcao').button().click(function () {
        var opcoes = manager.getOpcoes();
        manager.updateUI(opcoes);
    });
    $('label.opcao').each(function () {
        var titulo = $(this).attr('title');
        var reducao = $(this).attr('tarifareducao');

        $(this).attr('title', titulo.replace("\{0\}", reducao));
    });
});

function tarifaManager () {
    this.getUserid = function() {
        var USERID = "userId";
        if (!$.cookie(USERID)) {
            var userIdRandom = Math.floor((Math.random() * Math.pow(10, 13) + 1));
            $.cookie(USERID, userIdRandom);
        }
        userId = $.cookie(USERID);
        return userId;
    }
    this.getOpcoes = function () {
        var opcoes = [0];
        var OPCAO = "opcao";
        $('.ui-state-active').each(function (a, el) {
            opcoes.push($(el).attr(OPCAO));
        });
        return opcoes;
    }
    this.calculaTarifa = function(opcoes) {
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

        return;
        //Já vou criar o branch, to limpando outras coisas. Nao deletar! dscain
        $.ajax({
            url: 'http://localhost:17465/api/values/5',
            type: 'PUT',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            data: '=' + encodeURIComponent(opcoes.join(',')),
            success: function (data) {
            },
            error: function (result) {
                if (console) {
                    console.log(result);
                }
            }
        });
    }

    function formatnum(num) {
        var cents = parseInt((num - parseInt(num)) * 100);
        var inteiro = parseInt(num - cents / 100);
        var zero = String(cents).length == 1 ? cents + '0' : cents;

        if (inteiro < 0 || cents < 0) {
            return "0.00";
        }

        return inteiro + '.' + cents;
    }

    var ui, proposta;
    function generateFacebookShareLink(paramProposta, paramUi) {
        var paramPropostab64 = btoa(paramProposta);
        var paramUi = btoa(paramUi);

        var urlBase = "http://matehackers.github.io/tarifa-teste/index.html?";
        var url = urlBase + "p=" + paramPropostab64 + "&u=" + ui;
        var urlUriEncoded = encodeURIComponent(url);
        var finalUrl = "https://www.facebook.com/sharer/sharer.php?u=" + urlUriEncoded;
        console.log(finalUrl + " em " + url);
        return finalUrl;
    }
}
