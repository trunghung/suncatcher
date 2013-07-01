// a slightly higher-level abstraction for using dust templates.
// enforces a few thing about our use of them.

(function(){
    
    window.Template = {
        render: render,
        renderInto: renderInto
    };
    
    var current_vars;
    // So.. if your localized strings use {something|i}, this filter will be called recursively.
    // Not that you should. But you could.
    dust.filters.i = function(value) {
        return value.replace(/\{([^{}]*)\}/g,
            function (a, b) {
                var filters = b.split("|"), key = filters.shift();
                var r = current_vars.get(key);
                if (typeof r == "function") {
                    // comment the throw to live on the edge. Note that functions called here will have no access to a Chunk object
                    throw new Error("Template doesn't support function references in a 'i'-filter substitution.");
                    r = r.apply(current_vars.current(), [null, current_vars, null, {auto: null, filters: filters}]);
                }
                if (typeof r !== 'string' && typeof r !== 'number') { return ''; }
                return dust.filter(String(r), null, filters);
            }
        );
    };
    
    var Context = dust.makeBase().constructor; // sneak dust's Context type out of their module.
    
    function _render(template, vars) {
        var str;
        //vars = Intl.withStrings(Context.wrap(vars));
        current_vars = vars;
        dust.render(template, vars, function(err, out) {
            if (err) {
                if (window.debug) {
                    str = err;
                }
                console.error("Error rendering "+template, vars, err);
            }
            str = out;
        });
        current_vars = undefined;
        return str;
    }
    
    function render(template, vars) {
        console.warn("Raw Template.render called.",template, vars);
        return _render(template, vars);
    }
    
    function renderInto(template, vars, elt) {
        var str = _render(template, vars);
        elt.html(str).trigger( "refresh" );	// call trigger create so QJM enhance the body
        return str != null;
    }
    
})();