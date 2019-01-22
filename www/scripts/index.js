// and then run "window.location.reload()" in the JavaScript Console.

var pictureSource; // picture source
var destinationType; // sets the format of returned value

//link de homologacao http://apl04.pmcg.ms.gov.br/stagesweb/stagesapi/
//link de homologacao 2 http://172.17.0.53:/gesol/api/
//link de producao http://fala.campogrande.ms.gov.br/gesol/api/
//var urlApi = "http://172.17.0.53:8060/gesol/api/";
//var urlApi = "http://10.4.1.83:8080/gesol/api/";

var urlProducao = "http://fala.campogrande.ms.gov.br/gesol/api/";
var urlHomologacao = "http://172.17.0.53:8060/gesol/api/";
var urlApi = (localStorage.getItem('urlAmbiente') != null && localStorage.getItem('urlAmbiente') != "") ? localStorage.getItem('urlAmbiente') : urlProducao;

var countReq=1;
var returnPage = true;
var codden=0;
var nameArq;

(function () {
    "use strict";
    
  
    document.addEventListener('deviceready', onDeviceReady.bind(this), false);
    
    document.addEventListener('init', function (event) {
        var page = event.target;

        if (page.id == "tela-inicial") {
            var db = openDatabase('dbgesol', '1.0', 'DBGESOL', 5 * 1024 * 1024);
            db.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS usuario (usuarioid INTEGER PRIMARY KEY ASC, usuarioidgesol INT NOT NULL, nome TEXT NOT NULL, auxiliar1 TEXT, auxiliar2 TEXT, auxiliar3 TEXT, auxiliar4 TEXT, auxiliar5 TEXT, auxiliarinteiro1 INT, auxiliarinteiro2 INT, auxiliarinteiro3 INT, auxiliarinteiro4 INT, auxiliarinteiro5 INT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS notificacao (notificacaoid INTEGER PRIMARY KEY ASC, notificacaoidgesol INT NOT NULL, tipo TEXT, titulo TEXT, mensagem TEXT, lido TEXT, datasincronizacao DATETIME, auxiliar1 TEXT, auxiliar2 TEXT, auxiliar3 TEXT, auxiliar4 TEXT, auxiliar5 TEXT, auxiliarinteiro1 INT, auxiliarinteiro2 INT, auxiliarinteiro3 INT, auxiliarinteiro4 INT, auxiliarinteiro5 INT)');

                tx.executeSql("SELECT COUNT(*) as qtde, usuarioidgesol, nome FROM usuario", [], function (tx, results) {
                    var qtde = results.rows.item(0).qtde;
                    if (qtde == 1) {
                       
                        sessionStorage.setItem('usuarioid', results.rows.item(0).usuarioidgesol);
                        sessionStorage.setItem('nome', results.rows.item(0).nome);
                        sessionStorage.setItem('auxiliar1', results.rows.item(0).datanascimento);
                        
                        document.querySelector('#myNavigator').resetToPage("home.html");
                        var menu = document.getElementById('menu');
                        menu.setAttribute("swipeable", true);
                        consultarNotificacoesWebService();
                        btnProconVisible();
                    }
                });
                //Testa se a coluna datasincronizacao existe no banco do usuario, caso negativo adiciona a coluna.
                tx.executeSql("SELECT datasincronizacao FROM notificacao", [], function (tx, results) {
                }, function (tx, results) {
                    tx.executeSql("ALTER TABLE notificacao ADD datasincronizacao DATETIME");
                });
               
            });
        }

        if (page.id == "minhas-solicitacoes-2") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            consultarSolicitacoes();
        }

        if (page.id == "minhas-notificacoes") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            consultarNotificacoes();
        }

        if (page.id == "termo-uso") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
        }

        if (page.id == "sobre") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
        }

        if (page.id === 'home') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            
            page.querySelector('#btnEducacao').onclick = function () {
                document.querySelector('#myNavigator').resetToPage('educacao.html');
            };
            page.querySelector('#btnObraServico').onclick = function () {
                document.querySelector('#myNavigator').resetToPage('obras-servicos.html');
            };
            page.querySelector('#btnDefesaSocial').onclick = function () {
                document.querySelector('#myNavigator').resetToPage('defesa-social.html');
            };
            page.querySelector('#btnSaude').onclick = function () {
                document.querySelector('#myNavigator').resetToPage('saude.html');
            };
            page.querySelector('#btnTransporteColetivo').onclick = function () {
                document.querySelector('#myNavigator').resetToPage('transporte-coletivo.html');
            };
            page.querySelector('#btnOuvidoria').onclick = function () {
                document.querySelector('#myNavigator').resetToPage('ouvidoria.html');
            };
            page.querySelector('#btnProcon').onclick = function () {
                document.querySelector('#myNavigator').resetToPage('procon.html');
            };
            showButtons();
        }

        if (page.id === 'nova-solicitacao') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            //page.querySelector('ons-toolbar .left').innerHTML = page.data.title; 
            var titulo = page.data.title.split("|");
            var html = '<p style="margin: 0;">' + titulo[0] + '</p>' +
                    '<p style="margin: 0; font-size: 15px;">' + titulo[1] + '</p>';

            page.querySelector('ons-toolbar .left').innerHTML = html;

            jQuery("#idservico").val(page.data.servicoid);
            jQuery("#tiposervico").val(page.data.tpservico);
            if (page.data.removerservico) {
                jQuery("#itemServico").remove();
            }
            if (page.data.removerelogio) {
                jQuery("#itemElogio").remove();
            }
            if (page.data.removerdenuncia) {
                jQuery("#itemDenuncia").remove();
            }
            if (page.data.removerreclamacao) {
                jQuery("#itemReclamacao").remove();
            }

            jQuery("input:radio[name=tipo-solicitacao]").change(function () {
                var valor = this.value;
                if (valor == "S") {
                    jQuery("#divFoto").show();
                }
                else {
                    jQuery("#imagem").hide().removeAttr("src");
                    jQuery("#btnNovaFoto").show();
                    jQuery("#divFoto").hide();
                }
            });
        }

        if (page.id === 'obrigado') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
        }

        if (page.id === 'procon') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
        }
        
        if (page.id === 'contato-procon') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            jQuery.ajax({
                url: urlApi + 'enderecoprocon/procon',
                type: 'GET',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function(results) {
                     montarHtmlEnderecoProcon(results);
                },
                error: function(results) {
                    var temp = results;
                }
            });
            jQuery.ajax({
                url: urlApi + 'contatoprocon',
                type: 'GET',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function(results) {
                     montarHtmlContatoProcon(results);
                },
                error: function(results) {
                    var temp = results;
                }
            });
        }
        
        if (page.id === 'informacoes-consumidor-procon') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            modal.show();
            verificarSeOUsuarioJaEstaInscrito(); 
        }
        if (page.id == "solicitacoes-procon") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            consultarSolicitacoesProcon();
        }
        
        if (page.id == "termo-denuncia") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            getTermoDenuncia();
        }
         if (page.id == "termo-orientacao") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            getTermoOrientacao();
        }    
        if (page.id == "termo-informacao") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            getTermoInformacao();
        } 
        if (page.id == "perfil") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            if (!verificarConexao()) {
                ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
                fn.load("home.html");
            }

            modal.show();
            var usuarioid = sessionStorage.getItem('usuarioid');
            jQuery.ajax({
                url: urlApi + 'usuariosol/' + usuarioid,
                type: 'GET',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function (res) {
                    var nome = capitalizarTexto(res.nomuso);
                    jQuery("#nomeOla").html(nome.split(" ")[0]);
                    jQuery("#nomePerfil").html(nome);
                    jQuery("#emailPerfil").html(res.emauso);
                    jQuery("#cpfPerfil").html(res.cpfuso);

                    modal.hide();
                },
                error: function (res) {
                    modal.hide();
                    
                    ons.notification.alert({ message: "Ocorreu um erro, tente novamente mais tarde", title: "Atenção!" });
                    fn.load("home.html");
                }
            });
        }

        if (page.id == 'login') {
            jQuery("#cpf").find("input").mask("999.999.999-99", { clearIfNotMatch: true });

            var senha = jQuery('#senha');
            var olho = jQuery("#olho");
            olho.click(function () {
                var classe = olho.attr("class");
                if (classe == "fa fa-eye fa-2") {
                    olho.attr("class", "fa fa-eye-slash fa-2");
                    senha.attr("type", "text");
                }
                else {
                    olho.attr("class", "fa fa-eye fa-2");
                    senha.attr("type", "password");
                }
            });
        }

        if (page.id == 'cadastrar-usuario') {
            jQuery("#cpf").find("input").mask("000.000.000-00", { clearIfNotMatch: true });
            jQuery("#cep").find("input").mask("00.000-000", { clearIfNotMatch: true });
            //jQuery("#telefone").find("input").mask("(00) 0000-0000", { clearIfNotMatch: true });
            
            jQuery("#datanascimento").find("input").scroller({ preset: 'date', theme: "android-ics", mode: "scroller", display: "modal", lang: "pt-BR" });
            //Quando seleciona uma data, força a label para cima
            jQuery("#datanascimento").find("input").change(function () { jQuery("#datanascimento").find("span").first().addClass("text-input--material__label--active"); });

            var SPMaskBehavior = function (val) {
                return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
            },
            spOptions = {
                onKeyPress: function (val, e, field, options) {
                    field.mask(SPMaskBehavior.apply({}, arguments), options);
                },
                clearIfNotMatch: true
            };
            jQuery('#celular').find("input").mask(SPMaskBehavior, spOptions);

            var senha = jQuery('#senha');
            var olho = jQuery("#olho");
            olho.click(function () {
                var classe = olho.attr("class");
                if (classe == "fa fa-eye fa-2") {
                    olho.attr("class", "fa fa-eye-slash fa-2");
                    senha.attr("type", "text");
                }
                else {
                    olho.attr("class", "fa fa-eye fa-2");
                    senha.attr("type", "password");
                }
            });
        }

        if (page.id == 'esqueci-minha-senha') {
            jQuery("#cpf").find("input").mask("000.000.000-00", { clearIfNotMatch: true });
            jQuery("#datanascimento").find("input").scroller({ preset: 'date', theme: "android-ics", mode: "scroller", display: "modal", lang: "pt-BR" });
            //Quando seleciona uma data, força a label para cima
            jQuery("#datanascimento").find("input").change(function () { jQuery("#datanascimento").find("span").first().addClass("text-input--material__label--active"); });
        }

        if (page.id == 'alterar-senha') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            var senhaAtual = jQuery('#senhaatual');
            var olhoAtual = jQuery("#olhoAtual");
            olhoAtual.click(function () {
                var classe = olhoAtual.attr("class");
                if (classe == "fa fa-eye fa-2") {
                    olhoAtual.attr("class", "fa fa-eye-slash fa-2");
                    senhaAtual.attr("type", "text");
                }
                else {
                    olhoAtual.attr("class", "fa fa-eye fa-2");
                    senhaAtual.attr("type", "password");
                }
            });

            var senhaNova = jQuery('#novasenha');
            var olhoNova = jQuery("#olhoNova");
            olhoNova.click(function () {
                var classe = olhoNova.attr("class");
                if (classe == "fa fa-eye fa-2") {
                    olhoNova.attr("class", "fa fa-eye-slash fa-2");
                    senhaNova.attr("type", "text");
                }
                else {
                    olhoNova.attr("class", "fa fa-eye fa-2");
                    senhaNova.attr("type", "password");
                }
            });

            var senhaNovaConf = jQuery('#confnovasenha');
            var olhoNovaConf = jQuery("#olhoNovaConf");
            olhoNovaConf.click(function () {
                var classe = olhoNovaConf.attr("class");
                if (classe == "fa fa-eye fa-2") {
                    olhoNovaConf.attr("class", "fa fa-eye-slash fa-2");
                    senhaNovaConf.attr("type", "text");
                }
                else {
                    olhoNovaConf.attr("class", "fa fa-eye fa-2");
                    senhaNovaConf.attr("type", "password");
                }
            });
        }

        if (page.id == 'ouvidoria') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            if (!verificarConexao()) {
                return;
            }

            modal.show();
            jQuery.ajax({
                url: urlApi + 'configapk',
                type: 'GET',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function (res) {
                    modal.hide();
                    res.sort(function (a, b) {
                        var aName = a.desorgcon.toLowerCase();
                        var bName = b.desorgcon.toLowerCase();
                        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
                    });
                    var html = "";
                    for (var i = 0; i < res.length; i++) {
                        if (res[i].codorgcon == 4) {//Ouvidoria Geral
                            jQuery("#sNomeOuvidoria").html(capitalizarTexto(res[i].desorgcon));
                            jQuery("#ramallOuvidoriaGeral").html(res[i].codsercon);
                            jQuery("#htelOuvidoriaGeral").html(formatarTelefoneFixo(res[i].telorgcon));
                            jQuery("#sEmailOuvidoriaGeral").html(res[i].emaorgcon);
                        }
                        else {
                            html += "<ons-list modifier='gesol'>" +
	                                "<ons-list-header><small>" + res[i].desorgcon + "</small></ons-list-header>" +
	                                "<ons-list-item modifier='nodivider ouvidoria' style='padding-bottom:0; font-size: 90%;'><i class='fa fa-phone'></i>&nbsp;<small>" + formatarTelefoneFixo(res[i].telorgcon) + "</small></ons-list-item>" +
	                                "<ons-list-item modifier='nodivider' style='padding-top:0; font-size: 90%;'><i class='fa fa-envelope'></i>&nbsp;<small>" + res[i].emaorgcon + "</small></ons-list-item>" +
                                "</ons-list><br/>";
                        }
                    }
                    jQuery("#hOutrosTelefones").html("Outros telefones");
                    jQuery("#divOutrosTelefones").html(html);
                },
                error: function (res) {
                    modal.hide();
                }
            });
        }

        if (page.id == 'educacao') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            modal.show();
            setTimeout(function () { ObterServicos("Educação", "SEMED", "divTipoEducacao"); }, 1000);
        }

        if (page.id == 'obras-servicos') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            modal.show();
            setTimeout(function () { ObterServicos("Obras e Serviços", "SISEP", "divTipoObrasServicos"); }, 1000);
        }

        if (page.id == 'defesa-social') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            modal.show();
            setTimeout(function () { ObterServicos("Defesa Social", "SESDE", "divTipoDefesaSocial"); }, 1000);
        }

        if (page.id == 'saude') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            modal.show();
            setTimeout(function () { ObterServicos("Saúde", "SESAU", "divTipoSaude"); }, 1000);
        }

        if (page.id == 'transporte-coletivo') {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            modal.show();
            setTimeout(function () { ObterServicos("Transporte Coletivo", "AGETRAN", "divTipoTransporte"); }, 1000);
        }
        
        if (page.id == "orientacoes-procon") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            getTermoInformacao();
        } 
        if (page.id == "denuncias-procon") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
            getTermoInformacao();
        }
        if (page.id == "details") {
            jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text((sessionStorage.getItem('quantidadenotificacoesnovas') != null && sessionStorage.getItem('quantidadenotificacoesnovas') != "") ? sessionStorage.getItem('quantidadenotificacoesnovas') : "0");
           
        } 
    });

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        document.addEventListener("backbutton", onBackKeyDown, false);

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
       
        window.fn = {};
        window.modal = null;
        window.modal = document.querySelector('ons-modal');
        window.modalRamoAtividade = document.getElementById("ramoAtividade");
        window.fn.open = function () {
            var menu = document.getElementById('menu');
            menu.open();
        };

        window.fn.load = function (page) {
            var menu = document.getElementById('menu');
            var navi = document.getElementById('myNavigator');

            menu.close();
            navi.resetToPage(page, { animation: 'fade' });
        };

        window.fn.push = function (page) {
            var menu = document.getElementById('menu');
            var navi = document.getElementById('myNavigator');

            menu.close();
            navi.pushPage(page, { animation: 'fade' });
        };

        window.fn.novaSolicitacao = function (titulo, idservico, tiposervico, comServico, comElogio, comDenuncia, comReclamacao) {
            var menu = document.getElementById('menu');
            var navi = document.getElementById('myNavigator');

            menu.close();
            navi.pushPage("nova-solicitacao.html", { animation: 'fade', data: { title: titulo, servicoid: idservico, tpservico: tiposervico, removerservico: (comServico == null), removerelogio: (comElogio == null), removerdenuncia: (comDenuncia == null), removerreclamacao: (comReclamacao == null) } });
        };
         
        //ons.ready(function () {
        //    var pageHome = document.getElementById("home");
        //    pageHome.onDeviceBackButton.disable();
        //    var pageSolicitacoes = document.getElementById("minhas-solicitacoes");
        //    pageSolicitacoes.onDeviceBackButton.disable();
        //    var pageSobre = document.getElementById("sobre");
        //    pageSobre.onDeviceBackButton.disable();
        //});

        ons.setDefaultDeviceBackButtonListener(function () {
            btnProconVisible();
            var myNav = document.querySelector('#myNavigator');
            if (myNav.topPage.pushedOptions.page === "tela-inicial.html") {
                navigator.app.exitApp();
            }
            else if (myNav.topPage.pushedOptions.page === "logout.html") {
                navigator.app.exitApp();
            }
            else if (myNav.topPage.pushedOptions.page === "esqueci-minha-senha.html") {
                document.querySelector('#myNavigator').resetToPage("tela-inicial.html");
            }
            else if (myNav.topPage.pushedOptions.page === "login.html") {
                document.querySelector('#myNavigator').resetToPage("tela-inicial.html");
            }
            else if (myNav.topPage.pushedOptions.page === "cadastrar-usuario.html") {
                document.querySelector('#myNavigator').resetToPage("tela-inicial.html");
            }
            else if (myNav.topPage.pushedOptions.page === "home.html") {
                navigator.app.exitApp();
            }
            else if (myNav.topPage.pushedOptions.page === "denuncias-procon.html"
            || myNav.topPage.pushedOptions.page === "orientacoes-procon.html"
            || myNav.topPage.pushedOptions.page === "informacoes-consumidor-procon.html"
            || myNav.topPage.pushedOptions.page === "contato-procon.html"
            || myNav.topPage.pushedOptions.page === "termo-denuncia.html"
            || myNav.topPage.pushedOptions.page === "termo-orientacao.html"
            || myNav.topPage.pushedOptions.page === "termo-informacao.html") {
               if(returnPage==true)
                  document.querySelector('#myNavigator').resetToPage("procon.html");
            }
            else {
                document.querySelector('#myNavigator').resetToPage("home.html");
            }

            
            //if (fecharApp());
        });


       function onBackKeyDown(event) {
          event.preventDefault();
          if($("#ramoAtividade").is(':visible')) {
              returnPage =false;
              modalRamoAtividade.hide();
          }else{
            returnPage=true;
          }
      }

         
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();

