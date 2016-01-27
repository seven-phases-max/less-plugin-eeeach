
function ThisPlugin(options) {
    this.options = options;
}

ThisPlugin.prototype = {
    install: function(less, pluginManager) {
        require("./functions")(less, pluginManager);
    }
};

module.exports = ThisPlugin;
