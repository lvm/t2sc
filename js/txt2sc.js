// FUNKY FOREST  -- HERE BE DRAGONS
var DEBUG = 0;
var RESIZE = 0;
var RANDCOL = 0;
var DELAY = 50;
var USE_PX_DIFF = 1;
var USE_AUDIO = 1;
var CMONO = 0;

var WE_DA_MUZZAK_MAKERS = "We are the music-makers, And we are the dreamers of dreams, Wandering by lone sea-breakers, And sitting by desolate streams. World-losers and world-forsakers, Upon whom the pale moon gleams; Yet we are the movers and shakers, Of the world forever, it seems. With wonderful deathless ditties We build up the world's great cities, And out of a fabulous story We fashion an empire's glory: One man with a dream, at pleasure, Shall go forth and conquer a crown; And three with a new song's measure Can trample an empire down. We, in the ages lying In the buried past of the earth, Built Nineveh with our sighing, And Babel itself with our mirth; And o'erthrew them with prophesying To the old of the new world's worth; For each age is a dream that is dying, Or one that is coming to birth.";

// globales

var hTML = {canvas: $('#ccc'),
            editor: $('#editor'),
            textarea: $('#editor textarea')
           };

var Canvas = {objeto: document.getElementById('ccc'),
              contexto: null,
              margin_top: 20,
             };
Canvas.contexto = Canvas.objeto.getContext('2d');

var Sinusoide = {contexto: new (window.AudioContext || window.webkitAudioContext)(),
                 objeto: null,
                 objeto_tri: null,
                 objeto_sq: null,
                 amplitud: 0.5,
                 min_freq:20,
                 freq:0,
                 magic_freqs: [423, 559, 420, 393, 340, 292, 323, 193, 240, 292, 283, 259, 220]
                };
Sinusoide.objeto = Sinusoide.contexto.createOscillator();
Sinusoide.objeto.type = 'sine'; //0; // sine
Sinusoide.objeto.noteOn && Sinusoide.objeto.noteOn(0);
Sinusoide.objeto.start(0);

Sinusoide.objeto_tri = Sinusoide.contexto.createOscillator();
Sinusoide.objeto_tri.type = 'triangle'; //3; // triwave
Sinusoide.objeto_tri.noteOn && Sinusoide.objeto_tri.noteOn(0);
Sinusoide.objeto_tri.start(0);

// Sinusoide.objeto_sq = Sinusoide.contexto.createOscillator();
// Sinusoide.objeto_sq.type = 'square'; // x // squarewave
// Sinusoide.objeto_sq.noteOn && Sinusoide.objeto_sq.noteOn(0);
// Sinusoide.objeto_sq.start(0);

var Imagen = {canvas: {w:$(window).width(),
                     h:$(window).height()},
              pixelote: {w:30,
                         h:30},
              saturacion: {status:0,
                           modificador:10},
              colores: [],
              posicion: {x: 0,
                         y:0}
             };

var Texto = {pila: [],
             cadena: ""};


// funcs

function debug(){
    if( DEBUG ){
        console.log(arguments);
    }
};

function actualizo_resolucion(h_w){
    //canvas, editor, textarea, imagen
    h_w = h_w || {h:0, w:0};
    var canvas = hTML.canvas;
    var editor = hTML.editor;
    var textarea = hTML.textarea;

    Imagen.canvas = {w:$(window).width()-Imagen.pixelote.w + h_w.w,
                     h:$(window).height()-Imagen.pixelote.h + h_w.h}

    canvas
        .attr('height', Imagen.canvas.h-Canvas.margin_top)
        .attr('width', Imagen.canvas.w)
        .css({'margin-left': Imagen.pixelote.w/2,
              'margin-top': (Imagen.pixelote.h/2)+Canvas.margin_top});

    if( !RESIZE ){

        editor
            .css({'height': $(window).height()-5,
                  'width': $(window).width()-5});
        textarea
            .css({'height': Imagen.canvas.h-Canvas.margin_top,
                  'width': Imagen.canvas.w/2,
                  'margin-left': Imagen.pixelote.w/2,
                  'margin-top': (Imagen.pixelote.h/2)+Canvas.margin_top});
        RESIZE = 1;
    }
};