function onPhotoDataSuccess(imageURI) {
    document.getElementById("btnNovaFoto").style.display = "none";

    var cameraImage = document.getElementById("imagem");

    //Quando executado localmente a imagem fica em formato "blob:http://...", dessa forma para funcionar deve ser alterado na tag <meta> de "img-src * data:" para "img-src * blob:"   
    cameraImage.src = "data:image/png;base64," + imageURI;
    cameraImage.style.display = "block";

    capturarPontoAposFoto();
}

function onPhotoURISuccess(imageURI) {
    var nomeCampo = "divImagem" + jQuery("#divSelecionadaFoto").val();
    var galleryImage = document.getElementById(nomeCampo);

    //Quando executado localmente a imagem fica em formato "blob:http://...", dessa forma para funcionar deve ser alterado na tag <meta> de "img-src * data:" para "img-src * blob:"
    galleryImage.src = imageURI;
}

//Para pegar foto da camera

function capturePhoto() {
    // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 60,
        targetWidth: 600,
        targetHeight: 600,
        destinationType: destinationType.DATA_URL,
        //allowEdit: true,
        saveToPhotoAlbum: false
    });
}

//Para pegar foto da galeria
function getPhoto(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 60,
        targetWidth: 600,
        targetHeight: 600,
        destinationType: destinationType.DATA_URL,
        sourceType: source
    });
}

