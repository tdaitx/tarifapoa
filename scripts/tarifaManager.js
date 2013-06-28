  $(document).ready(function () {
            if (!$.cookie('ui')) {
                var uiRandom = Math.floor((Math.random() * 1000 * 1000 * 1000 * 1000 * 1000) + 1);;
                $.cookie('ui', uiRandom);
            } 
            ui = $.cookie('ui');

            $('.opcao').button().click(function () {
                tarifaFinalUpdate();
            });
        });

        function tarifaFinalUpdate() {
            var sum = 0;
            var opcoes = [0];
            $('.ui-state-active').each(function () {
                var b = $($(this)[0]);
                sum += Number(b.attr("tarifaReducao"));
                opcoes.push(b.attr("opcao"));
            });
            var tarifaFinal = formatnum(2.85 - sum);
            $("#tarifaFinal").html(tarifaFinal);
            
            var urlParam = generateFacebookShareLink(opcoes);
            $("#linkShare").attr("href", urlParam);

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