function apago_sine(_obj){
    if( _obj == "sine" ){
        debug("apago sine");
        Sinusoide.objeto.disconnect(); }
    if( _obj == "tri" ){
        debug("apago tri");
        Sinusoide.objeto_tri.disconnect(); }
    // if( _obj == "sq" ){
    //     debug("apago sq");
    //     Sinusoide.objeto_sq.disconnect(); }
}

function actualizo_sine(freq, _obj) {

    if( !USE_AUDIO ) return; 

    // EL NUMBERO MAS CERCANO A MF[N]
    this.mas_cercano = function(ff) {
        var nff = Sinusoide.magic_freqs[0];
        var nff_diff = Math.abs(ff-nff);
        for (var i=0;i<Sinusoide.magic_freqs.length;i++) {
            var nff_tmp = Math.abs(ff-Sinusoide.magic_freqs[i]);
            if (nff_tmp < nff_diff) {
                nff_diff = nff_tmp;
                nff = Sinusoide.magic_freqs[i];
            }
        }
        return nff;
    }

    debug('freq recibida',freq,'para',_obj);
    //var freq_cal = Sinusoide.min_freq + parseFloat(freq / 10) + Math.random() * (20-10) + 10;
    var freq_cal = this.mas_cercano(parseInt(freq));

    if( _obj == "sine" || _obj == undefined ){
        Sinusoide.objeto.connect(Sinusoide.contexto.destination);

        var sine_freq = freq_cal;
        if( parseInt(Sinusoide.objeto.context.currentTime) % parseInt(Math.random() + (5-1) + 1) == 0) {
            sine_freq = parseInt(sine_freq) + (Math.random() * (50-10) + 10);
            //console.log(sine_freq);
        }

        Sinusoide.objeto.frequency.value = sine_freq;
    }
    else if( _obj == "tri"  ){
        Sinusoide.objeto_tri.connect(Sinusoide.contexto.destination);
        Sinusoide.objeto_tri.frequency.value = freq_cal;
    }
    // else if( _obj == "sq"  ){
    //     Sinusoide.objeto_sq.connect(Sinusoide.contexto.destination);
    //     Sinusoide.objeto_sq.frequency.value = freq_cal;
    // }
};

function actualizo_amplitud(amp) {
    if( amp == "+" ){
        Sinusoide.amplitude += 0.1;
    }
    if( amp == "-" ){
        Sinusoide.amplitude = Sinusoide.amplitude <= 0.1 ? 0.1 : Sinusoide.amplitude-0.1;
    }
    Sinusoide.objeto.amplitude = Sinusoide.amplitude;
    Sinusoide.objeto_tri.amplitude = Sinusoide.amplitude;
    //Sinusoide.objeto_sq.amplitude = Sinusoide.amplitude;
};

function actualizo_saturacion(k){
    if(k==38){
        Imagen.saturacion.status = Imagen.saturacion.status >= 255 ? 255 : Imagen.saturacion.status+Imagen.saturacion.modificador;
    }
    else if(k==40){
        Imagen.saturacion.status = Imagen.saturacion.status <= 0 ? 0 : Imagen.saturacion.status-Imagen.saturacion.modificador;
    }
};

function definir_xy(xoy, p){

    debug('PRE>>', Imagen.posicion.x, Imagen.posicion.y);

    if(xoy.toLowerCase()=="x"){
        // -23 > linebreak HAX.
        Imagen.posicion.x = p ==="-23"? 0 : p || (Imagen.colores.length-1) * Imagen.pixelote.w;
    }
    if(xoy.toLowerCase()=="y"){
        Imagen.posicion.y = p || Math.floor( Imagen.colores.length / (Imagen.canvas.w / Imagen.pixelote.w) ) * Imagen.pixelote.h;
    }

    debug('POST>>', Imagen.posicion.x, Imagen.posicion.y);

};