function onFail(message) {
    //alert('Failed because: ' + message);
}

function clickDivImagem(op) {
    jQuery('#divSelecionadaFoto').val(op);
    //showDialog('dialog-origem-foto');
    capturePhoto();
}

var showDialog = function (id) {
    document
      .getElementById(id)
      .show();
};

var hideDialog = function (id) {
    document
      .getElementById(id)
      .hide();
};

function getLocalizacao() {
    navigator.geolocation.getCurrentPosition(onLocalizacaoSuccess, onLocalizacaoError, { enableHighAccuracy: true, timeout: 10000 });
}

function onLocalizacaoSuccess(position) {
    console.log({ lat: position.coords.latitude, long: position.coords.longitude });
}

function onLocalizacaoError(error) {
    alert("Capturando coordenadas, reenvie sua Solicitação.");
}

function obterEndereco(latitude, longitude) {
    //var spanEndereco = document.getElementById('spanEndereco');
    //spanEndereco.innerText = "Lat: " + latitude + "    Lng: " + longitude;
    latitude = "-20.491429";
    longitude = "-54.628017";
    var queryString = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=true';

    jQuery.getJSON(queryString, function (data) {
        if (data.status == "OK") {
            var spanEndereco = document.getElementById('spanEndereco');
            spanEndereco.innerText = data.results[0].formatted_address;
            //console.log(data.results[0].address_components[0].long_name); //Número
            //console.log(data.results[0].address_components[1].long_name); //Rua
            //console.log(data.results[0].address_components[2].long_name); //Bairro
            //console.log(data.results[0].address_components[3].long_name); //Cidade
        }
    }).fail(function (error) {

    });
}

function noLocalChange(campo) {
    if (campo.checked) {
        jQuery("#divEndereco").hide(200);
    }
    else {
        jQuery("#divEndereco").show(200);
        jQuery("#cep").find("input").mask("99.999-99");
    }
};

function fecharApp() {
    navigator.notification.confirm("Deseja realmente fechar o aplicativo?",
              function (index) {
                  if (index === 1) {
                      navigator.app.exitApp();
                  }
              }, "Fechar aplicativo", ["Sim", "Não"]
            );
}



function cadastrarusuario() {
    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return;
    }

    var nome = document.getElementById("nome").value;
    var datanascimento = document.getElementById("datanascimento").value;
    var cpf = document.getElementById("cpf").value;
    //var telefone = document.getElementById("telefone").value;
    var celular = document.getElementById("celular").value;
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;

    var logradouro = document.getElementById("logradouro").value;
    var numero = document.getElementById("numero").value;
    var bairro = document.getElementById("bairro").value;
    var cep = document.getElementById("cep").value;

    if (nome == "" || nome == null) {
        ons.notification.alert({ message: "Informe o Nome", title: "Atenção!" });
        return;
    }
    if (datanascimento == "" || datanascimento == null) {
        ons.notification.alert({ message: "Informe a Data de Nascimento", title: "Atenção!" });
        return;
    }
    else {
        if (!validarData(datanascimento)) {
            ons.notification.alert({ message: "O valor informado no campo Data de Nascimento é inválido", title: "Atenção!" });
            return;
        }
    }

    if (cpf == "" || cpf == null) {
        ons.notification.alert({ message: "Informe o CPF", title: "Atenção!" });
        return;
    }
    else {
        var cpfSemMascara = cpf.replace(/[^\d]+/g, '');
        if (cpfSemMascara.length < 11) {
            ons.notification.alert({ message: "Preencha o campo CPF corretamente.", title: "Atenção!" });
            return;
        }
    }

    
    if (celular == "" || celular == null) {
        ons.notification.alert({ message: "Informe o Celular", title: "Atenção!" });
        return;
    }
    else {
        celular = celular.replace(/[^\d]+/g, '');
        if (celular.length < 10) {
            ons.notification.alert({ message: "Preencha o campo celular corretamente.", title: "Atenção!" });
            return;
        }
    }

    if (email == "" || email == null) {
        ons.notification.alert({ message: "Informe o e-mail", title: "Atenção!" });
        return;
    }
    if (senha == "" || senha == null) {
        ons.notification.alert({ message: "Informe a senha", title: "Atenção!" });
        return;
    }
    if (logradouro == "" || logradouro == null) {
        ons.notification.alert({ message: "Informe o logradouro", title: "Atenção!" });
        return;
    }
    if (numero == "" || numero == null) {
        ons.notification.alert({ message: "Informe o número", title: "Atenção!" });
        return;
    }
    if (bairro == "" || bairro == null) {
        ons.notification.alert({ message: "Informe o bairro", title: "Atenção!" });
        return;
    }
    if (cep == "" || cep == null) {
        ons.notification.alert({ message: "Informe o CEP", title: "Atenção!" });
        return;
    }

    modal.show();

    var obj = {
        "celuso": celular,
        "codtpu": "4", //Tipo do usuário -> Munícipe
        "cpfuso": cpf,
        "emauso": email,
        "nasuso": datanascimento + " 00:00:00",
        "nomuso": nome,
        "teluso": "", //telefone,
        "tpeuso": "F", //Tipo da pessoa -> Física
        "usuuso": cpf,
        "senuso": senha,
        "loguso": logradouro,
        "numuso": numero,
        "baiuso": bairro,
        "cepuso": cep
    };

    jQuery.ajax({
        url: urlApi + 'usuariosol/incluir',
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            modal.hide();
            var db = openDatabase('dbgesol', '1.0', 'DBGESOL', 5 * 1024 * 1024);
            db.transaction(function (tx) {
                tx.executeSql("INSERT INTO usuario (usuarioidgesol, nome) VALUES (?, ?)", [res.codigo, nome], function (tx, results) {
                    sessionStorage.setItem('usuarioid', res.codigo);
                    sessionStorage.setItem('nome', nome);
                    document.querySelector('#myNavigator').resetToPage("home.html");
                    var menu = document.getElementById('menu');
                    menu.setAttribute("swipeable", true);
                    consultarNotificacoesWebService();
                    btnProconVisible();
                });
            });
        },
        error: function (res) {
            modal.hide();
            ons.notification.alert({ message: "Ocorreu um erro, tente novamente mais tarde", title: "Atenção!" });
        }
    });
}

function logar() {

    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return;
    }

    var usuario = document.getElementById("cpf").value;
    var senha = document.getElementById("senha").value;
    
    if (usuario == "" || usuario == null) {
        ons.notification.alert({ message: "Informe o CPF", title: "Atenção!" });
        return;
    }
    else {
        var cpfSemMascara = usuario.replace(/[^\d]+/g, '');
        if (cpfSemMascara.length < 11) {
            ons.notification.alert({ message: "Preencha o campo CPF corretamente.", title: "Atenção!" });
            return;
        }
    }
    if (senha == "" || senha == null) {
        ons.notification.alert({ message: "Informe a senha", title: "Atenção!" });
        return;
    }

    if (usuario == "999.999.999-99" && senha == "mercurio") {
        document.querySelector('#myNavigator').pushPage('selecionar-ambiente.html');
        return;
    }
     
    modal.show();

    var obj = { "senuso": senha, "cpfuso": usuario };
    console.log(urlApi);
    jQuery.ajax({
        url: urlApi + 'acesso/login',
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
         
            modal.hide();
            var db = openDatabase('dbgesol', '1.0', 'DBGESOL', 5 * 1024 * 1024);
            db.transaction(function (tx) {
                tx.executeSql("INSERT INTO usuario (usuarioidgesol, nome, auxiliar1) VALUES (?, ?, ?)", [res.codigo, res.nome, res.dataNasc], function (tx, results) {
                    sessionStorage.setItem('usuarioid', res.codigo);
                    sessionStorage.setItem('nome', res.nome);
                    sessionStorage.setItem('dataNasc', res.dataNasc);
                    document.querySelector('#myNavigator').resetToPage("home.html");
                    var menu = document.getElementById('menu');
                    menu.setAttribute("swipeable", true);
                    consultarNotificacoesWebService();
                    btnProconVisible();
                });
            });
        },
        error: function (res) {
            modal.hide();
            ons.notification.alert({ message: "CPF e/ou senha incorreta", title: "Atenção!" });
        }
    });
}

function logout() {
    var usuarioid = sessionStorage.getItem('usuarioid');
    var db = openDatabase('dbgesol', '1.0', 'DBGESOL', 5 * 1024 * 1024);
    db.transaction(function (tx) {
        tx.executeSql("DELETE FROM usuario WHERE usuarioidgesol = ?", [usuarioid], function (tx, results) {
            sessionStorage.setItem('usuarioid', "");
            sessionStorage.setItem('nome', "");
            sessionStorage.setItem('quantidadenotificacoesnovas', "");
            fn.load("logout.html");
            var menu = document.getElementById('menu');
            menu.removeAttribute("swipeable");
        });
        localStorage.clear();
        window.localStorage.clear();
        urlApi = urlProducao;
        //tx.executeSql("DELETE FROM notificacao", [], function (tx, results) {
            
        //});
    });
}

function alterarsenha() {
    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return;
    }

    var senhaAtual = document.getElementById("senhaatual").value;
    var novaSenha = document.getElementById("novasenha").value;
    var novaSenhaConf = document.getElementById("confnovasenha").value;

    if (senhaAtual == "" || senhaAtual == null) {
        ons.notification.alert({ message: "Informe sua senha atual.", title: "Atenção!" });
        return;
    }
    if (novaSenha == "" || novaSenha == null) {
        ons.notification.alert({ message: "Informe sua nova senha.", title: "Atenção!" });
        return;
    }
    if (novaSenhaConf == "" || novaSenhaConf == null) {
        ons.notification.alert({ message: "Confirme sua nova senha.", title: "Atenção!" });
        return;
    }
    if (novaSenha !== novaSenhaConf) {
        ons.notification.alert({ message: "A nova senha não coincide com a digitada na confirmação.", title: "Atenção!" });
        return;
    }

    var usuarioid = sessionStorage.getItem('usuarioid');

    var obj = {
        "coduso": usuarioid,
        "senuso": senhaAtual,
        "novasenha": novaSenha,
    };

    jQuery.ajax({
        url: urlApi + 'acesso/alterasenha',
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            if (res.mensagem == "OK") {
                ons.notification.alert({ message: "Senha alterada com sucesso.", title: "Sucesso!" });
                fn.load("home.html");
            }
            else {
                ons.notification.alert({ message: "Ocorreu um erro ao alterar a senha. Tente novamente mais tarde.", title: "Atenção!" });
            }
        },
        error: function (res) {
            ons.notification.alert({ message: "Ocorreu um erro ao tentar realizar a operação desejada. Tente novamente mais tarde.", title: "Atenção!" });
        }
    });
}

