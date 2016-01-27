
module.exports = function(less, pluginManager) {

    var tree        = less.tree,
        Rule        = tree.Rule,
        Dimension   = tree.Dimension,
        Ruleset     = tree.Ruleset,
        DetachedSet = tree.DetachedRuleset,
        isArray     = Array.isArray;
        
    // ........................................................
    
        function newVar(name, value) {
            return new Rule('@' + name, value, false,
                false, this.index, this.currentFileInfo);   
        }
        
        function toArray(list) {
            return isArray(list.value) ? list.value : [list];    
        }

// ............................................................

    var functions = {
        
        // ....................................................

        __each: function(list, vars, ruleset) {
            var indexId, valueId, inRules, outRules = [];
            ruleset = ruleset.ruleset;
            inRules = ruleset ? ruleset.rules : vars.ruleset.rules;
            vars    = ruleset ? toArray(vars) : [];
            list    = toArray(list);
            indexId = vars[0] ? vars[0].value : 'index';
            valueId = vars[1] ? vars[1].value : 'value';
                       
            for (var i = 0; i < list.length; i++) {
                var iter = inRules.slice(0);
                iter.push(newVar(indexId, new Dimension(i + 1)));
                iter.push(newVar(valueId, list[i]));
                outRules = outRules.concat((new Ruleset(null, iter))
                    .eval(this.context).rules);
            }
            
            return new DetachedSet(new Ruleset(null, outRules));
        },

        // ....................................................

    };
    
    less.functions.functionRegistry.addMultiple(functions);

// ............................................................

    function ImportInjector() {}

    ImportInjector.prototype = {
        process: function (src, extra) {
            if (extra.fileInfo.filename === extra.fileInfo.rootFilename)
                src = '@import "' 
                    + require('path').resolve(__dirname, 'each.less') 
                    + '";' + src; 
            return src;
        }
    };
    
    pluginManager.addPreProcessor(new ImportInjector);
    
};