function agrego_pixelote(color){
    var crand = parseInt(Math.random() * (100-50) + 50); //RANDCOL ? Math.random() * (255-0) : 0;
    var px_diff = USE_PX_DIFF ? Math.floor(color.reduce(function(a,b){ return a+b; })/100) : 0; // map > (a+b)+c
    var prand = USE_PX_DIFF ? parseInt(Math.random() * (10-5) + 5) : 0; //RANDCOL ? Math.random() * (255-0) : 0;

    var pover = 0; //Imagen.posicion.y > 30 ? 25 : 0; //RANDCOL ? Math.random() * (255-0) : 0;

    debug(px_diff, Imagen.pixelote.w-px_diff);

    if( CMONO ){ color = [color[0], color[0], color[0]]; }

    var rgba_color = 'rgba(_RED_,_GREEN_,_BLUE_, 255)'
        .replace('_RED_', color[0] + Imagen.saturacion.status + crand)
        .replace('_GREEN_', color[1] + Imagen.saturacion.status + crand)
        .replace('_BLUE_', color[2] + Imagen.saturacion.status + crand);

    Canvas.contexto.fillStyle = rgba_color;

    //Canvas.contexto.fillRect(Imagen.posicion.x, Imagen.posicion.y, Imagen.pixelote.w-px_diff, Imagen.pixelote.h-px_diff);

    Canvas.contexto.fillRect(Imagen.posicion.x-prand-pover, Imagen.posicion.y-prand-pover, Imagen.pixelote.w-px_diff, Imagen.pixelote.h-px_diff);

    debug(Imagen.posicion.x, Imagen.posicion.y);

    definir_xy("x", Imagen.posicion.x+Imagen.pixelote.w);
    if( Imagen.posicion.x == Imagen.canvas.w ){
        definir_xy("x", "-23");
        definir_xy("y", Imagen.posicion.y+Imagen.pixelote.h);
        // sim br
        actualizo_sine(Sinusoide.freq, "tri");
    }

    if( Imagen.posicion.y >= Imagen.canvas.h ){
        console.log(Imagen.posicion.y, Imagen.canvas.h);
        hw = {h:Imagen.posicion.y + Imagen.pixelote.h, w:Imagen.canvas.w};
    }

};

function disparo_acciones(){
    debug('BANG');
    agrego_pixelote(Imagen.colores[Imagen.colores.length-1]);
    actualizo_sine(Sinusoide.freq);
};

function conecto_teclas(key, cb){
    debug("ct", String.fromCharCode(key));

    if ( !Texto.pila.length ){
        Texto.pila = [key];
    }
    else{
        Texto.pila.push(key);
        if( Texto.pila.length === 3 ){
            Sinusoide.freq = Texto.pila.reduce(function (a, b){ return a+b; });
            Imagen.colores.push( Texto.pila );
            disparo_acciones();
            Texto.pila = [];
        }
    }
    Texto.cadena += String.fromCharCode(key);
    $(hTML.textarea).val(Texto.cadena);
    if( cb && (typeof(cb) == "function") ){
        setTimeout(cb, DELAY);
    }
};

function leo_texto(texto){
    var getc;
    texto = typeof(texto) == "string" ? texto.split("").reverse() : texto;
    if( texto !== undefined ){
        getc = texto.pop();
        if( getc !== undefined ){

            if( parseInt(getc.charCodeAt(0)) == 10 ){ // enter?
                definir_xy("y", Imagen.posicion.y+Imagen.pixelote.h);
                definir_xy("x", "-23");
            }
            conecto_teclas(getc.charCodeAt(0), function(){ leo_texto(texto) });
        }
    }
}

function canvas_dataurl(){
    var canvas = hTML.canvas[0];
    if ( canvas['toDataURL'] ){
        return canvas.toDataURL('image/png');
    }
    return undefined;
}

function abro_editor(){
    //$(hTML.textarea).val("");
    $(hTML.editor).show();
}