function recuperarsenha() {
    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return;
    }

    var cpf = document.getElementById("cpf").value;
    var datanascimento = document.getElementById("datanascimento").value;
    
    if (cpf == "" || cpf == null) {
        ons.notification.alert({ message: "Informe o CPF", title: "Atenção!" });
        return;
    }
    else {
        var cpfSemMascara = cpf.replace(/[^\d]+/g, '');
        if (cpfSemMascara.length < 11) {
            ons.notification.alert({ message: "Preencha o campo CPF corretamente.", title: "Atenção!" });
            return;
        }
    }

    if (datanascimento == "" || datanascimento == null) {
        ons.notification.alert({ message: "Informe a Data de Nascimento", title: "Atenção!" });
        return;
    }
    else {
        if (!validarData(datanascimento)) {
            ons.notification.alert({ message: "O valor informado no campo Data de Nascimento é inválido", title: "Atenção!" });
            return;
        }
    }

    var obj = {
        "cpfuso": cpf,
        "nasuso": datanascimento
    };

    jQuery.ajax({
        url: urlApi + 'usuariosol/recuperarsenha',
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            ons.notification.alert({ message: "Utilize o seu CPF como senha para ter acesso ao Aplicativo.", title: capitalizarTexto(res.mensagem.split(' ')[0]) + ", sua senha foi recuperada com sucesso!" });
            fn.load("tela-inicial.html");
        },
        error: function (res) {
            ons.notification.alert({ message: "<b>Usuário não encontrado!</b>", title: "" });
        }
    });
}

function selecionartipopessoa(campo) {
    var valor = campo.value;
    if (valor != "") {
        if (valor == "F") {
            jQuery("#cpf").val("").find("input").mask("999.999.999-99", { clearIfNotMatch: true });
        }
        if (valor == "J") {
            jQuery("#cpf").val("").find("input").mask("99.999.999/9999-99", { clearIfNotMatch: true });
        }
    }
}

function selecionarEnviar() {
    var tiposervico = document.getElementById("tiposervico").value;
    var tipoSolicitacao = (jQuery('input:radio[name="tipo-solicitacao"]').is(':checked')) ? jQuery('input:radio[name="tipo-solicitacao"]:checked').val() : "";

    if (tiposervico == "1") {
        if (tipoSolicitacao == "" || tipoSolicitacao == null) {
            var opcoes = "";
            if (jQuery("#itemDenuncia").length > 0) {
                opcoes += "<br>- Denúncia";
            }
            if (jQuery("#itemElogio").length > 0) {
                opcoes += "<br>- Elogio";
            }
            if (jQuery("#itemReclamacao").length > 0) {
                opcoes += "<br>- Reclamação";
            }
            if (jQuery("#itemServico").length > 0) {
                opcoes += "<br>- Serviço";
            }
            
            ons.notification.alert({ message: "Selecione uma das opções:" + opcoes, title: "Atenção!" });
            return;
        }
        else if (tipoSolicitacao == "S") {
            enviarObrasServicos();
        }
        else {
            enviarObrasServicosSemLocalizacao(); //enviarOuvidoria();
        }
    }
    else {
        enviarObrasServicosSemLocalizacao(); //enviarOuvidoria();
    }
}


function enviarObrasServicos() {
    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return;
    }

    var idservico = document.getElementById("idservico").value;
    var detalhes = document.getElementById("detalhes").value;
    var imagem = document.getElementById("imagem").src;
    console.info("Inicio");
    console.info(imagem);
    console.info("FIm")
    var nomeImagem = (imagem != null && imagem != "") ? "foto_anexo.jpg" : "";
    var tipoSolicitacao = (jQuery('input:radio[name="tipo-solicitacao"]').is(':checked')) ? jQuery('input:radio[name="tipo-solicitacao"]:checked').val() : "";
    var latitudeImagem = sessionStorage.getItem('latitude');
    var longitudeImagem = sessionStorage.getItem('longitude');
    
    if (tipoSolicitacao == "" || tipoSolicitacao == null) {
        ons.notification.alert({ message: "Selecione uma das opções:<br>- Denúncia<br>- Elogio<br>- Reclamação<br>- Serviço", title: "Atenção!" });
        return;
    }
    if (tipoSolicitacao == "S" && (imagem == "" || imagem == null || imagem == undefined)) {
        ons.notification.alert({ message: "É obrigatório incluir uma foto", title: "Atenção!" });
        return;
    }
    if (detalhes == "" || detalhes == null) {
        ons.notification.alert({ message: "Informe os detalhes da solicitação", title: "Atenção!" });
        return;
    }

    modal.show();
    
    var imagemReplaced = imagem.replace("data:image/png;base64,", "");
    tipoSolicitacao = tipoSolicitacao == "S" ? "0" : tipoSolicitacao;
  
    navigator.geolocation.getCurrentPosition(function (position) {
        var usuarioid = sessionStorage.getItem('usuarioid');
        var obj = {
            "cepsol": "",
            "tplsol": "",
            "logsol": "",
            "baisol": "",
            "numsol": "",
            "txtsol": imagemReplaced,
            "datsol": dataAtualFormatada(),
            "codmts": "1",
            "desmts": "1",
            "coduso": usuarioid,
            "latsol": (nomeImagem != "" && latitudeImagem != "" && latitudeImagem != null) ? latitudeImagem : position.coords.latitude.toString().replace(',', '.'),
            "lonsol": (nomeImagem != "" && longitudeImagem != "" && longitudeImagem != null) ? longitudeImagem : position.coords.longitude.toString().replace(',', '.'),
            //"arqsta": imagem,
            //"nomsta": nomeImagem,
            "ossVOs": [{ "coduso": usuarioid, "codtps": idservico, "obsoss": detalhes, "txtsol": imagemReplaced, "tiposs": tipoSolicitacao }]
        };

        jQuery.ajax({
            url: urlApi + 'solicitacao',
            type: 'POST',
            data: JSON.stringify(obj),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (res) {
                modal.hide();
                ons.notification.alert({ message: "<span style='font-size: 20px;font-weight: bold;'><center>PROTOCOLO Nº " + res.protocolo + "</center></span><br><hr><center>Campo Grande agradece, esta é a cidade que todos queremos!</center>", title: "Sua solicitação foi enviada com sucesso!" });
                document.querySelector('#myNavigator').resetToPage("obrigado.html");
            },
            error: function (res) {
                var mensagem = res.responseJSON.mensagem;
                ons.notification.alert({ message: mensagem, title: "Atenção!" }); 
            }
        });
    }, function () {
        modal.hide();
        ons.notification.alert({ message: "Capturando coordenadas, reenvie sua Solicitação.", title: "Atenção!" });
    }, { enableHighAccuracy: true, timeout: 10000 });
}


function enviarObrasServicosSemLocalizacao() {
    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return;
    }

    var idservico = document.getElementById("idservico").value;
    var detalhes = document.getElementById("detalhes").value;
    var tipoSolicitacao = (jQuery('input:radio[name="tipo-solicitacao"]').is(':checked')) ? jQuery('input:radio[name="tipo-solicitacao"]:checked').val() : "";

    if (tipoSolicitacao == "" || tipoSolicitacao == null) {
        var opcoes = "";
        if (jQuery("#itemDenuncia").length > 0) {
            opcoes += "<br>- Denúncia";
        }
        if (jQuery("#itemElogio").length > 0) {
            opcoes += "<br>- Elogio";
        }
        if (jQuery("#itemReclamacao").length > 0) {
            opcoes += "<br>- Reclamação";
        }
        if (jQuery("#itemServico").length > 0) {
            opcoes += "<br>- Serviço";
        }

        ons.notification.alert({ message: "Selecione uma das opções:" + opcoes, title: "Atenção!" });
        return;
    }
    if (detalhes == "" || detalhes == null) {
        ons.notification.alert({ message: "Informe os detalhes da solicitação", title: "Atenção!" });
        return;
    }

    modal.show();

    tipoSolicitacao = tipoSolicitacao == "S" ? "0" : tipoSolicitacao;

    var usuarioid = sessionStorage.getItem('usuarioid');
    var obj = {
        "cepsol": "",
        "tplsol": "",
        "logsol": "",
        "baisol": "",
        "numsol": "",
        "txtsol": "",
        "datsol": dataAtualFormatada(),
        "codmts": "1",
        "desmts": "1",
        "coduso": usuarioid,
        "latsol": "-20.4645049",
        "lonsol": "-54.632477",
        "ossVOs": [{ "coduso": usuarioid, "codtps": idservico, "obsoss": detalhes, "txtsol": "", "tiposs": tipoSolicitacao }]
    };
    //É enviado a latitude e longitude da AGETEC, pois o WS não aceita sem essas informações.

    jQuery.ajax({
        url: urlApi + 'solicitacao',
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            modal.hide();
            ons.notification.alert({ message: "<span style='font-size: 20px;font-weight: bold;'><center>PROTOCOLO Nº " + res.protocolo + "</center></span><br><hr><center>Campo Grande agradece, esta é a cidade que todos queremos!</center>", title: "Sua solicitação foi enviada com sucesso!" });
            document.querySelector('#myNavigator').resetToPage("obrigado.html");
        },
        error: function (res) {
            modal.hide();
            console.log(res.status);
            
            if(res.status==500)
                ons.notification.alert({ message: "Ocorreu um erro, tente novamente mais tarde", title: "Atenção!" });
        }
    });
}

