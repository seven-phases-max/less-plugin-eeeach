
'use strict';

module.exports = function(less, manager) {
    
// ............................................................

    var tree      = less.tree,
        Variable  = tree.Variable,
        Ruleset   = tree.Ruleset,
        Rule      = tree.Rule,
        Node      = tree.Node,
        isArray   = Array.isArray;

// ............................................................

    function toArray(list) {
        return isArray(list.value) ? list.value : [list];    
    }
    
// ............................................................

    function ForEachEvaluator(node) {
        this.node = node; 
    }
    
    ForEachEvaluator.prototype = new Node();
    ForEachEvaluator.prototype.type = "ForEachEvaluator";
    ForEachEvaluator.prototype.evalFirst = true;
    ForEachEvaluator.prototype.accept = function(visitor) {
        this.node.rules = visitor.visitArray(this.node.rules);
    };
    
    ForEachEvaluator.prototype.eval = function (context) {
        var node  = this.node,
            rules = node.rules,
            args  = node.params,
            fileIndex, fileInfo;
        
        // unfortunately mixin definition does not have index/fileinfo
        // stuff so using this unsafe kludge so far:
        if (rules[0]) {
            fileIndex = rules[0].index;
            fileInfo  = rules[0].currentFileInfo;
        }
        
        if (!((args.length === 3) 
            && args[1] && args[1].value 
            && (args[1].value.value === "in"))) throw {
                type:    "Syntax",
                message: "unexpected .for-each parameters",
                index:    fileIndex,
                filename: fileInfo.filename 
        };
            
        var result   = [],
            selector = this.selector,
            value    = args[0].name,
            list     = toArray((new Variable(args[2].name,
                fileIndex, fileInfo)).eval(context));
            
        for (var i = 0; i < list.length; i++) {
            var iter = rules.slice(0);
            iter.unshift(new Rule(value, list[i]));
            result.push(new Ruleset(selector, iter));
        }
        
        return (new Ruleset(selector, result)).eval(context);
    };
    
    ForEachEvaluator.prototype.selector
        = [new tree.Selector([new tree.Element('', '&')])];
    
// ............................................................
    
    function ThisVisitor() {
        this.native_ = new less.visitors.Visitor(this);    
    }

    ThisVisitor.prototype = {
        isPreEvalVisitor: true,
        isReplacing:      true,
        
        run: function(root) {
            return this.native_.visit(root);
        },
        
        visitMixinDefinition: function(node) {
            if (node.name === ".for-each")
                return new ForEachEvaluator(node);

            return node;
        },
    };
    
    manager.addVisitor(new ThisVisitor());

// ............................................................

}; // ~ end of module.exports