function cierro_editor(){
    $(hTML.editor).hide();
    //$(hTML.textarea).val("");
}

function inicio_hotkeys(){
    $(document)
        .on('keypress', function(e){
            e.preventDefault();
            var k = e.which||e.keyCode;
            conecto_teclas(k);

            if(k == 13){ // intro.
                debug('ENTER TEH DRAGON');
                definir_xy("y", Imagen.posicion.y+Imagen.pixelote.h);
                definir_xy("x", "-23");
                actualizo_sine(Sinusoide.freq, "tri");
            }

        })
        .on('keydown',
            function(e){
                var ctrl = e.ctrlKey;
                var k = e.keyCode||e.which;
                debug("KKK>", k);
                if ( ctrl && (k == 38 || k == 40) ) { // up, down
                    actualizo_saturacion(k);
                }
                if ( k == 27 ) { // esc
                    apago_sine("sine");
                    apago_sine("tri");
                }
                if ( k == 8 ) { // backspace
                    apago_sine("tri");
                    definir_xy("y", Imagen.posicion.y-Imagen.pixelote.h);
                    definir_xy("x", "-23");
                    e.preventDefault();
                }
                if ( k == 39 ) { // ->
                    definir_xy("x", Imagen.canvas.w+Imagen.pixelote.w>=Imagen.canvas.w?Imagen.canvas.w:Imagen.posicion.x+Imagen.pixelote.w);
                }
                if ( k == 37 ) { // <-
                    definir_xy("x", Imagen.canvas.w-Imagen.pixelote.w<=0?0:Imagen.posicion.x-Imagen.pixelote.w);
                }
            });
};

function inicio_botones(){
    $('a')
        .each(function(){
            var self = $(this);
            if( self.data('call') !== undefined ){
                switch (self.data('call')) {
                case "s_mute":
                    self.on('click',
                            function(){
                                apago_sine("sine");
                                apago_sine("tri");
                            });
                    break;
                case "f_open":
                    self.on('click',
                            function(){
                                abro_editor();
                            });
                    break;
                case "f_save":
                    self.on('click',
                            function(){
                                var self = $(this);
                                var download = self.attr('download');
                                var now = parseInt(new Date().getTime() / 1000);
                                var download_now = download.replace('.png', now + '.png');
                                self.attr('download', download_now);
                                self.attr('href', canvas_dataurl());
                            });
                    break;
                case "a_plus":
                    self.on('click',
                            function(){
                                actualizo_amplitud("+");
                            });
                    break;
                case "a_less":
                    self.on('click',
                            function(){
                                actualizo_amplitud("-");
                            });
                    break;
                case "s_plus":
                    self.on('click',
                            function(){
                                actualizo_saturacion(38); // c+up
                            });
                    break;
                case "s_less":
                    self.on('click',
                            function(){
                                actualizo_saturacion(40); // c+down
                            });
                    break;
                case "e_leer":
                    self.on('click',
                            function(){
                                leo_texto(hTML.textarea.val());
                                cierro_editor();
                            });
                    break;
                case "e_cancel":
                    self.on('click',
                            function(){
                                cierro_editor();
                            });
                    break;
                default:
                    console.log('wat');
                }
            }
        });
}

function inicio_menu(){
    var canvas = hTML.canvas[0];
    canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
}

function inicio_editor(){
    $(hTML.textarea)
        .on('focus', function(){
            $(document).off('keypress').off('keydown');
        })
        .on('blur', function(){
            inicio_hotkeys();
        });
}

// Inicio todo.
Canvas.contexto.clearRect(0, 0, Imagen.canvas.w, Imagen.canvas.h);

inicio_hotkeys();
inicio_botones();
inicio_menu();
inicio_editor();
//actualizo_resolucion(hTML.canvas, hTML.editor, hTML.textarea);
actualizo_resolucion();
//window.onresize = function(){ actualizo_resolucion(hTML.canvas, hTML.editor, hTML.textarea); }