function enviarOuvidoria() {
    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return; 
    }

    var idservico = document.getElementById("idservico").value;
    var tipoSolicitacao = (jQuery('input:radio[name="tipo-solicitacao"]').is(':checked')) ? jQuery('input:radio[name="tipo-solicitacao"]:checked').val() : "";
    var detalhes = document.getElementById("detalhes").value;

    if (tipoSolicitacao == "" || tipoSolicitacao == null) {
        var opcoes = "";
        if (jQuery("#itemDenuncia").length > 0) {
            opcoes += "<br>- Denúncia";
        }
        if (jQuery("#itemElogio").length > 0) {
            opcoes += "<br>- Elogio";
        }
        if (jQuery("#itemReclamacao").length > 0) {
            opcoes += "<br>- Reclamação";
        }
        if (jQuery("#itemServico").length > 0) {
            opcoes += "<br>- Serviço";
        }

        ons.notification.alert({ message: "Selecione uma das opções:" + opcoes, title: "Atenção!" });
        return;
    }

    if (detalhes == "" || detalhes == null) {
        ons.notification.alert({ message: "Informe os detalhes da solicitação", title: "Atenção!" });
        return;
    }
    var usuarioid = sessionStorage.getItem('usuarioid');

    var obj = {
        "coduso": usuarioid,
        "codsol": "",
        "codtps": idservico,
        "celava": "",
        "tipava": tipoSolicitacao,
        "usualt": "",
        "serava": "",
        "codita": "",
        "notava": "",
        "avaava": detalhes
    };

    modal.show();

    jQuery.ajax({
        url: urlApi + 'avaliacao',
        type: 'POST',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            modal.hide();
            document.querySelector('#myNavigator').resetToPage("obrigado-sem-acompanhar.html");
        },
        error: function (res) {
            modal.hide();
            ons.notification.alert({ message: "Ocorreu um erro, tente novamente mais tarde", title: "Atenção!" });
        }
    });
}

function enviarAvaliacao() {

}

function capturarPontoAposFoto() {
    navigator.geolocation.getCurrentPosition(function (position) {
         if(position!=null && position !=undefined){
            $("#camera").removeAttr("disabled");
            console.log("Captura de Fotos: " + position.coords.latitude.toString());
            sessionStorage.setItem('latitude', position.coords.latitude.toString().replace(',', '.'));
            sessionStorage.setItem('longitude', position.coords.longitude.toString().replace(',', '.'));
        }else{
            ons.notification.alert({ message: "Capturando coordenadas, reenvie sua Solicitação.", title: "Atenção!" });
            $("#camera").html("REENVIAR SOLICITAÇÃO");
        }
    }, function (error) {
        document.getElementById("btnNovaFoto").style.display = "block";
        var cameraImage = document.getElementById("imagem");
        cameraImage.src = "";
        cameraImage.style.display = "none";
        sessionStorage.setItem('latitude', "");
        sessionStorage.setItem('longitude', "");
         ons.notification.alert({ message: "Capturando coordenadas, reenvie sua Solicitação.", title: "Atenção!" });
        $("#camera").html("REENVIAR SOLICITAÇÃO");
    });
}

function consultarSolicitacoes() {
    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return;
    }
    modal.show();
    var usuarioid = sessionStorage.getItem('usuarioid');
    var solicitacoesId = new Array();

    jQuery.getJSON(urlApi + "solicitacao/" + usuarioid, function (data) {
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                solicitacoesId.push(data[i].codsol);
            }

            montarHtmlSolicitacoes(solicitacoesId, usuarioid);
        }
        else {
            modal.hide();
            jQuery("#divSolicitacoes").html("<button class='accordion-sem-registro'><span style='vertical-align: sub;'>Não há serviços solicitados.</span></button>");
        }
    }, 'json').fail(function (error) {
        console.info(error.responseText);
        
        modal.hide();
        ons.notification.alert({ message: "Ocorreu um erro, tente novamente mais tarde", title: "Atenção!" });
    });
}

function montarHtmlSolicitacoes(solicitacoesId, usuarioid) {
    var html = "";
    var contador = 1;
    
    var arrSolicitacoes = new Array();
    for (var i = 0; i < solicitacoesId.length; i++) {
        jQuery.getJSON(urlApi + "solicitacao/" + usuarioid + "/" + solicitacoesId[i], function (data) {
            if (data) {
                arrSolicitacoes.push(data.ossVOs[0]);
                contador++;
                if (contador > solicitacoesId.length) {
                    contador = 1;
                    arrSolicitacoes.sort(function (a, b) {
                        return b.codsol - a.codsol;
                    });

                    for (var i = 0; i < arrSolicitacoes.length; i++) {
                        var solicitacao = arrSolicitacoes[i];

                        var dataSolicitacaoSplited = solicitacao.datsol.split("-");
                        var dataSolicitacao = dataSolicitacaoSplited[2].split(" ")[0] + "/" + dataSolicitacaoSplited[1] + "/" + dataSolicitacaoSplited[0];
                        var dataSolicitacaoDiaMes = dataSolicitacaoSplited[2].split(" ")[0] + "/" + dataSolicitacaoSplited[1];
                         
                        var iconeSituacao = "";
                        if (solicitacao.sitsol == "C") { //Concluida
                            iconeSituacao = "<img src='./images/concluida.png' style='vertical-align: bottom; width: 6%' />&nbsp;";
                        }
                        else if (solicitacao.sitsol == "F") { //Finalizada
                            iconeSituacao = "<img src='./images/finalizada.png' style='vertical-align: bottom; width: 6%' />&nbsp;";
                        }
                        else if (solicitacao.sitsol == "A") { //Aberta
                            iconeSituacao = "<img src='./images/aberta.png' style='vertical-align: bottom; width: 6%' />&nbsp;";
                        }
                        else if (solicitacao.sitsol == "G") { //Em Análise
                            iconeSituacao = "<img src='./images/gerenciada.png' style='vertical-align: bottom; width: 6%' />&nbsp;";
                        }

                        html += "<button class='accordion-button' onclick='toggleAccordion(this)'>" + iconeSituacao + "<span style='vertical-align: sub;'>" + dataSolicitacaoDiaMes + " - " + capitalizarTexto(solicitacao.destps) + "</span></button>" +
                            "<div class='painel'>" +
                                "<p>" +
                                    "<span style='font-weight: bold'>Nº do Protocolo:</span><span>&nbsp;" + solicitacao.codsol + "</span>" +
                                "</p>" +
                                "<p>" +
                                    "<span style='font-weight: bold'>Aberto:</span><span>&nbsp;" + dataSolicitacao + "</span>" +
                                "</p>" +
                                "<p>" +
                                    "<span style='font-weight: bold'>Solicitação:</span><span>&nbsp;" + solicitacao.obsoss + "</span>" +
                                "</p>" +
                                "<p>" +
                                    "<span style='font-weight: bold'>Endereço:</span><span>&nbsp;" + solicitacao.logsol + ", " + solicitacao.numsol + " - " + solicitacao.baisol + "</span>" +
                                "</p>" +
                                "<p>" +
                                    "<span style='font-weight: bold'>Situação:</span><span>&nbsp;" + retornaSituacaoSolicitacao(solicitacao.sitsol) + "</span>" +
                                "</p>" +
                                "<p>" +
                                    "<span style='font-weight: bold'>Ordem de Serviço:</span><span>&nbsp;" + solicitacao.codoss + "</span>" +
                                "</p>";

                        if (solicitacao.sitsol == "F" || solicitacao.sitsol == "C") {
                            var dataFechamento = "";
                            if (solicitacao.dafsol != null && solicitacao.dafsol != "") {
                                var dataFechamentoSplited = solicitacao.dafsol.split("-");
                                dataFechamento = dataFechamentoSplited[2].split(" ")[0] + "/" + dataFechamentoSplited[1] + "/" + dataFechamentoSplited[0];
                            }

                            html += "<p>" +
                                    "<span style='font-weight: bold'>Atendimento:</span><span>&nbsp;" + solicitacao.tfisol + "</span>" +
                                "</p>" +
                                "<p>" +
                                    "<span style='font-weight: bold'>Finalizado:</span><span>&nbsp;" + dataFechamento + "</span>" +
                                "</p>";
                        }

                        html += "</div>";

                        contador++;
                        if (contador > solicitacoesId.length) {
                            jQuery("#divSolicitacoes").html(html);
                            modal.hide();
                        }
                    }
                }
            }
        }, 'json').fail(function (error) {
        });
    }
}

function consultarNotificacoesWebService() {
    //if (!verificarConexao()) {
    //    return;
    //}

    var usuarioid = sessionStorage.getItem('usuarioid');

    jQuery.getJSON(urlApi + "notificacao/buscar/" + usuarioid, function (data) {
        if (data.length > 0) {
            analisarRetornoConsultaNotificacaoWebService(data);
        }
    }, 'json').fail(function (error) {
        
    });
}

var notificacaoIds = new Array();
var qtdeNovas = 0;
function analisarRetornoConsultaNotificacaoWebService(notificacoes) {
    var contador = 1;
    for (var i = 0; i < notificacoes.length; i++) {
        var notificacao = notificacoes[i];
        VerificarSeExisteNotificacao(notificacao);

        contador++;
        if (contador > notificacoes.length) {
            setTimeout(function() {
                sessionStorage.setItem('quantidadenotificacoesnovas', qtdeNovas);
                jQuery("#spanQtdeNotificacao, #spanTopoQtdeNotificacoes").text(qtdeNovas);

                //Atualizar notificações recebidas no webservice
                if (notificacaoIds.length > 0) {
                    jQuery.ajax({
                        url: urlApi + 'notificacao/atualizar/' + notificacaoIds.join(","),
                        type: 'GET',
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        success: function(res) {
                            var temp = res;
                        },
                        error: function(res) {
                            var temp = res;
                        }
                    });
                } else {
                    modal.hide();
                }
            }, 1500);
        }
    }
}

function consultarNotificacoes() { 
    modal.show();

    var usuarioid = sessionStorage.getItem('usuarioid');
    var db = openDatabase('dbgesol', '1.0', 'DBGESOL', 5 * 1024 * 1024);
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM notificacao WHERE lido = " + usuarioid, [], function (tx, results) {
                if (results.rows.length > 0) {
                    montarHtmlNotificacoes(results.rows);
                }
                else {
                    setTimeout(function () {
                        modal.hide();
                        jQuery("#divNotificacoes").html("<button class='accordion-sem-registro'><span style='vertical-align: sub;'>Não há notificações.</span></button>");
                    }, 1500);
                }
            });
    });
}

function montarHtmlNotificacoes(notificacoes) {
    var html = "";
    var contador = 1;

    for (var i = 0; i < notificacoes.length; i++) {
        var notificacao = notificacoes.item(i);
        var datasinc = notificacao.datasincronizacao;
        if (datasinc == null || datasinc == "") {
            datasinc = dataAtualFormatada();
        }

        html += "<button class='accordion-button' onclick='toggleAccordion(this)'><span>" + formatarData(datasinc) + "</span><span><br></span><span>" + capitalizarTexto(notificacao.titulo) + "</span></button>" +
            "<div class='painel'>" +
            "<p>" +
            "<span>&nbsp;" + notificacao.mensagem + "</span>" +
            "</p>";

        html += "</div>";

        contador++;
        if (contador > notificacoes.length) {
            setTimeout(function() {
                jQuery("#divNotificacoes").html(html);
                modal.hide();
            }, 1500);
        }
    }
}

function montarHtmlEnderecoProcon(enderecos) {
    modal.show();
    var html = "";
    var contador = 1;

    for (var i = 0; i < enderecos.length; i++) {
        var endereco = enderecos[i];
        

        html += "<div>" +
            "<p>" +
            "<div>&nbsp;" + endereco.lgdepc + "</div>" +
            "<div>&nbsp;Número: " + endereco.numeroepc + "</div>" +
            "<div>&nbsp;Campo Grande / MS</div>" +
            "<div>&nbsp;CEP: " + endereco.cepepc + "</div>" +
            
            "</p>";

        html += "</div>";

        contador++;
        if (contador > enderecos.length) {
            setTimeout(function() {
                jQuery("#divEnderecoProcon").html(html);
                modal.hide();
            }, 1500);
        }
    }
}

function montarHtmlContatoProcon(contatos) {
    modal.show();
    var html = "";
    var contador = 1;

    for (var i = 0; i < contatos.length; i++) {
        var contato = contatos[i];
       
        html += "<div>" +
            "<p>" +
                "<div>&nbsp;" + contato.tcpcpr.destcp+":</div>"+
                "<div style='font-size:5vw;padding-left:10px; word-wrap: break-word;'>"+contato.concpr + "</div>"+
            "</p>";

        html += "</div>";

        contador++;
        if (contador > contatos.length) {
            setTimeout(function() {
                jQuery("#divContatoProcon").html(html);
                modal.hide();
            }, 1500);
        }
    }
}


function verificarSeOUsuarioJaEstaInscrito() {
    var usuarioid = sessionStorage.getItem('usuarioid');
    
     jQuery.ajax({
                url: urlApi + 'receberinformacao/coduso/'+usuarioid,
                type: 'GET',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function(results) {
                    
                    exibirBotaoProconInformativo(results.atvrei);
                    modal.hide();
                },
                error: function(results) {
                    console.log("Erro");
                    var temp = results;
                    
                    exibirBotaoProconInformativo(false);
                    modal.hide();
                } 
            });
    
}

function cadastrarNoInformativoProcon(){
    var usuarioid = sessionStorage.getItem('usuarioid');
            
    var inscricao = {
        "atvrei": true,
        "cadrei": 1,
        "coduso": usuarioid
    }
        
    jQuery.ajax({
        url: urlApi + 'receberinformacao/web/incluir',
        type: 'POST',
        data: JSON.stringify(inscricao),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            if (res.response != undefined) {
                ons.notification.alert({ message: "Acompanhe seu WhatsApp para ficar por dentro das notícias do procon !", title: "Sucesso!" });
                exibirBotaoProconInformativo(true);
            }
            else {
                ons.notification.alert({ message: "Ocorreu um erro ao se cadastrar no informativo PROCON. Tente novamente mais tarde.", title: "Atenção!" });
            }
        },
        error: function (res) {
            ons.notification.alert({ message: "Ocorreu um erro ao se cadastrar no informativo PROCON. Tente novamente mais tarde.", title: "Atenção!" });
        }
    });
} 

function cancelarInscricaoNoInformativoProcon(){
    var usuarioid = sessionStorage.getItem('usuarioid');
     jQuery.ajax({
        url: urlApi + 'receberinformacao/cancelar/'+usuarioid,
        type: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function(results) {
            ons.notification.alert({ message: "Inscrição cancelada!", title: "Sucesso!" });
            exibirBotaoProconInformativo(results.atvrei);
            modal.hide();
        },
        error: function(results) {
            console.log("Erro");
            var temp = results;
            modal.hide();
        } 
    });
}

function exibirBotaoProconInformativo ( inscricaoAtiva ){
    
    if( inscricaoAtiva ){
        document.getElementById("realizaInscricao").style.visibility = 'hidden'; 
        document.getElementById("cancelaInscricao").style.visibility = 'visible';
        
    }else{
        document.getElementById("realizaInscricao").style.visibility = 'visible'; 
        document.getElementById("cancelaInscricao").style.visibility = 'hidden';
    }
}

function VerificarSeExisteNotificacao(notificacao) {
    var usuarioid = sessionStorage.getItem('usuarioid');
    var db = openDatabase('dbgesol', '1.0', 'DBGESOL', 5 * 1024 * 1024);
    db.transaction(function (tx) {
        tx.executeSql("SELECT COUNT(*) AS qtde FROM notificacao WHERE notificacaoidgesol = " + notificacao.codigo_notificacao + " and lido = " + usuarioid,
            [], function (tx, results) {
                var qtde = results.rows.item(0).qtde;
                if (qtde == 0) {
                    InserirNotificacao(notificacao);
                    notificacaoIds.push(notificacao.codigo_notificacao);
                    qtdeNovas++;
                }
            });
    });
}

function InserirNotificacao(notificacao) {
    var usuarioid = sessionStorage.getItem('usuarioid');
    var dataAtualSplited = dataAtualFormatada().split('/');

    var db = openDatabase('dbgesol', '1.0', 'DBGESOL', 5 * 1024 * 1024);
    db.transaction(function (tx) {
        tx.executeSql("INSERT INTO notificacao (notificacaoidgesol, tipo, titulo, mensagem, lido, datasincronizacao) VALUES (?, ?, ?, ?, ?, ?)",
            [notificacao.codigo_notificacao, "1", notificacao.titulo, notificacao.mensagem, usuarioid, (dataAtualSplited[2] + "-" + dataAtualSplited[1] + "-" + dataAtualSplited[0])]);
    });
}

function selecionarAmbiente() {
    var tipoAmbiente = (jQuery('input:radio[name="ambiente"]').is(':checked')) ? jQuery('input:radio[name="ambiente"]:checked').val() : "";
    if (tipoAmbiente == "" || tipoAmbiente == null) {
        ons.notification.alert({ message: "Selecione um ambiente.", title: "Atenção!" });
        return;
    }

    var ambiente = tipoAmbiente == "P" ? urlProducao : urlHomologacao;
    localStorage.setItem("urlAmbiente", ambiente);
    urlApi = ambiente;
    document.querySelector('#myNavigator').resetToPage("tela-inicial.html");
}

function retornaSituacaoSolicitacao(sit) {
    switch (sit) {
        case 'A':
            return 'ABERTO';
        case 'G':
            return 'EM ANÁLISE';
        case 'S':
            return 'SEM OS PENDENTE';
        case 'F':
            return 'FINALIZADA';
        case 'C':
            return 'CONCLUÍDA';
        default:
            return '-';
    }
}

function verificarConexao() {
    var networkState = navigator.connection.type;
    if (networkState == Connection.UNKNOWN || networkState == Connection.NONE) {
        return false;
    }

    return true;
}

function dataAtualFormatada() {
    var data = new Date();
    var dia = data.getDate();
    if (dia.toString().length == 1)
        dia = "0" + dia;
    var mes = data.getMonth() + 1;
    if (mes.toString().length == 1)
        mes = "0" + mes;
    var ano = data.getFullYear();

    return dia + "/" + mes + "/" + ano;
}

function capitalizarTexto(texto) {
    var palavras = "";
    var strPalavras = "";

    // Pega a string a ser capitalizada
    var string = texto.toLowerCase();

    // Quebra a string em um vetor composto pelas palavras da frase
    var array = string.split(" ");

    // Laço para capitalizar cada palavra individualmente
    for (var i = 0; i < array.length; i++) {
        var word = array[i].toLowerCase();

        // Aqui basta digitar as palavras que não devem ser capitalizadas, exemplo: word == "dos" basta colocar como o modelo abaixo
        if (word == "de" || word == "do" || word == "da" || word == "dos" || word == "das" || word == "a" || word == "à") {
            strPalavras += " " + word;
        }
        else if (word == "agetran" || word == "semed" || word == "sesau" || word == "sisep") {
            strPalavras += " " + word.toUpperCase();
        }
        else {
            var inicial = array[i].charAt(0).toUpperCase();
            var restante = array[i].substring(1, array[i].length);
            strPalavras += " " + inicial + restante;
        }
    }

    // Verifica se a primeira letra da frase formada é um espaço, se for deleta-o da palavra
    for (var j = 0; j < strPalavras.length; j++) {
        var primeiroCaracter = strPalavras.charAt(0);
        if (primeiroCaracter == " ") {
            strPalavras = strPalavras.substring(1, strPalavras.length);
        }
        else {

            // Se o primeiro cacter não for um espaço então apenas o copia para a variável
            strPalavras = strPalavras;
        }
    }

    // Altera o conteúdo do campo
    return strPalavras;
}

function validarData(date) {
    var matches = /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.exec(date);
    if (matches == null) {
        return false;
    }
    var d = matches[1];
    var m = matches[2] - 1;
    var y = matches[3];
    var composedDate = new Date(y, m, d);
    return composedDate.getDate() == d &&
            composedDate.getMonth() == m &&
            composedDate.getFullYear() == y;
}

function formatarTelefoneFixo(valor) {
    if (valor == "" || valor == null) {
        return "";
    }
    return "(" + valor.substring(0, 2) + ") " + valor.substring(2, 6) + "-" + valor.substring(6, 12);
}

function formatarData(valor) {
    if (valor == "" || valor == null) {
        return "";
    }

    var valorSplited = valor.split('-');
    return valorSplited[2] + "/" + valorSplited[1] + "/" + valorSplited[0];
}

function ObterServicos(nomeArea, nomeOrgao, divId) {
    if (!verificarConexao()) {
        modal.hide();
        return;
    }

    jQuery.ajax({
        url: urlApi + 'servicos',
        type: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            var listaServicos = new Array();
            for (var i = 0; i < res.length; i++) {
                if (res[i].desorg == nomeOrgao)
                {
                    listaServicos.push(res[i]);
                }
            }

            var html = '<ons-list class="gesol-list" modifier="gesol">' +
                '<ons-list-header>Solicitações Disponíveis</ons-list-header>';

            listaServicos.sort(function (a, b) {
                var aNome = a.destps.toLowerCase();
                var bNome = b.destps.toLowerCase();
                return ((aNome < bNome) ? -1 : ((aNome > bNome) ? 1 : 0));
            });
            for (var i = 0; i < listaServicos.length; i++) {
                var img = (listaServicos[i].aplimgtps != null && listaServicos[i].aplimgtps != '') ? ('<img style="width:17px" src="data:image/png;base64,' + listaServicos[i].aplimgtps + '"/>') : '<i class="fa fa-check"></i>';
                html += '<ons-list-item onclick="fn.novaSolicitacao(\'' + nomeArea + '|' + capitalizarTexto(listaServicos[i].destps) + '\', \'' + listaServicos[i].codtps + '\', \'' + (listaServicos[i].aplsertps == 'S' ? 1 : 2) + '\', ' + (listaServicos[i].aplsertps == 'S' ? true : null) + ', ' + (listaServicos[i].aplelotps == 'S' ? true : null) + ', ' + (listaServicos[i].apldentps == 'S' ? true : null) + ', ' + (listaServicos[i].aplrectps == 'S' ? true : null) + ');" tappable>' + img + '&nbsp;' + capitalizarTexto(listaServicos[i].destps) + '</ons-list-item>';
            }

            html += '</ons-list>';
            jQuery("#" + divId).html(html);
            modal.hide();
        },
        error: function (res) {
            modal.hide();
        }
    });
}

function toggleAccordion (el) {
    el.classList.toggle("active");
    var panel = el.nextElementSibling;
    if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
    } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
    }
}

function reenviarRequisicao(msg, func){
    console.log(countReq);
   
    if(countReq<4){
        console.log(countReq);
        func;
        $("#solicitar").html("REENVIANDO SOLICITAÇÃO");
    }if(countReq>=4){
        modal.hide();
        $("#solicitar").html("FAZER SOLICITAÇÃO");
        ons.notification.alert({ message: "Tente novamente mais tarde", title: "Atenção!" });
       
       
    }
    
}


/** Solicitações PROCON * */
 var arquivo;
 var nomearquivo;
 var tparq;
 
var cepepc;
var lgdepc;
var bairroepc;
var tbairrotpc;
var numeroepc;
var estden;

function solicitarOrientacao() {
    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return;
    }
    
    var tipden = document.getElementById('tipden').value;
    var desden = document.getElementById("desden").value;
    var codram = document.getElementById("codram").value;
    var usuarioid = sessionStorage.getItem('usuarioid');
   
    if(desden == null || desden =="" ||  desden ==undefined){
      ons.notification.alert({ message: "Preencha o campo de descrição", title: "Atenção!" });
      return;
    }

    if(codram == null || codram == "" ||  codram == undefined){
      ons.notification.alert({ message: "Selecione um Ramo de Atividade", title: "Atenção!" });
      return;
    }
    
    if(tipden==1){
        var den = {
          "codram":codram,
          "sitden":0,
          "tipden":tipden,
          "tpeden":1,
          "desden":desden,
          "estden":null,
          "coduso":usuarioid,
          "arquivotxt":  (arquivo!=null && arquivo!="") ? arquivo : "",
          "nomArq" : (nomearquivo!=null && nomearquivo!="") ?  nomearquivo: "",
          "tparq": (tparq!=null && tparq!="") ? tparq: ""
        };
    }
    if(tipden==0){
            
        numeroepc = document.getElementById('numero').value;
        estden = document.getElementById('estden').value;
        desden = document.getElementById('desden').value;
        if(estden==null || estden==""){
            ons.notification.alert({ message: "Informe o Local da Ocorrência", title: "Atenção!" });
            return;
        }
        if(numeroepc==null || numeroepc==""){
            ons.notification.alert({ message: "Informe o Número do Endereço", title: "Atenção!" });
            return;
        }
        if(cepepc==null || cepepc==""){
            ons.notification.alert({ message: "Atualize o campo Endereço", title: "Atenção!" });
            return;
        }
        var den = {
          "codram":codram,
          "sitden":0,
          "tipden":tipden,
          "tpeden":1,
          "estden": estden,
          "desden":desden,
          "coduso":usuarioid,
          "arquivotxt":  (arquivo!=null && arquivo!="") ? arquivo : "",
          "nomArq" : (nomearquivo!=null && nomearquivo!="") ?  nomearquivo: "",
          "tparq": (tparq!=null && tparq!="") ? tparq: ""
        };
        den.epcVO =  {
            "cepepc": cepepc,
            "lgdepc": lgdepc,
            "bairroepc": bairroepc,
            "numeroepc": numeroepc,
            "tbairrotpc": tbairrotpc
        };
    }
   
    if(document.getElementById("arqsta").files[0] != undefined){
        
        realizarUploadDoArquivo( (arqden)=>{
            den.arqden = arqden;            
            enviarDenuncia(den);
        });
     
    }else{
        enviarDenuncia(den);
    }
  
}

function realizarUploadDoArquivo(callback){
    modal.show();
    var formdata=new FormData();
    formdata.append('file', document.getElementById("arqsta").files[0]);
    
    jQuery.ajax({
        url: urlApi + "denuncia/upload",
        type: 'POST',
        data: formdata,
        cache: false,
        contentType: false,
        processData: false,
        success: function (arqden) {
            callback(arqden);
        },
        error: function (res) {
            modal.hide();
            ons.notification.alert({ message: "Ocorreu um erro, tente novamente mais tarde", title: "Atenção!" }); 
        }
    });
}


function enviarDenuncia(den){
    jQuery.ajax({
        url: urlApi + "denuncia",
        type: 'POST',
        data: JSON.stringify(den),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            modal.hide();
            ons.notification.alert({ message: "<span style='font-size: 20px;font-weight: bold;'><center>PROTOCOLO Nº " + res.protocolo + "</center></span><br><hr><center>Campo Grande agradece, esta é a cidade que todos queremos!</center>", title: "Sua solicitação foi enviada com sucesso!" });
            document.querySelector('#myNavigator').resetToPage("obrigado2.html");
        },
        error: function (res) {
            console.info(res.responseText);
            modal.hide();
            ons.notification.alert({ message: "Ocorreu um erro, tente novamente mais tarde", title: "Atenção!" }); 
        }
    });
}

/*
function convertArquivo() {
    
    var files = document.getElementById("arqsta").files;
    var path = document.getElementById("arqsta").value;
    console.log(path);
    if (files.length > 0) {
        
        var reader = new FileReader();
        //console.log(reader);
        reader.readAsDataURL(files[0]);
    
       
        reader.onload = function () {
            arquivo= reader.result;
            nomearquivo = files[0].name;
            tparq =files[0].type;
            
          //console.log(reader.result);
       };
       reader.onerror = function (error) {
         console.log('Error: ', error);
       };
    }
  
   
   
}*/

setCodram = function  (cod, nomram){
    codram = cod
    document.getElementById("codram").value=cod;
    document.getElementById("nomram").value=capitalizarTexto(nomram);
    
    //document.querySelector("#myNavigator").resetToPage("denuncias-procon.html");
    modalRamoAtividade.hide();
}



function getRamoAtividade( ) {
    if (!verificarConexao()) {
        modal.hide();
        return;
    }
    var element = $("#nomram");
    element.attr('readonly', 'readonly'); // Force keyboard to hide on input field.
    element.attr('disabled', 'true'); // Force keyboard to hide on textarea field.
    setTimeout(function() {
        element.blur();  //actually close the keyboard
        // Remove readonly attribute after keyboard is hidden.
        element.removeAttr('readonly');
        element.removeAttr('disabled');
    }, 100);
    
    modalRamoAtividade.show();
    jQuery.ajax({
        url: urlApi + 'ramoatv/mobile',
        type: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            var listaRamos = new Array();
            for (var i = 0; i < res.length; i++) {
                if (res[i].codram != null)
                {
                    listaRamos.push(res[i]);
                }
            }

            var html = '<ons-list class="gesol-list" modifier="gesol">' +
                '<ons-list-header id="header-ra">Ramos de Atividades Disponíveis'+
                '</ons-list-header>';

            listaRamos.sort(function (a, b) {
                var aNome = a.nomram.toLowerCase();
                var bNome = b.nomram.toLowerCase();
                return ((aNome < bNome) ? -1 : ((aNome > bNome) ? 1 : 0));
            });
            for (var i = 0; i < listaRamos.length; i++) {
                var img = '<i class="fa fa-check"></i>';
                html += '<ons-list-item width="100%;" onclick="setCodram(\''+listaRamos[i].codram +'\',\''+ listaRamos[i].nomram +'\');" tappable> ' +capitalizarTexto(listaRamos[i].nomram) +'</ons-list-item>';
           
            }

            html += '</ons-list>';
            jQuery("#divRamoAtividade").html(html);
            modal.hide();
        },
        error: function (res) {
            modal.hide();
        }
    });
}


setEndereco = function(cep, log, bairro, reg){
  cepepc = cep;
  lgdepc = log;
  bairroepc = bairro;
  tbairrotpc = reg;
  var endOcorrencia = cep + "- " + lgdepc +", "+bairro;
  document.getElementById("endereco").value= endOcorrencia;
  
  jQuery("#listEnd").hide();
}

resetEndereco= function(){
   cepepc=null;
   
  jQuery("#listEnd").hide();
}
function obterEndereco() {
    if (!verificarConexao()) {
        modal.hide();
        return;
    }

    var logradouro = document.getElementById("endereco").value;
    if(logradouro.length > 4){
      jQuery.ajax({
          url: urlApi + 'endereco/end/'+ logradouro,
          type: 'GET',
          dataType: 'json',
          contentType: "application/json; charset=utf-8",
          success: function (res) {
              var listaEnderecos = new Array();
              
              for (var i = 0; i < res.length; i++) {
                  
                  if (res[i].cepend !=null)
                  {
                      listaEnderecos.push(res[i]);
                      
                  }
              }

              var html = '<ons-list class="gesol-list" modifier="gesol">';
              if(listaEnderecos.length>0){
                  for (var i = 0; i < listaEnderecos.length; i++) {
                    html+='<ons-list-item onclick="setEndereco(\''+listaEnderecos[i].cepend +'\',\''+listaEnderecos[i].logend +'\',\''+ listaEnderecos[i].baiend +'\',\''+ listaEnderecos[i].regend +'\');" tappable> '+listaEnderecos[i].cepend+"-" + capitalizarTexto(listaEnderecos[i].logend) +'</ons-list-item>';
                  }
              }else{
                resetEndereco();
                html = '<ons-list-item  tappable> </ons-list-item>'
              }
              
              html += '</ons-list>';
              
              jQuery("#listEnd").html(html);
              jQuery("#listEnd").show();
              modal.hide();
          },
          error: function (res) {
              modal.hide();
          }
      });
    }
}


function atualizaUsuario(){
    var usuarioid = sessionStorage.getItem('usuarioid');
    if(usuarioid!=null){
        jQuery.ajax({
            url: urlApi + 'usuariosol/coduso/' + usuarioid,
            type: 'GET',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (res) {
                if(res!=null){
                    if(res.dataNasc!=null){
                        sessionStorage.setItem('dataNasc', res.dataNasc);
                    }
                }     
            },
            error: function (res) {}
        });
    }
}
function btnProconVisible(){
  atualizaUsuario();
   
  var dataNasc =  sessionStorage.getItem("dataNasc");
  
  if(dataNasc!=null){
    var dadosNasc = dataNasc.split("-");
    var idade = parseInt(calculaIdade(dadosNasc[0], dadosNasc[1], dadosNasc[2]));
   if(idade>=18) {
      //console.log("Idade2: " +idade);
      setTimeout(()=>{document.getElementById("btnProcon").style.visibility = 'visible'; },3000);
      
    }
    if(idade<=17){
      //console.log("Idade: " +idade);
      setTimeout(()=>{document.getElementById("btnProcon").style.visibility = 'hidden' },2000);
    }
  }

  
  
}

function calculaIdade(ano_aniversario, mes_aniversario, dia_aniversario) {
    var d = new Date,
    ano_atual = d.getFullYear(),
    mes_atual = d.getMonth() + 1,
    dia_atual = d.getDate(),

    ano_aniversario = +ano_aniversario,
    mes_aniversario = +mes_aniversario,
    dia_aniversario = +dia_aniversario,

    quantos_anos = ano_atual - ano_aniversario;

    if (mes_atual < mes_aniversario || mes_atual == mes_aniversario && dia_atual < dia_aniversario) {
        quantos_anos--;
    }

    return quantos_anos < 0 ? 0 : quantos_anos;
}

function getTermoDenuncia(){
    
    var url = urlApi + "termo/codtpt/" + 5;
    modal.show();
    
    jQuery.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            modal.hide();
            if(res!=null){
                if(res.dester!=null){
                    
                    $("#termoden").html(res.dester);
                }
            }     
        },
        error: function (res) {
            modal.hide();
            
        }
    });    
}

function getTermoOrientacao(){
    
    var url = urlApi + "termo/codtpt/" + 2;
    console.log(url);
    modal.show();
    
    jQuery.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            modal.hide();
            if(res!=null){
                if(res.dester!=null){
                    
                    $("#termoori").html(res.dester);
                }
            }     
        },
        error: function (res) {
            modal.hide();
            
        }
    });    
}

function getTermoInformacao(){
    
    var url = urlApi + "termo/codtpt/" + 1;
    modal.show();
    
    jQuery.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (res) {
            modal.hide();
            if(res!=null){
                if(res.dester!=null){
                    
                    $("#termoinfo").html(res.dester);
                }
            }     
        },
        error: function (res) {
            modal.hide();
            
        }
    });    
}

function consultarSolicitacoesProcon() {
    if (!verificarConexao()) {
        ons.notification.alert({ message: "Sem conexão com a internet", title: "Atenção!" });
        return;
    }
    modal.show();
    var usuarioid = sessionStorage.getItem('usuarioid');
    var solicitacoes = new Array();

    jQuery.getJSON(urlApi + "denuncia/coduso/" + usuarioid, function (data) {
        if (data.length > 0) {
            montarHtmlSolicitacoesProcon(data, usuarioid);
        }
        else {
            modal.hide();
            jQuery("#divSolicitacoes").html("<button class='accordion-sem-registro'><span style='vertical-align: sub;'>Não há serviços solicitados.</span></button>");
        }
    }, 'json').fail(function (error) {
        modal.hide();
        ons.notification.alert({ message: "Ocorreu um erro, tente novamente mais tarde", title: "Atenção!" });
    });
}

function montarHtmlSolicitacoesProcon(solicitacoes, usuarioid) {
    var html = "";
     
    if (solicitacoes.length > 0) {
      //console.log(solicitacoes.length);             
      solicitacoes.sort(function (a, b) {
        return b.codden - a.codden;
      });

      for (var i = 0; i < solicitacoes.length; i++) {
         
         var dataSolicitacaoSplited = solicitacoes[i].datalt.split("-");
         var dataSolicitacao = dataSolicitacaoSplited[2].split(" ")[0] + "/" + dataSolicitacaoSplited[1] + "/" + dataSolicitacaoSplited[0];
         var dataSolicitacaoDiaMes = dataSolicitacaoSplited[2].split(" ")[0] + "/" + dataSolicitacaoSplited[1];
                       
         var iconeSituacao = "";
         if (solicitacoes[i].sitden == 2) { //Concluida
            iconeSituacao = "<img src='./images/concluida.png' style='vertical-align: bottom; width: 6%' />&nbsp;";
         }
         if (solicitacoes[i].sitden == 1) { //Concluida
            iconeSituacao = "<img src='./images/gerenciada.png' style='vertical-align: bottom; width: 6%' />&nbsp;";
         }
         if (solicitacoes[i].sitden == 0) { //Concluida
            iconeSituacao = "<img src='./images/aberta.png' style='vertical-align: bottom; width: 6%' />&nbsp;";
         }

         html += "<button class='accordion-button' onclick='toggleAccordion(this)'>" + iconeSituacao + "<span style='vertical-align: sub;'>" + dataSolicitacaoDiaMes + " - " + retornaTipoSolicitacao(solicitacoes[i].tipden) + "</span></button>" +
           "<div class='painel'>" +
                "<p>" +
                     "<span style='font-weight: bold'>Nº do Protocolo:</span><span>&nbsp;" + solicitacoes[i].codden + "</span>" +
                "</p>" +
                 "<p>" +
                   "<span style='font-weight: bold'>Aberto:</span><span>&nbsp;" + dataSolicitacao + "</span>" +
                 "</p>" +
                "<p>" +
                  "<span style='font-weight: bold'>Solicitação:</span><span>&nbsp;" + solicitacoes[i].desden + "</span>" +
                 "</p>";
                  if(solicitacoes[i].lgdepc!=null && solicitacoes[i].lgdepc!=""){
                      html +=  "<p>" +
                                "<span style='font-weight: bold'>Endereço:</span><span>&nbsp;" + solicitacoes[i].lgdepc + ", " + solicitacoes[i].numeroepc + " - " + solicitacoes.bairroepc +"</span>" +
                            "</p>";
                  }
                  html += "<p>" +
                                    "<span style='font-weight: bold'>Situação:</span><span>&nbsp;" + retornaSituacaoSolicitacaoProcon(solicitacoes[i].sitden) + "</span>" +
                          "</p>" ; 
                  if(solicitacoes[i].resden!=null && solicitacoes[i].resden!=""){
                           html += "<p>" +
                                    "<span style='font-weight: bold'>Resposta:</span><span>&nbsp;" + solicitacoes[i].resden + "</span>" +
                                "</p>" ;
                 } 
                 if(solicitacoes[i].arrden!=null && solicitacoes[i].arrden!=""){
                       html +=  ' <p  onclick="downloadAquivoDenuncia('+solicitacoes[i].codden+','+solicitacoes[i].arrden+')">  <b>Resposta:</b> <ons-icon modifier="quiet"> Dowload do Arquivo </ons-icon>   <ons-icon icon="fa-download"></ons-icon> </p>';
                }
                html += "</div>";
        
                }
                jQuery("#divSolicitacoesProcon").html(html);
                modal.hide(); 
    }
}

function retornaSituacaoSolicitacaoProcon(sit) {
    switch (sit) {
        case 0:
            return 'ABERTO';
        case 1:
            return 'EM ANDAMENTO';
        case 2:
            return 'FECHADO';
        default:
            return '-';
    }
}

function retornaTipoSolicitacao(tipden){
    switch (tipden) {
        case 0:
            return 'DENÚNCIA';
        case 1:
            return 'ORIENTAÇÃO';
        default:
            return '-';
    }
}

function showButtons(){
    var date = new Date();
    var dataLancamento = '2018-09-01';
    
}

function downloadAquivoDenuncia(codden,arrden){
    
    window.open(urlApi+"denuncia/download/"+codden, "_system");
    
}
